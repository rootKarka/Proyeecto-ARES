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

   
    def perform_create(self, serializer):
        lectura = serializer.save()

        url = "http://localhost:8080/api/analizar"

        data = {
            "tipo": "gas",  # para pruebas
            "valor": lectura.valor
        }

        try:
            response = requests.post(url, json=data)

            if response.status_code == 200:
                result = response.json()

                print("Respuesta Spring:", result)

                Alerta.objects.create(
                    nivel=result.get("nivel", "desconocido"),
                    mensaje=result.get("mensaje", "Sin mensaje"),
                    lectura=lectura
                )
            else:
                print("Error HTTP:", response.status_code)

        except Exception as e:
            print("Error conectando con Spring:", e)


#   spring boot endpoint

def analizar_sensor(request):
    url = "http://localhost:8080/api/analizar"

    data = {
        "tipo": "gas",
        "valor": 400
    }

    response = requests.post(url, json=data)

    return JsonResponse(response.json())


