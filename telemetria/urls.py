from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TelemetriaViewSet

router = DefaultRouter()
router.register(r'telemetria', TelemetriaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]