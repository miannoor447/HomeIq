"""
Simulated property data ingestion.

In production this module could be swapped for:
  - A web scraper (BeautifulSoup / Playwright)
  - A real-estate API call (Zillow RapidAPI, ATTOM, Redfin, etc.)

City-specific annual tax rates and a flat insurance rate are applied to
each listing to derive the required taxes and insurance fields.
"""
from __future__ import annotations

from app.db.database import get_db

# Annual property tax rates by city
_TAX_RATES: dict[str, float] = {
    "Austin, TX":    0.0181,
    "Denver, CO":    0.0061,
    "Phoenix, AZ":   0.0072,
    "Nashville, TN": 0.0070,
    "Atlanta, GA":   0.0092,
    "Charlotte, NC": 0.0084,
}

_INSURANCE_RATE = 0.0055  # annual % of home price

_RAW_LISTINGS: list[dict] = [
    {"address": "2847 Willow Creek Dr",  "city": "Austin, TX",     "price": 425_000, "bedrooms": 3, "bathrooms": 2.0},
    {"address": "1203 Maple Avenue",      "city": "Denver, CO",     "price": 385_000, "bedrooms": 3, "bathrooms": 1.5},
    {"address": "945 Sunset Blvd",        "city": "Phoenix, AZ",    "price": 310_000, "bedrooms": 2, "bathrooms": 2.0},
    {"address": "3421 Oak Ridge Rd",      "city": "Nashville, TN",  "price": 465_000, "bedrooms": 4, "bathrooms": 2.5},
    {"address": "567 Peachtree Lane",     "city": "Atlanta, GA",    "price": 295_000, "bedrooms": 3, "bathrooms": 2.0},
    {"address": "1891 Carolina Pine Ct",  "city": "Charlotte, NC",  "price": 340_000, "bedrooms": 3, "bathrooms": 2.0},
    {"address": "7234 Desert Rose Way",   "city": "Phoenix, AZ",    "price": 275_000, "bedrooms": 2, "bathrooms": 1.0},
    {"address": "456 Mountain View Ln",   "city": "Denver, CO",     "price": 520_000, "bedrooms": 4, "bathrooms": 3.0},
    {"address": "2109 Bluebonnet Trail",  "city": "Austin, TX",     "price": 550_000, "bedrooms": 4, "bathrooms": 3.0},
    {"address": "834 Magnolia Street",    "city": "Nashville, TN",  "price": 390_000, "bedrooms": 3, "bathrooms": 2.0},
    {"address": "1567 River Oaks Blvd",   "city": "Atlanta, GA",    "price": 445_000, "bedrooms": 4, "bathrooms": 2.5},
    {"address": "3892 Cypress Point Dr",  "city": "Charlotte, NC",  "price": 285_000, "bedrooms": 2, "bathrooms": 2.0},
    {"address": "612 Blue Ridge Pkwy",    "city": "Charlotte, NC",  "price": 415_000, "bedrooms": 3, "bathrooms": 2.5},
    {"address": "2234 Longhorn Pass",     "city": "Austin, TX",     "price": 325_000, "bedrooms": 2, "bathrooms": 2.0},
    {"address": "789 Sierra Nevada Way",  "city": "Denver, CO",     "price": 610_000, "bedrooms": 5, "bathrooms": 3.5},
    {"address": "1023 Saguaro Ct",        "city": "Phoenix, AZ",    "price": 395_000, "bedrooms": 3, "bathrooms": 2.0},
    {"address": "4521 Country Club Dr",   "city": "Nashville, TN",  "price": 680_000, "bedrooms": 5, "bathrooms": 4.0},
    {"address": "2876 Piedmont Ave",      "city": "Atlanta, GA",    "price": 355_000, "bedrooms": 3, "bathrooms": 2.0},
    {"address": "1445 Freedom Drive",     "city": "Charlotte, NC",  "price": 260_000, "bedrooms": 2, "bathrooms": 1.5},
    {"address": "5567 Congress Ave",      "city": "Austin, TX",     "price": 725_000, "bedrooms": 5, "bathrooms": 4.0},
]


def _enrich(listing: dict) -> dict:
    price = listing["price"]
    return {
        **listing,
        "taxes":     round(price * _TAX_RATES[listing["city"]], 2),
        "insurance": round(price * _INSURANCE_RATE, 2),
    }


def seed_properties() -> None:
    """Insert all listings. No-op if properties already exist."""
    with get_db() as conn:
        if conn.execute("SELECT COUNT(*) FROM properties").fetchone()[0] > 0:
            return

        enriched = [_enrich(l) for l in _RAW_LISTINGS]
        conn.executemany(
            """
            INSERT INTO properties (address, city, price, taxes, insurance, bedrooms, bathrooms)
            VALUES (:address, :city, :price, :taxes, :insurance, :bedrooms, :bathrooms)
            """,
            enriched,
        )
    print(f"[seed] Inserted {len(enriched)} properties.")
