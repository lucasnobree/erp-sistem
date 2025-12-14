# ERP-SISTEM

Sistema ERP completo com gerenciamento de clientes, produtos, vendas e sistema Kanban integrado.

## 📚 Documentação

- **[API Documentation](./API_DOCUMENTATION.md)** - Documentação completa da API com todos os endpoints
- **[Kanban Planning](./KANBAN.md)** - Planejamento e especificação do sistema Kanban
- **[Frontend README](./frontend/README.md)** - Documentação específica do frontend
- **[Swagger UI](http://localhost:8000/api/schema/swagger-ui/)** - Documentação interativa da API (servidor rodando)

---

## VERSÃO 2.0.0 - NOVAS CARACTERÍSTICAS

### NOVIDADES DESTA VERSÃO:
- **Sistema Kanban Completo** - Quadros Kanban com drag & drop para gerenciar atividades por cliente
- **Automação WhatsApp** - Regras de automação para notificações via WhatsApp
- **Gestão de imagens com Cloudinary** - Upload e armazenamento de imagens de produtos
- **Animações melhoradas** - Interface mais fluida com Framer Motion e @dnd-kit
- **Sistema de roles avançado** - Controle granular de permissões por usuário
- **PostgreSQL** - Migração de SQLite para PostgreSQL para melhor performance
- **Interface otimizada** - Melhor experiência de usuário e design responsivo
- **Validações melhoradas** - Maior segurança em formulários e dados

---

Um projeto full stack moderno que combina Django como backend e React com Vite como frontend.

## 🚀 Aplicação em Produção

### Links de Acesso Direto

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | [🌐 erptikno-flame.vercel.app](https://erptikno-flame.vercel.app/login) | Interface de usuário principal |
| **Backend API** | [⚙️ erp-tikno.onrender.com](https://erp-tikno.onrender.com/admin) | Painel de administração Django |

### Informação de Despliegue

- **Frontend**: Implantado em **Vercel** com integração contínua desde GitHub
- **Backend**: Implantado em **Render** 
- **CDN**: Imagens servidas através de **Cloudinary**
- **Domínio**: Configurado com HTTPS e certificados SSL automáticos
- **SUPABASE**: SUPABASE com banco de dados PostgreSQL

---

## Tecnologias Utilizadas

### Backend
- **Django 5.2.4** - Framework web de Python
- **Django REST Framework 3.14.0** - Framework de API REST
- **Simple JWT 5.3.1** - Autenticação baseada em tokens JWT
- **PostgreSQL 15** - Banco de dados relacional
- **Cloudinary** - Gerenciamento de imagens na nuvem
- **drf-spectacular** - Documentação OpenAPI/Swagger
- **Django Filter** - Filtragem avançada de dados
- **psycopg2** - Adaptador PostgreSQL para Python

### Frontend
- **React 19.1.0** - Biblioteca de JavaScript para interfaces de usuário
- **Vite 5.4.21** - Ferramenta de construção e desenvolvimento
- **React Router DOM** - Roteamento para aplicações React
- **Tailwind CSS 3.4.1** - Framework de CSS utilitário
- **@dnd-kit 6.3.1** - Biblioteca drag & drop para Kanban
- **Lucide React** - Ícones SVG para React
- **Framer Motion** - Biblioteca de animações
- **Cloudinary React** - Gestão de imagens na nuvem
- **ESLint** - Linter para JavaScript/React

### Ferramentas de Desenvolvimento
- **pnpm** - Gerenciador de pacotes para o frontend
- **pip** - Gerenciador de pacotes para Python
- **Git** - Controle de versões

## Estrutura do Projeto

```
APP WEB/
├── backend/                 # Aplicação Django
│   ├── BackWeb/            # Configuração principal do projeto
│   │   ├── settings.py     # Configurações de Django
│   │   ├── urls.py         # URLs principais
│   │   ├── wsgi.py         # Configuração WSGI
│   │   └── asgi.py         # Configuração ASGI
│   ├── mi_app/             # Aplicação Django personalizada
│   │   ├── models.py       # Modelos de dados (Usuario, Cliente, Produto, Categoria, Venda, VentaItem, Carrito)
│   │   ├── views.py        # Views e endpoints de API
│   │   ├── serializers.py  # Serializadores para a API
│   │   ├── urls.py         # URLs da API
│   │   ├── admin.py        # Configuração do admin
│   │   └── apps.py         # Configuração da app
│   ├── manage.py           # Utilitário de linha de comandos de Django
│   └── db.sqlite3          # Banco de dados SQLite
└── frontend/               # Aplicação React
    ├── src/                # Código fonte
    │   ├── App.jsx         # Componente principal com rotas
    │   ├── main.jsx        # Ponto de entrada
    │   ├── components/     # Componentes reutilizáveis
    │   │   ├── Auth.jsx    # Componente de autenticação
    │   │   ├── Sidebar.jsx # Navegação lateral
    │   │   ├── ClientesTable.jsx # Tabela de clientes
    │   │   ├── ProdutosTable.jsx # Tabela de produtos
    │   │   └── ProdutoModal.jsx  # Modal para produtos
    │   ├── pages/          # Páginas da aplicação
    │   │   ├── Clientes.jsx # Gestão de clientes
    │   │   ├── Produtos.jsx # Gestão de produtos
    │   │   ├── Vendas.jsx  # Sistema de vendas e carrinho
    │   │   ├── Relatorios.jsx # Relatórios e estatísticas
    │   │   ├── Usuarios.jsx # Gestão de usuários
    │   │   └── TestAPI.jsx # Testes de API
    │   ├── services/       # Serviços e utilitários
    │   │   └── auth.js     # Serviço de autenticação
    │   ├── App.css         # Estilos do componente principal
    │   └── index.css       # Estilos globais
    ├── public/             # Arquivos públicos
    ├── package.json        # Dependências e scripts de npm
    ├── vite.config.js      # Configuração de Vite
    └── eslint.config.js    # Configuração de ESLint
```

## Instalação e Configuração

### Pré-requisitos

- **Python 3.8+** instalado no seu sistema
- **Node.js 16+** e **pnpm** instalados
- **Git** para clonar o repositório

### 1. Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd "APP WEB"
```

### 2. Configuração do Backend (Django)

#### Criar um ambiente virtual
```bash
cd backend
python -m venv venv

# No Windows
venv\Scripts\activate

# No macOS/Linux
source venv/bin/activate
```

#### Instalar dependências
```bash
pip install -r requirements.txt
```

#### Configurar o banco de dados
```bash
python manage.py makemigrations
python manage.py migrate
```

#### Criar um superusuário (opcional)
```bash
python manage.py createsuperuser
```

### 3. Configuração do Frontend (React)

```bash
cd ../frontend
pnpm install
```

## Execução do Projeto

### Executar o Backend

```bash
cd backend
# Ativar o ambiente virtual se não estiver ativado
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

python manage.py runserver
```

O backend estará disponível em: `http://localhost:8000`

### Executar o Frontend

Em um novo terminal:

```bash
cd frontend
pnpm run dev
```

O frontend estará disponível em: `http://localhost:5173`

## Scripts Disponíveis

### Backend (Django)
- `python manage.py runserver` - Executar o servidor de desenvolvimento
- `python manage.py makemigrations` - Criar migrações
- `python manage.py migrate` - Aplicar migrações
- `python manage.py createsuperuser` - Criar superusuário
- `python manage.py collectstatic` - Coletar arquivos estáticos

### Frontend (React)
- `pnpm run dev` - Executar servidor de desenvolvimento
- `pnpm run build` - Construir para produção
- `pnpm run preview` - Pré-visualizar build de produção
- `pnpm run lint` - Executar linter

## Autenticação

O projeto utiliza autenticação baseada em JWT (JSON Web Tokens):

### Endpoints de Autenticação

- **Registro**: `POST /api/auth/registro/`
  ```json
  {
    "email": "usuario@exemplo.com",
    "username": "usuario",
    "password": "senha",
    "nome": "Nome Completo"
  }
  ```

- **Login**: `POST /api/auth/login/`
  ```json
  {
    "email": "usuario@exemplo.com",
    "password": "senha"
  }
  ```

- **Atualizar Token**: `POST /api/auth/refresh/`
  ```json
  {
    "refresh": "token-de-atualizacao"
  }
  ```

## Endpoints de API

### Gestão de Usuários
- `GET /api/usuarios/` - Listar usuários
- `POST /api/auth/registro/` - Registrar novo usuário
- `GET /api/usuarios/perfil/` - Obter perfil do usuário atual
- `PUT /api/usuarios/<id>/` - Atualizar usuário
- `DELETE /api/usuarios/<id>/` - Excluir usuário

### Gestão de Clientes
- `GET /api/clientes/` - Listar clientes
- `POST /api/clientes/` - Criar cliente
- `GET /api/clientes/<id>/` - Obter cliente específico
- `PUT /api/clientes/<id>/` - Atualizar cliente
- `DELETE /api/clientes/<id>/` - Excluir cliente

### Gestão de Produtos
- `GET /api/produtos/` - Listar produtos (com filtro por categoria)
- `POST /api/produtos/` - Criar produto
- `GET /api/produtos/<id>/` - Obter produto específico
- `PUT /api/produtos/<id>/` - Atualizar produto
- `DELETE /api/produtos/<id>/` - Excluir produto

### Gestão de Categorias
- `GET /api/categorias/` - Listar categorias
- `POST /api/categorias/` - Criar categoria
- `PUT /api/categorias/<id>/` - Atualizar categoria
- `DELETE /api/categorias/<id>/` - Excluir categoria

### Sistema de Vendas
- `GET /api/vendas/` - Listar vendas
- `POST /api/vendas/` - Criar venda direta
- `POST /api/vendas/procesar_desde_carrito/` - Processar venda do carrinho
- `GET /api/vendas/<id>/` - Obter venda específica

### Carrinho de Compras
- `GET /api/carrito/` - Obter itens do carrinho
- `POST /api/carrito/` - Adicionar produto ao carrinho
- `PUT /api/carrito/<id>/` - Atualizar quantidade no carrinho
- `DELETE /api/carrito/<id>/` - Remover item do carrinho

### Gerenciamento de Tokens no Frontend

Os tokens JWT são armazenados no localStorage:
- `access_token`: Token de acesso para autenticação
- `refresh_token`: Token para renovar o acesso

## Funcionalidades do Sistema

### Gestão de Usuários
- Registro e autenticação de usuários
- Roles de usuário (admin, funcionário)
- Gestão de perfis de usuário
- Controle de acesso baseado em roles

### Gestão de Clientes
- **CRUD completo de clientes**
- Campos: nome, email, cédula, telefone, cidade
- Busca e filtragem de clientes
- Validação de dados de entrada

### Gestão de Produtos
- **CRUD completo de produtos**
- Campos: nome, descrição, preço, estoque, categoria, imagem
- Categorização de produtos
- Controle de inventário com validação de estoque
- **Gestão avançada de imagens com Cloudinary**
  - Upload direto de imagens
  - Otimização automática de imagens
  - URLs seguras e otimizadas
  - Validação de tipos e tamanhos de arquivo
- Filtragem por categoria e busca por nome
- **Interface melhorada com animações fluidas**

### Sistema de Vendas
- **Carrinho de compras inteligente**
  - Validação automática de estoque disponível
  - Prevenção de sobrevenda
  - Atualização em tempo real de quantidades
- **Processamento de vendas**
  - Seleção de cliente obrigatória
  - Cálculo automático de totais
  - Redução automática de estoque ao processar venda
  - Histórico de vendas
- **Interface de vendas otimizada**
  - Busca de produtos em tempo real
  - Filtragem por categorias
  - Visualização de imagens de produtos
  - Mostra apenas produtos com estoque disponível
  - Botões de adicionar alinhados uniformemente

### Gestão de Categorias
- Criação e gestão de categorias de produtos
- Atribuição de produtos a categorias
- Filtragem de produtos por categoria

### Características Técnicas
- **Validação de estoque**: Previne adicionar mais produtos dos disponíveis
- **Transações atômicas**: Garante consistência nas vendas
- **Interface responsiva**: Design adaptável com Tailwind CSS
- **Tratamento de erros**: Mensagens informativas para o usuário
- **Otimização de desempenho**: Carregamento eficiente de dados

### NOVAS CARACTERÍSTICAS TÉCNICAS - V2.0.0
- **Integração com Cloudinary**:
  - Upload seguro de imagens
  - Transformações automáticas
  - CDN global para carregamento rápido
  - Validação de arquivos no lado cliente e servidor
- **Animações com Framer Motion**:
  - Transições suaves entre páginas
  - Efeitos de entrada e saída
  - Animações de carregamento e estados
- **Sistema de roles melhorado**:
  - Controle granular de permissões
  - Validação de acesso por componente
  - Diferentes níveis de usuário
- **Validações avançadas**:
  - Validação de tipos de arquivo
  - Limites de tamanho de imagem
  - Sanitização de dados de entrada
- **Otimizações de desempenho**:
  - Lazy loading de componentes
  - Memoização de funções custosas
  - Otimização de consultas de banco de dados

## Configuração Adicional

### Variáveis de Ambiente

Para produção, considere criar um arquivo `.env` no backend com:

```env
SECRET_KEY=sua-chave-secreta-aqui
DEBUG=False
ALLOWED_HOSTS=seu-dominio.com,www.seu-dominio.com
```

### Banco de Dados

O projeto usa SQLite por padrão. Para usar PostgreSQL ou MySQL:

1. Instale o driver correspondente:
   ```bash
   pip install psycopg2-binary  # Para PostgreSQL
   # ou
   pip install mysqlclient      # Para MySQL
   ```

2. Atualize a configuração em `backend/BackWeb/settings.py`

## URLs Importantes

### Frontend (http://localhost:5173)
- **Login**: `/login`
- **Dashboard**: `/` (redireciona para clientes)
- **Gestão de Clientes**: `/clientes`
- **Gestão de Produtos**: `/produtos`
- **Sistema de Vendas**: `/vendas`
- **Relatórios**: `/relatorios`
- **Gestão de Usuários**: `/usuarios`
- **Testes de API**: `/test-api`

### Backend (http://localhost:8000)
- **API REST**: `/api/`
- **Admin do Django**: `/admin/`
- **Documentação API**: `/api/schema/swagger-ui/` (se estiver configurado)

Usar o http de vercel e render dentro das rotas

---
