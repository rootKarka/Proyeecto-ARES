from rest_framework import viewsets
from .models import MensajeOperador, Notificacion
from .serializers import MensajeOperadorSerializer, NotificacionSerializer

class MensajeOperadorViewSet(viewsets.ModelViewSet):
    queryset = MensajeOperador.objects.select_related(
        'remitente', 'destinatario', 'mision'
    ).order_by('-created_at')
    serializer_class = MensajeOperadorSerializer

class NotificacionViewSet(viewsets.ReadOnlyModelViewSet):
    # Las notificaciones las crea el sistema, no el admin
    queryset = Notificacion.objects.select_related(
        'usuario', 'mision'
    ).order_by('-created_at')
    serializer_class = NotificacionSerializer