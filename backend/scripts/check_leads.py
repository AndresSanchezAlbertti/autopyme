"""
Diagnóstico rápido: muestra leads csv_import y verifica tenant del admin.
Uso: python scripts/check_leads.py
"""
import asyncio
from app.core.database import AsyncSessionLocal
from app.models.lead import Lead
from app.models.tenant import Tenant
from app.models.user import User
from app.models.tenant import TenantUser
from sqlalchemy import select


async def check():
    async with AsyncSessionLocal() as db:
        # Tenants existentes
        tenants = (await db.execute(select(Tenant))).scalars().all()
        print(f"\n=== Tenants ({len(tenants)}) ===")
        for t in tenants:
            print(f"  {t.id}  |  {t.name}  |  status={t.status}")

        # TenantUser para admin@autopyme.com
        user = (await db.execute(
            select(User).where(User.email == "admin@autopyme.com")
        )).scalar_one_or_none()
        if user:
            tus = (await db.execute(
                select(TenantUser).where(TenantUser.user_id == user.id)
            )).scalars().all()
            print(f"\n=== TenantUser para admin@autopyme.com ===")
            for tu in tus:
                print(f"  tenant_id={tu.tenant_id}")
        else:
            print("\n⚠️  Usuario admin@autopyme.com NO encontrado")

        # Leads csv_import
        leads = (await db.execute(
            select(Lead).where(Lead.source == "csv_import")
        )).scalars().all()
        print(f"\n=== Leads csv_import: {len(leads)} ===")
        for l in leads[:10]:
            print(f"  {l.email}  |  tenant_id={l.tenant_id}  |  deleted_at={l.deleted_at}")

        # Total leads por tenant
        all_leads = (await db.execute(select(Lead))).scalars().all()
        from collections import Counter
        by_tenant = Counter(str(l.tenant_id) for l in all_leads)
        print(f"\n=== Leads por tenant ===")
        for tid, count in by_tenant.items():
            print(f"  {tid}  →  {count} leads")


asyncio.run(check())
