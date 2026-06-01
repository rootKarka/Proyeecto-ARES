from rest_framework import serializers
from .models import LecturaSensor

# SCRUM-36: Este es el serializer que procesa lo que envía el ESP32
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
<<<<<<< HEAD
        # AQUÍ ESTÁ LA MAGIA: Agregamos 'id', 'sensor' y 'estado_procesamiento'
        fields = ['id', 'sensor', 'tipo', 'valor', 'fecha', 'robot', 'estado_procesamiento']
=======
        fields = ['id', 'sensor', 'tipo', 'valor', 'fecha', 'robot']
>>>>>>> ad6ae9bc8b9e0515826d1134ac5c1cfae274c1db
