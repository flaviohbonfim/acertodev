#!/bin/bash

# Script de "Hard Reset" para corrigir o deploy, forçando o código do servidor
# a ser um espelho exato do repositório Git e refazendo o setup do zero.

# Para a execução se qualquer comando falhar
set -e

APP_DIR="/var/www/acertodev"

echo "🚀 Iniciando processo de Hard Reset do Deploy..."

# 1. Navega para o diretório da aplicação
echo "📁 Navegando para $APP_DIR..."
cd $APP_DIR

# 2. Para a aplicação atual para evitar conflitos de arquivo
echo "🛑 Parando serviço PM2 (acertodev)..."
pm2 stop acertodev || true

# 3. Limpa o repositório Git de quaisquer alterações locais ou arquivos corrompidos
echo "🔄 Fazendo Hard Reset do repositório Git para o estado do 'origin/main'..."
git fetch --all
git reset --hard origin/main

# 4. Salva o .env.local, limpa o diretório e restaura o .env.local
echo "🔒 Salvando .env.local..."
# Move o .env.local para um local temporário se ele existir
if [ -f ".env.local" ]; then
  mv .env.local /tmp/.env.local.bak
else
  touch /tmp/.env.local.bak # Cria um arquivo vazio para o comando mv não falhar
fi

echo "🧹 Limpando todos os arquivos não rastreados (node_modules, .next)..."
git clean -dfx

echo " वापस लाओ .env.local..."
# Move o .env.local de volta
if [ -f "/tmp/.env.local.bak" ]; then
  mv /tmp/.env.local.bak .env.local
fi

# 5. Instala as dependências do zero
echo "📦 Instalando dependências limpas com npm install..."
npm install

# 6. Executa o build de produção
echo "🏗️  Executando o build de produção (npm run build)..."
npm run build

# 7. Reinicia a aplicação com PM2
echo "▶️  Reiniciando a aplicação com PM2..."
pm2 restart acertodev || pm2 start npm --name acertodev -- start

# 8. Salva a configuração do PM2
pm2 save

echo "✅ Processo de Hard Reset finalizado com sucesso!"
echo "A aplicação foi restaurada para o estado mais recente do repositório e reconstruída."
echo "Verifique o status com 'pm2 status' e os logs com 'pm2 logs acertodev'."
