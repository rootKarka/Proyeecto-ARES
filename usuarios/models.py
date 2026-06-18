from django.db import models


class Usuario(models.Model):
    ROL_CHOICES = [
        ('ADMIN',    'Administrador'),
        ('OPERADOR', 'Operador'),
    ]

    nombre        = models.CharField(max_length=100)
    email         = models.EmailField(max_length=150, unique=True)
    password_hash = models.CharField(max_length=255)
    rol           = models.CharField(max_length=20, choices=ROL_CHOICES, default='OPERADOR')
    sede          = models.CharField(max_length=100, blank=True)  # ← NUEVO
    telefono      = models.CharField(max_length=20, blank=True)
    activo        = models.BooleanField(default=True)
    token_push    = models.CharField(max_length=255, blank=True)
    token_sesion  = models.CharField(max_length=500, blank=True)
    created_at    = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nombre} ({self.rol}) - {self.sede}"