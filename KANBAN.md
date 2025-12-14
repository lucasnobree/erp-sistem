# 📋 SISTEMA KANBAN COM AUTOMAÇÃO WHATSAPP

## 🎯 VISÃO GERAL

Sistema de gestão de atividades em formato Kanban integrado ao ERP, com automação de notificações via WhatsApp baseadas em regras personalizáveis.

---

## 📊 CHECKLIST DE IMPLEMENTAÇÃO

### **FASE 1: ESTRUTURA DE BANCO DE DADOS** ⏱️ 2-3 dias

#### ✅ **1.1 Modelos Django**
- [ ] **Kanban** - Quadro principal
  - [ ] `nome` (CharField)
  - [ ] `descricao` (TextField, opcional)
  - [ ] `criado_por` (ForeignKey Usuario)
  - [ ] `data_criacao` (DateTimeField)
  - [ ] `ativo` (BooleanField)

- [ ] **Coluna** - Colunas do quadro
  - [ ] `kanban` (ForeignKey Kanban)
  - [ ] `nome` (CharField)
  - [ ] `ordem` (IntegerField)
  - [ ] `cor` (CharField, hex color)
  - [ ] `limite_cards` (IntegerField, opcional)

- [ ] **Card** - Atividades/tarefas
  - [ ] `coluna` (ForeignKey Coluna)
  - [ ] `titulo` (CharField)
  - [ ] `descricao` (TextField, opcional)
  - [ ] `cliente` (ForeignKey Cliente, opcional)
  - [ ] `produto` (ForeignKey Produto, opcional)
  - [ ] `responsavel` (ForeignKey Usuario, opcional)
  - [ ] `data_vencimento` (DateField, opcional)
  - [ ] `prioridade` (CharField: baixa/media/alta)
  - [ ] `ordem` (IntegerField)
  - [ ] `data_criacao` (DateTimeField)
  - [ ] `data_movimentacao` (DateTimeField)

#### ✅ **1.2 Modelos de Automação**
- [ ] **RegraAutomacao** - Regras de notificação
  - [ ] `kanban` (ForeignKey Kanban)
  - [ ] `nome` (CharField)
  - [ ] `tipo_trigger` (CharField: movimentacao/prazo/criacao/atribuicao)
  - [ ] `coluna_trigger` (ForeignKey Coluna, opcional)
  - [ ] `dias_antes_vencimento` (IntegerField, opcional)
  - [ ] `acao_whatsapp` (CharField: cliente/responsavel/admin)
  - [ ] `template_mensagem` (TextField)
  - [ ] `ativo` (BooleanField)

- [ ] **HistoricoMovimentacao** - Log de movimentações
  - [ ] `card` (ForeignKey Card)
  - [ ] `coluna_origem` (ForeignKey Coluna, opcional)
  - [ ] `coluna_destino` (ForeignKey Coluna)
  - [ ] `usuario` (ForeignKey Usuario)
  - [ ] `data` (DateTimeField)

- [ ] **LogNotificacao** - Log de notificações enviadas
  - [ ] `card` (ForeignKey Card)
  - [ ] `regra` (ForeignKey RegraAutomacao)
  - [ ] `destinatario` (CharField)
  - [ ] `mensagem` (TextField)
  - [ ] `status` (CharField: enviado/erro/pendente)
  - [ ] `data_envio` (DateTimeField)

#### ✅ **1.3 Migrações**
- [ ] Criar migrações dos modelos
- [ ] Aplicar migrações no banco
- [ ] Testar integridade referencial

---

### **FASE 2: API BACKEND** ⏱️ 3-4 dias

#### ✅ **2.1 Serializers**
- [ ] `KanbanSerializer` - CRUD completo
- [ ] `ColunaSerializer` - CRUD com ordenação
- [ ] `CardSerializer` - CRUD com relacionamentos
- [ ] `RegraAutomacaoSerializer` - Configuração de regras
- [ ] `HistoricoMovimentacaoSerializer` - Apenas leitura

