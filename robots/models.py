from django.db import models

class Robot(models.Model):
    nombre = models.CharField(max_length=255)
    estado = models.CharField(max_length=255)
    latitud = models.FloatField()
    longitud = models.FloatField()
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre