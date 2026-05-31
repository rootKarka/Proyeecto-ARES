from django.contrib import admin
from .models import Mision

@admin.register(Mision)
class MisionAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'estado', 'tipo', 'robot', 'operador', 'creado_por', 'fecha_inicio')