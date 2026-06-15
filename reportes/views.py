from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ReporteActualizacion, ReporteFinal
from .serializers import ReporteActualizacionSerializer, ReporteFinalSerializer

class ReporteActualizacionViewSet(viewsets.ModelViewSet):
    queryset = ReporteActualizacion.objects.select_related(
        'autor', 'mision'
    ).order_by('-created_at')
    serializer_class = ReporteActualizacionSerializer

    # Endpoint extra: reportes de una misión específica
    @action(detail=False, methods=['get'], url_path='mision/(?P<mision_id>[^/.]+)')
    def por_mision(self, request, mision_id=None):
        qs = ReporteActualizacion.objects.filter(mision_id=mision_id).order_by('-created_at')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

class ReporteFinalViewSet(viewsets.ModelViewSet):
    queryset = ReporteFinal.objects.select_related(
        'mision', 'generado_por'
    ).order_by('-created_at')
    serializer_class = ReporteFinalSerializer