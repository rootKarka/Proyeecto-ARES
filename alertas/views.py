from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Alerta
from .serializers import AlertaSerializer

@api_view(['GET'])
def listar_alertas(request):
    alertas = Alerta.objects.select_related('lectura').all()
    serializer = AlertaSerializer(alertas, many=True)
    return Response(serializer.data)