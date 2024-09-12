"""
Application generating real-life machine values.
"""

import warnings
import threading
import time
import os
import logging
import random
import datetime
import re
import json

import numpy as np
import psycopg2  # type: ignore
import paho.mqtt.client as mqtt
from flask import Flask, jsonify, request, abort
from flask_cors import CORS

from database_configuration import get_db_connection  # type: ignore
from broker_configuration import MQTT_BROKER, MQTT_PORT  # type: ignore
from machines_configuration import MACHINE_TYPES, PARAMETER_RANGES   # type: ignore

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(SCRIPT_DIR, "app.log")

logging.basicConfig(
    filename=LOG_FILE,
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
)

warnings.filterwarnings("ignore", category=DeprecationWarning)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

machines = dict(MACHINE_TYPES)

CLIENTS = {}
TOPIC_UNIT_MAPPING = {}
DATA_STORAGE = {}
DATA_LOCK = threading.Lock()
CONFIG_FILE = "config.json"
state = {}


def insert_machine_data(machine_name, topic, value, unit, timestamp):
    """
    Insert data into the machine_data table.
    
    :param machine_name: Name of the machine.
    :param topic: MQTT topic associated with the data.
    :param value: Value of the machine parameter.
    :param unit: Unit of the parameter.
    :param timestamp: Timestamp for when the data was generated.
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO machine_data (machine_name, topic, value, unit, timestamp)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (machine_name, topic, value, unit, timestamp),
            )
            conn.commit()
    except psycopg2.Error as exc:
        logging.error("Database error: %s", exc)
    finally:
        conn.close()


def load_configuration():
    """
    Load configuration from a JSON file, returning a dictionary.
    """
    try:
        with open(CONFIG_FILE, "r", encoding='UTF-8') as file:
            return json.load(file)
    except FileNotFoundError:
        logging.warning("%s not found. Using default configuration.", CONFIG_FILE)
        return {}
    except json.JSONDecodeError:
        logging.error("Error decoding %s. The file might be empty or corrupted.", CONFIG_FILE)
        return {}


def clear_old_state():
    """Clear any old state values before initializing new ones."""
    global state  # pylint: disable=global-statement, global-variable-not-assigned
    state.clear()


def create_table_if_not_exists():
    """Create the machine_data table if it doesn't already exist."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS machine_data (
                    id SERIAL PRIMARY KEY,
                    machine_name VARCHAR(255),
                    topic VARCHAR(255),
                    value FLOAT,
                    unit VARCHAR(50),
                    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            conn.commit()
    except psycopg2.Error as exc:
        logging.error("Error creating table: %s", exc)
    finally:
        conn.close()


def initialize_data_storage():
    """Initialize the in-memory data storage for machine data."""
    with DATA_LOCK:
        DATA_STORAGE.update(
            {
                machine: {
                    item["topic"]: {"value": None, "unit": item["unit"]}
                    for item in info.get('parameters', [])
                }
                for machine, info in machines.items() if isinstance(info.get('parameters'), list)
            }
        )


def handle_mqtt_message(_, __, msg):
    """Handle incoming MQTT messages and store data in the database."""
    topic = msg.topic
    try:
        message = float(msg.payload.decode())
    except ValueError:
        message = msg.payload.decode()

    unit = TOPIC_UNIT_MAPPING.get(topic, "")

    with DATA_LOCK:
        for machine, config in machines.items():
            if not isinstance(config, dict) or 'parameters' not in config:
                logging.error("Config for machine '%s' is not properly structured.", machine)
                continue

            for item in config.get('parameters'):
                if not isinstance(item, dict):
                    logging.error(
                        "Expected item to be a dictionary but got %s in machine '%s'.",
                        type(item), machine
                    )
                    continue

                if item.get("topic") == topic:
                    DATA_STORAGE[machine][topic] = {"value": message, "unit": unit}
                    insert_machine_data(machine, topic, message, unit, datetime.datetime.utcnow())
                    break


