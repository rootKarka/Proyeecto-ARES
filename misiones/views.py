# misiones/views.py

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg
from django.utils import timezone

from .models import Mision
from .serializers import MisionSerializer


class MisionViewSet(viewsets.ModelViewSet):
    queryset = Mision.objects.all()
    serializer_class = MisionSerializer

    def get_queryset(self):
        qs = Mision.objects.all().order_by('-created_at')
        sede = self.request.query_params.get('sede')
        if sede:
            qs = qs.filter(sede=sede)
        return qs

    @action(detail=True, methods=['get'], url_path='resumen')
    def resumen(self, request, pk=None):
        """
        GET /api/misiones/{id}/resumen/
        Kotlin llama esto al abrir el tab Finalizar Misión.
        """
        mision = self.get_object()
        resultado = {
            "bateria_inicio":       0,
            "latencia_promedio_ms": 0,
            "total_alertas":        0,
            "alertas_criticas":     0,
            "duracion_minutos":     0,
        }

        # ── TelemetriaRobot: batería y latencia ───────────────────
        try:
            from telemetria.models import TelemetriaRobot

            telemetrias = TelemetriaRobot.objects.filter(mision=mision)
            primera     = telemetrias.order_by('fecha').first()

            if primera:
                resultado['bateria_inicio'] = primera.bateria_nivel or 0

            prom_latencia = telemetrias.aggregate(
                Avg('latencia_ms')
            )['latencia_ms__avg']
            if prom_latencia:
                resultado['latencia_promedio_ms'] = int(prom_latencia)

        except Exception:
            pass

        # ── Alertas: total y críticas ─────────────────────────────
        try:
            from alertas.models import Alerta

            alertas = Alerta.objects.filter(mision=mision)
            resultado['total_alertas']    = alertas.count()
            resultado['alertas_criticas'] = alertas.filter(
                nivel__in=['CRITICO', 'EMERGENCIA']
            ).count()

        except Exception:
            pass

        # ── Duración desde inicio de misión ───────────────────────
        try:
            if mision.fecha_inicio:
                delta = timezone.now() - mision.fecha_inicio
                resultado['duracion_minutos'] = int(delta.total_seconds() / 60)
        except Exception:
            pass

        return Response(resultado)

    @action(detail=True, methods=['post'], url_path='cerrar')
    def cerrar(self, request, pk=None):
        """
        POST /api/misiones/{id}/cerrar/
        Kotlin lo llama después de enviar el reporte final.
        Cambia el estado de la misión a COMPLETADA y registra fecha_fin.
        El ESP32 ya no debería enviar más datos de esta misión.
        """
        mision = self.get_object()

        # Verificar que la misión no esté ya cerrada
        if mision.estado in ['COMPLETADA', 'ABORTADA']:
            return Response(
                {"error": f"La misión ya está {mision.estado}"},
                status=400
            )

        mision.estado    = 'COMPLETADA'
        mision.fecha_fin = timezone.now()
        mision.save(update_fields=['estado', 'fecha_fin'])

        return Response({
            "status":    "ok",
            "estado":    "COMPLETADA",
            "fecha_fin": mision.fecha_fin,
        })