from fastapi import APIRouter

from app.api.routes.properties import router as properties_router
from app.api.routes.analysis   import router as analysis_router

api_router = APIRouter()
api_router.include_router(properties_router)
api_router.include_router(analysis_router)
