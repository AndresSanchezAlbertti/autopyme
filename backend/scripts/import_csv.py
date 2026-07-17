"""
Importa leads desde un CSV directamente a la DB y los agrega a Perfit.
Uso: python scripts/import_csv.py ruta/al/archivo.csv

Columnas reconocidas (cualquier orden, no distingue mayúsculas):
  email / mail / correo
  nombre / name / first
  apellido / lastname / last
  telefono / phone / whatsapp / tel
  curso / course / interest / inscribe
"""
import asyncio
import csv
import os
import sys
from pathlib import Path

from app.core.database import AsyncSessionLocal
from app.models.lead import Lead
from app.models.tenant import Tenant
from app.services.perfit import add_contact_to_list
from sqlalchemy import select

TENANT_ID = os.getenv("TENANT_ID", "22dcfbbc-44f1-48d1-9383-f3a3e9378672")


def find_col(headers: list[str], keywords: list[str]) -> str | None:
    for h in headers:
        if any(k in h for k in keywords):
            return h
    return None


async def importar(csv_path: str):
    path = Path(csv_path)
    if not path.exists():
        print(f"❌ Archivo no encontrado: {csv_path}")
        sys.exit(1)

    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        text = path.read_text(encoding="latin-1")

    import io
    reader = csv.DictReader(io.StringIO(text))
    headers = [h.lower().strip() for h in (reader.fieldnames or [])]

    col_email    = find_col(headers, ["email", "mail", "correo"])
    col_nombre   = find_col(headers, ["nombre", "name", "first"])
    col_apellido = find_col(headers, ["apellido", "lastname", "last"])
    col_telefono = find_col(headers, ["telefono", "phone", "whatsapp", "tel"])
    col_interes  = find_col(headers, ["curso", "course", "interest", "interes", "inscribe"])

    if not col_email:
        print("❌ El CSV no tiene columna de email (email, mail, correo)")
        sys.exit(1)

    print(f"📄 Archivo: {path.name}")
    print(f"   Columna email    → '{col_email}'")
    print(f"   Columna nombre   → '{col_nombre or 'no detectada'}'")
    print(f"   Columna apellido → '{col_apellido or 'no detectada'}'")
    print(f"   Columna teléfono → '{col_telefono or 'no detectada'}'")
    print(f"   Columna curso    → '{col_interes or 'no detectada'}'")
    print()

    importados = duplicados = errores = sin_email = 0

    async with AsyncSessionLocal() as db:
        from uuid import UUID
        tenant_uuid = UUID(TENANT_ID)

        rows = list(reader)
        print(f"Procesando {len(rows)} filas...\n")

        for i, row in enumerate(rows, 1):
            row_lower = {k.lower().strip(): v.strip() for k, v in row.items()}

            email = row_lower.get(col_email, "").strip()
            if not email or "@" not in email:
                print(f"  Fila {i}: ⚪ Sin email válido")
                sin_email += 1
                continue

            # Verificar duplicado
            existing = (await db.execute(
                select(Lead).where(Lead.tenant_id == tenant_uuid, Lead.email == email)
            )).scalars().first()
            if existing:
                print(f"  Fila {i}: 🔁 Duplicado — {email}")
                duplicados += 1
                continue

            nombre   = row_lower.get(col_nombre,   "") if col_nombre   else ""
            apellido = row_lower.get(col_apellido, "") if col_apellido else ""
            telefono = row_lower.get(col_telefono, "") if col_telefono else ""
            interes  = row_lower.get(col_interes,  "") if col_interes  else ""
            full_name = f"{nombre} {apellido}".strip() or None

            try:
                lead = Lead(
                    tenant_id=tenant_uuid,
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
                ok = await add_contact_to_list(
                    email=email,
                    first_name=partes[0] if partes else "",
                    last_name=partes[1] if len(partes) > 1 else "",
                )

                perfit_status = "✅ Perfit OK" if ok else "⚠️  Perfit falló"
                print(f"  Fila {i}: ✅ Importado — {email} | {perfit_status}")
                importados += 1

            except Exception as e:
                print(f"  Fila {i}: ❌ Error — {email} ({e})")
                errores += 1

        await db.commit()

    print(f"""
─────────────────────────────────
  Importados:  {importados}
  Duplicados:  {duplicados}
  Sin email:   {sin_email}
  Errores:     {errores}
─────────────────────────────────
""")


if len(sys.argv) != 2:
    print("Uso: python scripts/import_csv.py ruta/al/archivo.csv")
    sys.exit(1)

asyncio.run(importar(sys.argv[1]))
