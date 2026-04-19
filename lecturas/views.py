from rest_framework import viewsets
from rest_framework.decorators import api_view
from .models import LecturaSensor
from .serializers import LecturaSerializer, LecturaListSerializer
import requests
from django.http import JsonResponse
from rest_framework.response import Response
from alertas.models import Alerta


class LecturaViewSet(viewsets.ModelViewSet):
    queryset = LecturaSensor.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return LecturaListSerializer
        return LecturaSerializer
    
    # logica para crear alertas al guardar una lectura, solo para hacer pruebas 
    def perform_create(self, serializer):
        lectura = serializer.save()

        if lectura.valor > 300:
            Alerta.objects.create(
                nivel="alto",
                mensaje="Valor crítico detectado",
                lectura=lectura
            )
        elif lectura.valor > 100:
            Alerta.objects.create(
                nivel="medio",
                mensaje="Valor elevado",
                lectura=lectura
            )





#   spring boot endpoint

def analizar_sensor(request):
    url = "http://localhost:8080/api/analizar"

    data = {
        "tipo": "gas",
        "valor": 400
    }

    response = requests.post(url, json=data)

    return JsonResponse(response.json())


