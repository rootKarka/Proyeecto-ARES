from django.db import models
from robots.models import Robot


class Mision(models.Model):
    ESTADO_CHOICES = [
        ('PENDIENTE',   'Pendiente'),
        ('EN_CURSO',    'En curso'),
        ('PAUSADA',     'Pausada'),
        ('COMPLETADA',  'Completada'),
        ('ABORTADA',    'Abortada'),
    ]

    TIPO_CHOICES = [
        ('DERRUMBE',        'Derrumbe'),
        ('INCENDIO',        'Incendio'),
        ('INUNDACION',      'Inundación'),
        ('EXPLOSION',       'Explosión'),
        ('FUGA_GAS',        'Fuga de gas'),
        ('PERSONA_PERDIDA', 'Persona perdida'),
        ('OTRO',            'Otro'),
    ]

    nombre       = models.CharField(max_length=255)
    estado       = models.CharField(max_length=30, choices=ESTADO_CHOICES, default='PENDIENTE')
    tipo         = models.CharField(max_length=50, choices=TIPO_CHOICES, default='OTRO')
    zona_nombre  = models.CharField(max_length=150, blank=True)
    lat_zona     = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    lng_zona     = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    robot        = models.ForeignKey(Robot, on_delete=models.SET_NULL, null=True, blank=True)
    usuario      = models.ForeignKey('usuarios.Usuario', on_delete=models.SET_NULL, null=True, blank=True)  
    descripcion  = models.TextField(blank=True)
    fecha_inicio = models.DateTimeField(null=True, blank=True)
    fecha_fin    = models.DateTimeField(null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre