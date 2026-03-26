# Guia de Diagnóstico para Problemas de Conexão HTTPS (Porta 443)

Use este guia para identificar por que sua aplicação não está acessível na porta 443 após a configuração do SSL. Execute os comandos no seu servidor Ubuntu.

---

### Passo 1: Verificar o Status do Nginx

Este comando confirma se o serviço Nginx está rodando e se encontrou algum erro crítico ao iniciar.

```bash
sudo systemctl status nginx
```

- **Saída Esperada:** O status deve ser `active (running)` em verde. Se estiver `failed`, a mensagem de erro associada indicará o problema inicial.

---

### Passo 2: Testar a Sintaxe da Configuração do Nginx

Verifica se há erros de digitação no arquivo de configuração e se os caminhos para os certificados SSL estão corretos.

```bash
sudo nginx -t
```

- **Saída Esperada:** `nginx: the configuration file /etc/nginx/nginx.conf syntax is ok` e `nginx: configuration file /etc/nginx/nginx.conf test is successful`. Qualquer outra mensagem apontará para o erro.

---

### Passo 3: Verificar as Portas em Uso (O Mais Importante)

Este comando mostra quais processos estão escutando em quais portas. É a forma mais rápida de confirmar se o Nginx e sua aplicação estão funcionando como esperado.

```bash
sudo ss -tlnp | grep -E ':3000|:443'
```

- **Saída Esperada:** Você **precisa** ver duas linhas:
    1.  Uma para o **Nginx** na porta `443`:
        ```
        LISTEN 0      4096         0.0.0.0:443        0.0.0.0:*    users:(("nginx",pid=...))
        ```
    2.  Uma para o **Node.js** (sua aplicação) na porta `3000`:
        ```
        LISTEN 0      511        127.0.0.1:3000       0.0.0.0:*    users:(("node",pid=...))
        ```
- **Se a linha da porta 443 não aparecer**, o Nginx não conseguiu iniciar o serviço nessa porta. O problema está na configuração do Nginx.
- **Se a linha da porta 3000 não aparecer**, a sua aplicação Next.js (gerenciada pelo PM2) não está rodando.

---

### Passo 4: Checar as Regras do Firewall

Confirma se a porta 443 está explicitamente liberada para tráfego de entrada.

```bash
sudo ufw status verbose
```

- **Saída Esperada:** Na lista de regras, você deve ver uma linha para a porta 443:
    ```
    443/tcp                    ALLOW IN    Anywhere
    ```

---

### Passo 5: Analisar os Logs de Erro do Nginx

Os logs de erro contêm detalhes específicos sobre falhas de conexão, problemas com certificados SSL ou erros de proxy.

```bash
sudo tail -n 50 /var/log/nginx/error.log
```

- **O que procurar:** Mensagens com `[error]`, `SSL_shutdown`, `cannot load certificate`, `permission denied`, ou `(111: Connection refused) while connecting to upstream`.

---

### Passo 6: Verificar o Status da Aplicação no PM2

Garante que o processo da sua aplicação Next.js está ativo e não entrou em estado de erro.

```bash
pm2 status
```

- **Saída Esperada:** A aplicação `acertodev` deve ter o status `online`. Se estiver `errored` ou `stopped`, use o comando abaixo para ver os logs específicos da aplicação:
    ```bash
    pm2 logs acertodev
    ```

---

Execute estes comandos em ordem. A saída de cada um deles ajudará a isolar a causa raiz do problema.
