"""
Modelos para Sistema Kanban com Automação WhatsApp
"""
from django.db import models
from django.utils import timezone
from .models import Usuario, Cliente, Produto


class Kanban(models.Model):
    """Quadro Kanban principal"""
    nome = models.CharField(max_length=200, verbose_name="Nome do Quadro")
    descricao = models.TextField(blank=True, null=True, verbose_name="Descrição")
    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.CASCADE,
        related_name='kanbans',
        verbose_name="Cliente",
        null=True,
        blank=True
    )
    criado_por = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='kanbans_criados',
        verbose_name="Criado Por"
    )
    data_criacao = models.DateTimeField(default=timezone.now, verbose_name="Data de Criação")
    ativo = models.BooleanField(default=True, verbose_name="Ativo")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'kanban'
        ordering = ['-data_criacao']
        verbose_name = 'Quadro Kanban'
        verbose_name_plural = 'Quadros Kanban'

    def __str__(self):
        cliente_nome = self.cliente.nome if self.cliente else "Sem cliente"
        return f"{self.nome} - {cliente_nome}"


class Coluna(models.Model):
    """Colunas do quadro Kanban"""
    kanban = models.ForeignKey(
        Kanban,
        on_delete=models.CASCADE,
        related_name='colunas',
        verbose_name="Quadro"
    )
    nome = models.CharField(max_length=100, verbose_name="Nome da Coluna")
    ordem = models.IntegerField(default=0, verbose_name="Ordem")
    cor = models.CharField(
        max_length=7,
        default='#3B82F6',
        help_text="Cor em hexadecimal (ex: #3B82F6)",
        verbose_name="Cor"
    )
    limite_cards = models.IntegerField(
        blank=True,
        null=True,
        help_text="Limite máximo de cards nesta coluna",
        verbose_name="Limite de Cards"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'kanban_coluna'
        ordering = ['ordem']
        verbose_name = 'Coluna'
        verbose_name_plural = 'Colunas'
        unique_together = [['kanban', 'ordem']]

    def __str__(self):
        return f"{self.kanban.nome} - {self.nome}"

    def total_cards(self):
        """Retorna o total de cards na coluna"""
        return self.cards.count()

    def pode_adicionar_card(self):
        """Verifica se pode adicionar mais cards (respeita limite)"""
        if self.limite_cards is None:
            return True
        return self.total_cards() < self.limite_cards


class Card(models.Model):
    """Cards/Tarefas do Kanban"""
    PRIORIDADE_CHOICES = [
        ('baixa', 'Baixa'),
        ('media', 'Média'),
        ('alta', 'Alta'),
    ]

    coluna = models.ForeignKey(
        Coluna,
        on_delete=models.CASCADE,
        related_name='cards',
        verbose_name="Coluna"
    )
    titulo = models.CharField(max_length=200, verbose_name="Título")
    descricao = models.TextField(blank=True, null=True, verbose_name="Descrição")

    # Relacionamentos opcionais
    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cards_kanban',
        verbose_name="Cliente"
    )
    produto = models.ForeignKey(
        Produto,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cards_kanban',
        verbose_name="Produto"
    )
    responsavel = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='cards_responsaveis',
        verbose_name="Responsável"
    )

    # Datas e controle
    data_vencimento = models.DateField(
        blank=True,
        null=True,
        verbose_name="Data de Vencimento"
    )
    prioridade = models.CharField(
        max_length=10,
        choices=PRIORIDADE_CHOICES,
        default='media',
        verbose_name="Prioridade"
    )
    ordem = models.IntegerField(default=0, verbose_name="Ordem")
    data_criacao = models.DateTimeField(default=timezone.now, verbose_name="Data de Criação")
    data_movimentacao = models.DateTimeField(default=timezone.now, verbose_name="Última Movimentação")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'kanban_card'
        ordering = ['ordem', '-data_criacao']
        verbose_name = 'Card'
        verbose_name_plural = 'Cards'

    def __str__(self):
        return f"{self.titulo} ({self.coluna.nome})"

    def esta_atrasado(self):
        """Verifica se o card está atrasado"""
        if self.data_vencimento:
            return timezone.now().date() > self.data_vencimento
        return False

    def dias_para_vencimento(self):
        """Retorna quantos dias faltam para o vencimento"""
        if self.data_vencimento:
            delta = self.data_vencimento - timezone.now().date()
            return delta.days
        return None


