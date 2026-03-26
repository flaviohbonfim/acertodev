#!/bin/bash

# Script para automatizar o setup da aplicação no servidor Ubuntu.
# USO: ./setup_server.sh <URL_DE_DOWNLOAD>

# Para a execução se qualquer comando falhar
set -e

# Verifica se a URL foi fornecida como argumento
if [ -z "$1" ]; then
  echo "❌ Erro: Você precisa fornecer a URL de download como primeiro argumento."
  echo "Uso: $0 <URL_DE_DOWNLOAD>"
  exit 1
fi

DOWNLOAD_URL=$1
APP_DIR="/var/www/acertodev"

echo "🚀 Iniciando processo de setup no servidor..."

# 1. Navega para o diretório da aplicação
echo "📁 Navegando para $APP_DIR..."
cd $APP_DIR

# 2. Para a aplicação atual, se estiver rodando
echo "🛑 Parando serviço PM2 (acertodev)..."
pm2 stop acertodev || true # O '|| true' evita erro se o processo não existir

# 3. Limpa o diretório antigo
echo "🧹 Limpando diretório de deploy antigo..."
rm -rf .next node_modules package.json package-lock.json public deploy.zip

# 4. Baixa o novo pacote de deploy
echo "☁️  Baixando o novo pacote de deploy..."
wget -O deploy.zip "$DOWNLOAD_URL"

# 5. Descompacta os arquivos
echo "🗜️  Descompactando deploy.zip..."
unzip -o deploy.zip # O '-o' sobrescreve arquivos sem perguntar
rm deploy.zip

# 6. Instala as dependências de produção (versão para Linux)
echo "📦 Instalando dependências de produção (npm install --production)..."
npm install --production

# 7. Reinicia a aplicação com PM2
echo "▶️  Iniciando a aplicação com PM2..."
pm2 restart acertodev

echo "✅ Processo de setup finalizado com sucesso!"
echo "Verifique o status com 'pm2 status' e os logs com 'pm2 logs acertodev'."
