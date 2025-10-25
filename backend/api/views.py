from rest_framework.views import APIView
from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiTypes
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Client, Kanban, KanbanShare, KanbanColumn, KanbanCard
from .serializers import (
    ClientSerializer,
    KanbanSerializer,
    KanbanShareSerializer,
    KanbanColumnSerializer,
    KanbanCardSerializer,
    RegisterSerializer,
    UserBasicSerializer,
    UserMeSerializer,
    UserListSerializer,
    KanbanUserAccessSerializer,
)


class MeView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserMeSerializer

    @extend_schema(
        tags=['Autenticação'],
        summary='Dados do usuário autenticado',
        responses=UserMeSerializer,
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
    serializer_class = RegisterSerializer

    @extend_schema(
        tags=['Autenticação'],
        summary='Registrar novo usuário',
        request=RegisterSerializer,
        responses={201: UserBasicSerializer},
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            UserBasicSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )

@extend_schema_view(
    list=extend_schema(
        tags=['Clientes'],
        summary='Listar clientes',
        parameters=[
            OpenApiParameter(
                name='status',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                enum=[Client.STATUS_ATIVO, Client.STATUS_INATIVO],
            ),
        ],
    ),
    retrieve=extend_schema(tags=['Clientes'], summary='Detalhar cliente'),
    create=extend_schema(tags=['Clientes'], summary='Criar cliente'),
    update=extend_schema(tags=['Clientes'], summary='Atualizar cliente'),
    partial_update=extend_schema(tags=['Clientes'], summary='Atualizar parcialmente'),
    destroy=extend_schema(tags=['Clientes'], summary='Excluir cliente'),
)
class ClientViewSet(viewsets.ModelViewSet):
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
    
    @extend_schema(
        tags=['Clientes'],
        summary='Listar Kanbans do cliente',
        responses={200: KanbanSerializer(many=True)}
    )
    @action(detail=True, methods=['get'])
    def kanbans(self, request, pk=None):
        cliente = self.get_object()
        user = request.user
        
        kanbans = cliente.kanbans.filter(
            Q(owner=user) | Q(shares__usuario=user)
        ).distinct()
        
        serializer = KanbanSerializer(kanbans, many=True, context={'request': request})
        return Response(serializer.data)


@extend_schema_view(
    list=extend_schema(tags=['Usuários'], summary='Listar usuários'),
    retrieve=extend_schema(tags=['Usuários'], summary='Detalhar usuário'),
)
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = get_user_model().objects.all()
    serializer_class = UserListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['id', 'username', 'email']
    ordering = ['username']


@extend_schema(tags=['Autenticação'], summary='Obter token JWT')
class JWTObtainPairView(TokenObtainPairView):
    pass


@extend_schema(tags=['Autenticação'], summary='Atualizar token JWT')
class JWTRefreshView(TokenRefreshView):
    pass


@extend_schema(tags=['Autenticação'], summary='Verificar token JWT')
class JWTVerifyView(TokenVerifyView):
    pass


@extend_schema_view(
    list=extend_schema(
        tags=['Kanban'],
        summary='Listar Kanbans',
        parameters=[
            OpenApiParameter(
                name='cliente',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
            ),
        ],
    ),
    retrieve=extend_schema(tags=['Kanban'], summary='Detalhar Kanban'),
    create=extend_schema(tags=['Kanban'], summary='Criar Kanban'),
    update=extend_schema(tags=['Kanban'], summary='Atualizar Kanban'),
    partial_update=extend_schema(tags=['Kanban'], summary='Atualizar parcialmente'),
    destroy=extend_schema(tags=['Kanban'], summary='Excluir Kanban'),
)
class KanbanViewSet(viewsets.ModelViewSet):
    serializer_class = KanbanSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nome', 'descricao', 'cliente__nome', 'cliente__empresa']
    ordering_fields = ['id', 'nome', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        qs = Kanban.objects.filter(
            Q(owner=user) | Q(shares__usuario=user)
        ).distinct()
        
        cliente_id = self.request.query_params.get('cliente')
        if cliente_id:
            qs = qs.filter(cliente_id=cliente_id)
        
        return qs
    
    def perform_create(self, serializer):
        serializer.save()
    
    @extend_schema(
        tags=['Kanban'],
        summary='Compartilhar Kanban',
        request=KanbanShareSerializer,
        responses={201: KanbanShareSerializer}
    )
    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        kanban = self.get_object()
        
        if kanban.owner != request.user:
            return Response(
                {"detail": "Apenas o proprietário pode compartilhar este Kanban."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        data = request.data.copy()
        data['kanban'] = kanban.id
        
        serializer = KanbanShareSerializer(data=data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @extend_schema(
        tags=['Kanban'],
        summary='Listar usuários com acesso',
        responses={200: KanbanUserAccessSerializer(many=True)}
    )
    @action(detail=True, methods=['get'], url_path='usuarios-acesso')
    def usuarios_acesso(self, request, pk=None):
        kanban = self.get_object()
        usuarios = []
        
        usuarios.append({
            'id': kanban.owner.id,
            'username': kanban.owner.username,
            'email': kanban.owner.email,
            'is_owner': True,
            'pode_editar': True,
            'shared_at': None
        })
        
        for share in kanban.shares.select_related('usuario').all():
            usuarios.append({
                'id': share.usuario.id,
                'username': share.usuario.username,
                'email': share.usuario.email,
                'is_owner': False,
                'pode_editar': share.pode_editar,
                'shared_at': share.shared_at
            })
        
        serializer = KanbanUserAccessSerializer(usuarios, many=True)
        return Response(serializer.data)


@extend_schema_view(
    list=extend_schema(tags=['Compartilhamento'], summary='Listar compartilhamentos'),
    retrieve=extend_schema(tags=['Compartilhamento'], summary='Detalhar compartilhamento'),
    create=extend_schema(tags=['Compartilhamento'], summary='Criar compartilhamento'),
    update=extend_schema(tags=['Compartilhamento'], summary='Atualizar compartilhamento'),
    partial_update=extend_schema(tags=['Compartilhamento'], summary='Atualizar parcialmente'),
    destroy=extend_schema(tags=['Compartilhamento'], summary='Remover compartilhamento'),
)
class KanbanShareViewSet(viewsets.ModelViewSet):
    serializer_class = KanbanShareSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return KanbanShare.objects.filter(
            Q(kanban__owner=user) | Q(usuario=user)
        )
    
    def perform_create(self, serializer):
        kanban = serializer.validated_data['kanban']
        if kanban.owner != self.request.user:
            raise serializers.ValidationError(
                "Apenas o proprietário pode compartilhar este Kanban."
            )
        serializer.save()


@extend_schema_view(
    list=extend_schema(
        tags=['Colunas'],
        summary='Listar colunas',
        parameters=[
            OpenApiParameter(
                name='kanban',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
            ),
        ],
    ),
    retrieve=extend_schema(tags=['Colunas'], summary='Detalhar coluna'),
    create=extend_schema(tags=['Colunas'], summary='Criar coluna'),
    update=extend_schema(tags=['Colunas'], summary='Atualizar coluna'),
    partial_update=extend_schema(tags=['Colunas'], summary='Atualizar parcialmente'),
    destroy=extend_schema(tags=['Colunas'], summary='Excluir coluna'),
)
class KanbanColumnViewSet(viewsets.ModelViewSet):
    serializer_class = KanbanColumnSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'color']
    ordering_fields = ['order', 'id', 'name']
    ordering = ['order', 'id']
    
    def get_queryset(self):
        user = self.request.user
        qs = KanbanColumn.objects.filter(
            Q(kanban__owner=user) | Q(kanban__shares__usuario=user)
        ).distinct().order_by('kanban', 'order', 'id')
        
        kanban_id = self.request.query_params.get('kanban')
        if kanban_id:
            qs = qs.filter(kanban_id=kanban_id)
        
        return qs


@extend_schema_view(
    list=extend_schema(
        tags=['Cards'],
        summary='Listar cards',
        parameters=[
            OpenApiParameter(name='columnId', type=OpenApiTypes.INT, location=OpenApiParameter.QUERY),
            OpenApiParameter(name='status', type=OpenApiTypes.STR, location=OpenApiParameter.QUERY),
            OpenApiParameter(name='priority', type=OpenApiTypes.STR, location=OpenApiParameter.QUERY),
        ],
    ),
    retrieve=extend_schema(tags=['Cards'], summary='Detalhar card'),
    create=extend_schema(tags=['Cards'], summary='Criar card'),
    update=extend_schema(tags=['Cards'], summary='Atualizar card'),
    partial_update=extend_schema(tags=['Cards'], summary='Atualizar parcialmente'),
    destroy=extend_schema(tags=['Cards'], summary='Excluir card'),
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
