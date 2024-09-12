const createTables = require("./createTable/createTable");
const insertData = require("./InsertValues/insertValues");
const deleteAllData = require("./DeleteAllData/deleteAllData");

const readline = require("node:readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

console.log("1. Create tables and insert data");
console.log("2. Create tables");
console.log("3. Insert data");
console.log("4. Delete all data");

rl.question(`Choose option: `, (option) => {
    start(parseInt(option));
    rl.close();
});

async function start(option = 1) {
    if (option === 1) {
        await createTables();
        await insertData();
    } else if (option === 2) {
        await createTables();
    } else if (option === 3) {
        await insertData();
    } else if (option === 4) {
        await deleteAllData();
    } else {
        console.log("Invalid option");
    }
}
