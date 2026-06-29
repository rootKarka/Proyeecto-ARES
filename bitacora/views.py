# bitacora/views.py
# CAMBIO: ReadOnlyModelViewSet → ModelViewSet para que Kotlin pueda hacer POST

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Bitacora
from .serializers import BitacoraSerializer

class BitacoraViewSet(viewsets.ModelViewSet):  # ← cambio aquí
    """
    GET  /api/bitacora/              → lista todas
    GET  /api/bitacora/{id}/         → detalle
    POST /api/bitacora/              → Kotlin crea nueva entrada  ← NUEVO
    GET  /api/bitacora/mision/{id}/  → bitácora de una misión
    """
    queryset = Bitacora.objects.select_related(
        'mision', 'usuario'
    ).order_by('fecha')  # orden cronológico para Kotlin
    serializer_class = BitacoraSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        # Filtrar por misión si se pasa como query param
        # GET /api/bitacora/?mision=1
        mision_id = self.request.query_params.get('mision')
        if mision_id:
            qs = qs.filter(mision_id=mision_id)
        return qs

    # Endpoint extra: bitácora completa de una misión
    @action(detail=False, methods=['get'], url_path='mision/(?P<mision_id>[^/.]+)')
    def por_mision(self, request, mision_id=None):
        qs = Bitacora.objects.filter(
            mision_id=mision_id
        ).order_by('fecha')  # cronológico para Kotlin
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)