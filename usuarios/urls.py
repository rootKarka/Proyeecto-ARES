from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet

router = DefaultRouter()
# El primer parámetro 'usuarios' será el prefijo de la URL.
router.register(r'usuarios', UsuarioViewSet, basename='usuario')

urlpatterns = [
    path('', include(router.urls)),

    # Al meter 'api/' e incluir router.urls, todas tus rutas empezarán con /api/
    path('api/', include(router.urls)),
]