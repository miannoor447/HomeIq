from dataclasses import dataclass, field
from pathlib import Path

# Resolve paths relative to the backend/ root, regardless of where
# uvicorn is launched from.
_BACKEND_ROOT = Path(__file__).resolve().parents[2]


@dataclass(frozen=True)
class Settings:
    database_path: str        = str(_BACKEND_ROOT / "homeiq.db")
    default_rate: float       = 0.065   # 6.5 % annual interest
    loan_term_years: int      = 30
    dti_limit: float          = 0.43    # 43 % total debt-to-income ceiling
    ti_annual_rate: float     = 0.0175  # combined taxes + insurance estimate


settings = Settings()
