module.exports = function(RED) {
    function AlertNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        // node.rules = config.rules; 

        node.on('input', function(msg) {
            try {
                let messageForUser = ["Alert message"];
                let alert_message = msg.alert_message;
                let rules = alert_message.rules; 
                let equations = alert_message.equations
                let changedProperty = msg.changedProperty;
                let isConditionMet = false;

                if(rules && rules?.properties.length > 0) {
                    for (let i=0; i< rules.properties.length; i++) {
                        isConditionMet = eval(`msg.payload.${rules.properties[i]} ${rules.params[i]} ${rules.values[i]}`);
                        if (isConditionMet) {
                            node.send([null, { 
                                payload: {
                                    property: rules.properties[i],
                                    param: rules.params[i],
                                    value: rules.values[i],
                                    current: eval(`msg.payload.${rules.properties[i]}`),
                                    message: `Alert message. ${rules.properties[i]} ${rules.params[i]} ${rules.values[i]}. current ${rules.properties[i]} is ${eval(`msg.payload.${rules.properties[i]}`)}`,
                                }
                            }]);
                            messageForUser.push(`${rules.properties[i]} ${rules.params[i]} ${rules.values[i]}. current ${rules.properties[i]} is ${eval(`msg.payload.${rules.properties[i]}`)}`);
                        } 
                    }
                }
                if(equations && equations?.length > 0){
                    for (let i=0; i< equations.length; i++) {
                        isConditionMet = eval(equations[i]);
                        if (isConditionMet) {
                            node.send([null, { 
                                payload: {
                                    property: changedProperty[i],
                                    equations: equations[i],
                                    current: eval(`msg.payload.${changedProperty[i]}`),
                                    message: `Alert message. Your equation: ${msg.alert_message.equations[i]}. ${changedProperty[i]} is ${eval(`msg.payload.${changedProperty[i]}`)}`,
                                }
                            }]);
                            messageForUser.push(`Your equation: ${msg.alert_message.equations[i]}. ${changedProperty[i]} is ${eval(`msg.payload.${changedProperty[i]}`)}`);
                        }
                    }
                }
                msg.messageForUser = messageForUser.join(". ");
                node.send([msg]);

            } catch (error) {
                node.error("Error evaluating rule: " + error.message);
                node.send([null, { payload: "Error in rule processing" }]);
            }
        });
    }
    RED.nodes.registerType("alert", AlertNode);
    
}