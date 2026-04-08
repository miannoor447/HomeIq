from __future__ import annotations

from typing import Optional
from fastapi import APIRouter

from app.db import queries

router = APIRouter(prefix="/properties", tags=["Properties"])


@router.get("/", summary="List properties")
def list_properties(max_price: Optional[float] = None):
    """Return all properties, optionally filtered to those at or below max_price."""
    if max_price is not None:
        return queries.get_properties_under_price(max_price)
    return queries.get_all_properties()
