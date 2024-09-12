module.exports = function (RED) {
    function MapNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        
        var jsonCode = config.jsonCode || '{}';
        jsonCode = JSON.parse(jsonCode); 
        let userProp = jsonCode.userProp
        let serverProp = jsonCode.serverProp
        
        node.on('input', function (msg) {
            let alert_message = msg.alert_message
            try {
                let changedProperty = [];
                let equations = alert_message.equations
                equations && equations.map((equation, index) => {
                    userProp.map((prop, i) => {
                        let regex = new RegExp(`\\b${prop}\\b`, 'g');
                        if (equation.match(regex)) {
                            equation = equation.replace(regex, `msg.payload.${serverProp[i]}`);
                            equations[index] = equation;
                            changedProperty.push(prop);
                            return;
                        }
                    })
                });
                
                msg.userProp = userProp
                msg.serverProp = serverProp
                msg.changedProperty = changedProperty
                node.send(msg);
            } catch (error) {
                node.error("Failed to parse JSON: " + error.message, msg);
            }
        });
    }

    RED.nodes.registerType("maper", MapNode);
};

