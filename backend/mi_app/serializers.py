from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Cliente, Categoria, Produto, Venta, VentaItem, Carrito
from .models_kanban import Kanban, Coluna, Card, RegraAutomacao, HistoricoMovimentacao, LogNotificacao

Usuario = get_user_model()

class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    is_admin = serializers.SerializerMethodField()
    created_at_formatted = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = ('id', 'email', 'username', 'password', 'nome', 'rol', 
                 'zona_acesso', 'is_admin', 'created_at_formatted', 'created_at')
        extra_kwargs = {
            'password': {'write_only': True},
            'created_at': {'write_only': True}
        }

    def get_is_admin(self, obj):
        return obj.rol in ['admin', 'staff']

    def get_created_at_formatted(self, obj):
        return obj.created_at.strftime('%d/%m/%Y %H:%M') if obj.created_at else None

    def create(self, validated_data):
        user = Usuario.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            nome=validated_data['nome'],
            rol=validated_data.get('rol', 'Usuario'),
            zona_acesso=validated_data.get('zona_acesso', 'geral')
        )
        return user

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            password = validated_data.pop('password')
            if password:
                instance.set_password(password)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Adicionar claims personalizados ao token
        token['email'] = user.email
        token['nome'] = user.nome
        token['rol'] = user.rol
        token['zona_acesso'] = user.zona_acesso
        return token

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = [
            'cedula', 'nome', 'email', 'telefone', 'cidade',
            'empresa', 'cnpj', 'data_bloqueio', 'vencimento',
            'reuniao_apresentacao_agendada', 'relatorio_gerado',
            'data_apresentacao_relatorio', 'contato', 'parceiro',
            'observacoes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nome']

