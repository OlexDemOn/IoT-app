const tables = require("./table");
const pool = require("../db");

function CreateTable(table) {
    return new Promise((resolve) => {
        pool.query(
            `CREATE TABLE IF NOT EXISTS ${table.tableName} (${table.columns.map((column) => `${column.value}`).join(", ")})`,
            (error, results) => {
                if (error) {
                    console.error(`Error creating table ${table.tableName}, ERROR: ${error}`);
                    throw error;
                }
                console.log(`Table ${table.tableName} created successfully`);
                resolve()
            }
        );
    });
}

async function createTables() {
    for (let i = 0; i < tables.length; i++) {
        await CreateTable(tables[i]);
    }
    return;
}

module.exports = createTables;