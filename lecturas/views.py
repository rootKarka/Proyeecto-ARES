from rest_framework import viewsets
from .models import LecturaSensor
from .serializers import LecturaSerializer, LecturaListSerializer
import requests
from alertas.models import Alerta
from rest_framework.decorators import api_view
from django.http import JsonResponse


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
            "tipo": "gas",  # puedes luego usar lectura.sensor.tipo
            "valor": lectura.valor
        }

        try:
            response = requests.post(url, json=data)

            if response.status_code == 200:
                result = response.json()

                Alerta.objects.create(
                    nivel=result.get("nivel", "desconocido"),
                    mensaje=result.get("mensaje", "Sin mensaje"),
                    lectura=lectura
                )

        except Exception:
            # Opcional: podrías loguear el error
            pass


# 🔹 SOLO PARA PRUEBA (OPCIONAL)
@api_view(['GET'])
def analizar_sensor(request):

    url = "http://localhost:8080/api/analizar"

    data = {
        "tipo": "gas",
        "valor": 400
    }

    try:
        response = requests.post(url, json=data)
        return JsonResponse(response.json())

    except:
        return JsonResponse({
            "nivel": "bajo",
            "mensaje": "Error conectando con Spring"
        })