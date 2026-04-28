#!/usr/bin/env bash
# =============================================================================
# auto-deploy.sh — Polling de novas releases no GitHub
# Roda no servidor via cron a cada 5 minutos.
# =============================================================================

set -euo pipefail

APP_DIR="/var/www/acertodev"
DEPLOY_ENV="$APP_DIR/.deploy_env"
VERSION_FILE="$APP_DIR/.deployed_version"
WORK_DIR="/tmp/acertodev-deploy"
LOG_TAG="[acertodev-deploy]"

log() { echo "$(date -u '+%Y-%m-%dT%H:%M:%SZ') $LOG_TAG $*"; }

# ---------------------------------------------------------------------------
# Carregar configuração
# ---------------------------------------------------------------------------

[[ -f "$DEPLOY_ENV" ]] || { log "ERROR: $DEPLOY_ENV não encontrado."; exit 1; }
# shellcheck source=/dev/null
source "$DEPLOY_ENV"

: "${GH_REPO:?GH_REPO não definido em $DEPLOY_ENV}"

# ---------------------------------------------------------------------------
# Consultar última release no GitHub
# ---------------------------------------------------------------------------

LATEST_JSON=$(curl -fsSL \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/${GH_REPO}/releases/latest") || {
  log "ERROR: Falha ao consultar a API do GitHub."
  exit 1
}

LATEST_TAG=$(echo "$LATEST_JSON" | grep '"tag_name"' | head -1 | sed 's/.*"tag_name": *"\([^"]*\)".*/\1/')
ASSET_URL=$(echo "$LATEST_JSON" | grep '"browser_download_url"' | head -1 | sed 's/.*"browser_download_url": *"\([^"]*\)".*/\1/')

[[ -n "$LATEST_TAG" ]] || { log "ERROR: Não foi possível determinar a tag da release."; exit 1; }
[[ -n "$ASSET_URL" ]]  || { log "ERROR: Nenhum asset encontrado na release $LATEST_TAG."; exit 1; }

# ---------------------------------------------------------------------------
# Verificar se já está na versão mais recente
# ---------------------------------------------------------------------------

CURRENT_TAG=""
[[ -f "$VERSION_FILE" ]] && CURRENT_TAG=$(cat "$VERSION_FILE")

if [[ "$CURRENT_TAG" == "$LATEST_TAG" ]]; then
  exit 0
fi

log "Nova versão detectada: $CURRENT_TAG → $LATEST_TAG"

# ---------------------------------------------------------------------------
# Download do artifact
# ---------------------------------------------------------------------------

rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR"

ARCHIVE="$WORK_DIR/release.tar.gz"

log "Baixando $ASSET_URL..."
curl -fsSL -o "$ARCHIVE" "$ASSET_URL" || {
  log "ERROR: Falha ao baixar o artifact."
  rm -rf "$WORK_DIR"
  exit 1
}

# ---------------------------------------------------------------------------
# Extrair e aplicar
# ---------------------------------------------------------------------------

log "Extraindo artifact..."
tar -xzf "$ARCHIVE" -C "$WORK_DIR"

# Preservar .env.local antes de substituir os arquivos
ENV_BACKUP="$WORK_DIR/.env.local.bak"
[[ -f "$APP_DIR/.env.local" ]] && cp "$APP_DIR/.env.local" "$ENV_BACKUP"

log "Aplicando nova versão..."
rsync -a --delete \
  --exclude=".env.local" \
  --exclude=".deploy_env" \
  --exclude=".deployed_version" \
  --exclude="node_modules" \
  "$WORK_DIR/" "$APP_DIR/"

# Restaurar .env.local
[[ -f "$ENV_BACKUP" ]] && cp "$ENV_BACKUP" "$APP_DIR/.env.local"

# ---------------------------------------------------------------------------
# Instalar dependências de produção
# ---------------------------------------------------------------------------

log "Instalando dependências de produção..."
cd "$APP_DIR"
npm install --omit=dev --prefer-offline 2>&1 | tail -5

# ---------------------------------------------------------------------------
# Reiniciar aplicação via PM2
# ---------------------------------------------------------------------------

log "Reiniciando aplicação..."
if pm2 list | grep -q "acertodev"; then
  pm2 restart acertodev
else
  # Primeira execução: iniciar o processo PM2
  pm2 start npm --name acertodev -- start
  pm2 save
fi

# ---------------------------------------------------------------------------
# Registrar versão deployada
# ---------------------------------------------------------------------------

echo "$LATEST_TAG" > "$VERSION_FILE"

log "Deploy concluído: $LATEST_TAG"

# Limpeza
rm -rf "$WORK_DIR"
