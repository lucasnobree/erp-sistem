from django.contrib import admin
from .models import Usuario, Cliente, Categoria, Produto, Venta, VentaItem, Carrito

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