#### ✅ **2.2 ViewSets e Endpoints**
- [ ] **KanbanViewSet**
  - [ ] `GET /api/kanbans/` - Listar quadros do usuário
  - [ ] `POST /api/kanbans/` - Criar novo quadro
  - [ ] `GET /api/kanbans/{id}/` - Detalhes do quadro
  - [ ] `PUT /api/kanbans/{id}/` - Atualizar quadro
  - [ ] `DELETE /api/kanbans/{id}/` - Excluir quadro

- [ ] **ColunaViewSet**
  - [ ] `GET /api/kanbans/{id}/colunas/` - Listar colunas
  - [ ] `POST /api/kanbans/{id}/colunas/` - Criar coluna
  - [ ] `PUT /api/colunas/{id}/` - Atualizar coluna
  - [ ] `DELETE /api/colunas/{id}/` - Excluir coluna
  - [ ] `POST /api/colunas/reordenar/` - Reordenar colunas

- [ ] **CardViewSet**
  - [ ] `GET /api/colunas/{id}/cards/` - Listar cards da coluna
  - [ ] `POST /api/colunas/{id}/cards/` - Criar card
  - [ ] `PUT /api/cards/{id}/` - Atualizar card
  - [ ] `DELETE /api/cards/{id}/` - Excluir card
  - [ ] `POST /api/cards/{id}/mover/` - Mover card entre colunas

#### ✅ **2.3 Endpoints Especiais**
- [ ] `GET /api/kanbans/{id}/completo/` - Quadro com colunas e cards
- [ ] `GET /api/cards/{id}/historico/` - Histórico de movimentações
- [ ] `POST /api/kanbans/{id}/regras/` - Criar regra de automação
- [ ] `GET /api/kanbans/{id}/regras/` - Listar regras ativas

#### ✅ **2.4 Validações e Permissões**
- [ ] Validar ordem das colunas e cards
- [ ] Verificar permissões de usuário por quadro
- [ ] Validar movimentação entre colunas
- [ ] Limitar acesso aos próprios quadros

---

### **FASE 3: FRONTEND BÁSICO** ⏱️ 4-5 dias

#### ✅ **3.1 Dependências**
- [ ] Instalar `@dnd-kit/core` para drag & drop
- [ ] Instalar `@dnd-kit/sortable` para ordenação
- [ ] Instalar `@dnd-kit/utilities` para utilitários

#### ✅ **3.2 Componentes Base**
- [ ] **KanbanList** - Lista de quadros
  - [ ] Listar quadros do usuário
  - [ ] Botão criar novo quadro
  - [ ] Cards com preview de colunas
  - [ ] Ações: editar, excluir, acessar

- [ ] **KanbanBoard** - Visualização do quadro
  - [ ] Header com nome e ações
  - [ ] Colunas horizontais
  - [ ] Drag & drop entre colunas
  - [ ] Botão adicionar coluna

- [ ] **KanbanColumn** - Coluna individual
  - [ ] Header com nome e contador
  - [ ] Lista de cards
  - [ ] Botão adicionar card
  - [ ] Menu de ações da coluna

- [ ] **KanbanCard** - Card individual
  - [ ] Título e descrição
  - [ ] Cliente e produto (se houver)
  - [ ] Data de vencimento
  - [ ] Indicador de prioridade
  - [ ] Menu de ações

#### ✅ **3.3 Modais e Formulários**
- [ ] **ModalKanban** - Criar/editar quadro
- [ ] **ModalColuna** - Criar/editar coluna
- [ ] **ModalCard** - Criar/editar card
  - [ ] Seleção de cliente
  - [ ] Seleção de produto
  - [ ] Seleção de responsável
  - [ ] Data de vencimento
  - [ ] Prioridade

