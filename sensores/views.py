from rest_framework import viewsets
from .models import Sensor
from .serializers import SensorSerializer

class SensorViewSet(viewsets.ModelViewSet):
    queryset = Sensor.objects.all()  # ← requerido por el router
    serializer_class = SensorSerializer

    def get_queryset(self):
        qs = Sensor.objects.all()
        sede = self.request.query_params.get('sede')
        if sede:
            qs = qs.filter(robot__sede=sede)
        return qs