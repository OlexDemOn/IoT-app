const tables = [
    {
        tableName: 'users',
        columns: [
            { value: 'uuid UUID DEFAULT gen_random_uuid() PRIMARY KEY' },
            { value: 'email VARCHAR(50) NOT NULL' },
            { value: 'name VARCHAR(50) NOT NULL' },
            { value: 'password VARCHAR(100) NOT NULL' },
            { value: 'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
        ]
    },
    {
        tableName: 'groups',
        columns: [
            { value: 'groups_id SERIAL PRIMARY KEY' },
            { value: 'group_name VARCHAR(50) NOT NULL' },
        ]
    },
    {
        tableName: 'user_groups',
        columns: [
            { value: 'groups_id INT' },
            { value: 'user_uuid UUID' },
            { value: 'PRIMARY KEY (groups_id, user_uuid)' },
            { value: 'FOREIGN KEY (groups_id) REFERENCES groups(groups_id)' },
            { value: 'FOREIGN KEY (user_uuid) REFERENCES users(uuid)' },
        ]
    },
    {
        tableName: 'product_lines',
        columns: [
            { value: 'product_line_id SERIAL PRIMARY KEY' },
            { value: 'group_id INT' },
            { value: 'FOREIGN KEY (group_id) REFERENCES groups(groups_id)' },
        ]
    },
    {
        tableName: 'machines',
        columns: [
            { value: 'machine_id INT' },
            { value: 'machine_type VARCHAR(50) NOT NULL' },
            { value: 'product_line_id INT' },
            { value: 'speed INT' },
            { value: 'belt_speed INT DEFAULT NULL' },
            { value: 'temperature INT DEFAULT NULL' },
            { value: 'gas_flow INT DEFAULT NULL' },
            { value: 'torque INT DEFAULT NULL' },
            { value: 'pressure INT DEFAULT NULL' },
            { value: 'elements_ready INT DEFAULT NULL' },
            { value: 'power INT DEFAULT NULL' },
            { value: 'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'},
            { value: 'FOREIGN KEY (product_line_id) REFERENCES product_lines(product_line_id)' },
        ]
    },
    {
        tableName: 'machine_properties',
        columns: [
            { value: 'machine_type VARCHAR(50) PRIMARY KEY' },
            { value: 'property TEXT[] NOT NULL' },
            { value: 'measure TEXT[] NOT NULL' },
        ]
    }
    
];

module.exports = tables;
