from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import LecturaViewSet, analizar_sensor

router = DefaultRouter()
router.register(r'lecturas', LecturaViewSet)

urlpatterns = router.urls + [

    path('analizar/', analizar_sensor),
]