from rest_framework import serializers
from .models import MensajeOperador, Notificacion

class MensajeOperadorSerializer(serializers.ModelSerializer):
    remitente_nombre    = serializers.CharField(source='remitente.nombre', read_only=True)
    destinatario_nombre = serializers.CharField(source='destinatario.nombre', read_only=True)

    class Meta:
        model = MensajeOperador
        fields = '__all__'

class NotificacionSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.nombre', read_only=True)

    class Meta:
        model = Notificacion
        fields = '__all__'