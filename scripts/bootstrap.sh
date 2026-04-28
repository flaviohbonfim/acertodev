#!/usr/bin/env bash
# =============================================================================
# bootstrap.sh — Configuração inicial do servidor Oracle Cloud Ubuntu
# Execute do seu Mac: bash scripts/bootstrap.sh
#
# Configuração (crie um arquivo .deploy.conf na raiz do projeto):
#   SERVER_IP=<ip do servidor>
#   SERVER_USER=<usuario ssh>
#   SERVER_KEY=<caminho da chave privada>   # opcional, default: ~/aptidev.key
# =============================================================================

set -euo pipefail

CONF_FILE="$(dirname "$0")/../.deploy.conf"
[[ -f "$CONF_FILE" ]] && source "$CONF_FILE"

SERVER_IP="${SERVER_IP:-}"
SERVER_USER="${SERVER_USER:-}"
SERVER_KEY="${SERVER_KEY:-$HOME/aptidev.key}"

[[ -n "$SERVER_IP" ]]   || { echo "Erro: SERVER_IP não definido. Crie o arquivo .deploy.conf"; exit 1; }
[[ -n "$SERVER_USER" ]] || { echo "Erro: SERVER_USER não definido. Crie o arquivo .deploy.conf"; exit 1; }
APP_DIR="/var/www/acertodev"
CERT_LOCAL="$(dirname "$0")/../acertodev.cert"
KEY_LOCAL="$(dirname "$0")/../acertodev.key"

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()    { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }
section() { echo -e "\n${BOLD}=== $* ===${NC}"; }

ssh_run() {
  ssh -i "$SERVER_KEY" -o StrictHostKeyChecking=accept-new \
      "${SERVER_USER}@${SERVER_IP}" "$@"
}

scp_upload() {
  scp -i "$SERVER_KEY" -o StrictHostKeyChecking=accept-new "$1" \
      "${SERVER_USER}@${SERVER_IP}:$2"
}

# ---------------------------------------------------------------------------
section "PRÉ-REQUISITOS"
# ---------------------------------------------------------------------------

[[ -f "$SERVER_KEY" ]] || error "Chave SSH não encontrada em $SERVER_KEY"
[[ -f "$CERT_LOCAL" ]] || error "Certificado não encontrado em $CERT_LOCAL"
[[ -f "$KEY_LOCAL"  ]] || error "Chave TLS não encontrada em $KEY_LOCAL"

warn "Antes de continuar, certifique-se de que as portas 80 e 443 estão abertas"
warn "no Oracle Cloud Console → Networking → VCN → Security Lists:"
warn "  Ingress: TCP 80  de 0.0.0.0/0"
warn "  Ingress: TCP 443 de 0.0.0.0/0"
echo
read -rp "As portas já foram abertas no Oracle Cloud Console? [s/N] " confirm
[[ "$confirm" =~ ^[sS]$ ]] || error "Abra as portas antes de continuar."

# ---------------------------------------------------------------------------
section "VARIÁVEIS DE AMBIENTE"
# ---------------------------------------------------------------------------

echo "Informe as variáveis de ambiente da aplicação:"
echo
read -rsp "  MONGODB_URI (Atlas connection string): " MONGODB_URI; echo
read -rsp "  NEXTAUTH_SECRET (string aleatória segura): " NEXTAUTH_SECRET; echo

[[ -n "$MONGODB_URI" ]]     || error "MONGODB_URI não pode ser vazio."
[[ -n "$NEXTAUTH_SECRET" ]] || error "NEXTAUTH_SECRET não pode ser vazio."

# ---------------------------------------------------------------------------
section "TESTANDO CONEXÃO SSH"
# ---------------------------------------------------------------------------

info "Conectando ao servidor..."
ssh_run "echo 'SSH OK'"

# ---------------------------------------------------------------------------
section "CONFIGURANDO SERVIDOR"
# ---------------------------------------------------------------------------

info "Atualizando pacotes e instalando dependências base..."
ssh_run "sudo apt-get update -q && sudo apt-get install -y -q curl gnupg nginx"

info "Instalando Node.js 20 LTS..."
ssh_run "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && \
         sudo apt-get install -y nodejs"

info "Instalando PM2..."
ssh_run "sudo npm install -g pm2"

info "Criando diretório da aplicação..."
ssh_run "sudo mkdir -p $APP_DIR && sudo chown ubuntu:ubuntu $APP_DIR"

# ---------------------------------------------------------------------------
section "CERTIFICADO SSL"
# ---------------------------------------------------------------------------

info "Enviando certificado Cloudflare para o servidor..."
ssh_run "sudo mkdir -p /etc/ssl/cloudflare"
scp_upload "$CERT_LOCAL" "/tmp/acertodev.cert"
scp_upload "$KEY_LOCAL"  "/tmp/acertodev.key"
ssh_run "sudo mv /tmp/acertodev.cert /etc/ssl/cloudflare/acertodev.cert && \
         sudo mv /tmp/acertodev.key  /etc/ssl/cloudflare/acertodev.key && \
         sudo chown root:root /etc/ssl/cloudflare/acertodev.cert /etc/ssl/cloudflare/acertodev.key && \
         sudo chmod 644 /etc/ssl/cloudflare/acertodev.cert && \
         sudo chmod 600 /etc/ssl/cloudflare/acertodev.key"

