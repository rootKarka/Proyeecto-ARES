from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReporteActualizacionViewSet, ReporteFinalViewSet

router = DefaultRouter()
router.register(r'reportes/actualizacion', ReporteActualizacionViewSet)
router.register(r'reportes/final',         ReporteFinalViewSet)

urlpatterns = [
    path('', include(router.urls)),
]