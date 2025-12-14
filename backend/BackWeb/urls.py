from django.contrib import admin
from django.urls import path, include
from mi_app.views import api_welcome
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path('', api_welcome, name='api_welcome'),  # Tela de boas vinda na raiz
    path('admin/', admin.site.urls),
    path('api/', include('mi_app.urls')),

    # Swagger/OpenAPI Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
