# lecturas/views.py — versión mejorada con sistema mixto
#
# ESTRATEGIA:
# - Datos crudos de alta frecuencia → WebSocket INMEDIATO, NO guarda en BD
# - Cada N lecturas (snapshot) → SÍ guarda en BD para historial
# - Spring Boot analiza en thread separado → solo crea Alerta si es anormal

import threading
import requests
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .models import LecturaSensor
from .serializers import LecturaSerializer, LecturaListSerializer
from alertas.models import Alerta

# ── Contador para snapshot (guardar cada N lecturas) ──────────────
_contadores = {}   # { robot_id: { sensor_tipo: count } }
SNAPSHOT_CADA = 10  # guardar 1 de cada 10 lecturas en BD


class LecturaViewSet(viewsets.ModelViewSet):
    queryset = LecturaSensor.objects.all()

    def get_queryset(self):
        qs = LecturaSensor.objects.all()
        sede = self.request.query_params.get('sede')
        if sede:
            qs = qs.filter(robot__sede=sede)
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return LecturaListSerializer
        return LecturaSerializer

    def perform_create(self, serializer):
        data      = self.request.data
        robot_id  = data.get('robot')
        tipo      = data.get('tipo_sensor', '')   # el ESP32 puede enviar esto extra
        valor     = float(data.get('valor', 0))
        mision_id = data.get('mision')

        # ── PASO 1: WebSocket INMEDIATO (sin guardar en BD) ───────
        # Kotlin y React reciben los datos crudos en tiempo real
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "sensores",
            {
                "type": "sensor_update",
                "data": {
                    "sensor_id":  data.get('sensor'),
                    "tipo":       tipo,
                    "valor":      valor,
                    "robot_id":   robot_id,
                    "mision_id":  mision_id,
                    "latitud":    data.get('latitud', 0),
                    "longitud":   data.get('longitud', 0),
                    "guardado":   False,   # indica que es dato crudo, no histórico
                }
            }
        )

        # ── PASO 2: Decidir si guardar en BD (snapshot) ──────────
        key = f"{robot_id}_{tipo}"
        _contadores[key] = _contadores.get(key, 0) + 1
        guardar_en_bd = (_contadores[key] % SNAPSHOT_CADA == 0)

        lectura = None
        if guardar_en_bd:
            lectura = serializer.save()

            # Actualizar ultima_lectura en el Sensor
            sensor = lectura.sensor
            sensor.ultima_lectura_valor = lectura.valor
            sensor.ultima_lectura_fecha = lectura.fecha
            sensor.save(update_fields=['ultima_lectura_valor', 'ultima_lectura_fecha'])

        # ── PASO 3: Spring Boot analiza en thread separado ────────
        # Solo llama Spring si hay una lectura guardada O si el valor
        # supera el umbral crítico del sensor (para no perder alertas)
        sensor_obj = None
        try:
            from sensores.models import Sensor
            sensor_obj = Sensor.objects.filter(
                id=data.get('sensor')
            ).first()
        except Exception:
            pass

        umbral_superado = (
            sensor_obj and
            sensor_obj.umbral_critico is not None and
            valor >= sensor_obj.umbral_critico
        )

        if guardar_en_bd or umbral_superado:
            def analisis_spring(obj_lectura, valor_raw, tipo_raw, robot_raw, mision_raw,
                                lat, lng):
                url_spring = "http://localhost:8080/api/analizar"
                payload    = {"tipo": tipo_raw, "valor": valor_raw}
                try:
                    resp = requests.post(url_spring, json=payload, timeout=2)
                    if resp.status_code == 200:
                        result = resp.json()
                        nivel  = result.get("nivel", "NORMAL")

                        if nivel != "NORMAL":
                            # Crear alerta en Django
                            alerta = Alerta.objects.create(
                                nivel           = nivel,
                                tipo            = result.get("tipo",    "GAS_TOXICO"),
                                mensaje         = result.get("mensaje", "Sin mensaje"),
                                lectura         = obj_lectura,
                                robot_id        = robot_raw,
                                mision_id       = mision_raw,
                                valor_detectado = valor_raw,
                                latitud         = lat,
                                longitud        = lng,
                            )

                            # Notificar la alerta por WebSocket a Kotlin/React
                            cl = get_channel_layer()
                            async_to_sync(cl.group_send)(
                                "sensores",
                                {
                                    "type": "sensor_update",
                                    "data": {
                                        "es_alerta":    True,
                                        "alerta_id":    alerta.id,
                                        "nivel":        nivel,
                                        "tipo":         result.get("tipo"),
                                        "mensaje":      result.get("mensaje"),
                                        "valor":        valor_raw,
                                        "robot_id":     robot_raw,
                                        "mision_id":    mision_raw,
                                        "nivel_riesgo": nivel,
                                    }
                                }
                            )
                except Exception as e:
                    print(f"[Spring] Error: {e}")

            hilo = threading.Thread(
                target=analisis_spring,
                args=(
                    lectura,
                    valor,
                    tipo,
                    robot_id,
                    mision_id,
                    data.get('latitud', 0),
                    data.get('longitud', 0),
                )
            )
            hilo.start()


