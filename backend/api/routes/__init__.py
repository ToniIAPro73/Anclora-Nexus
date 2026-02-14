"""
Anclora Intelligence API Routes Module
"""

from fastapi import APIRouter
from .intelligence import router as intelligence_router
from .prospection import router as prospection_router

router = APIRouter()
router.include_router(intelligence_router, prefix="/intelligence", tags=["Intelligence"])
router.include_router(prospection_router, prefix="/prospection", tags=["Prospection"])

__all__ = ["router"]
