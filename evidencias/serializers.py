from rest_framework import serializers
from .models import Evidencia

class EvidenciaSerializer(serializers.ModelSerializer):
    mision_nombre  = serializers.CharField(source='mision.nombre', read_only=True)
    usuario_nombre = serializers.CharField(source='usuario.nombre', read_only=True, default=None)

    class Meta:
        model = Evidencia
        fields = '__all__'