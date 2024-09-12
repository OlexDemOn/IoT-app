import warnings
import paho.mqtt.client as mqtt
from flask import Flask, jsonify, request
from random import uniform
import time
import threading
from flask_cors import CORS
import signal
import os

warnings.filterwarnings("ignore", category=DeprecationWarning)

app = Flask(__name__)
CORS(app)

mqttBroker = "mqtt.eclipseprojects.io"
#mqttBroker = "localhost"
mqttPort = 1883

machine_types = {
    "DrillingMachine": [
        {"parameter": "DrillingSpeed", "topic": "ZG/DR_MA/PLC/0/DrillingSpeed", "unit": "rpm"},
        {"parameter": "Torque", "topic": "ZG/DR_MA/PLC/0/Torque", "unit": "kNm"},
        {"parameter": "BeltSpeed", "topic": "ZG/DR_MA/PLC/0/BeltSpeed", "unit": "%"},
        {"parameter": "Temperature", "topic": "ZG/DR_MA/PLC/0/Temperature", "unit": "°C"}
    ],
    "SolderingMachine": [
        {"parameter": "Power", "topic": "ZG/SO_MA/PLC/0/Power", "unit": "W"},
        {"parameter": "BeltSpeed", "topic": "ZG/SO_MA/PLC/0/BeltSpeed", "unit": "%"},
        {"parameter": "Temperature", "topic": "ZG/SO_MA/PLC/0/Temperature", "unit": "°C"},
        {"parameter": "Speed", "topic": "ZG/SO_MA/PLC/0/Speed", "unit": "m/s"}
    ],
    "WeldingMachine": [
        {"parameter": "GasFlow", "topic": "ZG/WE_MA/PLC/0/GasFlow", "unit": "L/min"},
        {"parameter": "BeltSpeed", "topic": "ZG/WE_MA/PLC/0/BeltSpeed", "unit": "%"},
        {"parameter": "Temperature", "topic": "ZG/WE_MA/PLC/0/Temperature", "unit": "°C"},
        {"parameter": "Speed", "topic": "ZG/WE_MA/PLC/0/Speed", "unit": "%"}
    ],
    "AssemblyMachine": [
        {"parameter": "Pressure", "topic": "ZG/AS_MA/PLC/0/Pressure", "unit": "Pa"},
        {"parameter": "BeltSpeed", "topic": "ZG/AS_MA/PLC/0/BeltSpeed", "unit": "%"},
        {"parameter": "Speed", "topic": "ZG/AS_MA/PLC/0/Speed", "unit": "%"}
    ]
}

machines = {}
for machine_type in machine_types:
    for i in range(1, 4):
        machine_name = f"{machine_type}{i}"
        machines[machine_name] = machine_types[machine_type]

clients = {}
topic_unit_mapping = {}
data_storage = {}
data_lock = threading.Lock()

def initialize_data_storage():
    with data_lock:
        for machine, config in machines.items():
            data_storage[machine] = {item["topic"]: {"value": None, "unit": item["unit"]} for item in config}

def handle_mqtt_message(client, userdata, msg):
    topic = msg.topic
    try:
        message = float(msg.payload.decode())
    except ValueError:
        message = msg.payload.decode()
    
    unit = topic_unit_mapping.get(topic, "")
    
    with data_lock:
        for machine, config in machines.items():
            for item in config:
                if item["topic"] == topic:
                    data_storage[machine][topic] = {"value": message, "unit": unit}
                    print(f"Updated {machine} with topic {topic}: {message} {unit}")
                    break

def setup_mqtt_clients():
    global clients
    for machine, config in machines.items():
        client = mqtt.Client(client_id=machine, protocol=mqtt.MQTTv5)
        client.on_message = handle_mqtt_message
        client.connect(mqttBroker, mqttPort)

        for item in config:
            client.subscribe(item["topic"])
            topic_unit_mapping[item["topic"]] = item["unit"]

        client.loop_start()
        clients[machine] = client
        print(f"Client for {machine} started and subscribed to topics.")

def generate_parameters(machine_type):
    parameter_ranges = {
        "DrillingMachine": {
            "DrillingSpeed": (200, 6000),
            "Torque": (2, 40),
            "BeltSpeed": (0, 100),
            "Temperature": (15, 600)
        },
        "SolderingMachine": {
            "Power": (15, 50),
            "BeltSpeed": (0, 100),
            "Temperature": (20, 2000),
            "Speed": (0, 100)
        },
        "WeldingMachine": {
            "GasFlow": (1, 10),
            "BeltSpeed": (0, 100),
            "Temperature": (20, 2000),
            "Speed": (0, 100)
        },
        "AssemblyMachine": {
            "Pressure": (0, 7),
            "BeltSpeed": (0, 100),
            "Speed": (0, 100)
        }
    }

    ranges = parameter_ranges[machine_type]
    return {param: round(uniform(*range_), 2) if param != "Temperature" else round(uniform(*range_), 0) 
            for param, range_ in ranges.items()}

def publish_data():
    while True:
        for machine, config in machines.items():
            machine_type = machine.rstrip('123')
            parameters = generate_parameters(machine_type)

            client = clients[machine]
            for parameter, value in parameters.items():
                for item in config:
                    if item["parameter"] == parameter:
                        topic = item["topic"]
                        unit = item["unit"]
                        client.publish(topic, value)
                        print(f"Published {value} {unit} to Topic {topic}")
                        break
        time.sleep(5)

@app.route('/update_data', methods=['POST'])
def update_data():
    print("Received POST request to /update_data")
    data = request.json
    print(f"Request data: {data}")
    with data_lock:
        for item in data:
            topic = item.get("topic")
            value = item.get("value")
            unit = item.get("unit")
            if topic:
                for machine, config in machines.items():
                    for config_item in config:
                        if config_item["topic"] == topic:
                            data_storage[machine][topic] = {"value": value, "unit": unit}
                            print(f"Data updated for {machine} with topic {topic}: {value} {unit}")
                            break
    return jsonify({"status": "success"}), 200

@app.route('/machines', methods=['GET'])
def get_machines():
    result = []
    with data_lock:
        for machine, config in machines.items():
            machine_data = {"name": machine, "parameters": []}
            for item in config:
                topic = item["topic"]
                if topic in data_storage[machine]:
                    machine_data["parameters"].append({
                        "parameter": item["parameter"],
                        "value": data_storage[machine][topic]["value"],
                        "unit": data_storage[machine][topic]["unit"]
                    })
            result.append(machine_data)
    return jsonify(result)

def run_server():
    app.run(debug=True, use_reloader=False)

if __name__ == '__main__':
    initialize_data_storage()
    setup_mqtt_clients()
    threading.Thread(target=publish_data, daemon=True).start()
    run_server()

    app.run(host='0.0.0.0', port=5000)

