from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Robot, Control
from .serializers import RobotSerializer, ControlSerializer

# ViewSet para gestionar robots
class RobotViewSet(viewsets.ModelViewSet):
    queryset = Robot.objects.all()
    serializer_class = RobotSerializer

#Para visualizar  los controles enviados a los robots
class ControlViewSet(viewsets.ModelViewSet):
    queryset = Control.objects.all()
    serializer_class = ControlSerializer

# Endpoint para enviar comandos a los robots
@api_view(['POST'])
def control_robot(request):
    comando = request.data.get('comando')
    robot_id = request.data.get('robot')
    velocidad = request.data.get('velocidad', 0)
    duracion = request.data.get('duracion', 0)

    comandos_validos = ["avanzar", "detener", "izquierda", "derecha"]

    if comando not in comandos_validos:
        return Response({
            "status": "error",
            "mensaje": "Comando inválido"
        }, status=400)

    control = Control.objects.create(
        robot_id=robot_id,
        comando=comando,
        velocidad=velocidad,
        duracion=duracion
    )

    return Response({
        "status": "ok",
        "id": control.id
    })