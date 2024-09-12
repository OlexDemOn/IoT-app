import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Modal, Form, Input, Select, Card, Table, Pagination } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Header, Content } = Layout;
const { Option } = Select;

const timeOptions = [
  "5min", "15min", "30min", "1h", "2h", "6h", "12h", "24h", 
  "2 days", "4 days", "7 days", "2 weeks", "1 month"
];

const sortOptions = [
  "DrillingSpeed", "Torque", "Power", "GasFlow", "Pressure", 
  "BeltSpeed", "Temperature", "Speed"
];

const parameterUnits = {
  "DrillingSpeed": "rpm",
  "Torque": "Nm",
  "Power": "kW",
  "GasFlow": "m³/h",
  "Pressure": "bar",
  "BeltSpeed": "m/s",
  "Temperature": "°C",
  "Speed": "m/s"
};

const App = () => {
  const [machines, setMachines] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [form] = Form.useForm();
  const [sortParameter, setSortParameter] = useState('Name');
  const [sortOrder, setSortOrder] = useState('ascend');
  const [sortedMachines, setSortedMachines] = useState([]);

  useEffect(() => {
    fetchMachines();

    const interval = setInterval(fetchMachines, 3000);

    return () => clearInterval(interval);
  }, []);

  const fetchMachines = async () => {
    try {
      const { data } = await axios.get('http://127.0.0.1:5000/machines');
      setMachines(data);
      setSortedMachines(data);
    } catch (error) {
      console.error('Error fetching machines:', error);
    }
  };

  const addMachine = () => {
    setEditingMachine(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const editMachine = (machine) => {
    setEditingMachine(machine);
    form.setFieldsValue(machine);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      if (editingMachine) {
        const updatedMachines = machines.map(machine =>
          machine.name === editingMachine.name ? { ...machine, ...values } : machine
        );
        setMachines(updatedMachines);
        setSortedMachines(updatedMachines);
      } else {
        const newMachines = [...machines, values];
        setMachines(newMachines);
        setSortedMachines(newMachines);
      }
      setIsModalVisible(false);
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onPaginationChange = (page) => {
    setCurrentPage(page);
  };

  const onTimeRangeChange = (value) => {
    // handle time range change
  };

  const onSortParameterChange = (value) => {
    setSortParameter(value);
  };

  const onSortOrderChange = (order) => {
    setSortOrder(order);
  };

  const applySort = () => {
    let sorted = [];

    if (sortParameter === 'Name') {
      sorted = [...machines].sort((a, b) => 
        sortOrder === 'ascend' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      );
    } else {
      sorted = [...machines].sort((a, b) => {
        const paramA = a.parameters.find(param => param.parameter === sortParameter)?.value || '';
        const paramB = b.parameters.find(param => param.parameter === sortParameter)?.value || '';
        const numericParamA = isNaN(Number(paramA)) ? paramA : Number(paramA);
        const numericParamB = isNaN(Number(paramB)) ? paramB : Number(paramB);

        return sortOrder === 'ascend' ? 
          (numericParamA < numericParamB ? -1 : numericParamA > numericParamB ? 1 : 0) : 
          (numericParamA > numericParamB ? -1 : numericParamA < numericParamB ? 1 : 0);
      });
    }

    setSortedMachines(sorted);
    setCurrentPage(1);
  };

  const validateParameter = (value) => {
    if (!Object.keys(parameterUnits).includes(value)) {
      return Promise.reject(new Error('Parameter must be one of: DrillingSpeed, Torque, Power, GasFlow, Pressure, BeltSpeed, Temperature, Speed'));
    }
    return Promise.resolve();
  };

  const validateUnit = (value, parameter) => {
    if (parameter && value !== parameterUnits[parameter]) {
      return Promise.reject(new Error(`Unit must be ${parameterUnits[parameter]}`));
    }
    return Promise.resolve();
  };

  const handleParameterChange = async (index, value) => {
    const parameters = form.getFieldValue('parameters') || [];
    const parameter = value;
    const unit = parameters[index]?.unit;

    try {
      await validateParameter(parameter);
      await validateUnit(unit, parameter);
    } catch (error) {
      console.error(error.message);
    }
  };

  const currentData = sortedMachines.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header>
        <Menu theme="dark" mode="horizontal">
          <Menu.Item key="1">Dashboard</Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: '10px 50px', flex: 1 }}>
        <div style={{ marginBottom: '10px' }}>
          <Button type="primary" onClick={addMachine}>Add Machine</Button>
          <Select defaultValue="5min" style={{ width: 120, marginLeft: '20px' }} onChange={onTimeRangeChange}>
            {timeOptions.map(option => <Option key={option} value={option}>{option}</Option>)}
          </Select>
          <Select defaultValue="Name" style={{ width: 160, marginLeft: '20px' }} onChange={onSortParameterChange}>
            {sortOptions.map(option => <Option key={option} value={option}>{option}</Option>)}
          </Select>
          <Select defaultValue="ascend" style={{ width: 120, marginLeft: '20px' }} onChange={onSortOrderChange}>
            <Option value="ascend">Ascending</Option>
            <Option value="descend">Descending</Option>
          </Select>
          <Button type="default" style={{ marginLeft: '20px' }} onClick={applySort}>Sort</Button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {currentData.map(machine => (
            <div key={machine.name} style={{ flex: '1 0 calc(20% - 16px)', maxWidth: 'calc(20% - 16px)', boxSizing: 'border-box' }}>
              <Card
                title={<div style={{ textAlign: 'center' }}>{machine.name}</div>}
                extra={<Button onClick={() => editMachine(machine)}>Edit</Button>}
                style={{ height: 'auto', minHeight: '300px', maxHeight: 'auto', overflow: 'hidden' }}
              >
                {machine.parameters && machine.parameters.length > 0 ? (
                  <Table
                    dataSource={machine.parameters}
                    columns={[
                      { title: 'Parameter', dataIndex: 'parameter', key: 'parameter' },
                      { title: 'Value', dataIndex: 'value', key: 'value' },
                      { title: 'Unit', dataIndex: 'unit', key: 'unit' },
                    ]}
                    pagination={false}
                    size="small"
                    style={{ marginBottom: 0 }}
                  />
                ) : (
                  <div>No parameters available</div>
                )}
              </Card>
            </div>
          ))}
        </div>
        <Pagination
          current={currentPage}
          onChange={onPaginationChange}
          total={sortedMachines.length}
          pageSize={10}
          style={{ textAlign: 'center', marginTop: '10px' }}
        />
      </Content>

      <Modal title={editingMachine ? "Edit Machine" : "Add Machine"} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input the name!' }]}>
            <Input disabled={!!editingMachine} />
          </Form.Item>
          <Form.Item name="parameters" label="Parameters">
            <Form.List name="parameters">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, fieldKey, ...restField }) => (
                    <div key={key} style={{ display: 'flex', marginBottom: 8 }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'parameter']}
                        fieldKey={[fieldKey, 'parameter']}
                        rules={[{ required: true, message: 'Missing parameter' }]}
                        validateTrigger={['onChange']}
                      >
                        <Select
                          placeholder="Parameter"
                          onChange={value => handleParameterChange(name, value)}
                        >
                          {Object.keys(parameterUnits).map(param => (
                            <Option key={param} value={param}>{param}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'value']}
                        fieldKey={[fieldKey, 'value']}
                        rules={[{ required: true, message: 'Missing value' }]}
                      >
                        <Input placeholder="Value" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'unit']}
                        fieldKey={[fieldKey, 'unit']}
                        rules={[
                          { required: true, message: 'Missing unit' },
                          {
                            validator: (_, value) => {
                              const parameter = form.getFieldValue(['parameters', name, 'parameter']);
                              return validateUnit(value, parameter);
                            }
                          }
                        ]}
                      >
                        <Input placeholder="Unit" />
                      </Form.Item>
                      <Button onClick={() => remove(name)}>Remove</Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Add Parameter</Button>
                </>
              )}
            </Form.List>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default App;
