# Script PowerShell (Versão 2) - Otimizado para Deploy Cross-Platform

$ErrorActionPreference = "Stop"
Write-Host "🚀 Iniciando processo de build para deploy (v2)..." -ForegroundColor Green

# 1. Limpar builds antigos
Write-Host "🧹 Limpando builds antigos..." -ForegroundColor Yellow
if (Test-Path -Path ".next") {
    Remove-Item -Recurse -Force ".next"
}

# 2. Instalar dependências e compilar o projeto
Write-Host "📦 Instalando dependências e compilando o projeto..." -ForegroundColor Yellow
npm install
npm run build

# 3. Compactar apenas os arquivos de build e manifesto
Write-Host "🗜️  Compactando arquivos de deploy (sem node_modules)..." -ForegroundColor Yellow
$itemsToZip = @(
    ".next",
    "package.json",
    "package-lock.json",
    "next.config.js"
)
# Adiciona a pasta 'public' ao ZIP somente se ela existir
if (Test-Path -Path "public") {
    $itemsToZip += "public"
}
Compress-Archive -Path $itemsToZip -DestinationPath "deploy.zip" -Force

Write-Host "✅ Arquivos compactados com sucesso!" -ForegroundColor Green

# 4. Fazer o upload para filebin.net
Write-Host "☁️  Fazendo upload do arquivo para filebin.net..." -ForegroundColor Yellow
$zipFilePath = ".\deploy.zip"
$filebinUrl = "https://filebin.net"
$currentDateTime = Get-Date -Format "yyyyMMddHHmmss"
$bin = "acertodev-" + $currentDateTime
$filename = [System.IO.Path]::GetFileName($zipFilePath)
$curlCommand = @("curl", "--location", "'$filebinUrl/$bin/$filename'", "--header", "'Content-Type: application/octet-stream'", "--data-binary", "'@$zipFilePath'")
try {
    $response = Invoke-Expression ($curlCommand -join " ")
    $responseObj = $response | ConvertFrom-Json
    if ($responseObj.file.filename) {
        Write-Host "🎉 Upload concluído!" -ForegroundColor Green
        $downloadLink = "$filebinUrl/$($responseObj.bin.id)/$($responseObj.file.filename)"
        Write-Host "🔗 Link para download: $downloadLink" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Falha ao enviar o arquivo." -ForegroundColor Red; exit 1
    }
} catch {
    Write-Host "❌ Erro no upload." -ForegroundColor Red; exit 1
}

# 5. Limpeza local
Write-Host "🧼 Limpando arquivo temporário..." -ForegroundColor Yellow
Remove-Item "deploy.zip"

Write-Host "✅ Processo finalizado com sucesso!" -ForegroundColor Green
