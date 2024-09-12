"""
Database configuration file.
"""

import logging
import time
import psycopg2


class DatabaseConnectionError(Exception):
    """Exception raised when the database connection cannot be established."""


def get_db_connection():
    """Establish a connection to the PostgreSQL database."""
    retries = 5
    for attempt in range(retries):
        try:
            conn = psycopg2.connect(
                dbname="admin",
                user="postgres",
                password="postgres",
                host="localhost",
            )
            return conn
        except psycopg2.OperationalError as exc:
            logging.error("Database connection failed (attempt %d): %s.", attempt + 1, exc)
            time.sleep(5)
    logging.critical("Failed to connect to the database after %d retries.", retries)
    raise DatabaseConnectionError("Failed to connect to the database.") from exc


def create_table_if_not_exists():
    """Create the machine_data table if it doesn't already exist."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS machine_data (
                    id SERIAL PRIMARY KEY,
                    machine_name VARCHAR(255),
                    topic VARCHAR(255),
                    value FLOAT,
                    unit VARCHAR(50),
                    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            conn.commit()
    except psycopg2.Error as exc:
        logging.error("Error creating table: %s", exc)
    finally:
        conn.close()


def insert_machine_data(machine, topic, message, unit):
    """Insert data into the machine_data table."""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO machine_data (machine_name, topic, value, unit, timestamp)
                VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
                """,
                (machine, topic, message, unit),
            )
            conn.commit()
    except psycopg2.Error as exc:
        logging.error("Database error: %s", exc)
    finally:
        conn.close()
