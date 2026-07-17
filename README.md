# AutoPyme

Plataforma de automatización para PyMEs — captación, seguimiento y comunicación automática de clientes vía WhatsApp, formularios y email.

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Python 3.11 · FastAPI · SQLAlchemy 2 (async) · Alembic |
| Base de datos | PostgreSQL 16 |
| Workflows | n8n self-hosted |
| Infra | Docker Compose · Nginx · Let's Encrypt |
| Frontend | Next.js (pendiente) |

## Arranque local

```bash
cp .env.example .env
# Editar .env con tus valores

cd infra
docker-compose up -d db n8n
# Esperar que la DB esté healthy, luego:
docker-compose up -d backend
```

El backend queda en `http://localhost:8000`.
Docs API: `http://localhost:8000/docs`
n8n: `http://localhost:5678`

## Arranque en VPS (producción)

```bash
# En el VPS como root:
export DOMAIN="tudominio.com"
export CERTBOT_EMAIL="tu@email.com"
export REPO_URL="https://github.com/tu_usuario/autopyme.git"
bash infra/scripts/setup_vps.sh
```

## Estructura

```
autopyme/
  backend/         # FastAPI · modelos · endpoints · webhooks
  frontend/        # Next.js (a construir)
  workflows/n8n/   # Exports de workflows de n8n
  infra/           # docker-compose · nginx · scripts
  docs/            # Documentación técnica
```

## Próximos pasos

1. `cd backend && alembic revision --autogenerate -m "initial"` → revisar y aplicar migración
2. Crear primer usuario admin con script seed
3. Configurar workflow en n8n: "Nuevo lead desde formulario"
4. Conectar WhatsApp Cloud API (Meta Developers)
5. Construir frontend Next.js con login + listado de leads

## Seguridad

- Los tokens de WhatsApp, SMTP y API keys **nunca** se guardan en la DB en texto plano
- El `.env` está en `.gitignore` — nunca subir al repo
- Multi-tenancy por `tenant_id` en todas las tablas operativas
