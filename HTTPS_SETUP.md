# Guia de Configuração HTTPS com Certificado Autoassinado para Ubuntu + Nginx

Este guia detalha os passos para proteger sua aplicação com HTTPS na porta 443 usando um certificado SSL autoassinado. Esta abordagem é ideal quando você está usando um endereço de IP em vez de um nome de domínio.

**Aviso sobre Certificados Autoassinados:**
- A conexão será criptografada e segura.
- Os navegadores exibirão um aviso de segurança (ex: "Sua conexão não é particular"). Você precisará aceitar o risco para prosseguir.
- É uma solução adequada para ambientes de desenvolvimento, teste ou aplicações internas.

---

### Passo 1: Gerar o Certificado SSL Autoassinado

Execute estes comandos no seu servidor Ubuntu.

1.  **Crie um diretório para os certificados:**
    ```bash
    sudo mkdir -p /etc/nginx/ssl
    ```

2.  **Gere o certificado e a chave privada:**
    O comando abaixo cria um certificado válido por 365 dias.
    ```bash
    sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx-selfsigned.key \
    -out /etc/nginx/ssl/nginx-selfsigned.crt
    ```
    - Durante o processo, serão solicitadas algumas informações. Você pode preenchê-las ou pressionar Enter.
    - **Importante:** No campo `Common Name (e.g. server FQDN or YOUR name)`, insira o endereço de IP do seu servidor: **`157.151.229.220`**.

3.  **Ajuste as permissões dos arquivos para segurança:**
    ```bash
    sudo chmod 600 /etc/nginx/ssl/nginx-selfsigned.key
    sudo chmod 644 /etc/nginx/ssl/nginx-selfsigned.crt
    ```

---

### Passo 2: Configurar o Nginx para Usar HTTPS

1.  **Abra o arquivo de configuração do seu site:**
    ```bash
    sudo nano /etc/nginx/sites-available/acertodev
    ```

2.  **Substitua todo o conteúdo do arquivo** pela configuração abaixo. Ela redireciona HTTP para HTTPS e serve a aplicação na porta 443.

    ```nginx
    # Redireciona todo o tráfego HTTP (porta 80) para HTTPS (porta 443)
    server {
        listen 80;
        server_name 157.151.229.220;
        return 301 https://$server_name$request_uri;
    }

    # Configuração principal do servidor para HTTPS
    server {
        listen 443 ssl;
        server_name 157.151.229.220;

        # Caminhos para o certificado e chave SSL gerados
        ssl_certificate /etc/nginx/ssl/nginx-selfsigned.crt;
        ssl_certificate_key /etc/nginx/ssl/nginx-selfsigned.key;

        # Configurações de SSL recomendadas para maior segurança
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers on;
        ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';

        # Proxy reverso para a aplicação Next.js (rodando na porta 3000)
        location / {
            proxy_pass http://127.0.0.1:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

---

### Passo 3: Atualizar o Firewall e Aplicar as Alterações

1.  **Libere a porta 443 no firewall:**
    ```bash
    sudo ufw allow 443/tcp
    ```

2.  **Teste a sintaxe da configuração do Nginx:**
    ```bash
    sudo nginx -t
    ```
    A saída deve ser `syntax is ok` e `test is successful`.

3.  **Reinicie o Nginx para que as alterações entrem em vigor:**
    ```bash
    sudo systemctl restart nginx
    ```

---

### Passo 4: Atualizar a Configuração da Aplicação

Sua aplicação Next.js precisa saber que está sendo acessada via HTTPS.

1.  **Edite o arquivo de ambiente no servidor:**
    ```bash
    nano /var/www/acertodev/.env.local
    ```

2.  **Altere a variável `NEXTAUTH_URL` para usar `https://`:**
    ```env
    # ... outras variáveis
    NEXTAUTH_URL=https://157.151.229.220
    # ...
    ```

3.  **Reinicie a aplicação com PM2 para carregar a nova configuração:**
    ```bash
    pm2 restart acertodev
    ```

---

### Conclusão

Sua aplicação agora está acessível em **`https://157.151.229.220`**. Lembre-se de que você precisará aceitar o aviso de segurança do navegador na primeira vez que acessar o site.
