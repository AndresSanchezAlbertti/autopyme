#!/usr/bin/env bash
# ============================================================
# AutoPyme — Script de setup para VPS Ubuntu 22.04
# Uso: sudo bash setup_vps.sh
# ============================================================
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/tu_usuario/autopyme.git}"
APP_DIR="/opt/autopyme"
DOMAIN="${DOMAIN:-tudominio.com}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-tu@email.com}"

echo "==> [1/6] Actualizando paquetes..."
apt-get update -qq && apt-get upgrade -y -qq

echo "==> [2/6] Instalando Docker..."
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
  usermod -aG docker "$SUDO_USER"
fi

if ! command -v docker-compose &> /dev/null; then
  COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep tag_name | cut -d '"' -f4)
  curl -SL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-x86_64" \
    -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose
fi

echo "==> [3/6] Clonando repositorio..."
if [ -d "$APP_DIR" ]; then
  echo "  El directorio ya existe, haciendo pull..."
  git -C "$APP_DIR" pull
else
  git clone "$REPO_URL" "$APP_DIR"
fi
cd "$APP_DIR"

echo "==> [4/6] Configurando .env..."
if [ ! -f .env ]; then
  cp .env.example .env
  # Generar claves automáticamente
  SECRET_KEY=$(openssl rand -hex 32)
  N8N_KEY=$(openssl rand -hex 32)
  DB_PASS=$(openssl rand -base64 24 | tr -dc 'A-Za-z0-9' | head -c 24)
  N8N_AUTH_PASS=$(openssl rand -base64 16 | tr -dc 'A-Za-z0-9' | head -c 16)

  sed -i "s/cambia_esto_en_produccion/${DB_PASS}/g" .env
  sed -i "s/genera_una_clave_secreta_con_openssl_rand_hex_32/${SECRET_KEY}/" .env
  sed -i "s/genera_una_clave_con_openssl_rand_hex_32/${N8N_KEY}/" .env
  sed -i "s/N8N_BASIC_AUTH_PASSWORD=.*/N8N_BASIC_AUTH_PASSWORD=${N8N_AUTH_PASS}/" .env
  sed -i "s/tudominio.com/${DOMAIN}/g" .env
  sed -i "s/tu@email.com/${CERTBOT_EMAIL}/" .env

  echo ""
  echo "  ⚠️  .env generado con claves aleatorias."
  echo "  Revisalo antes de continuar: nano .env"
fi

echo "==> [5/6] Obteniendo certificados SSL (Let's Encrypt)..."
# Primera vez: Nginx sin SSL para que certbot pueda verificar
docker-compose -f infra/docker-compose.yml up -d nginx

sleep 3

for subdomain in "api.${DOMAIN}" "app.${DOMAIN}" "automation.${DOMAIN}"; do
  certbot certonly \
    --webroot \
    --webroot-path /var/www/certbot \
    --email "$CERTBOT_EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$subdomain" || echo "  Advertencia: certbot falló para $subdomain — continuando"
done

echo "==> [6/6] Levantando todos los servicios..."
docker-compose -f infra/docker-compose.yml up -d --build

echo ""
echo "✅ Setup completado."
echo "   Backend: https://api.${DOMAIN}/health"
echo "   App:     https://app.${DOMAIN}"
echo "   n8n:     https://automation.${DOMAIN}"
echo ""
echo "Revisá los logs con: docker-compose -f infra/docker-compose.yml logs -f"
