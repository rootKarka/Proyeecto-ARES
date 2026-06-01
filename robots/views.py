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
    # Recibimos los nuevos nombres de los campos
    tipo_comando = request.data.get('tipo_comando')
    robot_id = request.data.get('robot')
    
    # Si la app de Kotlin sigue enviando 'velocidad' y 'duracion' sueltos, 
    # los atrapamos y los metemos en el JSON 'parametros' que exige el modelo.
    parametros = request.data.get('parametros', {})
    if not parametros:
        parametros = {
            "velocidad": request.data.get('velocidad', 0),
            "duracion": request.data.get('duracion', 0)
        }

    # Obtenemos la lista de comandos válidos directamente del modelo para no repetir código
    comandos_validos = [choice[0] for choice in Control.TIPO_CHOICES]

    if tipo_comando not in comandos_validos:
        return Response({
            "status": "error",
            "mensaje": f"Comando inválido. Usa uno de: {comandos_validos}"
        }, status=400)

    try:
        # Creamos el registro con la nueva estructura
        control = Control.objects.create(
            robot_id=robot_id,
            tipo_comando=tipo_comando,
            parametros=parametros,
            estado='ENVIADO' # Estado inicial por defecto
        )

        return Response({
            "status": "ok",
            "id": control.id,
            "mensaje": "Comando encolado correctamente"
        })
    except Exception as e:
        return Response({
            "status": "error",
            "mensaje": str(e)
        }, status=500)