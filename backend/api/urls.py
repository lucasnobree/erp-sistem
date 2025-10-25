from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    MeView,
    ClientViewSet,
    RegisterView,
    UserViewSet,
    KanbanViewSet,
    KanbanShareViewSet,
    KanbanColumnViewSet,
    KanbanCardViewSet,
)

router = DefaultRouter()
router.register(r"clientes", ClientViewSet, basename="cliente")
router.register(r"usuarios", UserViewSet, basename="usuario")
router.register(r"kanbans", KanbanViewSet, basename="kanban")
router.register(r"kanban/shares", KanbanShareViewSet, basename="kanban-share")
router.register(r"kanban/colunas", KanbanColumnViewSet, basename="kanban-coluna")
router.register(r"kanban/cards", KanbanCardViewSet, basename="kanban-card")

urlpatterns = [
    path("me/", MeView.as_view(), name="me"),
    path("register/", RegisterView.as_view(), name="register"),
] + router.urls
