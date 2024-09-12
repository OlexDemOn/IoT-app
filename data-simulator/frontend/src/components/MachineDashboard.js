// src/components/MachineDashboard.js
import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import { Card, Row, Col, Button, Input, Space, Pagination, Modal, Form, InputNumber } from 'antd';
import 'antd/dist/antd.css';

const { Search } = Input;

const MQTT_BROKER = 'ws://mqtt.eclipseprojects.io:80'; // WebSocket URL

const MachineDashboard = () => {
  const [machines, setMachines] = useState([]);
  const [filteredMachines, setFilteredMachines] = useState([]);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();
  const machinesPerPage = 10;

  useEffect(() => {
    const client = mqtt.connect(MQTT_BROKER);

    client.on('connect', () => {
      console.log('Connected to MQTT broker');
      client.subscribe('factory/machines/#', (err) => {
        if (err) {
          console.error('Subscription error:', err);
        }
      });
    });

    client.on('message', (topic, message) => {
      console.log('Message received:', topic, message.toString());
      const data = JSON.parse(message.toString());
      const newMachine = {
        topic,
        ...data
      };
      setMachines((prevMachines) => {
        const updatedMachines = [...prevMachines, newMachine];
        return updatedMachines;
      });
    });

    client.on('error', (err) => {
      console.error('Connection error:', err);
    });

    return () => {
      client.end();
    };
  }, []);

  useEffect(() => {
    const filtered = machines.filter(machine =>
      machine.topic.toLowerCase().includes(filter.toLowerCase())
    );
    setFilteredMachines(filtered);
  }, [filter, machines]);

  const handleFilterChange = (value) => {
    setFilter(value);
  };

  const handlePageChange = (page) => {
    setPage(page);
  };

  const handleAddMachine = () => {
    setShowModal(true);
  };

  const handleModalOk = () => {
    form
      .validateFields()
      .then(values => {
        const machineName = `Machine_${Date.now()}`;
        const topic = `factory/machines/${machineName}`;
        const payload = JSON.stringify(values);
        
        const client = mqtt.connect(MQTT_BROKER);
        client.on('connect', () => {
          client.publish(topic, payload);
          console.log(`Published new machine to topic ${topic}: ${payload}`);
          client.end();
        });

        setShowModal(false);
        form.resetFields();
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  const handleModalCancel = () => {
    setShowModal(false);
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
        <Button
          type="primary"
          onClick={handleAddMachine}
          style={{ marginBottom: '20px' }}
        >
          Add Machine
        </Button>
        <Row gutter={16}>
          {currentMachines.map((machine, index) => (
            <Col span={8} key={index}>
              <Card
                title={machine.topic}
                size="small"
                style={{ marginBottom: '16px', width: '100%' }}
              >
                <p><strong>Parameters:</strong></p>
                {Object.entries(machine.parameters || {}).map(([param, value]) => (
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
      </Space>
      <Modal
        title="Add New Machine"
        visible={showModal}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form
          form={form}
          layout="vertical"
          name="add_machine_form"
        >
          <Form.Item
            name="DrillingSpeed"
            label="Drilling Speed (rpm)"
            rules={[{ required: true, message: 'Please input the drilling speed!' }]}
          >
            <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="Torque"
            label="Torque (kNm)"
            rules={[{ required: true, message: 'Please input the torque!' }]}
          >
            <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="BeltSpeed"
            label="Belt Speed (%)"
            rules={[{ required: true, message: 'Please input the belt speed!' }]}
          >
            <InputNumber min={0} max={100} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="Temperature"
            label="Temperature (°C)"
            rules={[{ required: true, message: 'Please input the temperature!' }]}
          >
            <InputNumber min={-100} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MachineDashboard;

