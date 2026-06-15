from django.db import models


class Robot(models.Model):
    ESTADO_CHOICES = [
        ('DISPONIBLE',    'Disponible'),
        ('EN_MISION',     'En misión'),
        ('MANTENIMIENTO', 'En mantenimiento'),
        ('AVERIADO',      'Averiado'),
        ('INACTIVO',      'Inactivo'),
    ]

    nombre          = models.CharField(max_length=100)
    estado          = models.CharField(max_length=30, choices=ESTADO_CHOICES, default='DISPONIBLE')
    mac_address     = models.CharField(max_length=17, unique=True)
    bateria_nivel   = models.FloatField(default=0)
    bateria_voltaje = models.FloatField(default=0)
    latitud         = models.DecimalField(max_digits=10, decimal_places=7, default=0)
    longitud        = models.DecimalField(max_digits=10, decimal_places=7, default=0)
    horas_uso       = models.FloatField(default=0)
    created_at      = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre
    
    