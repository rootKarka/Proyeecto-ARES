from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'nombre', 'email', 'rol', 'sede', 'telefono',
                  'activo', 'token_push', 'created_at']

# 👇 MODIFICAMOS ESTE PARA QUE ENCRIPTE EN AUTOMÁTICO 👇
class UsuarioCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'

    def create(self, validated_data):
        # Capturamos la contraseña que viene en texto plano
        raw_password = validated_data.get('password_hash')
        if raw_password:
            # La encriptamos con el algoritmo de Django antes de guardarla en la BD
            validated_data['password_hash'] = make_password(raw_password)
        
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Hacemos lo mismo por si en el futuro actualizas al usuario desde el panel
        raw_password = validated_data.get('password_hash')
        if raw_password:
            validated_data['password_hash'] = make_password(raw_password)
            
        return super().update(instance, validated_data)