#### ✅ **3.4 Navegação**
- [ ] Adicionar rota `/atividades` no App.jsx
- [ ] Adicionar item no Sidebar.jsx
- [ ] Configurar roteamento para `/atividades/kanban/:id`

---

### **FASE 4: DRAG & DROP AVANÇADO** ⏱️ 2-3 dias

#### ✅ **4.1 Implementação DnD**
- [ ] **DragContext** - Contexto global de drag & drop
- [ ] **Sortable Cards** - Cards ordenáveis dentro da coluna
- [ ] **Droppable Columns** - Colunas que recebem cards
- [ ] **Visual Feedback** - Indicadores visuais durante drag

#### ✅ **4.2 Funcionalidades**
- [ ] Mover cards entre colunas
- [ ] Reordenar cards dentro da coluna
- [ ] Reordenar colunas
- [ ] Animações suaves
- [ ] Validações de movimento

#### ✅ **4.3 Persistência**
- [ ] Salvar nova posição no backend
- [ ] Atualizar ordem em tempo real
- [ ] Registrar histórico de movimentação
- [ ] Tratamento de erros

---

### **FASE 5: SISTEMA DE AUTOMAÇÃO** ⏱️ 3-4 dias

#### ✅ **5.1 Interface de Regras**
- [ ] **ModalRegras** - Configurador de automações
  - [ ] Seleção de trigger
  - [ ] Configuração de condições
  - [ ] Editor de template de mensagem
  - [ ] Preview da mensagem

- [ ] **ListaRegras** - Gerenciar regras existentes
  - [ ] Listar regras ativas/inativas
  - [ ] Ativar/desativar regras
  - [ ] Editar regras
  - [ ] Excluir regras

#### ✅ **5.2 Templates de Mensagem**
- [ ] **Variáveis disponíveis:**
  - [ ] `{cliente_nome}` - Nome do cliente
  - [ ] `{produto_nome}` - Nome do produto
  - [ ] `{card_titulo}` - Título do card
  - [ ] `{responsavel_nome}` - Nome do responsável
  - [ ] `{data_vencimento}` - Data de vencimento
  - [ ] `{coluna_nome}` - Nome da coluna

- [ ] **Editor de template:**
  - [ ] Textarea com preview
  - [ ] Botões para inserir variáveis
  - [ ] Validação de template
  - [ ] Exemplo de mensagem final

#### ✅ **5.3 Backend de Automação**
- [ ] **Django Signals** - Triggers automáticos
  - [ ] Signal pós-movimentação de card
  - [ ] Signal pós-criação de card
  - [ ] Signal pós-atribuição de responsável

- [ ] **Processador de Regras**
  - [ ] Verificar regras ativas do quadro
  - [ ] Avaliar condições da regra
  - [ ] Processar template da mensagem
  - [ ] Enfileirar notificação

---

### **FASE 6: INTEGRAÇÃO WHATSAPP** ⏱️ 2-3 dias

#### ✅ **6.1 Configuração**
- [ ] Escolher provedor (Twilio/WhatsApp Business API)
- [ ] Configurar credenciais no settings.py
- [ ] Instalar dependências necessárias
- [ ] Configurar webhook (se necessário)

#### ✅ **6.2 Serviço de Envio**
- [ ] **WhatsAppService** - Classe para envio
  - [ ] Método `enviar_mensagem(numero, mensagem)`
  - [ ] Validação de número de telefone
  - [ ] Tratamento de erros de API
  - [ ] Log de tentativas de envio

#### ✅ **6.3 Processamento Assíncrono**
- [ ] Configurar Celery (opcional)
- [ ] Task para envio de notificações
- [ ] Retry em caso de falha
- [ ] Log detalhado de envios

#### ✅ **6.4 Verificação de Prazos**
- [ ] **Comando Django** - Verificar vencimentos
- [ ] Cron job diário
- [ ] Processar regras de prazo
- [ ] Enviar alertas automáticos

---

