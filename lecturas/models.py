from django.db import models
from sensores.models import Sensor
from robots.models import Robot
from misiones.models import Mision


class LecturaSensor(models.Model):
    NIVEL_CHOICES = [
        ('NORMAL',      'Normal'),
        ('ADVERTENCIA', 'Advertencia'),
        ('CRITICO',     'Crítico'),
    ]

    # Relaciones
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE)
    robot  = models.ForeignKey(Robot,  on_delete=models.CASCADE)
    mision = models.ForeignKey(Mision, on_delete=models.SET_NULL, null=True, blank=True)

    # Datos de lectura
    valor     = models.FloatField()
    valor_raw = models.FloatField()

    # Coordenadas GPS
    latitud  = models.DecimalField(max_digits=10, decimal_places=7, default=0)
    longitud = models.DecimalField(max_digits=10, decimal_places=7, default=0)

    # Estado y alerta
    estado_procesamiento = models.BooleanField(default=False)
    nivel_alerta         = models.CharField(max_length=15, choices=NIVEL_CHOICES, default='NORMAL')

    # Tiempo
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sensor} - {self.valor} ({self.fecha})"