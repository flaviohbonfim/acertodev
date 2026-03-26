#!/bin/bash

# Script final para deploy da aplicação AcertoDev diretamente no servidor.
# Este script busca o código, instala as dependências e faz o build no ambiente de produção.

# Para a execução se qualquer comando falhar
set -e

# Limpa o cache do compilador SWC do Next.js para evitar erros de download corrompido
echo "🧹 Limpando o cache do compilador Next.js (SWC)..."
rm -rf /home/ubuntu/.cache/next-swc/

APP_DIR="/var/www/acertodev"

echo "🚀 Iniciando deploy completo no servidor..."

# 1. Navega para o diretório da aplicação
echo "📁 Navegando para $APP_DIR..."
cd $APP_DIR

# 2. Busca o código mais recente do repositório Git
echo "🔄 Puxando as últimas alterações do Git (branch main)..."
git pull origin main

# 3. Instala todas as dependências (necessárias para o build)
echo "📦 Instalando/atualizando dependências com npm install..."
npm install --production

# 4. Executa o build de produção no servidor
#    Isso garante que os caminhos dos arquivos sejam compatíveis com Linux.
echo "🏗️  Executando o build de produção (npm run build)..."
npm run build

# 5. Reinicia a aplicação com PM2
echo "▶️  Reiniciando a aplicação com PM2..."
pm2 restart acertodev

echo "✅ Deploy finalizado com sucesso!"
echo "Verifique o status com 'pm2 status' e os logs com 'pm2 logs acertodev'."
