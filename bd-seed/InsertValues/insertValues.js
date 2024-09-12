const pool = require("../db");
const insert = require("./insert");

function InsertData(table) {
    const insertPromises = table.data.map(data => {
            const formattedValues = data.values.map(value => formater(value));
        return new Promise((resolve, reject) => {
            pool.query(`INSERT INTO ${table.tableName} (${data.into.join(", ")}) VALUES (${formattedValues});`,
                (error, results) => {
                    if (error) {
                        console.error(`Error inserting data into table ${table.tableName}, ERROR: ${error}`);
                        reject(error);
                    } else {
                        console.log(`Data inserted to ${table.tableName} successfully`);
                        resolve();
                    }
                }
            );
        });
    });

    return Promise.all(insertPromises);
}

function formater(value) {
    if (typeof value === 'string') {
        return `'${value}'`;
    }
    else if(typeof value === 'object'){
        return `ARRAY[${value.map(val => formater(val)).join(", ")}]`;
    }
    return value;
}

async function insertData() {
    for (let i = 0; i < insert.length; i++) {
        await InsertData(insert[i]);
    }
}

module.exports = insertData;