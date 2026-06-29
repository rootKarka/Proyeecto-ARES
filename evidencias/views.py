# evidencias/views.py
# CAMBIO: agregar soporte multipart para que Kotlin suba fotos

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from .models import Evidencia
from .serializers import EvidenciaSerializer


class EvidenciaViewSet(viewsets.ModelViewSet):
    """
    POST /api/evidencias/         → Kotlin sube foto (multipart/form-data)
    GET  /api/evidencias/mision/{id}/ → fotos de una misión

    Kotlin envía multipart/form-data con:
    - mision:      1
    - usuario:     1
    - tipo:        FOTO
    - archivo:     <imagen>
    - descripcion: "Evidencia final de la escena"
    - latitud:     0
    - longitud:    0
    """
    queryset = Evidencia.objects.select_related(
        'mision', 'robot', 'usuario'
    ).order_by('-fecha_captura')
    serializer_class = EvidenciaSerializer

    # Aceptar multipart (fotos) además de JSON
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def create(self, request, *args, **kwargs):
        """
        Sobreescribe create para calcular tamanio_bytes automáticamente
        y establecer tipo=FOTO si Kotlin no lo envía.
        """
        data = request.data.copy()

        # Tipo por defecto si Kotlin no lo envía
        if 'tipo' not in data:
            data['tipo'] = 'FOTO'

        # Calcular tamaño del archivo automáticamente
        archivo = request.FILES.get('archivo')
        if archivo:
            data['tamanio_bytes'] = archivo.size

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='mision/(?P<mision_id>[^/.]+)')
    def por_mision(self, request, mision_id=None):
        qs = Evidencia.objects.filter(
            mision_id=mision_id
        ).order_by('-fecha_captura')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)