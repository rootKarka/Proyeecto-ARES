import threading  # Permite que Django haga dos cosas a la vez
import requests
from rest_framework import viewsets
from rest_framework.decorators import api_view
from django.http import JsonResponse

from .models import LecturaSensor
from .serializers import LecturaSerializer, LecturaListSerializer
from alertas.models import Alerta

class LecturaViewSet(viewsets.ModelViewSet):
    queryset = LecturaSensor.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return LecturaListSerializer
        return LecturaSerializer

    def perform_create(self, serializer):
        # 1. GUARDADO INMEDIATO:
        # Django guarda y genera el ID de la lectura.
        lectura = serializer.save()

        # 2. FUNCIÓN DE ANÁLISIS (Tarea en segundo plano):
        # Esta función contiene la lógica que tarda (comunicación con Spring).
        def tarea_analisis_asincrona(obj_lectura):
            url_spring = "http://localhost:8080/api/analizar"
            
            # Usamos el tipo real del sensor ("gas", "temperatura", etc.) 
            # que vimos en las capturas de tu base de datos.
            data = {
                "tipo": obj_lectura.sensor.tipo,
                "valor": obj_lectura.valor
            }

            try:
                # Enviamos a Spring Boot con un tiempo de espera máximo de 2 segundos
                response = requests.post(url_spring, json=data, timeout=2)

                if response.status_code == 200:
                    result = response.json()
                    
                    # Si Spring detecta algo que NO sea nivel "NORMAL", creamos la alerta
                    if result.get("nivel") != "NORMAL":
                        Alerta.objects.create(
                            nivel=result.get("nivel", "INFO"),
                            tipo=result.get("tipo", "GAS_TOXICO"),
                            mensaje=result.get("mensaje", "Sin mensaje"),
                            lectura=obj_lectura,
                            robot=obj_lectura.robot,
                            mision=obj_lectura.mision,
                            valor_detectado=obj_lectura.valor,
                            latitud=obj_lectura.latitud,
                            longitud=obj_lectura.longitud
                        )
            except Exception as e:
                # Si Spring está apagado o hay error, lo imprime en la consola de Django
                # pero NO detiene al robot.
                print(f"Error en comunicación con Spring: {e}")

        # 3. LANZAMIENTO DEL HILO (Threading):
        # Aquí es donde ocurre la magia. Se dispara la función de arriba 
        # y Django sigue adelante inmediatamente sin esperar respuesta.
        hilo = threading.Thread(target=tarea_analisis_asincrona, args=(lectura,))
        hilo.start()

        # Al terminar esta función, Django le envía el "201 Created" al ESP32.
        # El robot recibe el OK mientras el hilo apenas está hablando con Spring.


# 🔹 VISTA DE PRUEBA (MANTENIDA PARA TESTEAR SPRING)
"""
@api_view(['GET'])
def analizar_sensor(request):
    url = "http://localhost:8080/api/analizar"
    data = {
        "tipo": "gas",
        "valor": 100
    }
    try:
        response = requests.post(url, json=data, timeout=2)
        return JsonResponse(response.json())
    except:
        return JsonResponse({
            "nivel": "NORMAL",
            "mensaje": "Error conectando con Spring"
        })
"""