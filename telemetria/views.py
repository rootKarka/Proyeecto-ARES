from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import TelemetriaRobot
from .serializers import TelemetriaSerializer

class TelemetriaViewSet(viewsets.ModelViewSet):
    queryset = TelemetriaRobot.objects.all().order_by('-fecha')
    serializer_class = TelemetriaSerializer

    # Endpoint extra: últimas N lecturas de un robot específico
    @action(detail=False, methods=['get'], url_path='robot/(?P<robot_id>[^/.]+)')
    def por_robot(self, request, robot_id=None):
        qs = TelemetriaRobot.objects.filter(robot_id=robot_id).order_by('-fecha')[:50]
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)