from __future__ import annotations

from fastapi import APIRouter

from app.models.schemas import AnalyzeRequest, AnalyzeResponse
from app.services.mortgage import calculate_mortgage, max_purchase_price
from app.services.home_iq  import calculate_home_iq
from app.db                import queries

router = APIRouter(tags=["Analysis"])


@router.post("/analyze", response_model=AnalyzeResponse, summary="Full affordability analysis")
def analyze(req: AnalyzeRequest) -> dict:
    """
    Given a user's financial profile, return:
      - Home IQ score, category, and recommendations
      - Maximum affordable purchase price
      - Top 3 affordable properties with mortgage breakdowns
      - Affordability summary (from users ⨝ properties JOIN)
    """
    # 1. Max purchase price
    price_ceiling = max_purchase_price(
        gross_annual_income=req.gross_annual_income,
        monthly_debt=req.monthly_debt,
        down_payment=req.down_payment,
        annual_rate=req.annual_rate,
    )
    reference_price = price_ceiling if price_ceiling > 0 else req.down_payment * 5

    # 2. Home IQ score
    iq = calculate_home_iq(
        credit_score=req.credit_score,
        gross_annual_income=req.gross_annual_income,
        monthly_debt=req.monthly_debt,
        down_payment=req.down_payment,
        home_price=reference_price,
    )

    # 3. Persist user → enables the JOIN query below
    user_id = queries.create_user(
        income=req.gross_annual_income,
        monthly_debt=req.monthly_debt,
        credit_score=req.credit_score,
    )

    # 4. JOIN query: users ⨝ properties affordability check
    join_rows = queries.affordability_join(user_id=user_id, max_price=price_ceiling)

    # 5. Top 3 affordable properties + per-property mortgage breakdown
    top3_raw = queries.get_top3_affordable(max_price=price_ceiling)
    top3 = [
        {
            **prop,
            "mortgage": calculate_mortgage(
                price=prop["price"],
                down_payment=req.down_payment,
                annual_rate=req.annual_rate,
                annual_taxes=prop["taxes"],
                annual_insurance=prop["insurance"],
            ),
        }
        for prop in top3_raw
    ]

    # 6. Sample mortgage (cheapest affordable property, or price ceiling)
    if top3:
        sample_mortgage = top3[0]["mortgage"]
    elif price_ceiling > 0:
        sample_mortgage = calculate_mortgage(
            price=price_ceiling,
            down_payment=req.down_payment,
            annual_rate=req.annual_rate,
            annual_taxes=price_ceiling * 0.012,
            annual_insurance=price_ceiling * 0.0055,
        )
    else:
        sample_mortgage = None

    return {
        "home_iq":            iq,
        "max_purchase_price": price_ceiling,
        "top3_properties":    top3,
        "sample_mortgage":    sample_mortgage,
        "affordability_summary": {
            "total_properties_checked": len(join_rows),
            "affordable_count": sum(1 for r in join_rows if r["affordability"] == "Affordable"),
        },
    }


@router.get("/sql-examples", summary="SQL queries used internally")
def sql_examples() -> dict:
    """Returns the raw SQL for the three required queries, for reference."""
    return {
        "1_properties_under_price": """
            SELECT id, address, city, price, taxes, insurance, bedrooms, bathrooms
            FROM   properties
            WHERE  price <= :max_price
            ORDER  BY price ASC
        """.strip(),

        "2_affordability_join": """
            SELECT
                u.id AS user_id, u.income, u.monthly_debt, u.credit_score,
                p.id AS property_id, p.address, p.city, p.price,
                p.taxes, p.insurance,
                CASE WHEN p.price <= :max_price THEN 'Affordable'
                     ELSE 'Out of range' END AS affordability
            FROM   users u
            CROSS  JOIN properties p
            WHERE  u.id = :user_id
            ORDER  BY p.price ASC
        """.strip(),

        "3_top3_affordable": """
            WITH candidates AS (
                SELECT p.*, ROUND((p.taxes + p.insurance) / 12.0, 2) AS monthly_ti
                FROM   properties p
                WHERE  p.price <= :max_price
            )
            SELECT * FROM candidates ORDER BY price ASC LIMIT 3
        """.strip(),
    }
