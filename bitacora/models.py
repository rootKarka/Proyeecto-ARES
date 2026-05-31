from django.db import models
from misiones.models import Mision
from usuarios.models import Usuario


class Bitacora(models.Model):
    TIPO_CHOICES = [
        ('NOTA',      'Nota'),
        ('EVENTO',    'Evento'),
        ('DECISION',  'Decisión'),
        ('HALLAZGO',  'Hallazgo'),
        ('INCIDENTE', 'Incidente'),
    ]

    mision       = models.ForeignKey(Mision,  on_delete=models.CASCADE)
    usuario      = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True)
    tipo_entrada = models.CharField(max_length=30, choices=TIPO_CHOICES, default='NOTA')
    contenido    = models.TextField()
    es_voz       = models.BooleanField(default=False)   # TRUE si vino de Speech-to-Text
    latitud      = models.DecimalField(max_digits=10, decimal_places=7, default=0)
    longitud     = models.DecimalField(max_digits=10, decimal_places=7, default=0)
    fecha        = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.tipo_entrada}] {self.mision} - {self.contenido[:50]}"