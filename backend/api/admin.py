from django.contrib import admin
from .models import Client, KanbanColumn, KanbanCard

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


@admin.register(KanbanColumn)
class KanbanColumnAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'name',
        'color',
        'order',
    )
    list_editable = ('order',)
    search_fields = ('name', 'color')
    ordering = ('order', 'id')


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
