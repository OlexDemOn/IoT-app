module.exports = function(RED){
    function ReportNode(config){
        RED.nodes.createNode(this,config);
        let node = this
        node.on('input', function(msg){
            const values = msg.payload
            const agr_func = msg.func || {avg: true, min: true, max: true}
            
            function betterfunc(){
                let header = [{ "text": "Values", "bold": true }]
                for(const agr in agr_func){
                    if (agr) header.push({ "text": `${agr.charAt(0).toUpperCase() + agr.slice(1)}`, "bold": true })
                }
                let widths = []
                for (let i = 0; i < header.length; i++) {
                    widths.push("*")
                }
                const s = {}
                s.stack = []
                    for (let i = 0; i < values.length; i++) {
                        let info = ""
                        for(const groups in msg.grouping){
                            info = info.concat(", ",`${msg.grouping[groups].replaceAll('_',' ')}: ${values[i][msg.grouping[groups]]}`)
                        }
                        s.stack.push({ text: `${info.slice(2)}\n` })
                        let table = {};
                        table.headerRows = 1;
                        table.widths = widths
                        let body = []
                        body.push(JSON.parse(JSON.stringify(header)))
                        for (const property in values[i]){
                            if (msg.agregating.indexOf(property) !== -1) {
                                let data = []
                                data.push({text: property.replaceAll('_',' '), "bold":true})
                                for(const agr in agr_func){
                                    if (agr) data.push(values[i][property][`${agr}_${property}`] || 0)
                                }
                                body.push(data)
                            }
                        }
                        table.body = body
                        s.stack.push({table:table})
                        s.stack.push({ text:"\n"})
                    }
                return s
            }
            
            msg.payload={
                "header": { "text": `Report ${new Date().toJSON().slice(0, 10)}`, "fontSize":20, margin:[0,10,0,0]},
                "content": [
                    betterfunc()
                ],
                "defaultStyle": {
                    "fontSize": 12,
                    "alignment": "center"
                }
            }
            msg.name = `C:\\Users\\abramowiczs\\Desktop\\Report ` + new Date().toJSON().slice(0, 10) + "_" + new Date().toTimeString().slice(0,8).replaceAll(":","-") + ".pdf"
            node.send(msg);
        });
    }
    RED.nodes.registerType("ReportJSON",ReportNode);
}