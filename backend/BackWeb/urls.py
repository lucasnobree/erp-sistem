from django.contrib import admin
from django.urls import path, include
from mi_app.views import api_welcome

urlpatterns = [
    path('', api_welcome, name='api_welcome'),  # Tela de boas vinda na raiz
    path('admin/', admin.site.urls),
    path('api/', include('mi_app.urls')),
]
