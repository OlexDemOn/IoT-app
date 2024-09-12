import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import { Table, Select, Input, Pagination, Card } from 'antd';

const { Option } = Select;

const MachineStatus = () => {
  const [machines, setMachines] = useState([]);
  const [filteredMachines, setFilteredMachines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    // Connect to the MQTT broker
    const client = mqtt.connect('ws://mqtt.eclipseprojects.io:80/mqtt');

    // Subscribe to the 'machines/new' topic
    client.on('connect', () => {
      client.subscribe('machines/new');
    });

    // Handle incoming MQTT messages
    client.on('message', (topic, message) => {
      const newMachine = JSON.parse(message.toString());
      setMachines(prevMachines => [...prevMachines, newMachine]);
      setFilteredMachines(prevMachines => [...prevMachines, newMachine]);
    });

    return () => {
      client.end();
    };
  }, []);

  useEffect(() => {
    const filtered = machines.filter(machine =>
      machine.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (sortKey) {
      filtered.sort((a, b) => {
        if (a.parameters[sortKey] < b.parameters[sortKey]) return -1;
        if (a.parameters[sortKey] > b.parameters[sortKey]) return 1;
        return 0;
      });
    }
    setFilteredMachines(filtered);
  }, [searchTerm, sortKey, machines]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (value) => {
    setSortKey(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderParameters = (params) => {
    return Object.entries(params).map(([param, value], index) => (
      <div key={index} style={{ marginBottom: 8 }}>
        <strong>{param}</strong>: {value}
      </div>
    ));
  };

  const displayData = filteredMachines.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <Input
          placeholder="Search machines"
          value={searchTerm}
          onChange={handleSearch}
          style={{ width: 200 }}
        />
        <Select
          placeholder="Sort by"
          onChange={handleSort}
          style={{ width: 200, marginRight: 10 }}
        >
          <Option value="BeltSpeed">Belt Speed</Option>
          <Option value="Temperature">Temperature</Option>
          <Option value="MachineSpeed">Machine Speed</Option>
          <Option value="Pressure">Pressure</Option>
        </Select>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
        {displayData.map((machine, index) => (
          <Card key={index} title={machine.name} style={{ width: '45%' }}>
            {renderParameters(machine.parameters)}
          </Card>
        ))}
      </div>
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={filteredMachines.length}
        onChange={handlePageChange}
        style={{ marginTop: 20, textAlign: 'center' }}
      />
    </div>
  );
};

export default MachineStatus;

