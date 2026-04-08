from __future__ import annotations

import sqlite3
from contextlib import contextmanager

from app.core.config import settings


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(settings.database_path)
    conn.row_factory = sqlite3.Row
    return conn


@contextmanager
def get_db():
    """Yield a connection, commit on success, rollback on error."""
    conn = _connect()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    """Create tables if they do not exist."""
    with get_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS properties (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                address   TEXT    NOT NULL,
                city      TEXT    NOT NULL,
                price     REAL    NOT NULL,
                taxes     REAL    NOT NULL,
                insurance REAL    NOT NULL,
                bedrooms  INTEGER,
                bathrooms REAL
            );

            CREATE TABLE IF NOT EXISTS users (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                name         TEXT,
                income       REAL    NOT NULL,
                monthly_debt REAL    NOT NULL,
                credit_score INTEGER NOT NULL,
                created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
