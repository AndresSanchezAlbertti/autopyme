"""
Integración con Perfit Email Marketing.
Agrega contactos a una lista cuando llega un lead.
"""
import httpx
from app.core.config import get_settings

settings = get_settings()

PERFIT_BASE = "https://api.myperfit.com/v2"


async def add_contact_to_list(
    email: str,
    first_name: str = "",
    last_name: str = "",
) -> bool:
    """
    Crea o actualiza un contacto en la lista de Perfit.
    Retorna True si tuvo éxito.
    """
    if not settings.PERFIT_API_KEY or not settings.PERFIT_ACCOUNT or not settings.PERFIT_LIST_ID:
        print("[perfit] Credenciales no configuradas — contacto no agregado")
        return False

    url = f"{PERFIT_BASE}/{settings.PERFIT_ACCOUNT}/lists/{settings.PERFIT_LIST_ID}/contacts"

    payload = {"email": email}
    if first_name:
        payload["firstName"] = first_name
    if last_name:
        payload["lastName"] = last_name

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                url,
                json=payload,
                headers={
                    "Authorization": f"Bearer {settings.PERFIT_API_KEY}",
                    "Content-Type": "application/json",
                },
            )
        if response.status_code in (200, 201):
            print(f"[perfit] ✅ Contacto agregado: {email}")
            return True
        else:
            print(f"[perfit] ❌ Error {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"[perfit] ❌ Excepción: {e}")
        return False
