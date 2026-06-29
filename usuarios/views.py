from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.hashers import check_password
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

    # 👇 NUEVO ENDPOINT PARA EL LOGIN 👇
    @action(detail=False, methods=['post'])
    def login(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        # Validación básica de campos vacíos
        if not email or not password:
            return Response(
                {"status": "error", "message": "Email y contraseña son requeridos"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # 1. Buscamos al usuario por email y que esté activo
            usuario = Usuario.objects.get(email=email, activo=True)
            
            # 2. ⚠️ ESTO DEBE ESTAR ADENTRO DEL TRY ⚠️
            # Verificamos la contraseña contra el hash de la BD
            if check_password(password, usuario.password_hash):
                serializer = UsuarioSerializer(usuario)
                return Response({
                    "status": "success",
                    "message": "Autenticación exitosa",
                    "usuario": serializer.data
                }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"status": "error", "message": "Contraseña incorrecta"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

        except Usuario.DoesNotExist:
            # Si entra aquí, la variable 'usuario' no existe, pero ya no importa 
            # porque respondemos limpiamente con un 404 sin que se muera el servidor
            return Response(
                {"status": "error", "message": "El usuario no existe o está inactivo"}, 
                status=status.HTTP_404_NOT_FOUND
            )