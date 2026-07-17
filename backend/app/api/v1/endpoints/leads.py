from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from datetime import datetime
import csv
import io

from app.core.database import get_db
from app.core.deps import get_current_user, get_current_tenant
from app.models.lead import Lead
from app.models.user import User
from app.models.tenant import Tenant
from app.models.event import Event
from app.services.perfit import add_contact_to_list

router = APIRouter(prefix="/leads", tags=["leads"])


# ─── Schemas ──────────────────────────────────────────────────────────────────

class LeadCreate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    email: str | None = None
    source: str | None = None
    interest: str | None = None
    tags: str | None = None


class LeadUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    email: str | None = None
    status: str | None = None
    interest: str | None = None
    tags: str | None = None
    assigned_to: UUID | None = None


class LeadResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    full_name: str | None
    phone: str | None
    email: str | None
    source: str | None
    status: str
    interest: str | None
    tags: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LeadListResponse(BaseModel):
    items: list[LeadResponse]
    total: int
    page: int
    limit: int


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get("", response_model=LeadListResponse)
async def list_leads(
    status: str | None = Query(None),
    source: str | None = Query(None),
    q: str | None = Query(None, description="Búsqueda por nombre, email o teléfono"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    query = select(Lead).where(Lead.tenant_id == tenant.id, Lead.deleted_at.is_(None))
    count_query = select(func.count()).select_from(Lead).where(
        Lead.tenant_id == tenant.id, Lead.deleted_at.is_(None)
    )

    if status:
        query = query.where(Lead.status == status)
        count_query = count_query.where(Lead.status == status)
    if source:
        query = query.where(Lead.source == source)
        count_query = count_query.where(Lead.source == source)
    if q:
        like = f"%{q}%"
        filter_q = (Lead.full_name.ilike(like) | Lead.email.ilike(like) | Lead.phone.ilike(like))
        query = query.where(filter_q)
        count_query = count_query.where(filter_q)

    total = (await db.execute(count_query)).scalar_one()
    results = await db.execute(query.offset((page - 1) * limit).limit(limit).order_by(Lead.created_at.desc()))
    return LeadListResponse(items=results.scalars().all(), total=total, page=page, limit=limit)


@router.post("", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
async def create_lead(
    body: LeadCreate,
    tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    lead = Lead(tenant_id=tenant.id, **body.model_dump())
    db.add(lead)
    await db.flush()

    # Registrar evento
    db.add(Event(
        tenant_id=tenant.id,
        entity_type="lead",
        entity_id=lead.id,
        event_type="lead.created",
        payload={"source": "manual", "created_by": str(current_user.id)},
    ))

    await db.commit()
    await db.refresh(lead)
    return lead


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(
    lead_id: UUID,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Lead).where(Lead.id == lead_id, Lead.tenant_id == tenant.id, Lead.deleted_at.is_(None))
    )
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead no encontrado")
    return lead


@router.patch("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: UUID,
    body: LeadUpdate,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Lead).where(Lead.id == lead_id, Lead.tenant_id == tenant.id, Lead.deleted_at.is_(None))
    )
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead no encontrado")

    old_status = lead.status
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(lead, field, value)

    if body.status and body.status != old_status:
        db.add(Event(
            tenant_id=tenant.id,
            entity_type="lead",
            entity_id=lead.id,
            event_type="lead.status_changed",
            payload={"from": old_status, "to": body.status},
        ))

    await db.commit()
    await db.refresh(lead)
    return lead


@router.post("/import")
async def import_leads_csv(
    file: UploadFile = File(...),
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    """
    Importa leads desde un CSV. Detecta columnas automáticamente.
    Columnas reconocidas: email, mail, nombre, name, apellido, lastname,
                          telefono, phone, whatsapp, curso, course, interest
    """
    content = await file.read()
    try:
        text = content.decode("utf-8")
    except UnicodeDecodeError:
        text = content.decode("latin-1")

    reader = csv.DictReader(io.StringIO(text))
    headers = [h.lower().strip() for h in (reader.fieldnames or [])]

    def find_col(keywords: list[str]) -> str | None:
        for h in headers:
            if any(k in h for k in keywords):
                return h
        return None

    col_email    = find_col(["email", "mail", "correo"])
    col_nombre   = find_col(["nombre", "name", "first"])
    col_apellido = find_col(["apellido", "lastname", "last"])
    col_telefono = find_col(["telefono", "phone", "whatsapp", "tel"])
    col_interes  = find_col(["curso", "course", "interest", "interes", "inscribe"])

    if not col_email:
        raise HTTPException(status_code=400, detail="El CSV no tiene columna de email (email, mail, correo)")

    importados = 0
    duplicados = 0
    errores    = 0
    sin_email  = 0

    for row in reader:
        row_lower = {k.lower().strip(): v for k, v in row.items()}

        email = row_lower.get(col_email, "").strip()
        if not email or "@" not in email:
            sin_email += 1
            continue

        # Verificar si ya existe en este tenant
        existing = (await db.execute(
            select(Lead).where(Lead.tenant_id == tenant.id, Lead.email == email)
        )).scalar_one_or_none()
        if existing:
            duplicados += 1
            continue

        nombre   = row_lower.get(col_nombre,   "") if col_nombre   else ""
        apellido = row_lower.get(col_apellido, "") if col_apellido else ""
        telefono = row_lower.get(col_telefono, "") if col_telefono else ""
        interes  = row_lower.get(col_interes,  "") if col_interes  else ""

        full_name = f"{nombre} {apellido}".strip() or None

        try:
            lead = Lead(
                tenant_id=tenant.id,
                full_name=full_name,
                email=email,
                phone=telefono or None,
                interest=interes or None,
                source="csv_import",
                status="new",
            )
            db.add(lead)
            await db.flush()

            # Agregar a Perfit
            partes = (full_name or "").split(" ", 1)
            await add_contact_to_list(
                email=email,
                first_name=partes[0] if partes else "",
                last_name=partes[1] if len(partes) > 1 else "",
            )

            importados += 1
        except Exception:
            errores += 1

    await db.commit()

    return {
        "importados": importados,
        "duplicados": duplicados,
        "sin_email":  sin_email,
        "errores":    errores,
        "total_procesados": importados + duplicados + sin_email + errores,
    }


@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lead(
    lead_id: UUID,
    tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Lead).where(Lead.id == lead_id, Lead.tenant_id == tenant.id)
    )
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead no encontrado")

    from datetime import datetime, timezone
    lead.deleted_at = datetime.now(timezone.utc)
    await db.commit()
