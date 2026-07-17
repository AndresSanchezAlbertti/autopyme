"""
Script de seed: crea el tenant principal y vincula TODOS los usuarios.
Uso: python scripts/seed.py
"""
import asyncio
import uuid
from app.core.database import AsyncSessionLocal
from app.core.security import hash_password as get_password_hash
from app.models.tenant import Tenant, TenantUser
from app.models.user import User
from sqlalchemy import select

TENANT_ID   = uuid.UUID("22dcfbbc-44f1-48d1-9383-f3a3e9378672")
TENANT_NAME = "AutoPyme"

ADMIN_EMAIL    = "admin@autopyme.com"
ADMIN_PASSWORD = "changeme123"
ADMIN_NAME     = "Admin"


async def seed():
    async with AsyncSessionLocal() as db:

        # ── Tenant ──────────────────────────────────────────────
        result = await db.execute(select(Tenant).where(Tenant.id == TENANT_ID))
        tenant = result.scalar_one_or_none()
        if tenant:
            tenant.status = "active"
            print(f"✅ Tenant actualizado: {TENANT_ID}")
        else:
            tenant = Tenant(id=TENANT_ID, name=TENANT_NAME, business_type="general", status="active")
            db.add(tenant)
            print(f"✅ Tenant creado: {TENANT_ID}")

        await db.flush()

        # ── Usuario admin ────────────────────────────────────────
        result = await db.execute(select(User).where(User.email == ADMIN_EMAIL))
        user = result.scalar_one_or_none()
        if user:
            user.password_hash = get_password_hash(ADMIN_PASSWORD)
            user.status = "active"
            print(f"✅ Usuario actualizado: {ADMIN_EMAIL}")
        else:
            user = User(
                email=ADMIN_EMAIL,
                password_hash=get_password_hash(ADMIN_PASSWORD),
                full_name=ADMIN_NAME,
                status="active",
            )
            db.add(user)
            await db.flush()
            print(f"✅ Usuario creado: {ADMIN_EMAIL}")

        # ── Vincular TODOS los usuarios al tenant ─────────────────
        all_users = (await db.execute(select(User))).scalars().all()
        for u in all_users:
            exists = (await db.execute(
                select(TenantUser).where(
                    TenantUser.tenant_id == TENANT_ID,
                    TenantUser.user_id == u.id,
                )
            )).scalar_one_or_none()

            if not exists:
                db.add(TenantUser(tenant_id=TENANT_ID, user_id=u.id, role="admin"))
                print(f"✅ TenantUser creado para {u.email}")
            else:
                print(f"✅ TenantUser ya existe para {u.email}")

        await db.commit()

        print("\n─────────────────────────────────────")
        print(f"  Email:     {ADMIN_EMAIL}")
        print(f"  Password:  {ADMIN_PASSWORD}")
        print(f"  Tenant ID: {TENANT_ID}")
        print("─────────────────────────────────────\n")


asyncio.run(seed())
