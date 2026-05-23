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


class Control(models.Model):
    TIPO_CHOICES = [
        ('MOVER_ADELANTE',  'Mover adelante'),
        ('MOVER_ATRAS',     'Mover atrás'),
        ('GIRAR_IZQ',       'Girar izquierda'),
        ('GIRAR_DER',       'Girar derecha'),
        ('DETENER',         'Detener'),
        ('EMERGENCIA_STOP', 'Parada de emergencia'),
        ('TOMAR_FOTO',      'Tomar foto'),
    ]

    ESTADO_CHOICES = [
        ('ENVIADO',   'Enviado'),
        ('EJECUTADO', 'Ejecutado'),
        ('FALLIDO',   'Fallido'),
    ]

    robot        = models.ForeignKey(Robot, on_delete=models.CASCADE)
    usuario      = models.ForeignKey('usuarios.Usuario', on_delete=models.SET_NULL, null=True, blank=True)
    mision       = models.ForeignKey('misiones.Mision',  on_delete=models.SET_NULL, null=True, blank=True)
    tipo_comando = models.CharField(max_length=50, choices=TIPO_CHOICES)
    parametros   = models.JSONField(default=dict, blank=True)
    estado       = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='ENVIADO')
    latencia_ms  = models.IntegerField(default=0)
    fecha_envio  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.tipo_comando} - {self.robot} ({self.estado})"