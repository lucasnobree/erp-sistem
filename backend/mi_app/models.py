from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.contrib.auth.hashers import make_password
import uuid

class Usuario(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nome = models.CharField(max_length=255, default='', db_index=True)
    email = models.EmailField(unique=True, default='', db_index=True)
    password = models.CharField(max_length=128, default=make_password('changeme'))
    username = models.CharField(max_length=150, unique=True, default='', db_index=True)
    first_name = models.CharField(max_length=150, default='')
    last_name = models.CharField(max_length=150, default='')
    rol = models.CharField(max_length=50, default='Usuario', db_index=True)
    zona_acesso = models.CharField(max_length=50, default='geral', db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'nome']

    class Meta:
        db_table = 'usuarios'
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
        indexes = [
            models.Index(fields=['rol', 'zona_acesso']),
            models.Index(fields=['created_at', 'is_active'])
        ]

    def get_full_name(self):
        return f"{self.nome} ({self.username})"

    def __str__(self):
        return self.get_full_name()

class Cliente(models.Model):
    cedula = models.CharField(max_length=20, primary_key=True)
    nome = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    telefone = models.CharField(max_length=20, null=True, blank=True)
    cidade = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'clientes'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.nome} - {self.cedula}"

class Categoria(models.Model):
    id = models.BigAutoField(primary_key=True)
    nome = models.TextField()

    class Meta:
        db_table = 'categorias'
        ordering = ['nome']

    def __str__(self):
        return self.nome

class Produto(models.Model):
    id = models.BigAutoField(primary_key=True)
    nome = models.CharField(max_length=255)
    descricao = models.TextField(null=True, blank=True)
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    estoque = models.IntegerField()
    imagem_url = models.URLField(null=True, blank=True)
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'produtos'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.nome} - R$ {self.preco}"
    
    def tem_estoque(self, quantidade=1):
        """Verifica se há estoque suficiente disponível"""
        return self.estoque >= quantidade
    
    def reduzir_estoque(self, quantidade):
        """Reduz o estoque do produto"""
        if self.tem_estoque(quantidade):
            self.estoque -= quantidade
            self.save()
            return True
        return False
    
    def aumentar_estoque(self, quantidade):
        """Aumenta o estoque do produto (para devoluções)"""
        self.estoque += quantidade
        self.save()

class Carrito(models.Model):
    id = models.BigAutoField(primary_key=True)
    session_id = models.CharField(max_length=255)  # Para usuários não autenticados
    usuario_id = models.UUIDField(null=True, blank=True)  # Para usuários autenticados
    produto_id = models.BigIntegerField()
    quantidade = models.IntegerField(default=1)
    preco_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'carrito'
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['session_id', 'produto_id'],
                condition=models.Q(usuario_id__isnull=True),
                name='unique_session_produto'
            ),
            models.UniqueConstraint(
                fields=['usuario_id', 'produto_id'],
                condition=models.Q(usuario_id__isnull=False),
                name='unique_usuario_produto'
            )
        ]

    def __str__(self):
        return f"Carrinho - Produto #{self.produto_id} x{self.quantidade}"
    
    def get_produto(self):
        """Obtém o produto associado"""
        try:
            return Produto.objects.get(id=self.produto_id)
        except Produto.DoesNotExist:
            return None
    
    def get_subtotal(self):
        """Calcula o subtotal do item"""
        return self.quantidade * self.preco_unitario

class Venta(models.Model):
    id = models.BigAutoField(primary_key=True)
    cliente_cedula = models.CharField(max_length=20, null=True, blank=True)  # Referencia directa por cédula
    total = models.DecimalField(max_digits=10, decimal_places=2)
    fecha = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'vendas'
        ordering = ['-created_at']

    def __str__(self):
        return f"Venda #{self.id} - {self.cliente_cedula} - R$ {self.total}"

class VentaItem(models.Model):
    id = models.BigAutoField(primary_key=True)
    venda_id = models.BigIntegerField(null=True, blank=True)  # Referência direta por ID
    produto_id = models.BigIntegerField(null=True, blank=True)  # Referência direta por ID
    quantidade = models.IntegerField()
    preco_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'detalles_venda'
        ordering = ['-created_at']

    def __str__(self):
        return f"Detalhe venda #{self.venda_id} - Produto #{self.produto_id} x{self.quantidade}"
