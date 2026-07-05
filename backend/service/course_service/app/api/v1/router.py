from fastapi import APIRouter
from app.api.v1.routers.course import router as course_router
from app.api.v1.routers.subject import router as subject_router
from app.api.v1.routers.module import router as module_router

router = APIRouter()

router.include_router(course_router)
router.include_router(subject_router)
router.include_router(module_router)