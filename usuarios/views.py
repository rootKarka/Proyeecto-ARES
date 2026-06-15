from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Usuario
from .serializers import UsuarioSerializer, UsuarioCreateSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all().order_by('-created_at')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return UsuarioCreateSerializer
        return UsuarioSerializer

    # Endpoint extra: solo operadores activos (para asignar a misiones)
    @action(detail=False, methods=['get'])
    def operadores(self, request):
        qs = Usuario.objects.filter(rol='OPERADOR', activo=True)
        serializer = UsuarioSerializer(qs, many=True)
        return Response(serializer.data)