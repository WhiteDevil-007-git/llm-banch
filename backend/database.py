"""
This file handles the database connection and session management.
It imports SQLAlchemy components and reads the DATABASE_URL from the environment.
It provides a get_db dependency for FastAPI routes.
"""

import os
from typing import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

# Load environment variables from .env file
load_dotenv()

# Get the database URL from the environment
DATABASE_URL = os.getenv("DATABASE_URL")

# Create the SQLAlchemy engine
# pool_pre_ping=True is important for Supabase to keep connections alive
if DATABASE_URL:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
else:
    # Fallback to SQLite for local testing if no DATABASE_URL is provided, though Postgres is expected
    engine = create_engine("sqlite:///./llm_bench.db", connect_args={"check_same_thread": False})

# Create the SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the declarative base for models
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """
    Dependency function that yields a database session and closes it after the request is finished.
    
    Yields:
        Session: A SQLAlchemy database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
