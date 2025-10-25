from django.contrib import admin
from .models import Client, Kanban, KanbanShare, KanbanColumn, KanbanCard

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'nome',
        'email',
        'telefone',
        'empresa',
        'status',
        'ultimo_contato',
    )
    list_filter = ('status',)
    search_fields = ('nome', 'email', 'empresa', 'telefone')
    ordering = ('-id',)


@admin.register(Kanban)
class KanbanAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'nome',
        'cliente',
        'owner',
        'created_at',
        'updated_at',
    )
    list_filter = ('owner', 'cliente', 'created_at')
    search_fields = ('nome', 'descricao', 'owner__username', 'cliente__nome', 'cliente__empresa')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')
    autocomplete_fields = ['cliente']


@admin.register(KanbanShare)
class KanbanShareAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'kanban',
        'usuario',
        'pode_editar',
        'shared_at',
    )
    list_filter = ('pode_editar', 'shared_at')
    search_fields = ('kanban__nome', 'usuario__username')
    ordering = ('-shared_at',)
    readonly_fields = ('shared_at',)


@admin.register(KanbanColumn)
class KanbanColumnAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'kanban',
        'name',
        'color',
        'order',
    )
    list_editable = ('order',)
    list_filter = ('kanban',)
    search_fields = ('name', 'color', 'kanban__nome')
    ordering = ('kanban', 'order', 'id')


@admin.register(KanbanCard)
class KanbanCardAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'title',
        'column',
        'priority',
        'status',
        'due_date',
        'assignee',
        'created_at',
    )
    list_filter = ('column', 'priority', 'status', 'due_date', 'assignee')
    search_fields = ('title', 'description')
    ordering = ('-id',)
