# views.py
import threading
import requests
from rest_framework import viewsets
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
        # Robot se asigna en el serializer automáticamente desde sensor
        lectura = serializer.save()

        # Actualizar ultima_lectura en el sensor
        sensor = lectura.sensor
        sensor.ultima_lectura_valor = lectura.valor
        sensor.ultima_lectura_fecha = lectura.fecha
        sensor.save(update_fields=['ultima_lectura_valor', 'ultima_lectura_fecha'])

        # Análisis asíncrono con Spring (sin bloquear el 201 al ESP32)
        def tarea_analisis_asincrona(obj_lectura):
            url_spring = "http://localhost:8080/api/analizar"
            data = {
                "tipo":  obj_lectura.sensor.tipo,
                "valor": obj_lectura.valor
            }
            try:
                response = requests.post(url_spring, json=data, timeout=2)
                if response.status_code == 200:
                    result = response.json()
                    if result.get("nivel") != "NORMAL":
                        Alerta.objects.create(
                            nivel           = result.get("nivel", "INFO"),
                            tipo            = result.get("tipo", "GAS_TOXICO"),
                            mensaje         = result.get("mensaje", "Sin mensaje"),
                            lectura         = obj_lectura,
                            robot           = obj_lectura.robot,
                            mision          = obj_lectura.mision,
                            valor_detectado = obj_lectura.valor,
                            latitud         = obj_lectura.latitud,
                            longitud        = obj_lectura.longitud
                        )
            except Exception as e:
                print(f"[Spring] Error: {e}")

        hilo = threading.Thread(target=tarea_analisis_asincrona, args=(lectura,))
        hilo.start()