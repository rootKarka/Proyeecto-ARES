from django.contrib import admin
from .models import Sensor

@admin.register(Sensor)
class SensorAdmin(admin.ModelAdmin):
    list_display = ('id', 'tipo', 'modelo', 'descripcion', 'robot', 'umbral_critico', 'activo')