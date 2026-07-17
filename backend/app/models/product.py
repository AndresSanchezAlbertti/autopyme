import uuid
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from app.core.database import Base
from app.models.base import TimestampMixin, new_uuid


class Product(Base, TimestampMixin):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=new_uuid)
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    score: Mapped[str | None] = mapped_column(String(100))  # ej: "4 puntos", "2.5"
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")

    tenant: Mapped["Tenant"] = relationship()  # type: ignore[name-defined]
