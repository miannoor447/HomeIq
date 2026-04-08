"""
HomeIQ API

Run:
    uvicorn app.main:app --reload --port 8000

Swagger UI:
    http://localhost:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api         import api_router
from app.db.database import init_db
from app.db.seed     import seed_properties


def create_app() -> FastAPI:
    app = FastAPI(
        title="HomeIQ API",
        version="1.0.0",
        description="Smart home affordability analysis backend.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router)

    @app.on_event("startup")
    def on_startup() -> None:
        init_db()
        seed_properties()

    @app.get("/health", tags=["Health"])
    def health() -> dict:
        return {"status": "ok"}

    return app


app = create_app()
