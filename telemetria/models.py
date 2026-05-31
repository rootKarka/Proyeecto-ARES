from django.db import models
from robots.models import Robot
from misiones.models import Mision


class TelemetriaRobot(models.Model):
    MODO_CHOICES = [
        ('MANUAL',   'Manual'),
        ('AUTONOMO', 'Autónomo'),
    ]

    robot               = models.ForeignKey(Robot,  on_delete=models.CASCADE)
    mision              = models.ForeignKey(Mision, on_delete=models.SET_NULL, null=True, blank=True)
    latitud             = models.DecimalField(max_digits=10, decimal_places=7, default=0)
    longitud            = models.DecimalField(max_digits=10, decimal_places=7, default=0)
    velocidad           = models.FloatField(default=0)
    bateria_nivel       = models.FloatField(default=0)
    bateria_voltaje     = models.FloatField(default=0)
    inclinacion_lateral = models.FloatField(default=0)   # alerta volcamiento > 35°
    inclinacion_frontal = models.FloatField(default=0)   # detecta rampas y escalones
    modo_conduccion     = models.CharField(max_length=20, choices=MODO_CHOICES, default='MANUAL')
    senal_rssi          = models.IntegerField(default=0) # dBm WiFi
    latencia_ms         = models.IntegerField(default=0)
    fecha               = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.robot} - {self.fecha}"