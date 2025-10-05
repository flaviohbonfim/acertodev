# Guia de Instalação - Acerto Dev

## Pré-requisitos

- Node.js 18+ 
- MongoDB 4.4+
- npm ou yarn

## Passo a Passo

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto com:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/acerto-dev

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# App
NODE_ENV=development
```

### 3. Iniciar MongoDB
Certifique-se de que o MongoDB está rodando:
```bash
# No Windows
net start MongoDB

# No macOS/Linux
sudo systemctl start mongod
# ou
brew services start mongodb-community
```

### 4. Criar Primeiro Usuário Admin
```bash
npm run create-admin
```

### 5. Iniciar Aplicação
```bash
npm run dev
```

### 6. Acessar Sistema
Abra http://localhost:3000 no navegador

## Estrutura de Dados

O sistema criará automaticamente as seguintes coleções no MongoDB:
- `users` - Usuários do sistema
- `clients` - Clientes
- `clientgroups` - Grupos de clientes  
- `activitytypes` - Tipos de atividade
- `timeentries` - Lançamentos de horas

## Primeiro Uso

1. Faça login com as credenciais criadas no passo 4
2. Acesse o Dashboard
3. Configure:
   - Clientes (obrigatório)
   - Tipos de Atividade (obrigatório)
   - Grupos (opcional)
4. Comece a lançar horas
5. Gere relatórios

## Troubleshooting

### Erro de Conexão MongoDB
- Verifique se o MongoDB está rodando
- Confirme a string de conexão no `.env.local`

### Erro de Autenticação
- Verifique se o `NEXTAUTH_SECRET` está definido
- Confirme se o `NEXTAUTH_URL` está correto

### Erro de Build
- Execute `npm run lint` para verificar erros
- Verifique se todas as dependências estão instaladas
