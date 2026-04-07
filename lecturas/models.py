from django.db import models
from sensores.models import Sensor

class LecturaSensor(models.Model):
    valor = models.FloatField()
    fecha = models.DateTimeField(auto_now_add=True)
    estado_procesamiento = models.BooleanField()
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE)

    def __str__(self):
        return str(self.valor)