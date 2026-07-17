import uuid
from sqlalchemy import String, Text, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB
from app.core.database import Base
from app.models.base import TimestampMixin, new_uuid


class AutomationTemplate(Base, TimestampMixin):
    """Plantillas globales creadas por el equipo de AutoPyme."""
    __tablename__ = "automation_templates"

    id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=new_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str | None] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(Text)
    default_config: Mapped[dict | None] = mapped_column(JSONB)
    n8n_workflow_blueprint: Mapped[dict | None] = mapped_column(JSONB)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class TenantAutomation(Base, TimestampMixin):
    """Automatización activa de un tenant específico."""
    __tablename__ = "tenant_automations"

    id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=new_uuid)
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False
    )
    template_id: Mapped[uuid.UUID | None] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("automation_templates.id")
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    config: Mapped[dict | None] = mapped_column(JSONB)
    n8n_workflow_id: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="inactive")
    # status: inactive | active | paused | error

    tenant: Mapped["Tenant"] = relationship(back_populates="automations")  # type: ignore[name-defined]
    template: Mapped["AutomationTemplate"] = relationship()
