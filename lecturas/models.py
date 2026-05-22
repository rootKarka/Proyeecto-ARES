from django.db import models
from sensores.models import Sensor
from robots.models import Robot
from misiones.models import Mision

class LecturaSensor(models.Model):
    # Relaciones (ForeignKeys)
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE)
    robot = models.ForeignKey(Robot, on_delete=models.CASCADE)
    mision = models.ForeignKey(Mision, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Datos numéricos de lectura
    valor = models.FloatField()
    valor_raw = models.FloatField()
    
    # Coordenadas GPS
    latidud = models.DecimalField(max_length=10, max_digits=10, decimal_places=7)
    longitud = models.DecimalField(max_length=10, max_digits=10, decimal_places=7)
    
    # Estados y Alertas
    estado_procesamiento = models.BooleanField(default=False)
    nivel_alerta = models.CharField(max_length=15)
    
    # Tiempos
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sensor} - {self.valor} ({self.fecha})"
