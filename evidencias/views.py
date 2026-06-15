from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Evidencia
from .serializers import EvidenciaSerializer

class EvidenciaViewSet(viewsets.ModelViewSet):
    queryset = Evidencia.objects.select_related(
        'mision', 'robot', 'usuario'
    ).order_by('-fecha_captura')
    serializer_class = EvidenciaSerializer

    # Endpoint extra: evidencias de una misión
    @action(detail=False, methods=['get'], url_path='mision/(?P<mision_id>[^/.]+)')
    def por_mision(self, request, mision_id=None):
        qs = Evidencia.objects.filter(mision_id=mision_id).order_by('-fecha_captura')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)