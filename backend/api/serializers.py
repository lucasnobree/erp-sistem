from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Client, Kanban, KanbanShare, KanbanColumn, KanbanCard


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = [
            'id',
            'nome',
            'email',
            'telefone',
            'empresa',
            'status',
            'ultimo_contato',
        ]
        read_only_fields = ['id']


class UserListSerializer(serializers.ModelSerializer):
    """Lista de usuários."""
    
    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id', 'username', 'email', 'first_name', 'last_name']


class KanbanUserAccessSerializer(serializers.Serializer):
    """Usuários com acesso ao Kanban."""
    
    id = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.EmailField()
    is_owner = serializers.BooleanField()
    pode_editar = serializers.BooleanField()
    shared_at = serializers.DateTimeField(allow_null=True)


class KanbanSerializer(serializers.ModelSerializer):
    """Kanban."""
    
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    cliente_info = serializers.SerializerMethodField(read_only=True)
    total_columns = serializers.SerializerMethodField(read_only=True)
    is_shared = serializers.SerializerMethodField(read_only=True)
    usuarios_com_acesso = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Kanban
        fields = [
            'id',
            'nome',
            'descricao',
            'cliente',
            'owner',
            'owner_username',
            'cliente_info',
            'total_columns',
            'is_shared',
            'usuarios_com_acesso',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']
    
    def get_cliente_info(self, obj):
        if obj.cliente:
            return {
                'id': obj.cliente.id,
                'nome': obj.cliente.nome,
                'email': obj.cliente.email,
                'empresa': obj.cliente.empresa,
                'status': obj.cliente.status
            }
        return None
    
    def get_total_columns(self, obj):
        return obj.columns.count()
    
    def get_is_shared(self, obj):
        return obj.shares.exists()
    
    def get_usuarios_com_acesso(self, obj):
        usuarios = []
        
        usuarios.append({
            'id': obj.owner.id,
            'username': obj.owner.username,
            'email': obj.owner.email,
            'is_owner': True,
            'pode_editar': True,
            'shared_at': None
        })
        
        for share in obj.shares.select_related('usuario').all():
            usuarios.append({
                'id': share.usuario.id,
                'username': share.usuario.username,
                'email': share.usuario.email,
                'is_owner': False,
                'pode_editar': share.pode_editar,
                'shared_at': share.shared_at
            })
        
        return usuarios
    
    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class KanbanShareSerializer(serializers.ModelSerializer):
    """Compartilhamento de Kanban."""
    
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    kanban_nome = serializers.CharField(source='kanban.nome', read_only=True)
    
    class Meta:
        model = KanbanShare
        fields = [
            'id',
            'kanban',
            'kanban_nome',
            'usuario',
            'usuario_username',
            'pode_editar',
            'shared_at',
        ]
        read_only_fields = ['id', 'shared_at']
    
    def validate(self, data):
        if data.get('usuario') == data.get('kanban').owner:
            raise serializers.ValidationError(
                "Você não pode compartilhar um Kanban com você mesmo."
            )
        return data


class KanbanColumnSerializer(serializers.ModelSerializer):
    kanban_nome = serializers.CharField(source='kanban.nome', read_only=True)
    total_cards = serializers.SerializerMethodField()
    
    class Meta:
        model = KanbanColumn
        fields = [
            'id',
            'kanban',
            'kanban_nome',
            'name',
            'color',
            'order',
            'total_cards',
        ]
        read_only_fields = ['id']
    
    def get_total_cards(self, obj):
        return obj.cards.count()


class KanbanCardSerializer(serializers.ModelSerializer):
    columnId = serializers.PrimaryKeyRelatedField(
        source='column', 
        queryset=KanbanColumn.objects.all(),
        required=True
    )
    dueDate = serializers.DateField(
        source='due_date', 
        required=False, 
        allow_null=True,
        input_formats=['%Y-%m-%d', 'iso-8601'],
        format=None
    )
    assigne = serializers.PrimaryKeyRelatedField(
        source='assignee', 
        queryset=get_user_model().objects.all(), 
        required=False, 
        allow_null=True
    )

    class Meta:
        model = KanbanCard
        fields = [
            'id',
            'columnId',
            'title',
            'description',
            'priority',
            'status',
            'dueDate',
            'assigne',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.column:
            representation['columnName'] = instance.column.name
        if instance.assignee:
            representation['assigneName'] = instance.assignee.username
        return representation


User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """Dados básicos do usuário."""

    class Meta:
        model = User
        fields = ["id", "username", "email"]


class UserMeSerializer(serializers.ModelSerializer):
    """Dados do usuário autenticado."""

    class Meta:
        model = User
        fields = ["id", "username", "email", "is_staff", "is_superuser"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        read_only_fields = ['id']

    def validate_email(self, value):
        if value and User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('E-mail já está em uso.')
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        return user
