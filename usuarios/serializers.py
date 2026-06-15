from rest_framework import serializers
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        # Excluimos password_hash y token_sesion de las respuestas por seguridad
        fields = ['id', 'nombre', 'email', 'rol', 'telefono', 'activo',
                  'token_push', 'created_at']

class UsuarioCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'