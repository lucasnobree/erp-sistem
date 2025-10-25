from django.db import models
from django.conf import settings

class Client(models.Model):
    STATUS_ATIVO = 'ATIVO'
    STATUS_INATIVO = 'INATIVO'
    STATUS_CHOICES = [
        (STATUS_ATIVO, 'Ativo'),
        (STATUS_INATIVO, 'Inativo'),
    ]

    nome = models.CharField(max_length=255)
    email = models.EmailField(max_length=255, blank=True, null=True)
    telefone = models.CharField(max_length=50, blank=True, null=True)
    empresa = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=7, choices=STATUS_CHOICES, default=STATUS_ATIVO)
    ultimo_contato = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-id']
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'

    def __str__(self) -> str:
        if self.empresa:
            return f"{self.nome} ({self.empresa})"
        return self.nome


class Kanban(models.Model):
    """Quadro Kanban com suporte a compartilhamento e vinculação de clientes."""
    
    nome = models.CharField(max_length=255)
    descricao = models.TextField(blank=True, null=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="kanbans_owned",
        verbose_name="Proprietário"
    )
    cliente = models.ForeignKey(
        'Client',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="kanbans",
        verbose_name="Cliente",
        help_text="Cliente associado a este Kanban (opcional)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Kanban"
        verbose_name_plural = "Kanbans"
    
    def __str__(self) -> str:
        if self.cliente:
            return f"{self.nome} - Cliente: {self.cliente.nome} (Owner: {self.owner.username})"
        return f"{self.nome} (Owner: {self.owner.username})"


class KanbanShare(models.Model):
    """Compartilhamento de Kanban entre usuários."""
    
    kanban = models.ForeignKey(
        Kanban,
        on_delete=models.CASCADE,
        related_name="shares"
    )
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="kanbans_shared"
    )
    pode_editar = models.BooleanField(
        default=False,
        help_text="Se True, o usuário pode editar o Kanban. Se False, apenas visualizar."
    )
    shared_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = [("kanban", "usuario")]
        ordering = ["-shared_at"]
        verbose_name = "Compartilhamento de Kanban"
        verbose_name_plural = "Compartilhamentos de Kanban"
    
    def __str__(self) -> str:
        return f"{self.kanban.nome} -> {self.usuario.username}"


class KanbanColumn(models.Model):
    """Coluna do Kanban."""

    kanban = models.ForeignKey(
        Kanban,
        on_delete=models.CASCADE,
        related_name="columns"
    )
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=20, help_text="Cor em HEX (ex: #FF0000) ou nome da cor")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["kanban", "order", "id"]
        verbose_name = "Coluna do Kanban"
        verbose_name_plural = "Colunas do Kanban"

    def __str__(self) -> str:
        return f"[{self.kanban.nome}] {self.order} - {self.name}"


class KanbanCard(models.Model):
    """Card do Kanban."""

    column = models.ForeignKey(
        KanbanColumn,
        on_delete=models.CASCADE,
        related_name="cards",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    priority = models.CharField(max_length=20, blank=True, null=True)
    status = models.CharField(max_length=30, blank=True, null=True)
    due_date = models.DateField(blank=True, null=True)
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="kanban_cards",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-id"]
        verbose_name = "Card do Kanban"
        verbose_name_plural = "Cards do Kanban"

    def __str__(self) -> str:
        return f"[{self.column.name}] {self.title}"