### **FASE 7: MELHORIAS E POLIMENTO** ⏱️ 2-3 dias

#### ✅ **7.1 Interface Avançada**
- [ ] **Filtros e Busca**
  - [ ] Filtrar cards por cliente
  - [ ] Filtrar por produto
  - [ ] Filtrar por responsável
  - [ ] Busca por título

- [ ] **Visualizações**
  - [ ] Modo compacto/expandido
  - [ ] Cores personalizadas por coluna
  - [ ] Indicadores visuais de prazo
  - [ ] Contador de cards por coluna

#### ✅ **7.2 Histórico e Relatórios**
- [ ] **Timeline de Atividades**
  - [ ] Histórico de movimentações
  - [ ] Log de notificações enviadas
  - [ ] Filtros por período

- [ ] **Métricas do Quadro**
  - [ ] Tempo médio por coluna
  - [ ] Cards vencidos
  - [ ] Produtividade por responsável

#### ✅ **7.3 Configurações Avançadas**
- [ ] **Configurações do Quadro**
  - [ ] Limite de cards por coluna
  - [ ] Regras de movimentação
  - [ ] Permissões por usuário

- [ ] **Templates de Quadro**
  - [ ] Quadros pré-configurados
  - [ ] Duplicar quadro existente
  - [ ] Importar/exportar configurações

---

## 🔧 DEPENDÊNCIAS NECESSÁRIAS

### **Backend (requirements.txt)**
```txt
# Automação WhatsApp
twilio==8.10.0
# ou
requests==2.31.0  # Para WhatsApp Business API

# Tarefas assíncronas (opcional)
celery==5.3.4
redis==5.0.1

# Validações
phonenumbers==8.13.25
```

### **Frontend (package.json)**
```json
{
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

---

## 📱 FLUXO DE USUÁRIO

### **1. Gestão de Quadros**
1. Usuário acessa `/atividades`
2. Visualiza lista de quadros existentes
3. Pode criar novo quadro ou acessar existente
4. Configura colunas iniciais (A Fazer, Em Andamento, Concluído)

### **2. Gestão de Cards**
1. Usuário acessa quadro específico
2. Cria cards nas colunas
3. Atribui cliente, produto, responsável
4. Define data de vencimento e prioridade
5. Move cards entre colunas via drag & drop

### **3. Configuração de Automações**
1. Usuário clica no ícone de configurações do quadro
2. Acessa "Regras de Automação"
3. Cria nova regra definindo:
   - Trigger (movimentação, prazo, etc.)
   - Condições específicas
   - Template da mensagem
   - Destinatário da notificação

### **4. Automação em Ação**
1. Card é movido para coluna "Concluído"
2. Sistema verifica regras ativas
3. Processa template da mensagem
4. Envia notificação via WhatsApp
5. Registra log da notificação

---

## 🎯 CRONOGRAMA ESTIMADO

| Fase | Duração | Descrição |
|------|---------|-----------|
| **Fase 1** | 2-3 dias | Estrutura de banco de dados |
| **Fase 2** | 3-4 dias | API Backend completa |
| **Fase 3** | 4-5 dias | Frontend básico funcional |
| **Fase 4** | 2-3 dias | Drag & drop avançado |
| **Fase 5** | 3-4 dias | Sistema de automação |
| **Fase 6** | 2-3 dias | Integração WhatsApp |
| **Fase 7** | 2-3 dias | Melhorias e polimento |

**TOTAL ESTIMADO: 18-25 dias de desenvolvimento**

---

## 🚀 PRÓXIMOS PASSOS

**Pronto para começar?** Sugiro iniciarmos pela **Fase 1** criando os modelos de banco de dados.

**Confirme se:**
- [ ] A estrutura proposta atende suas necessidades
- [ ] As funcionalidades estão alinhadas com sua visão
- [ ] O cronograma está adequado
- [ ] Podemos prosseguir com a implementação

**Qual fase gostaria de iniciar primeiro?**