from django.db import models
from lecturas.models import LecturaSensor
from robots.models import Robot
from misiones.models import Mision


class Alerta(models.Model):
    NIVEL_CHOICES = [
        ('INFO',        'Informativo'),
        ('ADVERTENCIA', 'Advertencia'),
        ('CRITICO',     'Crítico'),
        ('EMERGENCIA',  'Emergencia'),
    ]

    TIPO_CHOICES = [
        ('GAS_TOXICO',       'Gas tóxico'),
        ('INCENDIO',         'Incendio'),
        ('VOLCAMIENTO',      'Volcamiento del robot'),
        ('BATERIA_BAJA',     'Batería baja'),
        ('TEMPERATURA_ALTA', 'Temperatura alta'),
        ('DESCONEXION',      'Desconexión del robot'),
        ('VICTIMA_POSIBLE',  'Posible víctima detectada'),
    ]

    # Relaciones
    lectura = models.ForeignKey(LecturaSensor, on_delete=models.CASCADE)
    robot   = models.ForeignKey(Robot,         on_delete=models.CASCADE)
    mision  = models.ForeignKey(Mision,        on_delete=models.SET_NULL, null=True, blank=True)

    # Clasificación
    nivel   = models.CharField(max_length=20,  choices=NIVEL_CHOICES)
    tipo    = models.CharField(max_length=50,  choices=TIPO_CHOICES)
    mensaje = models.CharField(max_length=500)

    # Datos
    valor_detectado = models.FloatField()

    # Coordenadas GPS
    latitud  = models.DecimalField(max_digits=10, decimal_places=7, default=0)
    longitud = models.DecimalField(max_digits=10, decimal_places=7, default=0)

    # Estado de envío
    notificacion_enviada = models.BooleanField(default=False)

    # Tiempo
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.nivel}] {self.tipo} - {self.mensaje[:30]}..."