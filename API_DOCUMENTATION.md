# ERP-SISTEM - Documentação da API

Documentação completa da API do Sistema ERP com gerenciamento Kanban.

## Índice
- [Visão Geral](#visão-geral)
- [Autenticação](#autenticação)
- [Endpoints da API](#endpoints-da-api)
  - [Usuários](#usuários)
  - [Clientes](#clientes)
  - [Produtos](#produtos)
  - [Vendas](#vendas)
  - [Carrinho de Compras](#carrinho-de-compras)
  - [Sistema Kanban](#sistema-kanban)
  - [Relatórios](#relatórios)
- [Modelos](#modelos)
- [Rotas do Frontend](#rotas-do-frontend)
- [Configuração e Instalação](#configuração-e-instalação)

---

## Visão Geral

**URL Base**: `http://localhost:8000/api/`

**Stack Tecnológico**:
- **Backend**: Django 5.2.4 + Django REST Framework 3.14.0
- **Banco de Dados**: PostgreSQL 15
- **Frontend**: React 19.1.0 + Vite 5.4.21
- **Autenticação**: JWT (Simple JWT)
- **Estilização**: Tailwind CSS 3.4.1
- **Drag & Drop**: @dnd-kit

---

## Autenticação

### Login
```http
POST /api/auth/login/
```

**Corpo da Requisição**:
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta**:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "nome": "João Silva",
    "email": "usuario@exemplo.com",
    "rol": "Admin"
  }
}
```

### Renovar Token
```http
POST /api/auth/refresh/
```

**Corpo da Requisição**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Logout
```http
POST /api/auth/logout/
```

**Cabeçalhos**: `Authorization: Bearer {access_token}`

---

## Endpoints da API

Todos os endpoints requerem autenticação via token JWT no cabeçalho:
```
Authorization: Bearer {access_token}
```

### Usuários

#### Obter Perfil do Usuário
```http
GET /api/usuarios/perfil/
```

**Resposta**:
```json
{
  "id": 1,
  "nome": "João Silva",
  "email": "usuario@exemplo.com",
  "rol": "Admin",
  "telefone": "+5511999999999",
  "is_active": true
}
```

#### Listar Usuários
```http
GET /api/usuarios/
```

#### Criar Usuário
```http
POST /api/usuarios/
```

**Corpo da Requisição**:
```json
{
  "nome": "Maria Santos",
  "email": "maria@exemplo.com",
  "password": "senha123",
  "rol": "Usuario",
  "telefone": "+5511999999999"
}
```

#### Atualizar Usuário
```http
PUT /api/usuarios/{id}/
PATCH /api/usuarios/{id}/
```

#### Excluir Usuário
```http
DELETE /api/usuarios/{id}/
```

---

### Clientes

#### Listar Clientes
```http
GET /api/clientes/
```

**Resposta**:
```json
[
  {
    "cedula": "12345678",
    "nome": "Empresa ACME",
    "email": "contato@acme.com",
    "telefone": "+5511999999999",
    "cidade": "São Paulo",
    "empresa": "ACME Corp",
    "cnpj": "12.345.678/0001-90",
    "contato": "João Silva",
    "parceiro": "Parceiro XYZ",
    "observacoes": "Cliente importante",
    "created_at": "2025-01-15T10:00:00Z"
  }
]
```

#### Criar Cliente
```http
POST /api/clientes/
```

**Corpo da Requisição**:
```json
{
  "cedula": "12345678",
  "nome": "Empresa ACME",
  "email": "contato@acme.com",
  "telefone": "+5511999999999",
  "cidade": "São Paulo",
  "empresa": "ACME Corp",
  "cnpj": "12.345.678/0001-90"
}
```

#### Obter Cliente
```http
GET /api/clientes/{cedula}/
```

#### Atualizar Cliente
```http
PUT /api/clientes/{cedula}/
PATCH /api/clientes/{cedula}/
```

#### Excluir Cliente
```http
DELETE /api/clientes/{cedula}/
```

---

### Produtos

#### Listar Produtos
```http
GET /api/produtos/
```

**Resposta**:
```json
[
  {
    "id": 1,
    "nome": "Produto A",
    "descricao": "Descrição do produto",
    "preco": "99.99",
    "estoque": 100,
    "categoria": 1,
    "categoria_nome": "Eletrônicos",
    "imagem": "http://res.cloudinary.com/...",
    "created_at": "2025-01-15T10:00:00Z"
  }
]
```

#### Criar Produto
```http
POST /api/produtos/
```

**Corpo da Requisição** (multipart/form-data):
```json
{
  "nome": "Produto A",
  "descricao": "Descrição do produto",
  "preco": "99.99",
  "estoque": 100,
  "categoria": 1,
  "imagem": <arquivo>
}
```

#### Atualizar Produto
```http
PUT /api/produtos/{id}/
PATCH /api/produtos/{id}/
```

#### Excluir Produto
```http
DELETE /api/produtos/{id}/
```

---

### Categorias

#### Listar Categorias
```http
GET /api/categorias/
```

**Resposta**:
```json
[
  {
    "id": 1,
    "nome": "Eletrônicos"
  }
]
```

#### Criar Categoria
```http
POST /api/categorias/
```

---

### Vendas

#### Listar Vendas
```http
GET /api/ventas/
```

**Resposta**:
```json
[
  {
    "id": 1,
    "cliente_cedula": "12345678",
    "cliente_nome": "Empresa ACME",
    "total": "1599.98",
    "fecha": "2025-01-15",
    "items": [
      {
        "id": 1,
        "producto": 1,
        "producto_nome": "Produto A",
        "cantidad": 2,
        "precio_unitario": "799.99",
        "subtotal": "1599.98"
      }
    ],
    "created_at": "2025-01-15T10:00:00Z"
  }
]
```

#### Criar Venda
```http
POST /api/ventas/
```

**Corpo da Requisição**:
```json
{
  "cliente_cedula": "12345678",
  "items": [
    {
      "producto": 1,
      "cantidad": 2,
      "precio_unitario": "799.99"
    }
  ]
}
```

#### Obter Venda
```http
GET /api/ventas/{id}/
```

#### Obter Itens da Venda
```http
GET /api/ventas/{id}/items/
```

---

### Carrinho de Compras

#### Obter Carrinho
```http
GET /api/carritos/
```

**Resposta**:
```json
[
  {
    "id": 1,
    "usuario": 1,
    "producto": 1,
    "produto_nome": "Produto A",
    "produto_preco": "99.99",
    "cantidad": 2,
    "created_at": "2025-01-15T10:00:00Z"
  }
]
```

#### Adicionar ao Carrinho
```http
POST /api/carritos/
```

**Corpo da Requisição**:
```json
{
  "producto": 1,
  "cantidad": 2
}
```

#### Atualizar Item do Carrinho
```http
PATCH /api/carritos/{id}/
```

#### Remover do Carrinho
```http
DELETE /api/carritos/{id}/
```

#### Limpar Carrinho
```http
POST /api/carritos/clear/
```

#### Finalizar Compra
```http
POST /api/carritos/checkout/
```

**Corpo da Requisição**:
```json
{
  "cliente_cedula": "12345678"
}
```

---

### Sistema Kanban

#### Listar Kanbans
```http
GET /api/kanbans/
```

**Resposta**:
```json
[
  {
    "id": 1,
    "nome": "Projeto Alpha",
    "descricao": "Quadro principal do projeto",
    "cliente": 1,
    "cliente_nome": "Empresa ACME",
    "criado_por": 1,
    "criado_por_nome": "João Silva",
    "data_criacao": "2025-01-15T10:00:00Z",
    "ativo": true,
    "total_colunas": 4,
    "total_cards": 12
  }
]
```

#### Criar Kanban
```http
POST /api/kanbans/
```

**Corpo da Requisição**:
```json
{
  "nome": "Projeto Alpha",
  "descricao": "Quadro principal do projeto",
  "cliente": 1,
  "ativo": true
}
```

#### Obter Kanban Completo (com Colunas e Cards)
```http
GET /api/kanbans/{id}/completo/
```

**Resposta**:
```json
{
  "id": 1,
  "nome": "Projeto Alpha",
  "descricao": "Quadro principal do projeto",
  "cliente": 1,
  "cliente_nome": "Empresa ACME",
  "cliente_info": {
    "cedula": "12345678",
    "nome": "Empresa ACME",
    "email": "contato@acme.com",
    "telefone": "+5511999999999",
    "cidade": "São Paulo",
    "empresa": "ACME Corp",
    "contato": "João Silva"
  },
  "criado_por": 1,
  "criado_por_nome": "João Silva",
  "data_criacao": "2025-01-15T10:00:00Z",
  "ativo": true,
  "colunas": [
    {
      "id": 1,
      "nome": "A Fazer",
      "ordem": 0,
      "cor": "#3B82F6",
      "limite_cards": null,
      "total_cards": 3,
      "cards": [
        {
          "id": 1,
          "titulo": "Tarefa 1",
          "descricao": "Descrição da tarefa",
          "cliente": 1,
          "cliente_nome": "Empresa ACME",
          "responsavel": 1,
          "responsavel_nome": "João Silva",
          "data_vencimento": "2025-01-20",
          "prioridade": "alta",
          "ordem": 0,
          "esta_atrasado": false,
          "dias_vencimento": 5
        }
      ]
    }
  ]
}
```

#### Atualizar Kanban
```http
PUT /api/kanbans/{id}/
PATCH /api/kanbans/{id}/
```

#### Excluir Kanban
```http
DELETE /api/kanbans/{id}/
```

---

### Colunas do Kanban

#### Listar Colunas
```http
GET /api/colunas/
```

#### Criar Coluna
```http
POST /api/colunas/
```

**Corpo da Requisição**:
```json
{
  "kanban": 1,
  "nome": "Em Progresso",
  "cor": "#10B981",
  "limite_cards": 5
}
```

**Nota**: `ordem` é atribuída automaticamente.

#### Atualizar Coluna
```http
PUT /api/colunas/{id}/
PATCH /api/colunas/{id}/
```

#### Excluir Coluna
```http
DELETE /api/colunas/{id}/
```

---

### Cards do Kanban

#### Listar Cards
```http
GET /api/cards/
```

#### Criar Card
```http
POST /api/cards/
```

**Corpo da Requisição**:
```json
{
  "coluna": 1,
  "titulo": "Nova Tarefa",
  "descricao": "Descrição da tarefa",
  "cliente": 1,
  "produto": 1,
  "responsavel": 1,
  "data_vencimento": "2025-01-20",
  "prioridade": "media"
}
```

**Nota**: `ordem` é atribuída automaticamente.

#### Atualizar Card
```http
PUT /api/cards/{id}/
PATCH /api/cards/{id}/
```

#### Mover Card
```http
POST /api/cards/{id}/mover/
```

**Corpo da Requisição**:
```json
{
  "coluna_destino": 2,
  "ordem": 0,
  "observacao": "Movendo para Em Progresso"
}
```

#### Obter Histórico do Card
```http
GET /api/cards/{id}/historico/
```

**Resposta**:
```json
[
  {
    "id": 1,
    "card": 1,
    "coluna_origem": 1,
    "coluna_origem_nome": "A Fazer",
    "coluna_destino": 2,
    "coluna_destino_nome": "Em Progresso",
    "usuario": 1,
    "usuario_nome": "João Silva",
    "data": "2025-01-15T10:30:00Z",
    "observacao": "Movendo para Em Progresso"
  }
]
```

#### Excluir Card
```http
DELETE /api/cards/{id}/
```

---

### Regras de Automação

#### Listar Regras de Automação
```http
GET /api/regras-automacao/
```

**Resposta**:
```json
[
  {
    "id": 1,
    "kanban": 1,
    "kanban_nome": "Projeto Alpha",
    "nome": "Notificar ao concluir",
    "tipo_trigger": "movimentacao",
    "coluna_trigger": 4,
    "coluna_nome": "Concluído",
    "acao_whatsapp": "cliente",
    "template_mensagem": "Olá {cliente_nome}, seu card '{card_titulo}' foi concluído!",
    "ativo": true
  }
]
```

#### Criar Regra de Automação
```http
POST /api/regras-automacao/
```

**Corpo da Requisição**:
```json
{
  "kanban": 1,
  "nome": "Notificar ao concluir",
  "tipo_trigger": "movimentacao",
  "coluna_trigger": 4,
  "acao_whatsapp": "cliente",
  "template_mensagem": "Olá {cliente_nome}, seu card '{card_titulo}' foi concluído!",
  "ativo": true
}
```

**Gatilhos Disponíveis**:
- `movimentacao` - Movimentação de card
- `prazo` - Aproximação do prazo
- `criacao` - Criação de card
- `atribuicao` - Atribuição a usuário

**Ações Disponíveis**:
- `cliente` - Notificar cliente
- `responsavel` - Notificar responsável
- `admin` - Notificar administrador

**Variáveis do Template**:
- `{cliente_nome}` - Nome do cliente
- `{produto_nome}` - Nome do produto
- `{card_titulo}` - Título do card
- `{responsavel_nome}` - Nome do responsável
- `{data_vencimento}` - Data de vencimento
- `{coluna_nome}` - Nome da coluna

#### Atualizar Regra de Automação
```http
PUT /api/regras-automacao/{id}/
PATCH /api/regras-automacao/{id}/
```

#### Excluir Regra de Automação
```http
DELETE /api/regras-automacao/{id}/
```

#### Obter Regras do Kanban
```http
GET /api/kanbans/{id}/regras/
```

---

### Histórico de Movimentações

#### Listar Histórico de Movimentações
```http
GET /api/historico-movimentacao/
```

**Resposta**:
```json
[
  {
    "id": 1,
    "card": 1,
    "card_titulo": "Tarefa 1",
    "coluna_origem": 1,
    "coluna_origem_nome": "A Fazer",
    "coluna_destino": 2,
    "coluna_destino_nome": "Em Progresso",
    "usuario": 1,
    "usuario_nome": "João Silva",
    "data": "2025-01-15T10:30:00Z",
    "observacao": "Movendo para Em Progresso"
  }
]
```

---

### Logs de Notificação

#### Listar Logs de Notificação
```http
GET /api/log-notificacao/
```

**Resposta**:
```json
[
  {
    "id": 1,
    "card": 1,
    "card_titulo": "Tarefa 1",
    "regra": 1,
    "regra_nome": "Notificar ao concluir",
    "destinatario": "+5511999999999",
    "mensagem": "Olá Empresa ACME, seu card 'Tarefa 1' foi concluído!",
    "status": "enviado",
    "erro_mensagem": null,
    "data_envio": "2025-01-15T10:30:00Z",
    "tentativas": 1
  }
]
```

**Opções de Status**:
- `enviado` - Enviado com sucesso
- `erro` - Erro ocorrido
- `pendente` - Pendente

---

### Relatórios

#### Relatório de Vendas
```http
GET /api/ventas/relatorio/
```

**Parâmetros de Query**:
- `fecha_inicio` (opcional) - Data inicial (AAAA-MM-DD)
- `fecha_fin` (opcional) - Data final (AAAA-MM-DD)

**Resposta**:
```json
{
  "total_ventas": 10,
  "total_recaudado": "15999.80",
  "ventas": [...]
}
```

---

## Modelos

### Usuario (Usuário)
- `id` - Integer (PK)
- `nome` - String (max 100)
- `email` - Email (único)
- `password` - String (hash)
- `rol` - Escolha: "Admin" | "Usuario"
- `telefone` - String (opcional)
- `is_active` - Boolean
- `created_at` - DateTime
- `updated_at` - DateTime

### Cliente
- `cedula` - String (PK, max 20)
- `nome` - String (max 100)
- `email` - Email (único)
- `telefone` - String (opcional)
- `cidade` - String (opcional)
- `empresa` - String (opcional)
- `cnpj` - String (opcional)
- `data_bloqueio` - Date (opcional)
- `vencimento` - Date (opcional)
- `reuniao_apresentacao_agendada` - DateTime (opcional)
- `relatorio_gerado` - Boolean
- `data_apresentacao_relatorio` - Date (opcional)
- `contato` - String (opcional)
- `parceiro` - String (opcional)
- `observacoes` - Text (opcional)
- `created_at` - DateTime
- `updated_at` - DateTime

### Categoria
- `id` - Integer (PK)
- `nome` - String (max 50, único)

### Produto
- `id` - Integer (PK)
- `nome` - String (max 100)
- `descricao` - Text (opcional)
- `preco` - Decimal (10, 2)
- `estoque` - Integer
- `categoria` - FK para Categoria
- `imagem` - CloudinaryField
- `created_at` - DateTime
- `updated_at` - DateTime

### Venta (Venda)
- `id` - Integer (PK)
- `cliente_cedula` - FK para Cliente
- `total` - Decimal (10, 2)
- `fecha` - Date
- `created_at` - DateTime
- `updated_at` - DateTime

### VentaItem (Item de Venda)
- `id` - Integer (PK)
- `venta` - FK para Venta
- `producto` - FK para Produto
- `cantidad` - Integer
- `precio_unitario` - Decimal (10, 2)
- `subtotal` - Decimal (10, 2)

### Carrito (Carrinho)
- `id` - Integer (PK)
- `usuario` - FK para Usuario
- `producto` - FK para Produto
- `cantidad` - Integer
- `created_at` - DateTime

### Kanban
- `id` - Integer (PK)
- `nome` - String (max 200)
- `descricao` - Text (opcional)
- `cliente` - FK para Cliente (opcional)
- `criado_por` - FK para Usuario
- `data_criacao` - DateTime
- `ativo` - Boolean
- `created_at` - DateTime
- `updated_at` - DateTime

### Coluna
- `id` - Integer (PK)
- `kanban` - FK para Kanban
- `nome` - String (max 100)
- `ordem` - Integer (único com kanban)
- `cor` - String (cor hexadecimal)
- `limite_cards` - Integer (opcional)
- `created_at` - DateTime
- `updated_at` - DateTime

### Card
- `id` - Integer (PK)
- `coluna` - FK para Coluna
- `titulo` - String (max 200)
- `descricao` - Text (opcional)
- `cliente` - FK para Cliente (opcional)
- `produto` - FK para Produto (opcional)
- `responsavel` - FK para Usuario (opcional)
- `data_vencimento` - Date (opcional)
- `prioridade` - Escolha: "baixa" | "media" | "alta"
- `ordem` - Integer
- `data_criacao` - DateTime
- `data_movimentacao` - DateTime
- `created_at` - DateTime
- `updated_at` - DateTime

### RegraAutomacao (Regra de Automação)
- `id` - Integer (PK)
- `kanban` - FK para Kanban
- `nome` - String (max 200)
- `tipo_trigger` - Escolha
- `coluna_trigger` - FK para Coluna (opcional)
- `dias_antes_vencimento` - Integer (opcional)
- `acao_whatsapp` - Escolha
- `template_mensagem` - Text
- `ativo` - Boolean
- `created_at` - DateTime
- `updated_at` - DateTime

### HistoricoMovimentacao (Histórico de Movimentação)
- `id` - Integer (PK)
- `card` - FK para Card
- `coluna_origem` - FK para Coluna (opcional)
- `coluna_destino` - FK para Coluna (opcional)
- `usuario` - FK para Usuario (opcional)
- `data` - DateTime
- `observacao` - Text (opcional)

### LogNotificacao (Log de Notificação)
- `id` - Integer (PK)
- `card` - FK para Card
- `regra` - FK para RegraAutomacao (opcional)
- `destinatario` - String (número de telefone)
- `mensagem` - Text
- `status` - Escolha: "enviado" | "erro" | "pendente"
- `erro_mensagem` - Text (opcional)
- `data_envio` - DateTime
- `tentativas` - Integer

---

## Rotas do Frontend

### Rotas Públicas
- `/login` - Página de login

### Rotas Protegidas (requer autenticação)
- `/` - Redireciona para `/clientes`
- `/clientes` - Gerenciamento de clientes
- `/produtos` - Gerenciamento de produtos
- `/vendas` - Gerenciamento de vendas
- `/relatorios` - Relatórios (apenas Admin)
- `/usuarios` - Gerenciamento de usuários
- `/atividades` - Lista de quadros Kanban
- `/atividades/kanban/:id` - Visualização do quadro Kanban

---

## Configuração e Instalação

### Pré-requisitos
- Python 3.14+
- Node.js 18+
- PostgreSQL 15+
- pnpm

### Configuração do Backend

1. **Criar ambiente virtual**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
```

2. **Instalar dependências**:
```bash
pip install -r requirements.txt
```

3. **Configurar banco de dados**:
Criar arquivo `.env` no diretório backend:
```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/erp_sistem
SECRET_KEY=sua-chave-secreta-aqui
DEBUG=True
CLOUDINARY_CLOUD_NAME=seu-nome-cloudinary
CLOUDINARY_API_KEY=sua-api-key
CLOUDINARY_API_SECRET=seu-api-secret
```

4. **Executar migrações**:
```bash
python manage.py migrate
```

5. **Criar superusuário**:
```bash
python manage.py createsuperuser
```

6. **Executar servidor**:
```bash
python manage.py runserver
```

Backend estará disponível em `http://localhost:8000`

### Configuração do Frontend

1. **Instalar dependências**:
```bash
cd frontend
pnpm install
```

2. **Configurar ambiente**:
Criar arquivo `.env` no diretório frontend:
```env
VITE_API_URL=http://localhost:8000/api
```

3. **Executar servidor de desenvolvimento**:
```bash
pnpm dev
```

Frontend estará disponível em `http://localhost:5173`

---

## Testando a API

### Usando Swagger UI
Acesse a documentação interativa da API em:
```
http://localhost:8000/api/schema/swagger-ui/
```

### Usando cURL

**Login**:
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@exemplo.com","password":"senha123"}'
```

**Obter Kanbans**:
```bash
curl -X GET http://localhost:8000/api/kanbans/ \
  -H "Authorization: Bearer SEU_TOKEN_DE_ACESSO"
```

**Criar Card**:
```bash
curl -X POST http://localhost:8000/api/cards/ \
  -H "Authorization: Bearer SEU_TOKEN_DE_ACESSO" \
  -H "Content-Type: application/json" \
  -d '{
    "coluna": 1,
    "titulo": "Nova Tarefa",
    "prioridade": "alta"
  }'
```

---

## Respostas de Erro

Todos os endpoints retornam respostas de erro consistentes:

**400 Bad Request**:
```json
{
  "nome_do_campo": ["Mensagem de erro"]
}
```

**401 Unauthorized**:
```json
{
  "detail": "As credenciais de autenticação não foram fornecidas."
}
```

**403 Forbidden**:
```json
{
  "detail": "Você não tem permissão para executar esta ação."
}
```

**404 Not Found**:
```json
{
  "detail": "Não encontrado."
}
```

**500 Internal Server Error**:
```json
{
  "detail": "Erro interno do servidor."
}
```

---

## Resumo de Funcionalidades

### Funcionalidades Core
✅ Gerenciamento de Usuários com Controle de Acesso por Função (Admin/Usuario)
✅ Gerenciamento de Clientes (CRUD)
✅ Gerenciamento de Produtos com Imagens Cloudinary
✅ Gerenciamento de Categorias
✅ Gerenciamento de Vendas com Itens
✅ Sistema de Carrinho de Compras
✅ Autenticação JWT
✅ Documentação Swagger/OpenAPI

### Funcionalidades Kanban
✅ Múltiplos Quadros Kanban por Cliente
✅ Colunas Customizáveis com Cores
✅ Arrastar e Soltar Cards
✅ Níveis de Prioridade de Cards (baixa/media/alta)
✅ Rastreamento de Data de Vencimento com Detecção de Atraso
✅ Atribuição de Cards a Usuários
✅ Associação com Cliente e Produto
✅ Rastreamento de Histórico de Movimentações
✅ Regras de Automação com Integração WhatsApp (pronto)
✅ Logs de Notificação

### Funcionalidades Frontend
✅ Design Responsivo com Tailwind CSS
✅ Atualizações em Tempo Real com React
✅ Rotas Protegidas
✅ UI Moderna com Animações
✅ Interface de Arrastar e Soltar (@dnd-kit)
✅ Referência de Cliente nos Quadros Kanban

---

## Versão

**Versão Atual**: 2.0.0
**Última Atualização**: 14 de Dezembro de 2025

---

## Suporte

Para questões ou problemas, entre em contato com a equipe de desenvolvimento ou crie uma issue no repositório do projeto.
