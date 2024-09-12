import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt';
import { Card, Row, Col, Button, Input, Space, Pagination } from 'antd';
import 'antd/dist/antd.css';

const { Search } = Input;

const MQTT_BROKER = 'ws://mqtt.eclipseprojects.io:80';  // MQTT broker URL with WebSocket support

const MachineDashboard = () => {
  const [machines, setMachines] = useState([]);
  const [filteredMachines, setFilteredMachines] = useState([]);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const machinesPerPage = 10;

  useEffect(() => {
    const client = mqtt.connect(MQTT_BROKER);

    client.on('connect', () => {
      console.log('Connected to MQTT broker');
      // Subscribe to all topics
      client.subscribe('#', (err) => {
        if (err) {
          console.error('Subscription error:', err);
        }
      });
    });

    client.on('message', (topic, message) => {
      const data = JSON.parse(message.toString());
      const newMachine = {
        ...data,
        topic,
      };
      setMachines((prevMachines) => {
        const updatedMachines = [...prevMachines, newMachine];
        return updatedMachines;
      });
    });

    return () => client.end();
  }, []);

  useEffect(() => {
    const filtered = machines.filter(machine =>
      machine.name.toLowerCase().includes(filter.toLowerCase())
    );
    setFilteredMachines(filtered);
  }, [filter, machines]);

  const handleFilterChange = (value) => {
    setFilter(value);
  };

  const handlePageChange = (page) => {
    setPage(page);
  };

  const currentMachines = filteredMachines.slice(
    (page - 1) * machinesPerPage,
    page * machinesPerPage
  );

  return (
    <div style={{ padding: '20px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Search
          placeholder="Filter machines"
          onSearch={handleFilterChange}
          enterButton
        />
        <Row gutter={16}>
          {currentMachines.map(machine => (
            <Col span={8} key={machine.topic}>
              <Card
                title={machine.name}
                size="small"
                style={{ marginBottom: '16px' }}
              >
                <p><strong>Type:</strong> {machine.type}</p>
                {Object.entries(machine.parameters).map(([param, value]) => (
                  <p key={param}>
                    <strong>{param}:</strong> {value}
                  </p>
                ))}
              </Card>
            </Col>
          ))}
        </Row>
        <Pagination
          current={page}
          pageSize={machinesPerPage}
          total={filteredMachines.length}
          onChange={handlePageChange}
        />
        <Button
          type="primary"
          onClick={() => {
            // Implement add machine logic
            console.log('Add new machine logic here');
          }}
        >
          Add Machine
        </Button>
      </Space>
    </div>
  );
};

export default MachineDashboard;