class RegraAutomacao(models.Model):
    """Regras de automação para notificações WhatsApp"""
    TIPO_TRIGGER_CHOICES = [
        ('movimentacao', 'Movimentação de Card'),
        ('prazo', 'Prazo de Vencimento'),
        ('criacao', 'Criação de Card'),
        ('atribuicao', 'Atribuição de Responsável'),
    ]

    ACAO_WHATSAPP_CHOICES = [
        ('cliente', 'Notificar Cliente'),
        ('responsavel', 'Notificar Responsável'),
        ('admin', 'Notificar Administrador'),
    ]

    kanban = models.ForeignKey(
        Kanban,
        on_delete=models.CASCADE,
        related_name='regras_automacao',
        verbose_name="Quadro"
    )
    nome = models.CharField(max_length=200, verbose_name="Nome da Regra")
    tipo_trigger = models.CharField(
        max_length=20,
        choices=TIPO_TRIGGER_CHOICES,
        verbose_name="Tipo de Gatilho"
    )
    coluna_trigger = models.ForeignKey(
        Coluna,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Coluna específica que ativa a regra (opcional)",
        verbose_name="Coluna Gatilho"
    )
    dias_antes_vencimento = models.IntegerField(
        blank=True,
        null=True,
        help_text="Para trigger de prazo: quantos dias antes notificar",
        verbose_name="Dias Antes do Vencimento"
    )
    acao_whatsapp = models.CharField(
        max_length=20,
        choices=ACAO_WHATSAPP_CHOICES,
        verbose_name="Ação WhatsApp"
    )
    template_mensagem = models.TextField(
        help_text="Use {cliente_nome}, {produto_nome}, {card_titulo}, {responsavel_nome}, {data_vencimento}, {coluna_nome}",
        verbose_name="Template da Mensagem"
    )
    ativo = models.BooleanField(default=True, verbose_name="Ativo")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'kanban_regra_automacao'
        ordering = ['nome']
        verbose_name = 'Regra de Automação'
        verbose_name_plural = 'Regras de Automação'

    def __str__(self):
        return f"{self.nome} ({self.kanban.nome})"

    def processar_template(self, card):
        """Processa o template substituindo as variáveis"""
        mensagem = self.template_mensagem

        # Substituir variáveis
        mensagem = mensagem.replace('{card_titulo}', card.titulo or '')
        mensagem = mensagem.replace('{coluna_nome}', card.coluna.nome or '')

        if card.cliente:
            mensagem = mensagem.replace('{cliente_nome}', card.cliente.nome or '')

        if card.produto:
            mensagem = mensagem.replace('{produto_nome}', card.produto.nome or '')

        if card.responsavel:
            mensagem = mensagem.replace('{responsavel_nome}', card.responsavel.nome or '')

        if card.data_vencimento:
            mensagem = mensagem.replace('{data_vencimento}', card.data_vencimento.strftime('%d/%m/%Y'))

        return mensagem


class HistoricoMovimentacao(models.Model):
    """Log de movimentações de cards entre colunas"""
    card = models.ForeignKey(
        Card,
        on_delete=models.CASCADE,
        related_name='historico',
        verbose_name="Card"
    )
    coluna_origem = models.ForeignKey(
        Coluna,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='movimentacoes_origem',
        verbose_name="Coluna Origem"
    )
    coluna_destino = models.ForeignKey(
        Coluna,
        on_delete=models.SET_NULL,
        null=True,
        related_name='movimentacoes_destino',
        verbose_name="Coluna Destino"
    )
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name="Usuário"
    )
    data = models.DateTimeField(default=timezone.now, verbose_name="Data")
    observacao = models.TextField(blank=True, null=True, verbose_name="Observação")

    class Meta:
        db_table = 'kanban_historico_movimentacao'
        ordering = ['-data']
        verbose_name = 'Histórico de Movimentação'
        verbose_name_plural = 'Históricos de Movimentação'

    def __str__(self):
        origem = self.coluna_origem.nome if self.coluna_origem else 'Início'
        destino = self.coluna_destino.nome if self.coluna_destino else 'Desconhecido'
        return f"{self.card.titulo}: {origem} → {destino}"


class LogNotificacao(models.Model):
    """Log de notificações WhatsApp enviadas"""
    STATUS_CHOICES = [
        ('enviado', 'Enviado'),
        ('erro', 'Erro'),
        ('pendente', 'Pendente'),
    ]

    card = models.ForeignKey(
        Card,
        on_delete=models.CASCADE,
        related_name='notificacoes',
        verbose_name="Card"
    )
    regra = models.ForeignKey(
        RegraAutomacao,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name="Regra"
    )
    destinatario = models.CharField(
        max_length=20,
        help_text="Número de telefone do destinatário",
        verbose_name="Destinatário"
    )
    mensagem = models.TextField(verbose_name="Mensagem")
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='pendente',
        verbose_name="Status"
    )
    erro_mensagem = models.TextField(
        blank=True,
        null=True,
        verbose_name="Mensagem de Erro"
    )
    data_envio = models.DateTimeField(default=timezone.now, verbose_name="Data de Envio")
    tentativas = models.IntegerField(default=0, verbose_name="Tentativas")

    class Meta:
        db_table = 'kanban_log_notificacao'
        ordering = ['-data_envio']
        verbose_name = 'Log de Notificação'
        verbose_name_plural = 'Logs de Notificações'

    def __str__(self):
        return f"{self.destinatario} - {self.status} ({self.data_envio.strftime('%d/%m/%Y %H:%M')})"
