from django.db import models
from robots.models import Robot

class Sensor(models.Model):
    # Django crea el campo 'id' (AutoField PK) automáticamente
    robot = models.ForeignKey(Robot, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=50)
    modelo = models.CharField(max_length=50)
    unidad = models.CharField(max_length=20)
    #umbral_advertencia = models.FloatField(null=True, blank=True)
    umbral_critico = models.FloatField(null=True, blank=True)
    calibracion_offset = models.FloatField(default=0.0)
    activo = models.BooleanField(default=True)
    ultima_lectura_valor = models.FloatField(null=True, blank=True)
    ultima_lectura_fecha = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tipo} - {self.modelo}"
