from rest_framework import serializers
from .models import Mision

class MisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mision
        fields = '__all__'