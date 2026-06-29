# serializers.py
from rest_framework import serializers
from .models import LecturaSensor

class LecturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = LecturaSensor
        fields = '__all__'
        # Robot y misión los asigna Django, no el ESP32
        read_only_fields = ['robot', 'nivel_alerta', 'fecha']

    def validate(self, data):
        # Si no viene robot, lo sacamos del sensor automáticamente
        if 'sensor' in data and 'robot' not in data:
            data['robot'] = data['sensor'].robot
        return data

    def create(self, validated_data):
        # Aseguramos nivel_alerta según umbral_critico del sensor
        sensor = validated_data.get('sensor')
        valor  = validated_data.get('valor')

        if sensor and sensor.umbral_critico is not None:
            if valor >= sensor.umbral_critico:
                validated_data['nivel_alerta'] = 'CRITICO'
            elif valor >= sensor.umbral_critico * 0.8:
                validated_data['nivel_alerta'] = 'ADVERTENCIA'
            else:
                validated_data['nivel_alerta'] = 'NORMAL'
        else:
            validated_data['nivel_alerta'] = 'NORMAL'

        return super().create(validated_data)


class LecturaListSerializer(serializers.ModelSerializer):
    tipo  = serializers.CharField(source='sensor.tipo')
    robot = serializers.CharField(source='sensor.robot.nombre')

    class Meta:
        model  = LecturaSensor
        fields = ['id', 'sensor', 'tipo', 'valor', 'fecha',
                  'robot', 'estado_procesamiento', 'nivel_alerta']
