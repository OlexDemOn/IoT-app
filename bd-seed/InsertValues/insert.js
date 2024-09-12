var bcrypt = require('bcryptjs');

function generateHash(userPassword) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(userPassword, salt);
}
const insert = [
    {
        tableName: "users",
        data: [
            {
                into : ['uuid', 'email', 'name', 'password'],
                values: [ 'fde9f7da-23c0-4870-af84-6b74eca2cd7e', 'test@gmail.com', 'Test User', generateHash('password')],
            },
            {
                into : ['uuid','email', 'name', 'password'],
                values: ['d979ed8c-4d0c-4cb8-b3bb-4901d92d19a8','john@example.com', 'John Doe', generateHash('password')],
            },
        ]
    
    },
    {
        tableName: "groups",
        data: [
            {
                into : ['group_name'],
                values: ['admin'],
            },
            {
                into : ['group_name'],
                values: ['group test'],
            },
        ]
    },
    {
        tableName: "user_groups",
        data: [
            {
                into : ['groups_id', 'user_uuid'],
                values: [1, 'fde9f7da-23c0-4870-af84-6b74eca2cd7e'],
            },
            {
                into : ['groups_id', 'user_uuid'],
                values: [2, 'd979ed8c-4d0c-4cb8-b3bb-4901d92d19a8'],
            },
        ]
    },
    {
        tableName: "product_lines",
        data: [
            {
                into : ['product_line_id', 'group_id'],
                values: [1, 1],
            },
            {
                into : ['product_line_id' , 'group_id'],
                values: [2, 2],
            },
        ]
    },
    {
        tableName: "machine_properties",
        data: [
            {
                into: ['machine_type', 'property', 'measure'],
                values: ['soldering', ['speed', 'belt_speed', 'temperature', 'power'], ['km/h', 'm/s', '°C', 'kW']],
            },
            {
                into: ['machine_type', 'property', 'measure'],
                values: ['drilling', ['speed', 'belt_speed', 'temperature', 'torque'], ['km/h', 'm/s', '°C', 'Nm']],
            },
            {
                into: ['machine_type', 'property', 'measure'],
                values: ['welding', ['speed', 'belt_speed', 'temperature', 'gas_flow'], ['km/h', 'm/s', '°C', 'm³/h']],
            },
            {
                into: ['machine_type', 'property', 'measure'],
                values: ['assemble', ['speed', 'belt_speed', 'pressure', 'elements_ready'], ['km/h', 'm/s', 'bar', 'pcs']],
            }
        ]
    },
    // {
    //     tableName: "machines",
    //     data: [
    //         ...generateRandomValuesForMachine(1, 1001, 'drilling', ['speed', 'belt_speed', 'temperature', 'torque'], 1),
    //         ...generateRandomValuesForMachine(1, 1002, 'soldering', ['speed', 'belt_speed', 'temperature', 'power'], 1),
    //         ...generateRandomValuesForMachine(1, 1003, 'welding', ['speed', 'belt_speed', 'temperature', 'gas_flow'], 1),
    //         ...generateRandomValuesForMachine(1, 1004, 'assemble', ['speed', 'belt_speed', 'pressure', 'elements_ready'], 1),
    //     ]
    // }  
]

function generateRandomValuesForMachine(product_line_id, machine_id, machine_type, properties, amount =1) {

    const result = [];

    for (let i = 0; i < amount; i++) {
        const firstValue = Math.floor(Math.random() * 300) + 500;
        const secondValue = Math.floor(Math.random() * 200) + 300;
        const thirdValue = Math.floor(Math.random() * 200) + 300;
        const fourthValue = Math.floor(Math.random() * 200) + 300;
        
        result.push( {
            into : ['product_line_id', 'machine_id', 'machine_type', ...properties ],
            values: [product_line_id, machine_id, machine_type, firstValue, secondValue, thirdValue, fourthValue],
        })
    }
    return result;
}

function generateTimestamp() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setDate(today.getDate() +5);
    const randomDate = new Date(thirtyDaysAgo.getTime() + Math.random() * (thirtyDaysLater.getTime() - thirtyDaysAgo.getTime()));
    return randomDate.toISOString().replace('T', ' ').substring(0, 19);
}

module.exports = insert;