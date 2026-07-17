"""
Script para resetear la contraseña de un usuario.
Uso: python scripts/reset_password.py <email> <nueva_contraseña>

Ejemplo:
  python scripts/reset_password.py admin@autopyme.com admin123
"""
import asyncio
import sys
from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models.user import User
from sqlalchemy import select


async def reset(email: str, new_password: str):
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if not user:
            print(f"No se encontró ningún usuario con email: {email}")
            return

        user.password_hash = hash_password(new_password)
        await db.commit()
        print(f"Contraseña actualizada para {email}")


if len(sys.argv) != 3:
    print("Uso: python scripts/reset_password.py <email> <nueva_contraseña>")
    sys.exit(1)

asyncio.run(reset(sys.argv[1], sys.argv[2]))
