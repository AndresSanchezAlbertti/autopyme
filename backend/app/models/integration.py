import uuid
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB
from app.core.database import Base
from app.models.base import TimestampMixin, new_uuid


class Integration(Base, TimestampMixin):
    __tablename__ = "integrations"

    id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=new_uuid)
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False
    )
    provider: Mapped[str] = mapped_column(String(100), nullable=False)
    # provider: whatsapp | gmail | google_sheets | smtp | n8n
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="disconnected")
    # status: connected | disconnected | error
    credentials_ref: Mapped[str | None] = mapped_column(Text)
    # Referencia a secreto externo — NUNCA guardar token en texto plano aquí
    config: Mapped[dict | None] = mapped_column(JSONB)
