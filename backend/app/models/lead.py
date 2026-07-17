import uuid
from datetime import datetime
from sqlalchemy import String, Text, ForeignKey, Index, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from app.core.database import Base
from app.models.base import TimestampMixin, new_uuid


class Lead(Base, TimestampMixin):
    __tablename__ = "leads"
    __table_args__ = (
        Index("ix_leads_tenant_id", "tenant_id"),
        Index("ix_leads_status", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=new_uuid)
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False
    )
    full_name: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50))
    email: Mapped[str | None] = mapped_column(String(255))
    source: Mapped[str | None] = mapped_column(String(100))
    # source: whatsapp | web_form | instagram | manual | ...

    status: Mapped[str] = mapped_column(String(50), nullable=False, default="new")
    # status: new | contacted | interested | won | lost | inactive | archived

    interest: Mapped[str | None] = mapped_column(Text)
    tags: Mapped[str | None] = mapped_column(Text)  # CSV simple para MVP
    assigned_to: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id")
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    tenant: Mapped["Tenant"] = relationship(back_populates="leads")  # type: ignore[name-defined]
    conversations: Mapped[list["Conversation"]] = relationship(back_populates="lead")  # type: ignore[name-defined]
