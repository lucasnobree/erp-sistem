from rest_framework import serializers
from .models import Client


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