def is_valid_mqtt_topic(topic):
    """Validate MQTT topic according to basic MQTT rules."""
    if not isinstance(topic, str) or not topic:
        return False
    if any(ord(char) < 32 for char in topic) or " " in topic:
        return False
    if topic.count('+') > 0 and not re.match(r'^([^#]*\+[^#]*)+$', topic):
        return False
    if topic.count('#') > 1 or (topic.count('#') == 1 and not topic.endswith('#')):
        return False
    if "//" in topic:
        return False
    return True


def setup_mqtt_clients():
    """Set up MQTT clients for each machine to subscribe to relevant topics."""
    global CLIENTS  # pylint: disable=global-statement, global-variable-not-assigned
    for machine, info in machines.items():
        client = mqtt.Client(client_id=machine, protocol=mqtt.MQTTv5)
        client.on_message = handle_mqtt_message
        client.connect(MQTT_BROKER, MQTT_PORT)

        for item in info.get('parameters'):
            topic = item["topic"]
            if not is_valid_mqtt_topic(topic):
                logging.warning(
                    "Skipping invalid MQTT topic: '%s' for machine: '%s'",
                    topic, machine
                )
                continue
            logging.info(
                "Subscribing to valid topic: '%s' for machine: '%s'",
                topic, machine
            )
            client.subscribe(topic)
            TOPIC_UNIT_MAPPING[topic] = item["unit"]

        client.loop_start()
        CLIENTS[machine] = client
        logging.info("Client for %s started and subscribed to topics.", machine)


def generate_initial_value(low, high):
    """Generate an initial value for a parameter."""
    midpoint = (low + high) / 2
    initial_value = np.clip(np.random.normal(midpoint, (high - low) / 10), low, high)
    return initial_value


def initialize_state(machine_type, parameter_ranges, starting_values):
    """Initialize the state for a given machine type."""
    clear_old_state()
    initial_values = {}
    for param, (low, high) in parameter_ranges.get(machine_type, {}).items():
        if param in starting_values:
            initial_values[param] = starting_values[param]
        else:
            initial_value = (low + high) / 2
            initial_values[param] = initial_value
            starting_values[param] = initial_value
    history = {param: [value] * 5 for param, value in initial_values.items()}
    state[machine_type] = {"current_values": initial_values, "history": history}


def generate_parameters(machine_type):
    """Generate smooth and realistic parameters for the given machine type."""
    if machine_type not in PARAMETER_RANGES:
        logging.warning(
            "Machine type '%s' is not defined in PARAMETER_RANGES. Skipping.",
            machine_type
        )
        return {}

    if machine_type not in state:
        load_machine_state(machine_type)
    return generate_smooth_parameters(machine_type)


def load_machine_state(machine_type):
    """Load configuration and initialize the state for the machine."""
    config = load_configuration()
    machine_config = config.get(machine_type, {})
    starting_values = machine_config.get("starting_values", {})
    initialize_state(machine_type, PARAMETER_RANGES, starting_values)


def generate_smooth_parameters(machine_type):
    """Generate parameters with smoothing applied to historical data."""
    machine_state = state[machine_type]
    ranges = PARAMETER_RANGES[machine_type]
    parameters = {}
    for param, value_range in ranges.items():
        parameters[param] = calculate_smoothed_value(param, value_range, machine_state)
    return parameters


def calculate_smoothed_value(param, value_range, machine_state):
    """Calculate and return a smoothed value for a given parameter."""
    low, high = value_range
    current_value = machine_state["current_values"].get(param, (low + high) / 2)
    current_value = max(min(current_value, high), low)
    change = random.uniform(-0.07, 0.07) * current_value
    new_value = max(min(current_value + change, high), low)
    update_parameter_history(param, new_value, machine_state)
    return smooth_history_values(param, machine_state["history"][param], current_value)


