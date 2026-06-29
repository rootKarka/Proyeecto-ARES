# lecturas/urls.py — agregar la ruta de telemetría

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LecturaViewSet, recibir_telemetria

router = DefaultRouter()
router.register(r'lecturas', LecturaViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Telemetría del robot (batería, GPS, latencia)
    path('lecturas/telemetria/', recibir_telemetria, name='recibir_telemetria'),
]