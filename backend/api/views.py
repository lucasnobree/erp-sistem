from rest_framework.views import APIView
from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiTypes
from .models import Client, KanbanColumn, KanbanCard
from .serializers import (
    ClientSerializer,
    KanbanColumnSerializer,
    KanbanCardSerializer,
    RegisterSerializer,
)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Autenticação'],
        summary='Dados do usuário autenticado',
        description='Retorna informações básicas do usuário logado.'
    )
    def get(self, request):
        user = request.user
        data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
        }
        return Response(data)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Autenticação'],
        summary='Registrar novo usuário',
        description='Cria um novo usuário com username, email (opcional) e password.'
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
            status=status.HTTP_201_CREATED,
        )

@extend_schema_view(
    list=extend_schema(
        tags=['Clientes'],
        summary='Listar clientes',
        description='Lista clientes com suporte a busca, ordenação e filtro por status.',
        parameters=[
            OpenApiParameter(
                name='status',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                required=False,
                description='Filtrar por status do cliente',
                enum=[Client.STATUS_ATIVO, Client.STATUS_INATIVO],
            ),
            OpenApiParameter(
                name='search',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                required=False,
                description='Busca por nome, email, empresa ou telefone',
            ),
            OpenApiParameter(
                name='ordering',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                required=False,
                description='Ordenação: id, nome, ultimo_contato (prefixe com - para desc)'
            ),
        ],
    ),
    retrieve=extend_schema(tags=['Clientes'], summary='Detalhar cliente'),
    create=extend_schema(tags=['Clientes'], summary='Criar cliente'),
    update=extend_schema(tags=['Clientes'], summary='Atualizar cliente'),
    partial_update=extend_schema(tags=['Clientes'], summary='Atualização parcial do cliente'),
    destroy=extend_schema(tags=['Clientes'], summary='Excluir cliente'),
)
class ClientViewSet(viewsets.ModelViewSet):
    """CRUD completo para clientes"""

    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["nome", "email", "empresa", "telefone"]
    ordering_fields = ["id", "nome", "ultimo_contato"]
    ordering = ["-id"]

    def get_queryset(self):
        qs = super().get_queryset()
        status_value = self.request.query_params.get("status")
        if status_value in {Client.STATUS_ATIVO, Client.STATUS_INATIVO}:
            qs = qs.filter(status=status_value)
        return qs


@extend_schema_view(
    list=extend_schema(tags=['Kanban - Colunas'], summary='Listar colunas'),
    retrieve=extend_schema(tags=['Kanban - Colunas'], summary='Detalhar coluna'),
    create=extend_schema(tags=['Kanban - Colunas'], summary='Criar coluna'),
    update=extend_schema(tags=['Kanban - Colunas'], summary='Atualizar coluna'),
    partial_update=extend_schema(tags=['Kanban - Colunas'], summary='Atualização parcial da coluna'),
    destroy=extend_schema(tags=['Kanban - Colunas'], summary='Excluir coluna'),
)
class KanbanColumnViewSet(viewsets.ModelViewSet):
    queryset = KanbanColumn.objects.all().order_by('order', 'id')
    serializer_class = KanbanColumnSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'color']
    ordering_fields = ['order', 'id', 'name']
    ordering = ['order', 'id']


@extend_schema_view(
    list=extend_schema(
        tags=['Kanban - Cards'],
        summary='Listar cards',
        parameters=[
            OpenApiParameter(
                name='columnId',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                required=False,
                description='Filtrar cards por coluna (ID da coluna)'
            ),
            OpenApiParameter(
                name='status',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                required=False,
                description='Filtrar cards por status'
            ),
            OpenApiParameter(
                name='priority',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                required=False,
                description='Filtrar cards por prioridade'
            ),
        ],
    ),
    retrieve=extend_schema(tags=['Kanban - Cards'], summary='Detalhar card'),
    create=extend_schema(tags=['Kanban - Cards'], summary='Criar card'),
    update=extend_schema(tags=['Kanban - Cards'], summary='Atualizar card'),
    partial_update=extend_schema(tags=['Kanban - Cards'], summary='Atualização parcial do card'),
    destroy=extend_schema(tags=['Kanban - Cards'], summary='Excluir card'),
)
class KanbanCardViewSet(viewsets.ModelViewSet):
    queryset = KanbanCard.objects.select_related('column', 'assignee').all()
    serializer_class = KanbanCardSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['id', 'created_at', 'updated_at', 'due_date', 'priority', 'title']
    ordering = ['-id']

    def get_queryset(self):
        qs = super().get_queryset()
        column_id = self.request.query_params.get('columnId') or self.request.query_params.get('column')
        if column_id:
            qs = qs.filter(column_id=column_id)
        status_val = self.request.query_params.get('status')
        if status_val:
            qs = qs.filter(status=status_val)
        priority_val = self.request.query_params.get('priority')
        if priority_val:
            qs = qs.filter(priority=priority_val)
        return qs
