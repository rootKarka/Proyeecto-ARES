from django.db import models
from lecturas.models import LecturaSensor

class Alerta(models.Model):
    nivel = models.CharField(max_length=20)
    mensaje = models.CharField(max_length=255)
    fecha = models.DateTimeField(auto_now_add=True)
    lectura= models.ForeignKey(LecturaSensor, on_delete=models.CASCADE)


    def __str__(self):
        return self.mensaje