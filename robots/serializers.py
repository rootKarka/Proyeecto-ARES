from rest_framework import serializers
from .models import Robot, Control

class ControlSerializer(serializers.ModelSerializer):
    class Meta:
        model = Control
        fields = ['comando', 'velocidad', 'duracion', 'estado', 'fecha']


class RobotSerializer(serializers.ModelSerializer):
    controles = ControlSerializer(many=True, read_only=True)

    class Meta:
        model = Robot
        fields = '__all__'