def update_parameter_history(param, new_value, machine_state):
    """Update the historical values for a parameter."""
    history = machine_state["history"][param]
    history.append(new_value)
    if len(history) > 5:
        history.pop(0)


def smooth_history_values(_, history, default_value):
    """Apply smoothing to the historical values of a parameter."""
    valid_history = [h for h in history if isinstance(h, (int, float))]
    if not valid_history:
        return default_value
    history_np = np.array(valid_history, dtype=np.float64)
    weights = np.linspace(1, 2, len(history_np), dtype=np.float64)
    smoothed_value = np.average(history_np, weights=weights)
    return round(smoothed_value, 2)


def generate_past_data(machine_name, start_time, end_time, interval_seconds=60):
    """
    Generate machine data for the specified machine within a date range in the past and log it.

    :param machine_name: Name of the machine.
    :param start_time: Start datetime for data generation.
    :param end_time: End datetime for data generation.
    :param interval_seconds: Interval in seconds between data points.
    :return: List of generated data entries.
    """
    conn = get_db_connection()
    generated_data = []

    try:
        current_time = start_time
        while current_time <= end_time:
            parameters = generate_parameters(machine_name)
            generated_data.extend(
                process_parameters_and_store(machine_name, parameters, current_time)
            )
            current_time += datetime.timedelta(seconds=interval_seconds)
        conn.commit()
        logging.info(
            "Generated past data for %s from %s to %s",
            machine_name, start_time, end_time
        )
    except psycopg2.Error as exc:
        logging.error("Error generating past data: %s", exc)
    finally:
        conn.close()
    return generated_data


def process_parameters_and_store(machine_name, parameters, current_time):
    """Process parameters and insert the data into the database."""
    data_entries = []

    for parameter, value in parameters.items():
        topic, unit = get_topic_and_unit(machine_name, parameter)
        if topic:
            value = validate_and_convert_value(machine_name, parameter, value)
            data_entry = {
                "machine_name": machine_name,
                "topic": topic,
                "parameter": parameter,
                "value": value,
                "unit": unit,
                "timestamp": current_time.isoformat(),
            }
            data_entries.append(data_entry)
            print(f"Generated data entry: {data_entry}")
            insert_machine_data(machine_name, topic, value, unit, current_time)
    return data_entries


def get_topic_and_unit(machine_name, parameter):
    """Retrieve the topic and unit for a given parameter of a machine."""
    for item in machines[machine_name]['parameters']:
        if item['parameter'] == parameter:
            return item['topic'], item['unit']
    return None, None


def validate_and_convert_value(machine_name, parameter, value):
    """Validate and convert the value for a parameter."""
    if isinstance(value, (np.float64, np.float32)):
        value = float(value)

    if value is None or value == "":
        logging.warning(
            "Empty value detected for parameter '%s' in machine '%s'. "
            "Using default value 0.0.",
            parameter, machine_name
        )
        value = 0.0

    return value


def publish_data():
    """Publish generated data to MQTT topics."""
    while True:
        for machine, config in machines.items():
            if not validate_machine_config(machine, config):
                continue

            client = CLIENTS.get(machine)
            parameters_list = config.get('parameters')
            parameters = generate_parameters(machine)

            publish_machine_data(machine, parameters, parameters_list, client)

        time.sleep(15)


def validate_machine_config(machine, config):
    """Validate the machine configuration to ensure it's a dictionary with a parameters key."""
    if not isinstance(config, dict):
        logging.error(
            "Config for machine '%s' is not a dictionary: %s",
            machine, type(config)
        )
        return False

    parameters_list = config.get('parameters')
    if not isinstance(parameters_list, list):
        logging.error(
            "'parameters' for machine '%s' is not a list: %s",
            machine, type(parameters_list)
        )
        return False

    return True


