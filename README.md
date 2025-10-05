# Acerto Dev - Sistema de Controle de Horas

Sistema completo para controle de horas e faturamento para clientes, com autenticação baseada em roles e relatórios com lógica de rateio.

## 🚀 Tecnologias

- **Frontend:** Next.js 14 (App Router)
- **UI:** Chakra UI com suporte a Dark Mode
- **Backend:** Next.js API Routes
- **Banco de Dados:** MongoDB
- **ODM:** Mongoose
- **Autenticação:** NextAuth.js (Auth.js)
- **Linguagem:** TypeScript

## 📋 Funcionalidades

### Para Administradores
- ✅ Gestão de usuários (CRUD completo)
- ✅ Cadastro de clientes com valor por hora
- ✅ Criação de grupos de clientes
- ✅ Tipos de atividade personalizáveis
- ✅ Lançamento de horas (cliente individual ou grupo)
- ✅ Relatórios com lógica de rateio automático
- ✅ Dashboard com estatísticas

### Para Visualizadores
- ✅ Acesso apenas aos relatórios
- ✅ Visualização de dados de faturamento

## 🛠️ Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd acerto-dev
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
Crie um arquivo `.env.local` na raiz do projeto:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/acerto-dev

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# App
NODE_ENV=development
```

4. **Inicie o MongoDB**
Certifique-se de que o MongoDB está rodando na sua máquina.

5. **Crie o primeiro usuário administrador**
```bash
npm run create-admin
```

6. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

7. **Acesse a aplicação**
Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 👤 Primeiro Acesso

1. Execute o script `npm run create-admin` para criar o primeiro usuário administrador
2. Faça login com as credenciais criadas
3. Acesse o dashboard e configure:
   - Clientes
   - Grupos de clientes
   - Tipos de atividade
   - Lançamentos de horas

## 📊 Lógica de Rateio

O sistema implementa uma lógica inteligente de rateio:

- **Lançamentos diretos para clientes:** As horas são atribuídas integralmente ao cliente
- **Lançamentos para grupos:** As horas são divididas igualmente entre todos os clientes do grupo
- **Relatórios:** Calculam automaticamente o valor total baseado no valor por hora de cada cliente

## 🔐 Controle de Acesso

- **Administradores:** Acesso completo a todas as funcionalidades
- **Visualizadores:** Acesso apenas aos relatórios
- **Autenticação:** Baseada em sessões com NextAuth.js
- **Proteção de rotas:** Implementada em todas as páginas sensíveis

## 📱 Interface

- **Design responsivo:** Funciona em desktop, tablet e mobile
- **Dark Mode:** Suporte nativo com toggle automático
- **Chakra UI:** Componentes modernos e acessíveis
- **Navegação intuitiva:** Menu lateral com permissões condicionais

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar em produção
npm start

# Criar usuário administrador
npm run create-admin

# Linting
npm run lint
```

## 📁 Estrutura do Projeto

```
acerto-dev/
├── app/                    # App Router (Next.js 14)
│   ├── api/               # API Routes
│   ├── dashboard/         # Páginas da aplicação
│   ├── login/
│   └── ...
├── components/            # Componentes reutilizáveis
├── lib/                   # Utilitários e configurações
├── models/                # Modelos do MongoDB
├── scripts/               # Scripts utilitários
└── types/                 # Definições TypeScript
```

## 🔧 Configuração Avançada

### MongoDB
- Configure a string de conexão no arquivo `.env.local`
- O sistema criará automaticamente as coleções necessárias

### NextAuth
- Configure o `NEXTAUTH_SECRET` com uma chave segura
- Ajuste a `NEXTAUTH_URL` conforme seu ambiente

### Chakra UI
- Tema personalizado em `lib/theme.ts`
- Suporte completo a Dark Mode

## 📈 Relatórios

Os relatórios incluem:
- **Resumo do período:** Total de horas e valor
- **Detalhamento por cliente:** Horas e valores individuais
- **Lógica de rateio:** Divisão automática para grupos
- **Exportação:** Dados prontos para emissão de notas fiscais

## 🛡️ Segurança

- **Autenticação obrigatória:** Todas as rotas protegidas
- **Controle de acesso baseado em roles:** Admin vs Viewer
- **Validação de dados:** Tanto no frontend quanto no backend
- **Sanitização:** Prevenção contra ataques comuns

## 🎨 Personalização

O sistema é facilmente personalizável:
- **Tema:** Modifique `lib/theme.ts`
- **Cores:** Ajuste a paleta de cores do Chakra UI
- **Componentes:** Todos os componentes são reutilizáveis
- **Layout:** Estrutura modular e flexível

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique se todas as dependências estão instaladas
2. Confirme se o MongoDB está rodando
3. Verifique as variáveis de ambiente
4. Execute `npm run create-admin` para criar o primeiro usuário

---

**Desenvolvido com ❤️ usando Next.js, Chakra UI e MongoDB**
