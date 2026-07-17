"""
Prueba el envío de email con las credenciales del .env
Uso: python scripts/test_email.py destinatario@gmail.com
"""
import asyncio
import sys
from app.services.email import send_lead_confirmation

async def main():
    to = sys.argv[1] if len(sys.argv) > 1 else "sanchezalberttia@gmail.com"
    print(f"Enviando email de prueba a {to}...")
    ok = await send_lead_confirmation(
        to_email=to,
        nombre="Andrés",
        curso="Curso de prueba — AutoPyme",
    )
    if ok:
        print("✅ Email enviado correctamente")
    else:
        print("❌ Falló el envío — revisá los logs de arriba")

asyncio.run(main())
