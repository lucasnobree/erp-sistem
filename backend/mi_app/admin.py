from django.contrib import admin
from .models import Usuario, Cliente, Categoria, Produto, Venta, VentaItem, Carrito
from .models_kanban import Kanban, Coluna, Card, RegraAutomacao, HistoricoMovimentacao, LogNotificacao

# Registrar modelos no admin do Django
@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('email', 'username', 'nome', 'rol', 'zona_acesso', 'is_active', 'created_at')
    list_filter = ('rol', 'zona_acesso', 'is_active', 'created_at')
    search_fields = ('email', 'username', 'nome')
    readonly_fields = ('id', 'created_at', 'updated_at')

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ('cedula', 'nome', 'email', 'telefone', 'cidade', 'created_at')
    list_filter = ('cidade', 'created_at')
    search_fields = ('cedula', 'nome', 'email')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('id', 'nome')
    search_fields = ('nome',)

@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nome', 'preco', 'estoque', 'categoria', 'created_at')
    list_filter = ('categoria', 'created_at')
    search_fields = ('nome', 'descricao')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Venta)
class VentaAdmin(admin.ModelAdmin):
    list_display = ('id', 'cliente_cedula', 'total', 'fecha', 'created_at')
    list_filter = ('fecha', 'created_at')
    search_fields = ('cliente_cedula',)
    readonly_fields = ('created_at', 'updated_at')

@admin.register(VentaItem)
class VentaItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'venda_id', 'produto_id', 'quantidade', 'preco_unitario', 'created_at')
    list_filter = ('created_at',)
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Carrito)
class CarritoAdmin(admin.ModelAdmin):
    list_display = ('id', 'session_id', 'usuario_id', 'produto_id', 'quantidade', 'preco_unitario', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('session_id',)
    readonly_fields = ('created_at', 'updated_at')


# Kanban System Admin
@admin.register(Kanban)
class KanbanAdmin(admin.ModelAdmin):
    list_display = ('id', 'nome', 'cliente', 'criado_por', 'ativo', 'data_criacao')
    list_filter = ('ativo', 'data_criacao', 'cliente')
    search_fields = ('nome', 'descricao', 'cliente__nome')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Coluna)
class ColunaAdmin(admin.ModelAdmin):
    list_display = ('id', 'nome', 'kanban', 'ordem', 'cor', 'limite_cards')
    list_filter = ('kanban',)
    search_fields = ('nome',)
    ordering = ('kanban', 'ordem')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = ('id', 'titulo', 'coluna', 'cliente', 'responsavel', 'prioridade', 'data_vencimento', 'ordem')
    list_filter = ('prioridade', 'data_vencimento', 'coluna__kanban')
    search_fields = ('titulo', 'descricao')
    ordering = ('coluna', 'ordem')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(RegraAutomacao)
class RegraAutomacaoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nome', 'kanban', 'tipo_trigger', 'acao_whatsapp', 'ativo')
    list_filter = ('tipo_trigger', 'acao_whatsapp', 'ativo', 'kanban')
    search_fields = ('nome', 'template_mensagem')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(HistoricoMovimentacao)
class HistoricoMovimentacaoAdmin(admin.ModelAdmin):
    list_display = ('id', 'card', 'coluna_origem', 'coluna_destino', 'usuario', 'data')
    list_filter = ('data', 'coluna_destino')
    search_fields = ('card__titulo', 'observacao')
    ordering = ('-data',)


@admin.register(LogNotificacao)
class LogNotificacaoAdmin(admin.ModelAdmin):
    list_display = ('id', 'card', 'destinatario', 'status', 'data_envio', 'tentativas')
    list_filter = ('status', 'data_envio')
    search_fields = ('destinatario', 'mensagem')
    ordering = ('-data_envio',)
