module.exports = function (RED) {

    function formater(value) {
        if (typeof value === 'string') {
            return `'${value}'`;
        }
        return value;
    }

    function MqttMapNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        
        node.on('input', function (msg) {
            try {
                let machines = {};
                let query = '';

                for (let i = 0; i < msg.payload.length; i++) {
                    let topic = msg.payload[i].topic;
                    let value = msg.payload[i].payload;

                    let properties = topic.split('/');

                    let machine_type = properties[1];
                    let product_line_id = 1;
                    let machine_id = Number(properties[3]);
                    let parameter = properties[4];

                    let key = `${product_line_id}_${machine_id}_${machine_type}`;

                    if (!machines[key]) {
                        machines[key] = {
                            product_line_id: product_line_id,
                            machine_id: machine_id,
                            machine_type: machine_type,
                            created_at: new Date().toISOString()
                        };
                    }

                    machines[key][parameter] = value;
                }

                machines = Object.values(machines);
                msg.machines = machines;
                for (let i = 0; i < machines.length; i++) {
                    query +=(`INSERT INTO machines (${Object.keys(machines[i]).join(', ')}) VALUES (${Object.values(machines[i]).map(value => formater(value)).join(', ')});\n`);
                }
                msg.query = query
                node.send(msg);
            } catch (error) {
                node.error("Failed to parse JSON: " + error.message, msg);
            }
        });
    }

    RED.nodes.registerType("mqttMaper", MqttMapNode);
};

