"""
Servicio de envío de emails async.
Usa las credenciales SMTP del .env (por ahora globales; luego se migra a per-tenant).
"""
import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import get_settings

settings = get_settings()


def _build_lead_html(nombre: str, curso: str) -> str:
    return f"""
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gracias por tu consulta</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#1a56db;padding:32px 40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;letter-spacing:0.5px;">
                SEDEBA
              </h1>
              <p style="color:#bfdbfe;margin:6px 0 0;font-size:13px;">
                Instituto Superior de Formación Docente
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="color:#374151;font-size:16px;margin:0 0 16px;">
                Hola <strong>{nombre}</strong>,
              </p>
              <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
                ¡Gracias por tu interés en inscribirte! Recibimos tu consulta sobre:
              </p>

              <!-- Curso destacado -->
              <div style="background:#eff6ff;border-left:4px solid #1a56db;
                          border-radius:0 6px 6px 0;padding:16px 20px;margin:0 0 24px;">
                <p style="margin:0;color:#1e40af;font-size:15px;font-weight:600;line-height:1.5;">
                  {curso}
                </p>
              </div>

              <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Un integrante de nuestro equipo se pondrá en contacto con vos
                a la brevedad para brindarte toda la información sobre el cursado,
                fechas de inicio y proceso de inscripción.
              </p>
              <p style="color:#374151;font-size:15px;line-height:1.6;margin:0;">
                Si tenés alguna pregunta urgente, podés escribirnos directamente
                respondiendo este correo.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="https://instituto.sedeba.org.ar/capacitaciones"
                 style="display:inline-block;background:#1a56db;color:#ffffff;
                        text-decoration:none;padding:14px 32px;border-radius:6px;
                        font-size:15px;font-weight:600;">
                Ver todos los cursos
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;
                       text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                SEDEBA — Instituto Superior de Formación Docente<br>
                Este correo fue enviado porque completaste un formulario en nuestro sitio.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


async def send_lead_confirmation(
    to_email: str,
    nombre: str,
    curso: str,
) -> bool:
    """
    Envía email de confirmación al lead.
    Retorna True si tuvo éxito, False si falló (no rompe el flujo del webhook).
    """
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print("[email] SMTP no configurado — email no enviado")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Recibimos tu consulta sobre: {curso}"
    msg["From"]    = f"SEDEBA <{settings.SMTP_FROM or settings.SMTP_USER}>"
    msg["To"]      = to_email

    # Texto plano de fallback
    texto = (
        f"Hola {nombre},\n\n"
        f"Gracias por tu interés en: {curso}\n\n"
        "Un integrante de nuestro equipo se pondrá en contacto a la brevedad.\n\n"
        "SEDEBA — Instituto Superior de Formación Docente"
    )
    msg.attach(MIMEText(texto, "plain", "utf-8"))
    msg.attach(MIMEText(_build_lead_html(nombre, curso), "html", "utf-8"))

    try:
        await aiosmtplib.send(
            msg,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            start_tls=True,
        )
        print(f"[email] ✅ Enviado a {to_email}")
        return True
    except Exception as e:
        print(f"[email] ❌ Error al enviar a {to_email}: {e}")
        return False
