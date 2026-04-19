from rest_framework import serializers
from .models import Alerta

class AlertaSerializer(serializers.ModelSerializer):
    valor = serializers.FloatField(source='lectura.valor')
    

    class Meta:
        model = Alerta
        fields = ['nivel', 'mensaje', 'fecha', 'valor']