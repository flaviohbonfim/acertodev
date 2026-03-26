# Guia de Implantação: Projeto Next.js em Ubuntu 24.04

Este guia detalha os passos para implantar sua aplicação Next.js em um servidor Ubuntu 24.04, usando Nginx como proxy reverso e PM2 para gerenciar o processo da aplicação.

## Pré-requisitos

- Um servidor com Ubuntu 24.04.
- Acesso SSH ao servidor com um usuário `sudo`.
- Seu código de projeto em um repositório Git (ex: GitHub, GitLab).

---

## Passo 1: Configuração do Servidor

Primeiro, conecte-se ao seu servidor via SSH e atualize os pacotes do sistema.

```bash
ssh seu_usuario@ip_do_servidor

sudo apt update && sudo apt upgrade -y
```

### 1.1 Configurar Fuso Horário (Opcional, mas recomendado)

Para garantir que os logs de todos os serviços (Nginx, PM2, etc.) exibam o horário correto, ajuste o fuso horário do servidor.

```bash
# Define o fuso horário para São Paulo
sudo timedatectl set-timezone America/Sao_Paulo

# Verifica se a alteração foi aplicada
timedatectl
```

### 1.2 Instalar Node.js

Vamos instalar o Node.js (versão 20.x LTS é recomendada).

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verifique a instalação:
```bash
node -v
npm -v
```

### 1.3 Instalar Nginx

Nginx será nosso proxy reverso, direcionando o tráfego da porta 80 para a porta da sua aplicação Next.js (padrão 3000).

```bash
sudo apt install nginx -y
```

### 1.4 Instalar PM2

PM2 é um gerenciador de processos que manterá sua aplicação rodando em segundo plano e a reiniciará automaticamente em caso de falhas.

```bash
sudo npm install pm2 -g
```

---

## Passo 2: Implantação do Projeto

### 2.1 Clonar o Repositório

Clone seu projeto do Git para o servidor. Um bom local é `/var/www`.

```bash
# Crie o diretório se não existir e ajuste as permissões
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www

# Clone o projeto
git clone seu_repositorio_git /var/www/acertodev
cd /var/www/acertodev
```

### 2.2 Instalar Dependências

Instale as dependências do projeto com `npm`.

```bash
npm install
```

### 2.3 Configurar Variáveis de Ambiente

Sua aplicação provavelmente precisa de variáveis de ambiente (ex: conexão com banco de dados, `NEXTAUTH_SECRET`). Crie um arquivo `.env.local` no diretório do projeto.

**NUNCA** adicione este arquivo ao Git.

```bash
nano .env.local
```

Adicione suas variáveis, por exemplo:
```
MONGODB_URI=sua_string_de_conexao
NEXTAUTH_URL=http://seu_dominio_ou_ip
NEXTAUTH_SECRET=gere_um_secret_forte_aqui # use `openssl rand -base64 32` para gerar um
```

### 2.4 Build do Projeto

Compile a aplicação para produção.

```bash
npm run build
```

---

## Passo 3: Gerenciar a Aplicação com PM2

### 3.1 Iniciar a Aplicação

Use o PM2 para iniciar o servidor Next.js. O script `start` do seu `package.json` executa `next start`.

```bash
pm2 start npm --name "acertodev" -- start
```

### 3.2 Salvar a Configuração do PM2

Para garantir que o PM2 reinicie sua aplicação após uma reinicialização do servidor, execute os seguintes comandos:

```bash
# Salva a lista de processos atual
pm2 save

# Cria e habilita o serviço de inicialização do PM2
pm2 startup
```
O último comando irá gerar uma instrução que você precisa copiar e colar para finalizar a configuração.

---

## Passo 4: Configurar Nginx como Proxy Reverso

### 4.1 Criar o Arquivo de Configuração do Nginx

Crie um novo arquivo de configuração para o seu site.

```bash
sudo nano /etc/nginx/sites-available/acertodev
```

Cole a seguinte configuração, substituindo `seu_dominio_ou_ip` pelo seu domínio ou endereço IP:

```nginx
server {
    listen 80;
    server_name seu_dominio_ou_ip;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4.2 Ativar a Configuração

Crie um link simbólico para ativar o site e teste a configuração do Nginx.

```bash
# Ativa o site
sudo ln -s /etc/nginx/sites-available/acertodev /etc/nginx/sites-enabled/

# Remove o link padrão se ele existir
sudo rm /etc/nginx/sites-enabled/default

# Testa a sintaxe da configuração
sudo nginx -t
```

Se o teste for bem-sucedido, reinicie o Nginx.

```bash
sudo systemctl restart nginx
```

---

## Passo 5: Configurar o Firewall

Permita o tráfego HTTP e HTTPS através do firewall.

```bash
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

Sua aplicação agora deve estar acessível publicamente através do seu domínio ou endereço IP!
