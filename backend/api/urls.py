from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import MeView, ClientViewSet

router = DefaultRouter()
router.register(r"clientes", ClientViewSet, basename="cliente")

urlpatterns = [
    path("me/", MeView.as_view(), name="me"),
] + router.urls
