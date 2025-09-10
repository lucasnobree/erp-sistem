from django.contrib import admin
from .models import Client

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
