"""
Defines database connection settings and SQLAlchemy engine.

This module provides functions to construct the database URL, create the
SQLAlchemy engine, and define a declarative base for ORM models.
Database credentials are loaded from environment variables.
"""

import os

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
# Removed declarative_base as Base is now defined in models.py


# Environment variable names for database configuration
DB_HOST_ENV = "POSTGRES_HOST"
DB_PORT_ENV = "POSTGRES_PORT"
DB_USER_ENV = "POSTGRES_USER"
DB_PASSWORD_ENV = "POSTGRES_PASSWORD"
DB_NAME_ENV = "POSTGRES_DB"


def get_database_url() -> str:
    """
    Constructs the PostgreSQL database URL from environment variables.

    Raises:
        ValueError: If any required database environment variable is not set.

    Returns:
        str: The constructed database URL using psycopg2 driver.
    """
    db_host = os.getenv(DB_HOST_ENV)
    db_port = os.getenv(DB_PORT_ENV)
    db_user = os.getenv(DB_USER_ENV)
    db_password = os.getenv(DB_PASSWORD_ENV)
    db_name = os.getenv(DB_NAME_ENV)

    required_vars = {
        DB_HOST_ENV: db_host,
        DB_PORT_ENV: db_port,
        DB_USER_ENV: db_user,
        DB_PASSWORD_ENV: db_password,
        DB_NAME_ENV: db_name,
    }

    for var_name, var_value in required_vars.items():
        if var_value is None:
            raise ValueError(f"Environment variable '{var_name}' is not set.")

    # Using psycopg2 as the driver for PostgreSQL for synchronous operations
    return (
        f"postgresql+psycopg2://{db_user}:{db_password}@{db_host}:"
        f"{db_port}/{db_name}"
    )


def get_engine() -> Engine:
    """
    Creates and returns a SQLAlchemy engine instance for synchronous operations.

    The engine is configured using the database URL obtained from
    `get_database_url()`. This engine is suitable for tools like Alembic.

    Returns:
        Engine: A SQLAlchemy engine connected to the PostgreSQL database.
    """
    database_url = get_database_url()
    # echo=False for production, set to True for debugging SQL queries
    engine = create_engine(database_url, echo=False)
    return engine


# Base class for declarative models is now imported from models.py
# Base = declarative_base()
