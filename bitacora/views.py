from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Bitacora
from .serializers import BitacoraSerializer

class BitacoraViewSet(viewsets.ReadOnlyModelViewSet):
    # El admin solo lee la bitácora, la escribe la App Kotlin
    queryset = Bitacora.objects.select_related('mision', 'usuario').order_by('-fecha')
    serializer_class = BitacoraSerializer

    # Endpoint extra: bitácora completa de una misión
    @action(detail=False, methods=['get'], url_path='mision/(?P<mision_id>[^/.]+)')
    def por_mision(self, request, mision_id=None):
        qs = Bitacora.objects.filter(mision_id=mision_id).order_by('-fecha')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)