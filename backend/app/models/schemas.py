from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, Field


# ── Request ───────────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    gross_annual_income: float = Field(..., gt=0,        description="Annual gross income in dollars")
    monthly_debt:        float = Field(..., ge=0,        description="Existing monthly debt payments")
    credit_score:        int   = Field(..., ge=300, le=850, description="FICO credit score")
    down_payment:        float = Field(..., ge=0,        description="Available down payment in dollars")
    annual_rate:         float = Field(0.065, ge=0.01, le=0.20, description="Interest rate as decimal (e.g. 0.065)")

    model_config = {"json_schema_extra": {"example": {
        "gross_annual_income": 95000,
        "monthly_debt":        800,
        "credit_score":        720,
        "down_payment":        50000,
        "annual_rate":         0.065,
    }}}


# ── Mortgage ──────────────────────────────────────────────────────────────────

class MortgageBreakdown(BaseModel):
    loan_amount:           float
    down_payment:          float
    down_payment_pct:      float
    monthly_pi:            float
    monthly_taxes:         float
    monthly_insurance:     float
    total_monthly_payment: float
    annual_rate_pct:       float
    loan_term_years:       int


# ── Home IQ ───────────────────────────────────────────────────────────────────

class IQBreakdown(BaseModel):
    credit_score_points:  int
    dti_points:           int
    down_payment_points:  int


class IQRatios(BaseModel):
    dti_pct:          float
    down_payment_pct: float


class HomeIQResult(BaseModel):
    score:          int
    category:       str
    category_color: str
    breakdown:      IQBreakdown
    ratios:         IQRatios
    recommendations: list[str]


# ── Property ──────────────────────────────────────────────────────────────────

class Property(BaseModel):
    id:        int
    address:   str
    city:      str
    price:     float
    taxes:     float
    insurance: float
    bedrooms:  Optional[int]
    bathrooms: Optional[float]


class PropertyWithMortgage(Property):
    monthly_ti: Optional[float] = None
    mortgage:   Optional[MortgageBreakdown] = None


# ── Affordability summary ─────────────────────────────────────────────────────

class AffordabilitySummary(BaseModel):
    total_properties_checked: int
    affordable_count:         int


# ── Analyze response ──────────────────────────────────────────────────────────

class AnalyzeResponse(BaseModel):
    home_iq:              HomeIQResult
    max_purchase_price:   float
    top3_properties:      list[PropertyWithMortgage]
    sample_mortgage:      Optional[MortgageBreakdown]
    affordability_summary: AffordabilitySummary
