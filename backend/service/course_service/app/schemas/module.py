from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class ModuleBase(BaseModel):
    title: str
    order_index: int = 1

class ModuleCreate(ModuleBase):
    subject_id: UUID

class ModuleUpdate(BaseModel):
    title: Optional[str] = None
    order_index: Optional[int] = None

class ModuleRead(ModuleBase):
    module_id: UUID
    subject_id: UUID

class ModulePreview(BaseModel):
    title: str
