from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Alerta
from .serializers import AlertaSerializer

@api_view(['GET'])
def listar_alertas(request):
    qs = Alerta.objects.select_related('lectura', 'robot', 'mision').all()
    sede = request.query_params.get('sede')
    if sede:
        qs = qs.filter(robot__sede=sede)
    serializer = AlertaSerializer(qs, many=True)
    return Response(serializer.data)