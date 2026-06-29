from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MisionViewSet

router = DefaultRouter()
router.register(r'misiones', MisionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]