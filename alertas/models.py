from django.db import models
from lecturas.models import LecturaSensor

from django.db import models
from lecturas.models import LecturaSensor
from robots.models import Robot    
from misiones.models import Mision  

class Alerta(models.Model):
    # Relaciones (ForeignKeys)
    lectura = models.ForeignKey(LecturaSensor, on_delete=models.CASCADE)
    robot = models.ForeignKey(Robot, on_delete=models.CASCADE)
    mision = models.ForeignKey(Mision, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Clasificación de la alerta
    nivel = models.CharField(max_length=20)
    tipo = models.CharField(max_length=50)
    mensaje = models.CharField(max_length=500)
    
    # Datos de la alerta
    valor_detected = models.FloatField()
    
    # Coordenadas GPS
    latidud = models.DecimalField(max_digits=10, decimal_places=7)
    longitud = models.DecimalField(max_digits=10, decimal_places=7)
    
    # Estado de envío
    notificacion_enviada = models.BooleanField(default=False)
    
    # Tiempo
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.nivel}] {self.tipo} - {self.mensaje[:30]}..."
