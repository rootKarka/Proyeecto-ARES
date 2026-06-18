from rest_framework import viewsets
from .models import Robot
from .serializers import RobotSerializer

class RobotViewSet(viewsets.ModelViewSet):
    queryset = Robot.objects.all()  # ← requerido por el router
    serializer_class = RobotSerializer

    def get_queryset(self):
        qs = Robot.objects.all()
        sede = self.request.query_params.get('sede')
        if sede:
            qs = qs.filter(sede=sede)
        return qs