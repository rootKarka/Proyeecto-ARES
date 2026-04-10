from rest_framework import serializers
from .models import LecturaSensor

class LecturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = LecturaSensor
        fields = '__all__'