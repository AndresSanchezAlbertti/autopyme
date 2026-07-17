"""
Webhooks públicos — no requieren autenticación JWT.
Seguridad: verificación de firma/token según el proveedor.
"""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.config import get_settings
from app.models.tenant import Tenant
from app.models.lead import Lead
from app.models.conversation import Conversation, Message
from app.models.event import Event
from app.services.email import send_lead_confirmation
from app.services.perfit import add_contact_to_list

router = APIRouter(prefix="/webhooks", tags=["webhooks"])
settings = get_settings()


# ─── Formularios web ──────────────────────────────────────────────────────────

class FormWebhookPayload(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    email: str | None = None
    interest: str | None = None
    source: str = "web_form"


@router.post("/forms/{tenant_id}", status_code=202)
async def receive_form(
    tenant_id: UUID,
    payload: FormWebhookPayload,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Tenant).where(Tenant.id == tenant_id, Tenant.status == "active"))
    tenant = result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant no encontrado")

    lead = Lead(
        tenant_id=tenant_id,
        full_name=payload.full_name,
        phone=payload.phone,
        email=payload.email,
        interest=payload.interest,
        source=payload.source,
        status="new",
    )
    db.add(lead)
    await db.flush()

    db.add(Event(
        tenant_id=tenant_id,
        entity_type="lead",
        entity_id=lead.id,
        event_type="lead.created",
        payload={"source": payload.source},
    ))

    await db.commit()

    # Enviar email de confirmación al lead
    # TODO: descomentar cuando el mensaje esté definido
    # if payload.email and payload.full_name:
    #     await send_lead_confirmation(
    #         to_email=payload.email,
    #         nombre=payload.full_name.split()[0],
    #         curso=payload.interest or "nuestros cursos",
    #     )

    # Agregar a lista de Perfit
    if payload.email:
        partes = (payload.full_name or "").split(" ", 1)
        await add_contact_to_list(
            email=payload.email,
            first_name=partes[0] if partes else "",
            last_name=partes[1] if len(partes) > 1 else "",
        )

    return {"status": "accepted", "lead_id": str(lead.id)}


# ─── WhatsApp Cloud API ───────────────────────────────────────────────────────

@router.get("/whatsapp")
async def verify_whatsapp_webhook(
    hub_mode: str = Query(alias="hub.mode"),
    hub_verify_token: str = Query(alias="hub.verify_token"),
    hub_challenge: str = Query(alias="hub.challenge"),
):
    """Verificación del webhook por parte de Meta."""
    if hub_mode == "subscribe" and hub_verify_token == settings.WHATSAPP_VERIFY_TOKEN:
        return int(hub_challenge)
    raise HTTPException(status_code=403, detail="Token de verificación inválido")


@router.post("/whatsapp", status_code=200)
async def receive_whatsapp(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Recepción de mensajes y eventos desde WhatsApp Cloud API.
    Meta espera siempre un 200 rápido, incluso ante errores internos.
    """
    try:
        body = await request.json()
        entry = body.get("entry", [{}])[0]
        changes = entry.get("changes", [{}])[0]
        value = changes.get("value", {})
        messages = value.get("messages", [])

        for msg in messages:
            wa_phone = msg.get("from")
            wa_message_id = msg.get("id")
            text = msg.get("text", {}).get("body", "")
            timestamp = msg.get("timestamp")

            # Buscar o crear lead por número de teléfono en el tenant correcto
            # En MVP usamos el phone_number_id para resolver el tenant
            phone_number_id = value.get("metadata", {}).get("phone_number_id")

            # TODO: resolver tenant desde phone_number_id (tabla integrations)
            # Por ahora loguear el evento
            print(f"[WA] mensaje de {wa_phone}: {text[:50]}")

    except Exception as e:
        # Loguear error pero responder 200 igual para que Meta no reintente
        print(f"[WA webhook error] {e}")

    return {"status": "ok"}


# ─── Callback desde n8n ───────────────────────────────────────────────────────

class N8nEventPayload(BaseModel):
    tenant_id: UUID
    event_type: str
    entity_type: str | None = None
    entity_id: UUID | None = None
    payload: dict | None = None


@router.post("/n8n/events", status_code=202)
async def receive_n8n_event(
    body: N8nEventPayload,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Callback que n8n llama al backend para registrar eventos."""
    # Validación mínima: verificar header de API key
    api_key = request.headers.get("X-API-Key", "")
    if api_key != settings.N8N_API_KEY and settings.N8N_API_KEY:
        raise HTTPException(status_code=401, detail="API key inválida")

    db.add(Event(
        tenant_id=body.tenant_id,
        entity_type=body.entity_type,
        entity_id=body.entity_id,
        event_type=body.event_type,
        payload=body.payload,
    ))
    await db.commit()
    return {"status": "accepted"}
