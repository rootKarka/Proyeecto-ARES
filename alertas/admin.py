from django.contrib import admin
from .models import Alerta

@admin.register(Alerta)
class AlertaAdmin(admin.ModelAdmin):
    list_display = ('id', 'nivel', 'tipo', 'robot', 'mision', 'notificacion_enviada', 'fecha')