class ProdutoSerializer(serializers.ModelSerializer):
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)

    class Meta:
        model = Produto
        fields = ['id', 'nome', 'descricao', 'preco', 'estoque', 'imagem_url', 
                 'categoria', 'categoria_nome', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def validate_preco(self, value):
        if value <= 0:
            raise serializers.ValidationError("O preço deve ser maior que 0")
        return value

    def validate_estoque(self, value):
        if value < 0:
            raise serializers.ValidationError("O estoque não pode ser negativo")
        return value

class CarritoSerializer(serializers.ModelSerializer):
    produto_nome = serializers.SerializerMethodField()
    produto_preco = serializers.SerializerMethodField()
    produto_imagem = serializers.SerializerMethodField()
    produto_estoque = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = Carrito
        fields = ['id', 'session_id', 'usuario_id', 'produto_id', 'produto_nome', 
                 'produto_preco', 'produto_imagem', 'produto_estoque', 'quantidade', 
                 'preco_unitario', 'subtotal', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'subtotal', 'preco_unitario']
        extra_kwargs = {
            'usuario_id': {'required': False, 'allow_null': True},
            'preco_unitario': {'required': False}
        }

    def get_produto_nome(self, obj):
        produto = obj.get_produto()
        return produto.nome if produto else None

    def get_produto_preco(self, obj):
        produto = obj.get_produto()
        return produto.preco if produto else None

    def get_produto_imagem(self, obj):
        produto = obj.get_produto()
        return produto.imagem_url if produto else None
    
    def get_produto_estoque(self, obj):
        produto = obj.get_produto()
        return produto.estoque if produto else 0
    
    def get_subtotal(self, obj):
        return obj.get_subtotal()

    def validate(self, data):
        produto_id = data.get('produto_id')
        quantidade = data.get('quantidade', 1)
        
        try:
            produto = Produto.objects.get(id=produto_id)
            if not produto.tem_estoque(quantidade):
                raise serializers.ValidationError(
                    f"Estoque insuficiente. Apenas {produto.estoque} unidades disponíveis."
                )
            # Estabelecer o preço unitário atual do produto
            data['preco_unitario'] = produto.preco
        except Produto.DoesNotExist:
            raise serializers.ValidationError("O produto não existe.")
        
        return data

class VentaItemSerializer(serializers.ModelSerializer):
    produto_nome = serializers.SerializerMethodField()
    produto_preco = serializers.SerializerMethodField()
    produto_imagem = serializers.SerializerMethodField()

    class Meta:
        model = VentaItem
        fields = ['id', 'venda_id', 'produto_id', 'produto_nome', 'produto_preco', 'produto_imagem', 
                 'quantidade', 'preco_unitario', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_produto_nome(self, obj):
        try:
            produto = Produto.objects.get(id=obj.produto_id)
            return produto.nome
        except Produto.DoesNotExist:
            return None

    def get_produto_preco(self, obj):
        try:
            produto = Produto.objects.get(id=obj.produto_id)
            return produto.preco
        except Produto.DoesNotExist:
            return None

    def get_produto_imagem(self, obj):
        try:
            produto = Produto.objects.get(id=obj.produto_id)
            return produto.imagem_url
        except Produto.DoesNotExist:
            return None

    def validate_quantidade(self, value):
        if value <= 0:
            raise serializers.ValidationError("A quantidade deve ser maior que 0")
        return value

class VentaSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    cliente_nome = serializers.SerializerMethodField()

    class Meta:
        model = Venta
        fields = ['id', 'cliente_cedula', 'cliente_nome', 'total', 'fecha', 
                 'items', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_items(self, obj):
        # Obter os itens de venda manualmente usando venda_id
        items = VentaItem.objects.filter(venda_id=obj.id)
        return VentaItemSerializer(items, many=True).data

    def get_cliente_nome(self, obj):
        try:
            cliente = Cliente.objects.get(cedula=obj.cliente_cedula)
            return cliente.nome
        except Cliente.DoesNotExist:
            return None

    def create(self, validated_data):
        # Os itens serão criados separadamente usando VentaItemSerializer
        venda = Venta.objects.create(**validated_data)
        return venda
    
    def validate_total(self, value):
        if value <= 0:
            raise serializers.ValidationError("O total deve ser maior que 0")
        return value


# ============================================================================
# KANBAN SERIALIZERS
# ============================================================================

class ColunaSerializer(serializers.ModelSerializer):
    """Serializer para Colunas do Kanban"""
    total_cards = serializers.SerializerMethodField()
    pode_adicionar = serializers.SerializerMethodField()

    class Meta:
        model = Coluna
        fields = ['id', 'kanban', 'nome', 'ordem', 'cor', 'limite_cards',
                 'total_cards', 'pode_adicionar', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_total_cards(self, obj):
        return obj.total_cards()

    def get_pode_adicionar(self, obj):
        return obj.pode_adicionar_card()


class CardSerializer(serializers.ModelSerializer):
    """Serializer para Cards do Kanban"""
    cliente_nome = serializers.CharField(source='cliente.nome', read_only=True)
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)
    responsavel_nome = serializers.CharField(source='responsavel.nome', read_only=True)
    coluna_nome = serializers.CharField(source='coluna.nome', read_only=True)
    esta_atrasado = serializers.SerializerMethodField()
    dias_vencimento = serializers.SerializerMethodField()

    class Meta:
        model = Card
        fields = ['id', 'coluna', 'coluna_nome', 'titulo', 'descricao',
                 'cliente', 'cliente_nome', 'produto', 'produto_nome',
                 'responsavel', 'responsavel_nome', 'data_vencimento',
                 'prioridade', 'ordem', 'esta_atrasado', 'dias_vencimento',
                 'data_criacao', 'data_movimentacao', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'data_criacao', 'data_movimentacao']

    def get_esta_atrasado(self, obj):
        return obj.esta_atrasado()

    def get_dias_vencimento(self, obj):
        return obj.dias_para_vencimento()

    def validate(self, data):
        # Validar se a coluna pode receber mais cards
        coluna = data.get('coluna')
        if coluna and not coluna.pode_adicionar_card():
            raise serializers.ValidationError(
                f"A coluna '{coluna.nome}' atingiu o limite de {coluna.limite_cards} cards."
            )
        return data


class KanbanSerializer(serializers.ModelSerializer):
    """Serializer para Quadro Kanban"""
    criado_por_nome = serializers.CharField(source='criado_por.nome', read_only=True)
    cliente_nome = serializers.CharField(source='cliente.nome', read_only=True)
    total_colunas = serializers.SerializerMethodField()
    total_cards = serializers.SerializerMethodField()

    class Meta:
        model = Kanban
        fields = ['id', 'nome', 'descricao', 'cliente', 'cliente_nome',
                 'criado_por', 'criado_por_nome', 'data_criacao', 'ativo',
                 'total_colunas', 'total_cards', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'data_criacao', 'criado_por']

    def get_total_colunas(self, obj):
        return obj.colunas.count()

    def get_total_cards(self, obj):
        return Card.objects.filter(coluna__kanban=obj).count()


class KanbanCompletoSerializer(serializers.ModelSerializer):
    """Serializer completo com colunas e cards para visualização do quadro"""
    colunas = serializers.SerializerMethodField()
    criado_por_nome = serializers.CharField(source='criado_por.nome', read_only=True)
    cliente_nome = serializers.CharField(source='cliente.nome', read_only=True)
    cliente_info = serializers.SerializerMethodField()

    class Meta:
        model = Kanban
        fields = ['id', 'nome', 'descricao', 'cliente', 'cliente_nome', 'cliente_info',
                 'criado_por', 'criado_por_nome', 'data_criacao', 'ativo',
                 'colunas', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_cliente_info(self, obj):
        """Retorna informações completas do cliente"""
        if obj.cliente:
            return {
                'cedula': obj.cliente.cedula,
                'nome': obj.cliente.nome,
                'email': obj.cliente.email,
                'telefone': obj.cliente.telefone,
                'cidade': obj.cliente.cidade,
                'empresa': obj.cliente.empresa,
                'contato': obj.cliente.contato,
            }
        return None

    def get_colunas(self, obj):
        colunas = obj.colunas.all().order_by('ordem')
        return [{
            'id': coluna.id,
            'nome': coluna.nome,
            'ordem': coluna.ordem,
            'cor': coluna.cor,
            'limite_cards': coluna.limite_cards,
            'total_cards': coluna.total_cards(),
            'cards': CardSerializer(coluna.cards.all().order_by('ordem', '-data_criacao'), many=True).data
        } for coluna in colunas]


class RegraAutomacaoSerializer(serializers.ModelSerializer):
    """Serializer para Regras de Automação"""
    kanban_nome = serializers.CharField(source='kanban.nome', read_only=True)
    coluna_nome = serializers.CharField(source='coluna_trigger.nome', read_only=True)

    class Meta:
        model = RegraAutomacao
        fields = ['id', 'kanban', 'kanban_nome', 'nome', 'tipo_trigger',
                 'coluna_trigger', 'coluna_nome', 'dias_antes_vencimento',
                 'acao_whatsapp', 'template_mensagem', 'ativo',
                 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def validate_template_mensagem(self, value):
        """Validar que o template contém variáveis válidas"""
        variaveis_validas = [
            '{cliente_nome}', '{produto_nome}', '{card_titulo}',
            '{responsavel_nome}', '{data_vencimento}', '{coluna_nome}'
        ]
        # Apenas aviso - não bloquear
        return value


class HistoricoMovimentacaoSerializer(serializers.ModelSerializer):
    """Serializer para Histórico de Movimentações"""
    card_titulo = serializers.CharField(source='card.titulo', read_only=True)
    coluna_origem_nome = serializers.CharField(source='coluna_origem.nome', read_only=True)
    coluna_destino_nome = serializers.CharField(source='coluna_destino.nome', read_only=True)
    usuario_nome = serializers.CharField(source='usuario.nome', read_only=True)

    class Meta:
        model = HistoricoMovimentacao
        fields = ['id', 'card', 'card_titulo', 'coluna_origem', 'coluna_origem_nome',
                 'coluna_destino', 'coluna_destino_nome', 'usuario', 'usuario_nome',
                 'data', 'observacao']
        read_only_fields = ['data']


class LogNotificacaoSerializer(serializers.ModelSerializer):
    """Serializer para Log de Notificações WhatsApp"""
    card_titulo = serializers.CharField(source='card.titulo', read_only=True)
    regra_nome = serializers.CharField(source='regra.nome', read_only=True)

    class Meta:
        model = LogNotificacao
        fields = ['id', 'card', 'card_titulo', 'regra', 'regra_nome',
                 'destinatario', 'mensagem', 'status', 'erro_mensagem',
                 'data_envio', 'tentativas']
        read_only_fields = ['data_envio']