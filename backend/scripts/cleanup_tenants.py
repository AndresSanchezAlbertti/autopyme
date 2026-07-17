"""
Limpieza: elimina los tenants sobrantes y deja solo AutoPyme (22dcfbbc...).
Uso: python scripts/cleanup_tenants.py
"""
import asyncio
import uuid
from app.core.database import AsyncSessionLocal
from app.models.tenant import Tenant, TenantUser
from app.models.lead import Lead
from sqlalchemy import select, delete

KEEP_TENANT_ID = uuid.UUID("22dcfbbc-44f1-48d1-9383-f3a3e9378672")


async def cleanup():
    async with AsyncSessionLocal() as db:

        # Tenants a eliminar
        result = await db.execute(
            select(Tenant).where(Tenant.id != KEEP_TENANT_ID)
        )
        extra_tenants = result.scalars().all()

        if not extra_tenants:
            print("✅ No hay tenants sobrantes")
        else:
            for t in extra_tenants:
                print(f"🗑  Eliminando tenant: {t.name} ({t.id})")

                # Eliminar TenantUsers de ese tenant
                await db.execute(
                    delete(TenantUser).where(TenantUser.tenant_id == t.id)
                )
                # Mover leads huérfanos al tenant correcto (por si acaso)
                leads = (await db.execute(
                    select(Lead).where(Lead.tenant_id == t.id)
                )).scalars().all()
                for lead in leads:
                    lead.tenant_id = KEEP_TENANT_ID
                    print(f"   ↳ Lead movido: {lead.full_name}")

                await db.delete(t)

        await db.commit()
        print(f"\n✅ Solo queda el tenant AutoPyme ({KEEP_TENANT_ID})")

        # Verificar TenantUsers restantes
        result = await db.execute(select(TenantUser))
        tus = result.scalars().all()
        print("\n─── TenantUsers activos ─────────────────")
        for tu in tus:
            print(f"  Tenant: {tu.tenant_id} | User: {tu.user_id} | Rol: {tu.role}")

        # Verificar leads
        result = await db.execute(select(Lead))
        leads = result.scalars().all()
        print(f"\n─── Leads en AutoPyme: {len(leads)} ──────────────")
        for l in leads:
            print(f"  {l.full_name} | {l.email} | {l.status}")


asyncio.run(cleanup())
