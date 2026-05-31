from django.db import models
from misiones.models import Mision
from robots.models import Robot
from usuarios.models import Usuario


class Evidencia(models.Model):
    TIPO_CHOICES = [
        ('FOTO',           'Fotografía'),
        ('VIDEO',          'Video'),
        ('AUDIO',          'Audio'),
        ('NOTA_VOZ_TEXTO', 'Nota de voz transcrita'),
    ]

    mision        = models.ForeignKey(Mision,  on_delete=models.CASCADE)
    robot         = models.ForeignKey(Robot,   on_delete=models.SET_NULL, null=True, blank=True)
    usuario       = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True)
    tipo          = models.CharField(max_length=20, choices=TIPO_CHOICES)
    archivo       = models.FileField(upload_to='evidencias/', blank=True)
    descripcion   = models.TextField(blank=True)
    latitud       = models.DecimalField(max_digits=10, decimal_places=7, default=0)
    longitud      = models.DecimalField(max_digits=10, decimal_places=7, default=0)
    tamanio_bytes = models.BigIntegerField(default=0)
    fecha_captura = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tipo} - {self.mision} ({self.fecha_captura})"