from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Client, KanbanColumn, KanbanCard


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


class KanbanColumnSerializer(serializers.ModelSerializer):
    class Meta:
        model = KanbanColumn
        fields = [
            'id',
            'name',
            'color',
            'order',
        ]
        read_only_fields = ['id']


class KanbanCardSerializer(serializers.ModelSerializer):
    # Mapeamentos de nomes solicitados
    columnId = serializers.PrimaryKeyRelatedField(
        source='column', queryset=KanbanColumn.objects.all()
    )
    dueDate = serializers.DateField(source='due_date', required=False, allow_null=True)
    assigne = serializers.PrimaryKeyRelatedField(
        source='assignee', queryset=get_user_model().objects.all(), required=False, allow_null=True
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


User = get_user_model()


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
