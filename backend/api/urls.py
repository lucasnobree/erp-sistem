from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    MeView,
    ClientViewSet,
    RegisterView,
    KanbanColumnViewSet,
    KanbanCardViewSet,
)

router = DefaultRouter()
router.register(r"clientes", ClientViewSet, basename="cliente")
router.register(r"kanban/colunas", KanbanColumnViewSet, basename="kanban-coluna")
router.register(r"kanban/cards", KanbanCardViewSet, basename="kanban-card")

urlpatterns = [
    path("me/", MeView.as_view(), name="me"),
    path("register/", RegisterView.as_view(), name="register"),
] + router.urls
