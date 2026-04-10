from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from robots.views import RobotViewSet
from sensores.views import SensorViewSet
from lecturas.views import LecturaViewSet

router = DefaultRouter()
router.register(r'robots', RobotViewSet)
router.register(r'sensores', SensorViewSet)
router.register(r'lecturas', LecturaViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
