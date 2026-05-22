from rest_framework import serializers
from .models import LecturaSensor

# SCRUM-36: Este es el serializer que procesa lo que envía el ESP32
class LecturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = LecturaSensor
        fields = '__all__'

    def validate_valor(self, value):
        """
        Validación de integridad para asegurar que los datos del robot
        tengan sentido físico (SCRUM-36).
        """
        # Obtenemos el ID del sensor desde los datos iniciales
        sensor_id = self.initial_data.get('sensor')

        # 1. Validación para Sensor de Gas (ID 4)
        if str(sensor_id) == "4":
            if value < 0:
                raise serializers.ValidationError("Error de integridad: El nivel de gas no puede ser negativo.")
            if value > 1023:
                raise serializers.ValidationError("Error de integridad: Valor de gas fuera del rango ADC (0-1023).")

        # 2. Validación para Sensor de Distancia (ID 3)
        if str(sensor_id) == "3":
            if value < 2 or value > 400:
                # El HC-SR04 no es preciso fuera de este rango
                raise serializers.ValidationError("Lectura de distancia fuera de los límites físicos del sensor (2cm - 400cm).")

        # 3. Validación para Temperatura (ID 1)
        if str(sensor_id) == "1":
            if value < -40 or value > 80:
                raise serializers.ValidationError("Temperatura fuera de rango operativo del sensor.")

        return value

# Serializer para listar (Este se queda igual, es solo para lectura)
class LecturaListSerializer(serializers.ModelSerializer):
    tipo = serializers.CharField(source='sensor.tipo')
    robot = serializers.CharField(source='sensor.robot.nombre')

    class Meta:
        model = LecturaSensor
        fields = ['tipo', 'valor', 'fecha', 'robot']