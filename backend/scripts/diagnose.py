"""
Diagnóstico completo: tenants, users, tenant_users y leads.
Uso: python scripts/diagnose.py
"""
import asyncio
from app.core.database import AsyncSessionLocal
from app.models.tenant import Tenant, TenantUser
from app.models.user import User
from app.models.lead import Lead
from sqlalchemy import select, text


async def diagnose():
    async with AsyncSessionLocal() as db:
        print("\n═══ TENANTS ═══════════════════════════")
        rows = (await db.execute(select(Tenant))).scalars().all()
        if not rows:
            print("  ❌ Sin tenants")
        for t in rows:
            print(f"  ID:     {t.id}")
            print(f"  Nombre: {t.name}")
            print(f"  Status: {t.status}")
            print()

        print("═══ USERS ══════════════════════════════")
        rows = (await db.execute(select(User))).scalars().all()
        if not rows:
            print("  ❌ Sin usuarios")
        for u in rows:
            print(f"  ID:     {u.id}")
            print(f"  Email:  {u.email}")
            print(f"  Status: {u.status}")
            print()

        print("═══ TENANT_USERS ═══════════════════════")
        rows = (await db.execute(select(TenantUser))).scalars().all()
        if not rows:
            print("  ❌ Sin vínculos TenantUser — este es el problema!")
        for tu in rows:
            print(f"  Tenant: {tu.tenant_id}")
            print(f"  User:   {tu.user_id}")
            print(f"  Rol:    {tu.role}")
            print()

        print("═══ LEADS ══════════════════════════════")
        rows = (await db.execute(select(Lead))).scalars().all()
        if not rows:
            print("  ❌ Sin leads")
        for l in rows:
            print(f"  ID:        {l.id}")
            print(f"  Tenant ID: {l.tenant_id}")
            print(f"  Nombre:    {l.full_name}")
            print(f"  Email:     {l.email}")
            print(f"  Status:    {l.status}")
            print()


asyncio.run(diagnose())