def publish_machine_data(machine, parameters, parameters_list, client):
    """Publish data for a single machine."""
    for parameter, value in parameters.items():
        for item in parameters_list:
            if not isinstance(item, dict):
                logging.error(
                    "Item in parameters for machine '%s' is not a dict: %s",
                    machine, type(item)
                )
                continue

            if item.get("parameter") == parameter:
                topic = item.get("topic")
                if client and topic:
                    client.publish(topic, value)
                    logging.info(
                        "Published to topic '%s' with value '%s' for machine '%s'",
                        topic, value, machine
                    )
                break


@app.route("/")
def index():
    """Return a welcome message for the API root."""
    return "Welcome to the API!", 200


@app.route("/machines", methods=["GET"])
def get_machines():
    """Return a list of machines and their current parameters."""
    result = []
    with DATA_LOCK:
        for machine, config in machines.items():
            machine_data = {"name": machine, "parameters": []}
            parameters = config.get('parameters')
            if not isinstance(parameters, list):
                logging.error(
                    "Parameters for machine '%s' is not a list: %s",
                    machine, type(parameters)
                )
                continue

            for item in parameters:
                if not isinstance(item, dict):
                    logging.error(
                        "Expected item to be a dictionary but got %s in machine '%s'.",
                        type(item), machine
                    )
                    continue
                topic = item.get("topic")
                if topic in DATA_STORAGE.get(machine, {}):
                    machine_data["parameters"].append(
                        {
                            "parameter": item.get("parameter"),
                            "value": DATA_STORAGE[machine][topic]["value"],
                            "unit": DATA_STORAGE[machine][topic]["unit"],
                        }
                    )
            result.append(machine_data)
    return jsonify(result)


@app.route("/machine-data", methods=["GET"])
def get_machine_data():
    """Return data for a specific machine over a specified lookback period."""
    requested_machine_name = request.args.get("machine_name")
    if not requested_machine_name or not requested_machine_name.isalnum():
        abort(400, description="Invalid machine name")
    lookback_minutes = request.args.get("lookback_minutes", 5)

    try:
        lookback_minutes = int(lookback_minutes)
        if lookback_minutes <= 0:
            raise ValueError
    except ValueError:
        abort(400, description="Invalid lookback_minutes value")

    start_time = datetime.datetime.utcnow() - datetime.timedelta(minutes=lookback_minutes)

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT topic, value, unit, timestamp FROM machine_data
                WHERE machine_name = %s AND timestamp >= %s
                ORDER BY timestamp ASC
                """,
                (requested_machine_name, start_time),
            )
            rows = cur.fetchall()

        result = {}
        for row in rows:
            topic, value, unit, timestamp = row
            if topic not in result:
                result[topic] = {"timestamps": [], "values": [], "unit": unit}
            result[topic]["timestamps"].append(timestamp.isoformat())
            result[topic]["values"].append(value)

        return jsonify(result)
    except psycopg2.Error as exc:
        logging.error("Error fetching machine data: %s", exc)
        return jsonify({"error": str(exc)}), 500
    finally:
        conn.close()


@app.route("/generate-past-data", methods=["POST"])
def generate_past_data_endpoint():
    """
    Endpoint to generate data for a machine in a specified date range in the past and return it.
    """
    data = request.json
    machine_name = data.get("machine_name")
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    interval_seconds = data.get("interval_seconds", 60)

    if not machine_name or not start_date or not end_date:
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        start_time = datetime.datetime.fromisoformat(start_date)
        end_time = datetime.datetime.fromisoformat(end_date)
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400

    if start_time >= end_time:
        return jsonify({"error": "Start date must be before end date"}), 400

    generated_data = generate_past_data(machine_name, start_time, end_time, interval_seconds)

    return jsonify({"message": "Data generation complete", "generated_data": generated_data}), 200


def run_server():
    """Run the Flask server."""
    app.run(debug=True, use_reloader=False, host="0.0.0.0")


if __name__ == "__main__":
    create_table_if_not_exists()
    initialize_data_storage()
    setup_mqtt_clients()
    threading.Thread(target=publish_data, daemon=True).start()
    run_server()
