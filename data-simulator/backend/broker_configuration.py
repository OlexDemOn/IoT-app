"""
Broker configuration file
"""

import inspect

MQTT_BROKER = "192.168.194.177"
# MQTT_BROKER = 'mqtt.eclipseprojects.io'
MQTT_PORT = 1883

def set_broker_config(broker, port):
    """Set the MQTT broker configuration."""
    global MQTT_BROKER, MQTT_PORT  # pylint: disable=global-statement
    MQTT_BROKER = broker
    MQTT_PORT = port


def save_broker_config():
    """Save the current broker configuration to the file."""
    current_file = inspect.getfile(inspect.currentframe())
    with open(current_file, 'r', encoding='utf-8') as file:
        lines = file.readlines()
    with open(current_file, 'w', encoding='utf-8') as file:
        for line in lines:
            if line.startswith('MQTT_BROKER ='):
                file.write(f"MQTT_BROKER = '{MQTT_BROKER}'\n")
            elif line.startswith('MQTT_PORT ='):
                file.write(f"MQTT_PORT = {MQTT_PORT}\n")
            else:
                file.write(line)
