"""
Database session and connection engine configuration for Peblo TV.
Provides SQLAlchemy base declarative model and scoped sessionmaker.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Default to SQLite for local development; can be overridden via DATABASE_URL environment variable
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./peblo.db")

# SQLAlchemy engine initialization with SQLite thread checking disabled for multi-threaded requests
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Configured session factory for database operations
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base class for ORM models
Base = declarative_base()