# reportes/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Count, Min, Max, Sum
from django.utils import timezone
from django.http import FileResponse

from .models import ReporteActualizacion, ReporteFinal
from .serializers import ReporteActualizacionSerializer, ReporteFinalSerializer
from .pdf_utils import generar_pdf_actualizacion, generar_pdf_final
from evidencias.models import Evidencia
from bitacora.models import Bitacora


class ReporteActualizacionViewSet(viewsets.ModelViewSet):
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

    # ── NUEVO: descarga de PDF ──
    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        reporte = self.get_object()
        buffer = generar_pdf_actualizacion(reporte)
        filename = f"reporte_actualizacion_{reporte.id}.pdf"
        return FileResponse(buffer, filename=filename, content_type='application/pdf')


class ReporteFinalViewSet(viewsets.ModelViewSet):
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

        datos_calculados = self._calcular_datos_mision(int(mision_id))
        data_completa = {**datos_calculados, **request.data}

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

    # ── NUEVO: descarga de PDF (combina las 3 tablas) ──
    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        reporte = self.get_object()
        evidencias = Evidencia.objects.filter(mision_id=reporte.mision_id)
        bitacora = Bitacora.objects.filter(mision_id=reporte.mision_id).order_by('fecha')
        buffer = generar_pdf_final(reporte, evidencias, bitacora)
        filename = f"reporte_final_{reporte.id}.pdf"
        return FileResponse(buffer, filename=filename, content_type='application/pdf')

    def _calcular_datos_mision(self, mision_id):
        resultado = {}

        try:
            from telemetria.models import TelemetriaRobot

            telemetrias = TelemetriaRobot.objects.filter(
                mision_id=mision_id
            ).order_by('fecha')

            total_tel = telemetrias.count()

            if total_tel > 0:
                primera = telemetrias.first()
                ultima = telemetrias.last()
                agr = telemetrias.aggregate(
                    prom_latencia=Avg('latencia_ms'),
                    prom_rssi=Avg('senal_rssi'),
                )

                resultado['total_snapshots_telemetria'] = total_tel
                resultado['bateria_inicio'] = primera.bateria_nivel or 0
                resultado['bateria_fin'] = ultima.bateria_nivel or 0
                resultado['tiempo_promedio_alerta_ms'] = int(agr['prom_latencia'] or 0)
                resultado['promedio_senal_rssi'] = float(agr['prom_rssi'] or 0)

                coordenadas = list(
                    telemetrias
                    .exclude(latitud=0).exclude(longitud=0)
                    .values('latitud', 'longitud')
                )
                resultado['coordenadas_trayectoria'] = [
                    {"lat": float(c['latitud']), "lng": float(c['longitud'])}
                    for c in coordenadas
                ]
                resultado['distancia_recorrida_m'] = _calcular_distancia(coordenadas)

        except Exception:
            pass

        try:
            from lecturas.models import LecturaSensor
            from sensores.models import Sensor

            lecturas = LecturaSensor.objects.filter(mision_id=mision_id)
            resultado['total_lecturas'] = lecturas.count()

            resumen_sensores = []
            for tipo in ['GAS', 'TEMPERATURA', 'SONIDO']:
                sensores_tipo = Sensor.objects.filter(tipo=tipo, activo=True)
                lects_tipo = lecturas.filter(sensor__in=sensores_tipo)
                if lects_tipo.exists():
                    agr = lects_tipo.aggregate(
                        minv=Min('valor'), maxv=Max('valor'), prom=Avg('valor')
                    )
                    unidad = sensores_tipo.first().unidad if sensores_tipo.exists() else ''
                    resumen_sensores.append({
                        "sensor": tipo,
                        "unidad": unidad,
                        "min": round(agr['minv'] or 0, 2),
                        "max": round(agr['maxv'] or 0, 2),
                        "promedio": round(agr['prom'] or 0, 2),
                    })
            resultado['resumen_sensores'] = resumen_sensores

        except Exception:
            pass

        try:
            from alertas.models import Alerta

            alertas = Alerta.objects.filter(mision_id=mision_id)
            resultado['total_alertas'] = alertas.count()
            resultado['alertas_criticas'] = alertas.filter(
                nivel__in=['CRITICO', 'EMERGENCIA']
            ).count()
            resultado['alertas_advertencia'] = alertas.filter(
                nivel='ADVERTENCIA'
            ).count()

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

        try:
            resultado['total_reportes_actualizacion'] = ReporteActualizacion.objects.filter(
                mision_id=mision_id
            ).count()
        except Exception:
            pass

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
    import math

    def haversine(lat1, lon1, lat2, lon2):
        R = 6371000
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlambda = math.radians(lon2 - lon1)
        a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
        return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    total = 0.0
    for i in range(1, len(coordenadas)):
        p1 = coordenadas[i - 1]
        p2 = coordenadas[i]
        total += haversine(
            float(p1['latitud']), float(p1['longitud']),
            float(p2['latitud']), float(p2['longitud'])
        )
    return round(total, 2)