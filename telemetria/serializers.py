from rest_framework import serializers
from .models import TelemetriaRobot

class TelemetriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TelemetriaRobot
        fields = '__all__'