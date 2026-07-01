from rest_framework import viewsets, status
from rest_framework.response import Response
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils import timezone

from .models import MensajeOperador, Notificacion
from .serializers import MensajeOperadorSerializer, NotificacionSerializer


class MensajeOperadorViewSet(viewsets.ModelViewSet):
    queryset = MensajeOperador.objects.select_related(
        'remitente', 'destinatario', 'mision'
    ).order_by('-created_at')
    serializer_class = MensajeOperadorSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        # Filtros opcionales por query params:
        # GET /api/mensajes/?destinatario=3   → mensajes para un operador
        # GET /api/mensajes/?remitente=3      → mensajes enviados por alguien (ej. el operador)
        destinatario_id = self.request.query_params.get('destinatario')
        remitente_id    = self.request.query_params.get('remitente')
        if destinatario_id:
            qs = qs.filter(destinatario_id=destinatario_id)
        if remitente_id:
            qs = qs.filter(remitente_id=remitente_id)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        mensaje = serializer.save()

        # ── Empujar el mensaje en tiempo real al destinatario ──
        # Tanto si el Admin (React) le escribe al Operador (Kotlin),
        # como si el Operador le responde al Admin.
        if mensaje.destinatario_id:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'mensajes_usuario_{mensaje.destinatario_id}',
                {
                    'type': 'enviar_mensaje',
                    'mensaje': {
                        'id':                  mensaje.id,
                        'remitente_id':        mensaje.remitente_id,
                        'remitente_nombre':    mensaje.remitente.nombre if mensaje.remitente else 'Sistema',
                        'destinatario_id':     mensaje.destinatario_id,
                        'mision':              mensaje.mision_id,
                        'tipo':                mensaje.tipo,
                        'contenido':           mensaje.contenido,
                        'prioridad':           mensaje.prioridad,
                        'leido':               mensaje.leido,
                        'created_at':          mensaje.created_at.isoformat(),
                    }
                }
            )

        return Response(
            self.get_serializer(mensaje).data,
            status=status.HTTP_201_CREATED
        )

    def partial_update(self, request, *args, **kwargs):
        # Usado para marcar como leído: PATCH /api/mensajes/{id}/ {"leido": true}
        instance = self.get_object()
        if request.data.get('leido') is True and not instance.leido:
            instance.leido        = True
            instance.fecha_lectura = timezone.now()
            instance.save(update_fields=['leido', 'fecha_lectura'])
            return Response(self.get_serializer(instance).data)
        return super().partial_update(request, *args, **kwargs)


class NotificacionViewSet(viewsets.ReadOnlyModelViewSet):
    # Las notificaciones las crea el sistema, no el admin
    queryset = Notificacion.objects.select_related(
        'usuario', 'mision'
    ).order_by('-created_at')
    serializer_class = NotificacionSerializer