from fastapi import APIRouter, HTTPException
from uuid import UUID

from app.api.v1.deps import SessionDep
from app.schemas.module import ModuleCreate, ModuleUpdate, ModuleRead
from app.crud.module import crud_module

router = APIRouter(prefix="/modules", tags=["modules"])

@router.post("/", response_model=ModuleRead)
def create_module(module_in: ModuleCreate, db: SessionDep):
    return crud_module.create(db, module_in)

@router.get("/{module_id}", response_model=ModuleRead)
def get_module(module_id: UUID, db: SessionDep):
    module = crud_module.get_by_id(db, module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module

@router.get("/", response_model=list[ModuleRead])
def get_modules(db: SessionDep, skip: int = 0, limit: int = 10):
    return crud_module.get_multi(db, skip=skip, limit=limit)

@router.put("/{module_id}", response_model=ModuleRead)
def update_module(module_id: UUID, module_in: ModuleUpdate, db: SessionDep):
    db_obj = crud_module.get_by_id(db, module_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Module not found")
    return crud_module.update(db, db_obj, module_in)

@router.delete("/{module_id}")
def delete_module(module_id: UUID, db: SessionDep):
    db_obj = crud_module.delete(db, module_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Module not found")
    return {"msg": "Module deleted successfully"}


# 🟣 Lấy tất cả Module theo Subject ID
@router.get("/by-subject/{subject_id}", response_model=list[ModuleRead])
def get_modules_by_subject(subject_id: UUID, db: SessionDep):
    modules = crud_module.get_by_subject(db, subject_id)
    if not modules:
        raise HTTPException(status_code=404, detail="No modules found for this subject")
    return modules