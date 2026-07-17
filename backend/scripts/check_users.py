"""
Script para verificar usuarios en la DB.
Uso: python scripts/check_users.py
"""
import asyncio
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.tenant import Tenant, TenantUser
from sqlalchemy import select


async def check():
    async with AsyncSessionLocal() as db:
        # Usuarios
        result = await db.execute(select(User))
        users = result.scalars().all()

        print("=" * 50)
        print(f"USUARIOS ({len(users)} encontrados)")
        print("=" * 50)
        if users:
            for u in users:
                print(f"  ID:     {u.id}")
                print(f"  Email:  {u.email}")
                print(f"  Nombre: {u.full_name}")
                print(f"  Status: {u.status}")
                print("-" * 30)
        else:
            print("  No hay usuarios en la DB.")

        # Tenants
        result = await db.execute(select(Tenant))
        tenants = result.scalars().all()

        print(f"\nEMPRESAS ({len(tenants)} encontradas)")
        print("=" * 50)
        if tenants:
            for t in tenants:
                print(f"  ID:     {t.id}")
                print(f"  Nombre: {t.name}")
                print(f"  Status: {t.status}")
                print("-" * 30)
        else:
            print("  No hay empresas en la DB.")


asyncio.run(check())
