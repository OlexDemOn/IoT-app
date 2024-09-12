import paho.mqtt.client as mqtt
import time

# Define the on_connect function
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"Connected to MQTT Broker: {client._host}")
        client.subscribe("ZG/+/PLC/0/#")
    else:
        print(f"Failed to connect, return code {rc}")

# Define the on_disconnect function with the correct number of arguments
def on_disconnect(client, userdata, rc, properties=None):
    print(f"Disconnected from MQTT Broker: {client._host} with return code {rc}")

# Define the on_message function
def on_message(client, userdata, msg):
    topic = msg.topic
    payload = msg.payload.decode()
    print(f"Received message: Topic={topic}, Payload={payload}")

# Define the on_publish function
def on_publish(client, userdata, mid):
    print(f"Published message with mid {mid}")

# Create a new MQTT client instance
client = mqtt.Client(client_id="DrillingMachine")

# Assign event callbacks
client.on_connect = on_connect
client.on_disconnect = on_disconnect
client.on_message = on_message
client.on_publish = on_publish

# Connect to the MQTT broker
client.connect("mqtt.eclipseprojects.io", 1883, 60)

# Start the loop
client.loop_start()

try:
    while True:
        # Simulate publishing messages
        client.publish("ZG/DR_MA/PLC/0/DrillingSpeed", "235.07", qos=1)
        client.publish("ZG/DR_MA/PLC/0/Torque", "39.7", qos=1)
        client.publish("ZG/DR_MA/PLC/0/BeltSpeed", "1.15", qos=1)
        client.publish("ZG/DR_MA/PLC/0/Temperature", "519.0", qos=1)
        client.publish("ZG/SO_MA/PLC/0/Power", "33.83", qos=1)
        client.publish("ZG/SO_MA/PLC/0/BeltSpeed", "96.49", qos=1)
        client.publish("ZG/SO_MA/PLC/0/Temperature", "1818.0", qos=1)
        client.publish("ZG/SO_MA/PLC/0/Speed", "33.29", qos=1)
        client.publish("ZG/WE_MA/PLC/0/GasFlow", "2.65", qos=1)
        client.publish("ZG/WE_MA/PLC/0/BeltSpeed", "87.21", qos=1)
        client.publish("ZG/WE_MA/PLC/0/Temperature", "767.0", qos=1)
        client.publish("ZG/WE_MA/PLC/0/Speed", "50.51", qos=1)
        client.publish("ZG/AS_MA/PLC/0/Pressure", "4.21", qos=1)
        client.publish("ZG/AS_MA/PLC/0/BeltSpeed", "27.64", qos=1)
        client.publish("ZG/AS_MA/PLC/0/Speed", "62.53", qos=1)
        # Add a sleep interval if needed to control the publishing rate
        time.sleep(1)
except KeyboardInterrupt:
    print("Exiting...")

client.loop_stop()
client.disconnect()

