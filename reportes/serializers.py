from rest_framework import serializers
from .models import ReporteActualizacion, ReporteFinal

class ReporteActualizacionSerializer(serializers.ModelSerializer):
    autor_nombre  = serializers.CharField(source='autor.nombre', read_only=True)
    mision_nombre = serializers.CharField(source='mision.nombre', read_only=True)

    class Meta:
        model = ReporteActualizacion
        fields = '__all__'

class ReporteFinalSerializer(serializers.ModelSerializer):
    mision_nombre    = serializers.CharField(source='mision.nombre', read_only=True)
    generado_por_nombre = serializers.CharField(source='generado_por.nombre', read_only=True)

    class Meta:
        model = ReporteFinal
        fields = '__all__'