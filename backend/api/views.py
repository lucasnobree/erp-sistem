from rest_framework.views import APIView
from rest_framework import viewsets, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiTypes
from .models import Client
from .serializers import ClientSerializer


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
    """CRUD completo para clientes.

    Endpoints gerados automaticamente pelo router:
    - GET /api/clientes/ (list)
    - POST /api/clientes/ (create)
    - GET /api/clientes/{id}/ (retrieve)
    - PUT /api/clientes/{id}/ (update)
    - PATCH /api/clientes/{id}/ (partial_update)
    - DELETE /api/clientes/{id}/ (destroy)
    """

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
