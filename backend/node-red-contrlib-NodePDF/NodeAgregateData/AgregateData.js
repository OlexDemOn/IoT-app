module.exports = function (RED) {
    function AgregateData(config) {
        RED.nodes.createNode(this, config);
        let node = this;
        node.on("input", function (msg) {
            const data = msg.payload;
            let prepared_data = [];
            for (const machines in data) {
                let machinedata = {};
                let agregationdata = {};
                for (const values in data[machines]) {
                    if (msg.grouping.includes(values)) {
                        machinedata[values] = data[machines][values];
                    } else if (msg.agregating.includes(values)) {
                        agregationdata[values] = [];
                        agregationdata[values].push(data[machines][values]);
                    }
                }
                let create_group = true;
                for (const groups in prepared_data) {
                    if (
                        JSON.stringify(prepared_data[groups]).includes(
                            JSON.stringify(machinedata).slice(0, -1)
                        )
                    ) {
                        for (const values in prepared_data[groups].data) {
                            prepared_data[groups]["data"][values].push(
                                agregationdata[values][0]
                            );
                        }
                        create_group = false;
                        break;
                    }
                }
                if (create_group) {
                    machinedata.data = agregationdata;
                    prepared_data.push(machinedata);
                }
            }
            msg.check = JSON.parse(JSON.stringify(prepared_data));
            for (const groups in prepared_data) {
                for (const values in prepared_data[groups].data) {
                    if (
                        prepared_data[groups]["data"][values].every(
                            (element) => element === null
                        )
                    ) {
                        delete prepared_data[groups]["data"][values];
                        continue;
                    }
                    prepared_data[groups][values] = {};
                    if (msg.func.avg) {
                        prepared_data[groups][values][`avg_${values}`] = +(
                            prepared_data[groups]["data"][values].reduce(
                                (a, b) => a + b
                            ) / prepared_data[groups]["data"][values].length
                        ).toFixed(2);
                    }
                    if (msg.func.min) {
                        prepared_data[groups][values][`min_${values}`] =
                            Math.min(...prepared_data[groups]["data"][values]);
                    }
                    if (msg.func.max) {
                        prepared_data[groups][values][`max_${values}`] =
                            Math.max(...prepared_data[groups]["data"][values]);
                    }
                    if (msg.func.median) {
                        const sorted = [
                            ...prepared_data[groups]["data"][values],
                        ].sort((a, b) => a - b);
                        const middle = sorted.length / 2;
                        const median =
                            middle % 1 === 0
                                ? (sorted[middle - 1] + sorted[middle]) / 2
                                : sorted[Math.floor(middle)];
                        prepared_data[groups][values][`median_${values}`] =
                            median;
                    }
                }
                delete prepared_data[groups].data;
            }

            msg.payload = prepared_data;
            node.send(msg);
        });
    }
    RED.nodes.registerType("AgregateData", AgregateData);
};
