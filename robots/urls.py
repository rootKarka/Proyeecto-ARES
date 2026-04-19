from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import RobotViewSet, control_robot
from .views import ControlViewSet

router = DefaultRouter()
router.register(r'robots', RobotViewSet)
router.register(r'control', ControlViewSet)

urlpatterns = [
    path('control/enviar', control_robot), 
]

urlpatterns += router.urls