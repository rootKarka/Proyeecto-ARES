from rest_framework import serializers
from .models import Bitacora

class BitacoraSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.nombre', read_only=True, default=None)
    mision_nombre  = serializers.CharField(source='mision.nombre', read_only=True)

    class Meta:
        model = Bitacora
        fields = '__all__'