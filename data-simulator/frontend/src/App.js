import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Menu, Button, Modal, Form, Input, Select, Card, Table, Pagination, InputNumber } from 'antd';
import { PlusOutlined, InfoCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import * as echarts from 'echarts';

const { Header, Content } = Layout;
const { Option } = Select;

const sortOptions = [
  "DrillingSpeed", "Torque", "Power", "GasFlow", "Pressure", 
  "BeltSpeed", "Temperature", "Speed"
];

const timeOptions = [
  { label: "Past 5 minutes", value: 5 },
  { label: "Past 15 minutes", value: 15 },
  { label: "Past 30 minutes", value: 30 },
  { label: "Past 1 hour", value: 60 },
  { label: "Past 3 hours", value: 180 },
  { label: "Past 6 hours", value: 360 },
  { label: "Past 12 hours", value: 720 },
  { label: "Past 24 hours", value: 1440 },
  { label: "Past 3 days", value: 4320 },
  { label: "Past 7 days", value: 10080 },
  { label: "Past 2 weeks", value: 20160 },
  { label: "Past month", value: 43200 },
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
  const [detailsMachine, setDetailsMachine] = useState(null);
  const [form] = Form.useForm();
  const [sortParameter, setSortParameter] = useState('Name');
  const [sortOrder, setSortOrder] = useState('ascend');
  const [sortedMachines, setSortedMachines] = useState([]);
  const [timeFilter, setTimeFilter] = useState(null);

  useEffect(() => {
    fetchMachines();
    const interval = setInterval(fetchMachines, 15000);
    return () => clearInterval(interval);
  }, []);

  const renderCharts = useCallback(() => {
    if (!detailsMachine) return;

    detailsMachine.parameters.forEach((param, index) => {
      const chartId = `chart-${param.parameter}-${index}`;
      const chartElement = document.getElementById(chartId);
      if (chartElement) {
        const chart = echarts.init(chartElement);
        const option = {
          title: { text: param.parameter },
          tooltip: {},
          xAxis: { type: 'category', data: param.timestamps || [] },
          yAxis: { type: 'value' },
          series: [{ data: param.values || [], type: 'line' }]
        };
        chart.setOption(option);
      }
    });
  }, [detailsMachine]);

  useEffect(() => {
    renderCharts();
  }, [renderCharts, detailsMachine]);

  const fetchMachines = async () => {
    try {
      const { data } = await axios.get('http://127.0.0.1:5000/machines');
      setMachines(data);
      setSortedMachines(data);
    } catch (error) {
      console.error('Error fetching machines:', error);
    }
  };

  const fetchMachineData = async (machineName) => {
    try {
      const { data } = await axios.get('http://127.0.0.1:5000/machine-data', {
        params: { machine_name: machineName, lookback_minutes: 5 }  // Fetch last 5 minutes data
      });
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      // Filter data to include only the last 5 minutes
      const filteredData = Object.keys(data).reduce((acc, topic) => {
        const timestamps = data[topic].timestamps.filter(time => new Date(time) >= fiveMinutesAgo);
        const values = data[topic].values.slice(data[topic].timestamps.length - timestamps.length);
        acc[topic] = { ...data[topic], timestamps, values };
        return acc;
      }, {});
      return filteredData;
    } catch (error) {
      console.error('Error fetching machine data:', error);
      return null;
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

  const viewDetails = async (machine) => {
    const machineData = await fetchMachineData(machine.name);
    if (machineData) {
      const parameters = Object.keys(machineData).map(topic => ({
        parameter: topic,
        timestamps: machineData[topic].timestamps,
        values: machineData[topic].values,
        unit: machineData[topic].unit,
      }));
      setDetailsMachine({ ...machine, parameters });
      setIsModalVisible(true);
    }
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
    }).catch(errorInfo => {
      console.error('Failed:', errorInfo);
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setDetailsMachine(null); // Close details modal
  };

  const onPaginationChange = (page) => {
    setCurrentPage(page);
  };

  const onSortParameterChange = (value) => {
    setSortParameter(value);
  };

  const onSortOrderChange = (order) => {
    setSortOrder(order);
  };

  const onTimeFilterChange = (value) => {
    setTimeFilter(value);
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

    if (timeFilter !== null) {
      const now = new Date();
      sorted = sorted.filter(machine => {
        const machineTime = new Date(machine.timestamp);
        const diffInMinutes = (now - machineTime) / (1000 * 60); // Difference in minutes
        return diffInMinutes <= timeFilter;
      });
    }

    setSortedMachines(sorted);
    setCurrentPage(1);
  };

  const handleParameterChange = (index, value) => {
    const parameters = form.getFieldValue('parameters') || [];
    const updatedParameters = [...parameters];
    const unit = parameterUnits[value];

    // Update the selected parameter and its corresponding unit
    updatedParameters[index] = { ...updatedParameters[index], parameter: value, unit };

    form.setFieldsValue({ parameters: updatedParameters });
  };

  const currentData = sortedMachines.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header>
        <Menu theme="dark" mode="horizontal" items={[{ key: "1", label: "Dashboard" }]} />
      </Header>
      <Content style={{ padding: '10px 50px', flex: 1 }}>
        <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" onClick={addMachine}>Add Machine</Button>
          <Select defaultValue="Name" style={{ width: 160, marginLeft: '20px' }} onChange={onSortParameterChange}>
            {sortOptions.map(option => <Option key={option} value={option}>{option}</Option>)}
          </Select>
          <Select defaultValue="ascend" style={{ width: 120, marginLeft: '20px' }} onChange={onSortOrderChange}>
            <Option value="ascend">Ascending</Option>
            <Option value="descend">Descending</Option>
          </Select>
          <Select placeholder="Filter by time" style={{ width: 200, marginLeft: '20px' }} onChange={onTimeFilterChange}>
            {timeOptions.map(option => <Option key={option.value} value={option.value}>{option.label}</Option>)}
          </Select>
          <Button type="default" style={{ marginLeft: '20px' }} onClick={applySort}>Sort</Button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {currentData.map((machine, index) => (
            <div key={index} style={{ flex: '1 0 calc(20% - 16px)', maxWidth: 'calc(20% - 16px)', boxSizing: 'border-box' }}>
              <Card
                title={<div style={{ textAlign: 'center' }}>{machine.name}</div>}
                extra={
                  <>
                    <Button onClick={() => editMachine(machine)}>Edit</Button>
                    <Button 
                      type="default" 
                      icon={<InfoCircleOutlined />} 
                      onClick={() => viewDetails(machine)} 
                      style={{ marginLeft: '10px' }}
                    >
                      Details
                    </Button>
                  </>
                }
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

      <Modal 
        title={editingMachine ? "Edit Machine" : "Add Machine"} 
        visible={isModalVisible && !detailsMachine} 
        onOk={handleOk} 
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please input the name!' }]}>
            <Input disabled={!!editingMachine} />
          </Form.Item>
          <Form.Item name="parameters" label="Parameters">
            <Form.List 
              name="parameters"
              rules={[
                {
                  validator: async (_, parameters) => {
                    if (!parameters || parameters.length < 1) {
                      return Promise.reject(new Error('At least one parameter is required.'));
                    }
                    for (const param of parameters) {
                      if (!param.parameter || !param.value || !param.unit) {
                        return Promise.reject(new Error('All parameter fields must be filled.'));
                      }
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
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
                        style={{ width: '40%' }}
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
                        style={{ width: '40%' }}
                      >
                        <InputNumber placeholder="Value" style={{ width: '100%' }} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'unit']}
                        fieldKey={[fieldKey, 'unit']}
                        rules={[{ required: true, message: 'Missing unit' }]}
                        style={{ width: '20%' }}
                      >
                        <Input placeholder="Unit" disabled />
                      </Form.Item>
                      <Button onClick={() => remove(name)}>Remove</Button>
                    </div>
                  ))}
                  <Button 
                    type="dashed" 
                    onClick={() => add()} 
                    block 
                    icon={<PlusOutlined />} 
                    style={{ marginTop: 16 }} 
                    disabled={fields.length >= 4}  // Disable button if 4 parameters already added
                  >
                    Add Parameter
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>
        </Form>
      </Modal>

      <Modal 
        title="Machine Details" 
        visible={!!detailsMachine} 
        onCancel={handleCancel}
        footer={null}
        width={900}
        bodyStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {detailsMachine && detailsMachine.parameters.map((param, index) => (
            <div key={index} style={{ flex: '1 0 calc(50% - 16px)', maxWidth: 'calc(50% - 16px)', boxSizing: 'border-box' }}>
              <div id={`chart-${param.parameter}-${index}`} style={{ width: '100%', height: '300px' }}></div>
            </div>
          ))}
        </div>
      </Modal>
    </Layout>
  );
};

export default App;

