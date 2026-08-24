# AutoPyme — Frontend

Next.js 14 (App Router) · TypeScript · Tailwind CSS

## Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Editar .env.local con la URL de tu backend
```

### Paso obligatorio antes del primer build

Hay un archivo duplicado que Next.js no puede tener en la misma ruta. **Eliminá** este archivo:

```
src/app/(dashboard)/page.tsx   ← ELIMINAR
```

El root `/` ya lo maneja `src/app/page.tsx`.

```bash
# En la carpeta frontend:
rm src/app/\(dashboard\)/page.tsx
```

## Desarrollo

```bash
npm run dev    # http://localhost:3000
```

## Build producción

```bash
npm run build
npm start
```

## Variables de entorno

| Variable | Descripción | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL base del backend FastAPI | `http://localhost:8000` |
| `NEXT_PUBLIC_APP_NAME` | Nombre de la app | `AutoPyme` |

## Estructura

```
src/
  app/
    (dashboard)/         # Grupo de rutas autenticadas (layout con Sidebar)
      dashboard/         # /dashboard — panel principal
      leads/             # /leads — lista de leads
      leads/[id]/        # /leads/:id — detalle del lead
      conversations/     # /conversations — bandeja de conversaciones
      automations/       # /automations — automatizaciones
      integrations/      # /integrations — integraciones (WA, email, n8n)
      settings/          # /settings — configuración de perfil y negocio
    login/               # /login — página pública de ingreso
  components/
    ui/                  # Badge, Button, Card, Input, Modal, Spinner, Toast
    layout/              # Sidebar, Header
    leads/               # LeadForm
  contexts/              # AuthContext (JWT + user state)
  hooks/                 # useLeads, useLead
  lib/                   # api.ts (axios), utils.ts
  types/                 # Tipos TypeScript alineados con el backend
```

## Autenticación

JWT almacenado en cookies (`access_token`, `refresh_token`). El `AuthContext` carga el usuario al iniciar y redirige a `/login` si el token no es válido.

## API

El cliente `src/lib/api.ts` apunta al backend en `NEXT_PUBLIC_API_URL/v1/*`. Para desarrollo local, asegurate de tener el backend corriendo en `http://localhost:8000`.
