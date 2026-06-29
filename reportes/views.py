# reportes/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Count, Min, Max, Sum
from django.utils import timezone

from .models import ReporteActualizacion, ReporteFinal
from .serializers import ReporteActualizacionSerializer, ReporteFinalSerializer


class ReporteActualizacionViewSet(viewsets.ModelViewSet):
    """
    POST /api/reportes/actualizacion/ → Kotlin: ENVIAR ACTUALIZACIÓN
    GET  /api/reportes/actualizacion/ → lista todos
    GET  /api/reportes/actualizacion/mision/{id}/ → por misión
    """
    queryset = ReporteActualizacion.objects.select_related(
        'autor', 'mision'
    ).order_by('-created_at')
    serializer_class = ReporteActualizacionSerializer

    @action(detail=False, methods=['get'], url_path='mision/(?P<mision_id>[^/.]+)')
    def por_mision(self, request, mision_id=None):
        qs = ReporteActualizacion.objects.filter(
            mision_id=mision_id
        ).order_by('-created_at')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class ReporteFinalViewSet(viewsets.ModelViewSet):
    """
    POST /api/reportes/final/ → Kotlin: ENVIAR A BASE
    Kotlin envía: mision, generado_por, victimas_*, nivel_riesgo_maximo, duracion_minutos
    Django calcula el resto automáticamente desde TelemetriaRobot, LecturaSensor y Alerta
    """
    queryset = ReporteFinal.objects.select_related(
        'mision', 'generado_por'
    ).order_by('-created_at')
    serializer_class = ReporteFinalSerializer

    def create(self, request, *args, **kwargs):
        mision_id = request.data.get('mision')
        if not mision_id:
            return Response(
                {"error": "El campo 'mision' es requerido"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calcular campos automáticos desde BD
        datos_calculados = self._calcular_datos_mision(int(mision_id))

        # Los datos de Kotlin tienen prioridad sobre los calculados
        data_completa = {**datos_calculados, **request.data}

        # Si ya existe un ReporteFinal para esta misión, actualizar
        instancia = ReporteFinal.objects.filter(mision_id=mision_id).first()
        if instancia:
            serializer = self.get_serializer(instancia, data=data_completa, partial=True)
        else:
            serializer = self.get_serializer(data=data_completa)

        serializer.is_valid(raise_exception=True)
        reporte = serializer.save(estado_generacion='LISTO')

        return Response(
            self.get_serializer(reporte).data,
            status=status.HTTP_201_CREATED
        )

    def _calcular_datos_mision(self, mision_id):
        """
        Calcula automáticamente los campos del ReporteFinal
        usando los modelos reales: TelemetriaRobot, LecturaSensor, Alerta
        """
        resultado = {}

        # ── Desde TelemetriaRobot ─────────────────────────────────
        # bateria_nivel, latencia_ms, senal_rssi, latitud, longitud
        try:
            from telemetria.models import TelemetriaRobot

            telemetrias = TelemetriaRobot.objects.filter(
                mision_id=mision_id
            ).order_by('fecha')

            total_tel = telemetrias.count()

            if total_tel > 0:
                primera = telemetrias.first()
                ultima  = telemetrias.last()
                agr     = telemetrias.aggregate(
                    prom_latencia = Avg('latencia_ms'),
                    prom_rssi     = Avg('senal_rssi'),
                )

                resultado['total_snapshots_telemetria'] = total_tel
                resultado['bateria_inicio']             = primera.bateria_nivel or 0
                resultado['bateria_fin']                = ultima.bateria_nivel  or 0
                resultado['tiempo_promedio_alerta_ms']  = int(agr['prom_latencia'] or 0)
                resultado['promedio_senal_rssi']        = float(agr['prom_rssi']   or 0)

                # Trayectoria GPS desde telemetría
                coordenadas = list(
                    telemetrias
                    .exclude(latitud=0).exclude(longitud=0)
                    .values('latitud', 'longitud')
                )
                resultado['coordenadas_trayectoria'] = [
                    {"lat": float(c['latitud']), "lng": float(c['longitud'])}
                    for c in coordenadas
                ]

                # Distancia recorrida (suma de desplazamientos entre puntos GPS)
                resultado['distancia_recorrida_m'] = _calcular_distancia(coordenadas)

        except Exception as e:
            pass

        # ── Desde LecturaSensor ───────────────────────────────────
        # valor es genérico — agrupar por tipo de sensor
        try:
            from lecturas.models import LecturaSensor
            from sensores.models import Sensor

            lecturas = LecturaSensor.objects.filter(mision_id=mision_id)
            resultado['total_lecturas'] = lecturas.count()

            # Resumen por tipo de sensor
            resumen_sensores = []
            for tipo in ['GAS', 'TEMPERATURA', 'SONIDO']:
                sensores_tipo = Sensor.objects.filter(tipo=tipo, activo=True)
                lects_tipo    = lecturas.filter(sensor__in=sensores_tipo)
                if lects_tipo.exists():
                    agr = lects_tipo.aggregate(
                        minv=Min('valor'), maxv=Max('valor'), prom=Avg('valor')
                    )
                    # Obtener unidad del primer sensor de ese tipo
                    unidad = sensores_tipo.first().unidad if sensores_tipo.exists() else ''
                    resumen_sensores.append({
                        "sensor":   tipo,
                        "unidad":   unidad,
                        "min":      round(agr['minv'] or 0, 2),
                        "max":      round(agr['maxv'] or 0, 2),
                        "promedio": round(agr['prom']  or 0, 2),
                    })
            resultado['resumen_sensores'] = resumen_sensores

        except Exception:
            pass

        # ── Desde Alerta ──────────────────────────────────────────
        # nivel usa: INFO, ADVERTENCIA, CRITICO, EMERGENCIA
        try:
            from alertas.models import Alerta

            alertas = Alerta.objects.filter(mision_id=mision_id)
            resultado['total_alertas']       = alertas.count()
            resultado['alertas_criticas']    = alertas.filter(
                nivel__in=['CRITICO', 'EMERGENCIA']
            ).count()
            resultado['alertas_advertencia'] = alertas.filter(
                nivel='ADVERTENCIA'
            ).count()

            # Nivel de riesgo máximo
            if alertas.filter(nivel='EMERGENCIA').exists():
                resultado['nivel_riesgo_maximo'] = 'CRITICO'
            elif alertas.filter(nivel='CRITICO').exists():
                resultado['nivel_riesgo_maximo'] = 'CRITICO'
            elif alertas.filter(nivel='ADVERTENCIA').exists():
                resultado['nivel_riesgo_maximo'] = 'PRECAUCION'
            else:
                resultado['nivel_riesgo_maximo'] = resultado.get('nivel_riesgo_maximo', 'NORMAL')

        except Exception:
            pass

        # ── Desde ReporteActualizacion ────────────────────────────
        try:
            resultado['total_reportes_actualizacion'] = ReporteActualizacion.objects.filter(
                mision_id=mision_id
            ).count()
        except Exception:
            pass

        # ── Tiempo de respuesta ───────────────────────────────────
        try:
            from misiones.models import Mision
            mision = Mision.objects.get(id=mision_id)
            if mision.fecha_inicio:
                delta = timezone.now() - mision.fecha_inicio
                resultado['tiempo_respuesta_minutos'] = int(delta.total_seconds() / 60)
        except Exception:
            pass

        return resultado


def _calcular_distancia(coordenadas):
    """
    Calcula distancia total recorrida sumando desplazamientos
    entre puntos GPS consecutivos usando la fórmula de Haversine.
    """
    import math

    def haversine(lat1, lon1, lat2, lon2):
        R = 6371000  # Radio de la Tierra en metros
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        dphi       = math.radians(lat2 - lat1)
        dlambda    = math.radians(lon2 - lon1)
        a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
        return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    total = 0.0
    for i in range(1, len(coordenadas)):
        p1 = coordenadas[i-1]
        p2 = coordenadas[i]
        total += haversine(
            float(p1['latitud']), float(p1['longitud']),
            float(p2['latitud']), float(p2['longitud'])
        )
    return round(total, 2)