# ---------------------------------------------------------------------------
section "NGINX"
# ---------------------------------------------------------------------------

info "Configurando Nginx..."
ssh_run "sudo tee /etc/nginx/sites-available/acertodev > /dev/null << 'NGINX_EOF'
server {
    listen 80;
    server_name acertodev.apti.dev;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name acertodev.apti.dev;

    ssl_certificate     /etc/ssl/cloudflare/acertodev.cert;
    ssl_certificate_key /etc/ssl/cloudflare/acertodev.key;

    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX_EOF"

ssh_run "sudo ln -sf /etc/nginx/sites-available/acertodev /etc/nginx/sites-enabled/acertodev && \
         sudo rm -f /etc/nginx/sites-enabled/default && \
         sudo nginx -t && sudo systemctl reload nginx"

info "Habilitando Nginx no boot..."
ssh_run "sudo systemctl enable nginx"

# ---------------------------------------------------------------------------
section "UFW (FIREWALL)"
# ---------------------------------------------------------------------------

info "Configurando UFW..."
ssh_run "sudo ufw allow OpenSSH && \
         sudo ufw allow 'Nginx Full' && \
         sudo ufw --force enable"

# ---------------------------------------------------------------------------
section "VARIÁVEIS DE AMBIENTE DA APLICAÇÃO"
# ---------------------------------------------------------------------------

info "Criando .env.local..."
ssh_run "cat > $APP_DIR/.env.local << EOF
MONGODB_URI=$MONGODB_URI
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
NEXTAUTH_URL=https://acertodev.apti.dev
NODE_ENV=production
EOF
chmod 600 $APP_DIR/.env.local"

# ---------------------------------------------------------------------------
section "AUTO-DEPLOY — CONFIGURAÇÃO"
# ---------------------------------------------------------------------------

info "Criando .deploy_env..."
ssh_run "cat > $APP_DIR/.deploy_env << 'EOF'
GH_REPO=flaviohbonfim/acertodev
EOF
chmod 600 $APP_DIR/.deploy_env"

info "Instalando auto-deploy.sh no servidor..."
scp_upload "$(dirname "$0")/auto-deploy.sh" "/tmp/auto-deploy.sh"
ssh_run "sudo mv /tmp/auto-deploy.sh /usr/local/bin/acertodev-auto-deploy.sh && \
         sudo chmod +x /usr/local/bin/acertodev-auto-deploy.sh"

info "Registrando cron (a cada 5 minutos)..."
ssh_run "(crontab -l 2>/dev/null | grep -v acertodev-auto-deploy; \
          echo '*/5 * * * * /usr/local/bin/acertodev-auto-deploy.sh >> /var/log/acertodev-deploy.log 2>&1') | crontab -"

ssh_run "sudo touch /var/log/acertodev-deploy.log && \
         sudo chown ubuntu:ubuntu /var/log/acertodev-deploy.log"

# ---------------------------------------------------------------------------
section "PRIMEIRO DEPLOY"
# ---------------------------------------------------------------------------

info "Executando primeiro deploy (aguardando release no GitHub)..."
warn "O GitHub Actions precisa ter gerado ao menos uma release."
warn "Se ainda não fez push na main, faça agora e aguarde o Actions terminar."
echo
read -rp "Já existe uma release publicada no GitHub? [s/N] " has_release

if [[ "$has_release" =~ ^[sS]$ ]]; then
  ssh_run "/usr/local/bin/acertodev-auto-deploy.sh"
  info "Deploy concluído!"
else
  warn "Faça push na branch main para acionar o GitHub Actions."
  warn "Após a release ser criada, rode: ./manage.sh deploy"
fi

# ---------------------------------------------------------------------------
section "PM2 STARTUP"
# ---------------------------------------------------------------------------

info "Configurando PM2 para iniciar no boot..."
ssh_run "pm2 startup systemd -u ubuntu --hp /home/ubuntu | tail -1 | sudo bash || true"
ssh_run "pm2 save"

# ---------------------------------------------------------------------------
section "CONCLUÍDO"
# ---------------------------------------------------------------------------

echo
info "Bootstrap concluído com sucesso!"
info "Próximos passos:"
echo "  1. Faça push na branch main para acionar o GitHub Actions"
echo "  2. Adicione os secrets NEXTAUTH_SECRET e MONGODB_URI no GitHub:"
echo "     https://github.com/flaviohbonfim/acertodev/settings/secrets/actions"
echo "  3. Use ./manage.sh status para verificar o servidor"
echo "  4. Acesse https://acertodev.apti.dev"
