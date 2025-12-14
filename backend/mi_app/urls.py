from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegistroUsuarioView,
    CustomTokenObtainPairView,
    PerfilUsuarioView,
    ListaUsuariosView,
    UsuarioDetailView,
    ClienteViewSet,
    ProdutoViewSet,
    CategoriaViewSet,
    VentaViewSet,
    VentaItemViewSet,
    CarritoViewSet,
    KanbanViewSet,
    ColunaViewSet,
    CardViewSet,
    RegraAutomacaoViewSet,
    HistoricoMovimentacaoViewSet,
    LogNotificacaoViewSet
)

router = DefaultRouter()
router.register(r'clientes', ClienteViewSet)
router.register(r'produtos', ProdutoViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'vendas', VentaViewSet)
router.register(r'venda-items', VentaItemViewSet)
router.register(r'carrito', CarritoViewSet)

# Kanban routes
router.register(r'kanbans', KanbanViewSet)
router.register(r'colunas', ColunaViewSet)
router.register(r'cards', CardViewSet)
router.register(r'regras-automacao', RegraAutomacaoViewSet)
router.register(r'historico-movimentacao', HistoricoMovimentacaoViewSet)
router.register(r'log-notificacao', LogNotificacaoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/registro/', RegistroUsuarioView.as_view(), name='auth_registro'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('usuarios/perfil/', PerfilUsuarioView.as_view(), name='perfil_usuario'),
    path('usuarios/', ListaUsuariosView.as_view(), name='lista_usuarios'),
    path('usuarios/<uuid:pk>/', UsuarioDetailView.as_view(), name='detalle_usuario'),
]