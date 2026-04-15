from rest_framework import viewsets
from .models import LecturaSensor
from .serializers import LecturaSerializer
import requests
from django.http import JsonResponse

class LecturaViewSet(viewsets.ModelViewSet):
    queryset = LecturaSensor.objects.all()
    serializer_class = LecturaSerializer

def analizar_sensor(request):
    url = "http://localhost:8080/api/analizar"

    data = {
        "tipo": "gas",
        "valor": 400
    }

    response = requests.post(url, json=data)

    return JsonResponse(response.json())