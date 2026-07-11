from fastapi import APIRouter
from app.api.v1.routers.course_enrollment import router as course_enrollment_router

router = APIRouter()

router.include_router(course_enrollment_router)
