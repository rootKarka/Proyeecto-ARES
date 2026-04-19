from rest_framework import serializers
from .models import LecturaSensor

#Para crear o actualizar lecturas
class LecturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = LecturaSensor
        fields = '__all__'

# Serializer para listar lecturas con detalles del sensor y robot
class LecturaListSerializer(serializers.ModelSerializer):
    tipo = serializers.CharField(source='sensor.tipo')
    robot = serializers.CharField(source='sensor.robot.nombre')

    class Meta:
        model = LecturaSensor
        fields = ['tipo', 'valor', 'fecha', 'robot']