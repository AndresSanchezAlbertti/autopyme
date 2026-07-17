from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr

from app.core.database import get_db
from app.core.security import hash_password
from app.models.user import User
from app.models.tenant import Tenant, TenantUser

router = APIRouter(prefix="/users", tags=["users"])


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None
    company_name: str | None = None


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str | None

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, obj):
        return cls(id=str(obj.id), email=obj.email, full_name=obj.full_name)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Verificar que el email no exista
    result = await db.execute(select(User).where(User.email == body.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    # Crear tenant
    tenant = Tenant(
        name=body.company_name or body.full_name or body.email,
        status="active",
    )
    db.add(tenant)
    await db.flush()

    # Crear usuario
    user = User(
        email=body.email,
        full_name=body.full_name,
        password_hash=hash_password(body.password),
        status="active",
    )
    db.add(user)
    await db.flush()

    # Asociar usuario al tenant como owner
    db.add(TenantUser(tenant_id=tenant.id, user_id=user.id, role="owner"))
    await db.commit()
    await db.refresh(user)
    return UserResponse(id=str(user.id), email=user.email, full_name=user.full_name)
