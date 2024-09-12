# Python Flask, MQTT, and React Application

This project showcases a full-stack application using Python Flask, MQTT, PostgreSQL, and React. It consists of a backend that generates data, a Flask server that handles API requests, an MQTT broker for real-time messaging, and a React frontend that displays the data.

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [Accessing the Application](#accessing-the-application)

## Overview

This application includes the following components:
- **Backend**: A Python Flask application for serving data via REST API and MQTT.
- **Frontend**: A React application consuming data from the Flask API and MQTT broker.
- **MQTT Broker**: An Eclipse Mosquitto MQTT broker for real-time communication.
- **PostgreSQL Database**: A PostgreSQL database managed by Docker Compose for data storage.

## Project Structure

./
├── backend
│   ├── Dockerfile
│   ├── app.py
│   └── requirements.txt
├── frontend
│   ├── Dockerfile
│   ├── package.json
│   └── src
│       └── App.js
├── mosquitto
│   ├── mosquitto_config
│   │   └── mosquitto.conf
│   ├── mosquitto_data
│   └── mosquitto_log
├── nodered
│   └── Dockerfile
├── docker-compose.yml
└── README.md

## Getting Started

### Prerequisites

- Docker
- Docker Compose

### Installation

1. Clone the repository:

   ```bash
   git clone git@gitlab.ttpsc.com:intern-iot-zg/data-simulator.git
   cd your-repo

2. Build and start the services:
  docker-compose up --build

### Usage

1. Running the application:

   docker-compose up

2. Stopping the application:

   docker-compose down

3. In case of errors with other containers run:

   docker-compose down --rmi all --volumes
   
   docker container prune

## Accessing the Application

- **Frontend**: Open your browser and navigate to `http://localhost:3000`
- **Backend**: The Flask API can be accessed at `http://localhost:5000`
- **MQTT Broker**: The MQTT broker will be running on `mqtt://localhost:1883`

## Frontend

- **Built from**: The `frontend` directory
- **Runs on port**: `3000`
- **Environment variables**:
  - `REACT_APP_API_URL`: URL for the Flask backend API.
  - `REACT_APP_MQTT_URL`: URL for the MQTT broker.

## Backend

- **Built from**: The `backend` directory
- **Runs on port**: `5000`
- **Environment variables**:
  - `FLASK_ENV`: Set to `development` for development mode.
  - `DATABASE_URL`: Connection URL for PostgreSQL (default: `postgresql://admin:admin@db:5432/all_machine_data`).

## MQTT Broker

- **Uses**: The `eclipse-mosquitto` image
- **Accessible on ports**:
  - `1883` (MQTT)
  - `9001` (WebSockets)
- **Configuration and data**: Managed under the `mosquitto` directory.

## PostgreSQL Database

- **Managed by**: Docker Compose
- **Default credentials**:
  - **Username**: `admin`
  - **Password**: `admin`
- **Database name**: `all_machine_data`
- **Data**: Automatically managed and stored by the Docker Compose setup.
