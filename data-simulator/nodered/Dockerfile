# Use the official Node-RED Docker image
FROM nodered/node-red:latest

# Install additional Node-RED nodes
RUN npm install \
    node-red-contrib-postgres-multi \
    node-red-contrib-mqtt-broker

# Expose the default Node-RED port
EXPOSE 1880
