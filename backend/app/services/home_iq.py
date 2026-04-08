"""
Home IQ Scoring service  produces a 0 100 score from three components.

Components and maximum points:
    Credit score     → 40 pts
    Debt-to-income   → 35 pts
    Down payment %   → 25 pts

Categories:
    70  100  →  Strong
    40  69   →  متوسط  (Average)
     0  39   →  Weak
"""
from __future__ import annotations


# ── Scoring helpers ───────────────────────────────────────────────────────────

def _credit_points(credit_score: int) -> int:
    if credit_score >= 800: return 40
    if credit_score >= 740: return 33
    if credit_score >= 670: return 25
    if credit_score >= 580: return 15
    return 5


def _dti_points(monthly_income: float, monthly_debt: float) -> "tuple[int, float]":
    if monthly_income <= 0:
        return 0, 1.0
    dti = monthly_debt / monthly_income
    if dti <= 0.28: pts = 35
    elif dti <= 0.36: pts = 27
    elif dti <= 0.43: pts = 17
    elif dti <= 0.50: pts = 8
    else:             pts = 0
    return pts, dti


def _down_payment_points(down_payment: float, home_price: float) -> "tuple[int, float]":
    dp_pct = (down_payment / home_price) if home_price > 0 else 0.0
    if dp_pct >= 0.20: pts = 25
    elif dp_pct >= 0.10: pts = 18
    elif dp_pct >= 0.05: pts = 10
    elif dp_pct >= 0.03: pts = 5
    else:                pts = 0
    return pts, dp_pct


def _build_recommendations(
    score: int,
    credit_score: int,
    dti: float,
    dp_pct: float,
) -> list[str]:
    recs: list[str] = []
    if credit_score < 670:
        recs.append(
            "Improve your credit score  pay bills on time, keep credit utilization "
            "below 30 %, and avoid opening new accounts before applying."
        )
    if dti > 0.43:
        recs.append(
            "Reduce your monthly debt: pay down high-interest cards or loans "
            "to bring your debt-to-income ratio below 43 %."
        )
    if dp_pct < 0.10:
        recs.append(
            "Increase your down payment toward 10  20 % to unlock better rates, "
            "avoid PMI, and lower your monthly payment."
        )
    if score < 40:
        recs.append(
            "Consider speaking with a HUD-approved housing counselor to build a "
            "step-by-step homebuying plan."
        )
    return recs


# ── Public API ────────────────────────────────────────────────────────────────

def calculate_home_iq(
    credit_score: int,
    gross_annual_income: float,
    monthly_debt: float,
    down_payment: float,
    home_price: float,
) -> dict:
    """Return the full Home IQ result dict, ready to serialize."""
    monthly_income = gross_annual_income / 12

    credit_pts         = _credit_points(credit_score)
    dti_pts, dti       = _dti_points(monthly_income, monthly_debt)
    dp_pts,  dp_pct    = _down_payment_points(down_payment, home_price)

    score = credit_pts + dti_pts + dp_pts

    if score >= 70:
        category, color = "Strong",  "green"
    elif score >= 40:
        category, color = "متوسط",  "yellow"   # Arabic: "Average"
    else:
        category, color = "Weak",    "red"

    return {
        "score":          score,
        "category":       category,
        "category_color": color,
        "breakdown": {
            "credit_score_points":  credit_pts,
            "dti_points":           dti_pts,
            "down_payment_points":  dp_pts,
        },
        "ratios": {
            "dti_pct":          round(dti * 100, 1),
            "down_payment_pct": round(dp_pct * 100, 1),
        },
        "recommendations": _build_recommendations(score, credit_score, dti, dp_pct),
    }
