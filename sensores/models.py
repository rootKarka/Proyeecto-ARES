from django.db import models
from robots.models import Robot


class Sensor(models.Model):
    TIPO_CHOICES = [
        ('GAS',         'Gas'),
        ('TEMPERATURA', 'Temperatura'),
        ('SONIDO',      'Sonido'),
        ('ULTRASONICO', 'Ultrasónico'),
        ('INFRARROJO',  'Infrarrojo'),
        ('IMU',         'IMU / Acelerómetro'),
        ('GPS',         'GPS'),
    ]

    robot                = models.ForeignKey(Robot, on_delete=models.CASCADE)
    tipo                 = models.CharField(max_length=50, choices=TIPO_CHOICES)
    modelo               = models.CharField(max_length=50)        # MQ135, DHT22...
    descripcion          = models.CharField(max_length=100, blank=True)  # ✅ diferencia sensores iguales
    unidad               = models.CharField(max_length=20)
    umbral_critico       = models.FloatField(null=True, blank=True)
    activo               = models.BooleanField(default=True)
    ultima_lectura_valor = models.FloatField(null=True, blank=True)
    ultima_lectura_fecha = models.DateTimeField(null=True, blank=True)
    created_at           = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tipo} - {self.modelo} - {self.descripcion}"