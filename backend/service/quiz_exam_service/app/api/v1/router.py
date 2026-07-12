from fastapi import APIRouter
from app.api.v1.routers.quiz import router as quiz_router

router = APIRouter()

router.include_router(quiz_router)
