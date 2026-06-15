from django.db import models
from misiones.models import Mision
from usuarios.models import Usuario


class MensajeOperador(models.Model):
    TIPO_CHOICES = [
        ('INSTRUCCION',  'Instrucción'),
        ('EVACUACION',   'Evacuación'),
        ('INFORMATIVO',  'Informativo'),
        ('CRITICO_AUTO', 'Crítico automático'),
    ]

    PRIORIDAD_CHOICES = [
        ('NORMAL',  'Normal'),
        ('URGENTE', 'Urgente'),
        ('CRITICO', 'Crítico'),
    ]

    remitente    = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, related_name='mensajes_enviados')
    destinatario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, related_name='mensajes_recibidos')
    mision       = models.ForeignKey(Mision,  on_delete=models.CASCADE)
    tipo         = models.CharField(max_length=20, choices=TIPO_CHOICES)
    contenido    = models.TextField()
    prioridad    = models.CharField(max_length=10, choices=PRIORIDAD_CHOICES, default='NORMAL')
    leido        = models.BooleanField(default=False)
    fecha_lectura= models.DateTimeField(null=True, blank=True)
    push_enviado = models.BooleanField(default=False)
    created_at   = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.prioridad}] {self.remitente} → {self.destinatario}"


class Notificacion(models.Model):
    ORIGEN_CHOICES = [
        ('ALERTA',          'Alerta de sensor'),
        ('REPORTE_CRITICO', 'Reporte crítico'),
        ('MENSAJE_ADMIN',   'Mensaje del admin'),
        ('SISTEMA',         'Sistema'),
    ]

    usuario       = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    mision        = models.ForeignKey(Mision,  on_delete=models.SET_NULL, null=True, blank=True)
    origen        = models.CharField(max_length=20, choices=ORIGEN_CHOICES)
    titulo        = models.CharField(max_length=100)
    cuerpo        = models.CharField(max_length=500)
    token_push    = models.CharField(max_length=255)
    entregada     = models.BooleanField(default=False)
    respuesta_fcm = models.CharField(max_length=200, blank=True)
    leida         = models.BooleanField(default=False)
    fecha_lectura = models.DateTimeField(null=True, blank=True)
    created_at    = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.origen}] {self.titulo} → {self.usuario}"