# ── Endpoint separado para telemetría del robot ───────────────────
# (batería, GPS, latencia — viene en un POST distinto del ESP32)
@api_view(['POST'])
def recibir_telemetria(request):
    """
    El ESP32 envía telemetría del robot (no de sensores) aquí.
    POST /api/lecturas/telemetria/

    Body:
    {
        "robot_id":    1,
        "mision_id":   1,
        "bateria":     84.0,
        "latitud":     -8.11,
        "longitud":    -79.02,
        "velocidad":   0.5,
        "latencia_ms": 12,
        "rssi":        -65,
        "inclinacion_lateral": 0,
        "inclinacion_frontal":  0,
        "modo": "MANUAL"
    }
    """
    data = request.data

    # Siempre guarda telemetría (frecuencia más baja que lecturas de sensor)
    try:
        from telemetria.models import TelemetriaRobot
        TelemetriaRobot.objects.create(
            robot_id            = data.get('robot_id',  1),
            mision_id           = data.get('mision_id'),
            latitud             = data.get('latitud',   0),
            longitud            = data.get('longitud',  0),
            velocidad           = float(data.get('velocidad', 0)),
            bateria_nivel       = float(data.get('bateria',   0)),
            senal_rssi          = int(data.get('rssi',        0)),
            latencia_ms         = int(data.get('latencia_ms', 0)),
            inclinacion_lateral = float(data.get('inclinacion_lateral', 0)),
            inclinacion_frontal = float(data.get('inclinacion_frontal', 0)),
            modo_conduccion     = data.get('modo', 'MANUAL'),
        )
    except Exception as e:
        print(f"[Telemetria] Error guardando: {e}")

    # WebSocket con datos del robot para Kotlin/React
    try:
        bateria  = float(data.get('bateria', 0))
        latencia = int(data.get('latencia_ms', 0))

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "sensores",
            {
                "type": "sensor_update",
                "data": {
                    "es_telemetria": True,
                    "bateria":       bateria,
                    "latencia_ms":   latencia,
                    "rssi":          int(data.get('rssi', 0)),
                    "velocidad":     float(data.get('velocidad', 0)),
                    "latitud":       float(data.get('latitud',   0)),
                    "longitud":      float(data.get('longitud',  0)),
                    "robot_id":      data.get('robot_id'),
                    "mision_id":     data.get('mision_id'),
                    # Color de batería para Kotlin
                    "bateria_nivel": (
                        "CRITICO"    if bateria < 20 else
                        "ADVERTENCIA" if bateria < 50 else
                        "NORMAL"
                    ),
                    # Color de latencia para Kotlin
                    "latencia_nivel": (
                        "CRITICO"    if latencia > 200 else
                        "ADVERTENCIA" if latencia > 100 else
                        "NORMAL"
                    ),
                }
            }
        )
    except Exception as e:
        print(f"[Telemetria WS] Error: {e}")

    return Response({"status": "ok"}, status=201)