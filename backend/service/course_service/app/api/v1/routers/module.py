from fastapi import APIRouter, HTTPException, Depends
from uuid import UUID

from app.api.v1.deps import SessionDep
from app.core.security import RoleChecker
from app.schemas.module import ModuleCreate, ModuleUpdate, ModuleRead
from app.crud.module import crud_module

router = APIRouter(prefix="/modules", tags=["modules"])

# 🟢 Tạo Module (Admin, Instructor)
@router.post("/", response_model=ModuleRead)
def create_module(
    db: SessionDep,
    module_in: ModuleCreate,
    current_user: dict = Depends(RoleChecker(["Admin", "Instructor"]))
):
    return crud_module.create(db, module_in)

# 🔵 Lấy Module theo ID (mọi role đều có thể xem)
@router.get("/{module_id}", response_model=ModuleRead)
def get_module(
    db: SessionDep,
    module_id: UUID,
    current_user: dict = Depends(RoleChecker(["Admin", "Instructor", "Student"]))
):
    module = crud_module.get_by_id(db, module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module

# 🟡 Lấy danh sách Module (Admin, Instructor)
@router.get("/", response_model=list[ModuleRead])
def get_modules(
    db: SessionDep,
    skip: int = 0,
    limit: int = 10,
    current_user: dict = Depends(RoleChecker(["Admin", "Instructor"]))
):
    return crud_module.get_multi(db, skip=skip, limit=limit)

# 🟠 Cập nhật Module (Admin, Instructor)
@router.put("/{module_id}", response_model=ModuleRead)
def update_module(
    db: SessionDep,
    module_id: UUID,
    module_in: ModuleUpdate,
    current_user: dict = Depends(RoleChecker(["Admin", "Instructor"]))
):
    db_obj = crud_module.get_by_id(db, module_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Module not found")
    return crud_module.update(db, db_obj, module_in)

# 🔴 Xóa Module (Admin)
@router.delete("/{module_id}")
def delete_module(
    db: SessionDep,
    module_id: UUID,
    current_user: dict = Depends(RoleChecker(["Admin"]))
):
    db_obj = crud_module.delete(db, module_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Module not found")
    return {"msg": "Module deleted successfully"}
