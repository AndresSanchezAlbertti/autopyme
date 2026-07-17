"""
Script para crear el primer usuario admin + tenant.
Uso:
    cd backend
    python scripts/seed_admin.py
"""
import asyncio
import sys
import os

# Agregar el directorio backend al path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models.user import User
from app.models.tenant import Tenant, TenantUser

# ── Configurá acá las credenciales ──────────────────────────
EMAIL    = "admin@autopyme.com"
PASSWORD = "admin1234"
NAME     = "Admin"
TENANT   = "Mi PyME"
# ────────────────────────────────────────────────────────────


async def seed():
    async with AsyncSessionLocal() as db:
        # Verificar si el usuario ya existe
        from sqlalchemy import select
        result = await db.execute(select(User).where(User.email == EMAIL))
        existing = result.scalar_one_or_none()
        if existing:
            print(f"⚠️  El usuario {EMAIL} ya existe. Nada que hacer.")
            return

        # Crear tenant
        tenant = Tenant(name=TENANT, business_type="servicios", status="active")
        db.add(tenant)
        await db.flush()

        # Crear usuario
        user = User(
            email=EMAIL,
            password_hash=hash_password(PASSWORD),
            full_name=NAME,
            status="active",
        )
        db.add(user)
        await db.flush()

        # Asociar usuario al tenant como owner
        db.add(TenantUser(tenant_id=tenant.id, user_id=user.id, role="owner"))

        await db.commit()

        print("✅ Usuario creado correctamente")
        print(f"   Email:      {EMAIL}")
        print(f"   Contraseña: {PASSWORD}")
        print(f"   Tenant:     {TENANT} ({tenant.id})")


if __name__ == "__main__":
    asyncio.run(seed())
