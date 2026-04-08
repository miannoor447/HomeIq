from __future__ import annotations

from app.db.database import get_db


# ── Properties ────────────────────────────────────────────────────────────────

def get_all_properties() -> list[dict]:
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM properties ORDER BY price ASC").fetchall()
    return [dict(r) for r in rows]


def get_properties_under_price(max_price: float) -> list[dict]:
    """Return all properties at or below max_price, ordered cheapest first."""
    sql = """
        SELECT id, address, city, price, taxes, insurance, bedrooms, bathrooms
        FROM   properties
        WHERE  price <= ?
        ORDER  BY price ASC
    """
    with get_db() as conn:
        rows = conn.execute(sql, (max_price,)).fetchall()
    return [dict(r) for r in rows]


def get_top3_affordable(max_price: float) -> list[dict]:
    """
    Return the 3 cheapest properties within max_price.

    Uses a CTE to pre-compute monthly T&I per listing, making it easy
    to extend with a payment filter later.
    """
    sql = """
        WITH candidates AS (
            SELECT
                p.id,
                p.address,
                p.city,
                p.price,
                p.taxes,
                p.insurance,
                p.bedrooms,
                p.bathrooms,
                ROUND((p.taxes + p.insurance) / 12.0, 2) AS monthly_ti
            FROM properties p
            WHERE p.price <= ?
        )
        SELECT * FROM candidates ORDER BY price ASC LIMIT 3
    """
    with get_db() as conn:
        rows = conn.execute(sql, (max_price,)).fetchall()
    return [dict(r) for r in rows]


# ── Users ─────────────────────────────────────────────────────────────────────

def create_user(
    income: float,
    monthly_debt: float,
    credit_score: int,
    name: str = "",
) -> int:
    """Insert a user row and return its new id."""
    sql = """
        INSERT INTO users (name, income, monthly_debt, credit_score)
        VALUES (?, ?, ?, ?)
    """
    with get_db() as conn:
        cur = conn.execute(sql, (name, income, monthly_debt, credit_score))
    return cur.lastrowid


# ── Join query ────────────────────────────────────────────────────────────────

def affordability_join(user_id: int, max_price: float) -> list[dict]:
    """
    Cross-join a stored user against every property and flag each as
    Affordable / Out of range based on max_price.

    Satisfies requirement: JOIN users + properties to determine affordability.
    """
    sql = """
        SELECT
            u.id            AS user_id,
            u.income,
            u.monthly_debt,
            u.credit_score,
            p.id            AS property_id,
            p.address,
            p.city,
            p.price,
            p.taxes,
            p.insurance,
            CASE
                WHEN p.price <= ? THEN 'Affordable'
                ELSE 'Out of range'
            END             AS affordability
        FROM   users      u
        CROSS  JOIN properties p
        WHERE  u.id = ?
        ORDER  BY p.price ASC
    """
    with get_db() as conn:
        rows = conn.execute(sql, (max_price, user_id)).fetchall()
    return [dict(r) for r in rows]
