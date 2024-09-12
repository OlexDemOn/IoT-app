const tables = require("../createTable/table");
const pool = require("../db");

function DeleteTable(tableName) {
    return new Promise((resolve) => {
        pool.query(
            `DROP TABLE IF EXISTS ${tableName} cascade`,
            (error, results) => {
                if (error) {
                    console.error(`Error deleting table ${tableName}, ERROR: ${error}`);
                    throw error;
                }
                console.log(`Table ${tableName} deleted successfully`);
                resolve()
            }
        );
    });
}

async function deleteAllData() {
    for (let i = 0; i < tables.length; i++) {
        await DeleteTable(tables[i].tableName);
    }
}

module.exports = deleteAllData;