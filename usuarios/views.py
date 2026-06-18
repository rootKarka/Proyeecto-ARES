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

    def get_queryset(self):
        qs = Usuario.objects.all().order_by('-created_at')
        sede = self.request.query_params.get('sede')
        if sede:
            qs = qs.filter(sede=sede)
        return qs

    # Solo operadores activos de una sede — para asignar a misiones
    @action(detail=False, methods=['get'])
    def operadores(self, request):
        sede = request.query_params.get('sede')
        qs = Usuario.objects.filter(rol='OPERADOR', activo=True)
        if sede:
            qs = qs.filter(sede=sede)
        serializer = UsuarioSerializer(qs, many=True)
        return Response(serializer.data)