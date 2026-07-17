"""
Script para verificar si el login funcionaría para un usuario.
Uso: python scripts/verify_login.py <email> <contraseña>

Ejemplo:
  python scripts/verify_login.py admin@autopyme.com admin123
"""
import asyncio
import sys
from app.core.database import AsyncSessionLocal
from app.core.security import verify_password
from app.models.user import User
from sqlalchemy import select


async def check_login(email: str, password: str):
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if not user:
            print(f"❌ No existe usuario con email: {email}")
            return

        print(f"✅ Usuario encontrado: {user.email}")
        print(f"   Status: {user.status}")
        print(f"   Hash guardado: {user.password_hash[:30]}...")

        match = verify_password(password, user.password_hash)
        if match:
            print(f"✅ Contraseña '{password}' es CORRECTA")
        else:
            print(f"❌ Contraseña '{password}' es INCORRECTA")


if len(sys.argv) != 3:
    print("Uso: python scripts/verify_login.py <email> <contraseña>")
    sys.exit(1)

asyncio.run(check_login(sys.argv[1], sys.argv[2]))
