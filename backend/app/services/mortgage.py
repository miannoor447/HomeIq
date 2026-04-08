"""
Mortgage calculation service  30-year fixed, default rate 6.5 %.

Monthly payment formula:
    M = P * [r(1+r)^n] / [(1+r)^n - 1]

Where:
    P = loan amount  (price − down payment)
    r = monthly rate (annual_rate / 12)
    n = 360 months   (30 years)
"""
from __future__ import annotations

from app.core.config import settings


def calculate_mortgage(
    price: float,
    down_payment: float,
    annual_rate: float = settings.default_rate,
    years: int = settings.loan_term_years,
    annual_taxes: float = 0.0,
    annual_insurance: float = 0.0,
) -> dict:
    """Return a full PITI breakdown for a given price and user inputs."""
    loan_amount  = max(price - down_payment, 0.0)
    monthly_rate = annual_rate / 12
    n            = years * 12

    if monthly_rate == 0 or loan_amount == 0:
        monthly_pi = loan_amount / n if n else 0.0
    else:
        factor     = (1 + monthly_rate) ** n
        monthly_pi = loan_amount * (monthly_rate * factor) / (factor - 1)

    monthly_taxes     = annual_taxes / 12
    monthly_insurance = annual_insurance / 12

    return {
        "loan_amount":           round(loan_amount, 2),
        "down_payment":          round(down_payment, 2),
        "down_payment_pct":      round((down_payment / price * 100) if price else 0.0, 2),
        "monthly_pi":            round(monthly_pi, 2),
        "monthly_taxes":         round(monthly_taxes, 2),
        "monthly_insurance":     round(monthly_insurance, 2),
        "total_monthly_payment": round(monthly_pi + monthly_taxes + monthly_insurance, 2),
        "annual_rate_pct":       round(annual_rate * 100, 3),
        "loan_term_years":       years,
    }


def max_purchase_price(
    gross_annual_income: float,
    monthly_debt: float,
    down_payment: float,
    annual_rate: float = settings.default_rate,
    years: int = settings.loan_term_years,
) -> float:
    """
    Back-calculate the maximum affordable purchase price using the 43 % DTI limit.

    Derivation:
        max_piti  = (income / 12) * dti_limit − monthly_debt
        max_piti  = price * (1 − dp_pct) * r_factor + price * ti_rate / 12
        price     = max_piti / [(1 − dp_pct) * r_factor + ti_rate / 12]
    """
    monthly_income = gross_annual_income / 12
    max_piti       = monthly_income * settings.dti_limit - monthly_debt

    if max_piti <= 0:
        return 0.0

    monthly_rate = annual_rate / 12
    n            = years * 12
    factor       = (1 + monthly_rate) ** n
    r_factor     = (monthly_rate * factor) / (factor - 1) if monthly_rate > 0 else 1 / n

    # Estimate down-payment % against a rough price to resolve the circularity
    rough_price = max_piti / (r_factor + settings.ti_annual_rate / 12)
    dp_pct      = min(down_payment / rough_price if rough_price > 0 else 0.10, 1.0)

    denominator = (1 - dp_pct) * r_factor + settings.ti_annual_rate / 12
    if denominator <= 0:
        return 0.0

    return round(max(max_piti / denominator, 0.0), 2)
