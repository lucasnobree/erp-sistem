"""
Project URL configuration for erp.
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)
from api.views import (
    JWTObtainPairView,
    JWTRefreshView,
    JWTVerifyView,
)

urlpatterns = [
    # Home -> Swagger UI
    path('', RedirectView.as_view(url='/api/docs/', permanent=False)),
    path('admin/', admin.site.urls),

    # JWT Authentication endpoints (com documentação/tag "Authentication")
    path('api/token/', JWTObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', JWTRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', JWTVerifyView.as_view(), name='token_verify'),

    # API routes
    path('api/', include('api.urls')),

    # API schema and documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
