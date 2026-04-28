#!/usr/bin/env bash
# =============================================================================
# manage.sh — Gerenciamento remoto do servidor acertodev
# Execute do seu Mac: ./manage.sh <comando>
#
# Configuração (crie um arquivo .deploy.conf na raiz do projeto):
#   SERVER_IP=<ip do servidor>
#   SERVER_USER=<usuario ssh>
#   SERVER_KEY=<caminho da chave privada>   # opcional, default: ~/aptidev.key
# =============================================================================

set -euo pipefail

CONF_FILE="$(dirname "$0")/.deploy.conf"
[[ -f "$CONF_FILE" ]] && source "$CONF_FILE"

SERVER_IP="${SERVER_IP:-}"
SERVER_USER="${SERVER_USER:-}"
SERVER_KEY="${SERVER_KEY:-$HOME/aptidev.key}"

[[ -n "$SERVER_IP" ]]   || { echo "Erro: SERVER_IP não definido. Crie o arquivo .deploy.conf"; exit 1; }
[[ -n "$SERVER_USER" ]] || { echo "Erro: SERVER_USER não definido. Crie o arquivo .deploy.conf"; exit 1; }

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

ssh_run() {
  ssh -i "$SERVER_KEY" -o StrictHostKeyChecking=accept-new \
      -o ConnectTimeout=10 "${SERVER_USER}@${SERVER_IP}" "$@"
}

usage() {
  echo -e "${BOLD}Uso:${NC} ./manage.sh <comando>"
  echo
  echo -e "${BOLD}Comandos:${NC}"
  echo -e "  ${CYAN}status${NC}   — Exibe estado do PM2, Nginx, disco e versão deployada"
  echo -e "  ${CYAN}logs${NC}     — Tail dos logs do PM2 em tempo real (Ctrl+C para sair)"
  echo -e "  ${CYAN}deploy${NC}   — Força execução imediata do auto-deploy"
  echo -e "  ${CYAN}restart${NC}  — Reinicia o processo PM2"
  echo -e "  ${CYAN}diagnose${NC} — Diagnóstico completo de portas, app e certificados"
  echo -e "  ${CYAN}shell${NC}    — Abre sessão SSH interativa"
  exit 1
}

cmd="${1:-}"

case "$cmd" in

  status)
    echo -e "\n${BOLD}=== STATUS: acertodev.apti.dev ===${NC}\n"

    echo -e "${YELLOW}--- PM2 ---${NC}"
    ssh_run "pm2 list 2>/dev/null || echo 'PM2 sem processos registrados'"

    echo -e "\n${YELLOW}--- Nginx ---${NC}"
    ssh_run "systemctl is-active nginx && echo 'Nginx: ativo' || echo 'Nginx: inativo'"

    echo -e "\n${YELLOW}--- Versão deployada ---${NC}"
    ssh_run "cat /var/www/acertodev/.deployed_version 2>/dev/null || echo '(nenhuma versão registrada)'"

    echo -e "\n${YELLOW}--- Últimas entradas do log de deploy ---${NC}"
    ssh_run "tail -20 /var/log/acertodev-deploy.log 2>/dev/null || echo '(log vazio)'"

    echo -e "\n${YELLOW}--- Espaço em disco ---${NC}"
    ssh_run "df -h / | tail -1 | awk '{print \"Usado: \"\$3\" / \"\$2\" (\"\$5\" cheio)\"}'"
    echo
    ;;

  logs)
    echo -e "${CYAN}Exibindo logs do PM2 (Ctrl+C para sair)...${NC}\n"
    ssh -i "$SERVER_KEY" -o StrictHostKeyChecking=accept-new \
        -t "${SERVER_USER}@${SERVER_IP}" "pm2 logs acertodev --lines 50"
    ;;

  deploy)
    echo -e "${CYAN}Forçando deploy imediato...${NC}"
    ssh_run "/usr/local/bin/acertodev-auto-deploy.sh"
    echo -e "${GREEN}Concluído.${NC}"
    ;;

  restart)
    echo -e "${CYAN}Reiniciando PM2...${NC}"
    ssh_run "pm2 restart acertodev"
    echo -e "${GREEN}Processo reiniciado.${NC}"
    ;;

  shell)
    echo -e "${CYAN}Abrindo sessão SSH em ${SERVER_USER}@${SERVER_IP}...${NC}"
    ssh -i "$SERVER_KEY" -o StrictHostKeyChecking=accept-new \
        "${SERVER_USER}@${SERVER_IP}"
    ;;

  diagnose)
    echo -e "\n${BOLD}=== DIAGNÓSTICO: acertodev.apti.dev ===${NC}\n"

    echo -e "${YELLOW}--- Portas em escuta ---${NC}"
    ssh_run "sudo ss -tlnp | grep -E ':80|:443|:3000' || echo 'Nenhuma das portas 80/443/3000 em escuta'"

    echo -e "\n${YELLOW}--- App respondendo localmente ---${NC}"
    ssh_run "curl -sI http://localhost:3000 | head -3 || echo 'App não responde em localhost:3000'"

    echo -e "\n${YELLOW}--- Nginx config test ---${NC}"
    ssh_run "sudo nginx -t 2>&1"

    echo -e "\n${YELLOW}--- UFW status ---${NC}"
    ssh_run "sudo ufw status"

    echo -e "\n${YELLOW}--- Últimas linhas do log do PM2 ---${NC}"
    ssh_run "pm2 logs acertodev --lines 20 --nostream 2>/dev/null || echo '(sem logs)'"

    echo -e "\n${YELLOW}--- Certificado SSL ---${NC}"
    ssh_run "ls -la /etc/ssl/cloudflare/ 2>/dev/null || echo 'Certificados não encontrados'"

    echo -e "\n${BOLD}ATENÇÃO:${NC} Se as portas 80/443 aparecerem em escuta mas o site não carregar,"
    echo "verifique a Oracle Cloud Security List no console OCI:"
    echo "  Networking → Virtual Cloud Networks → VCN → Security Lists"
    echo "  Adicione Ingress Rules: TCP 80 e TCP 443 de 0.0.0.0/0"
    echo
    ;;

  *)
    usage
    ;;

esac
