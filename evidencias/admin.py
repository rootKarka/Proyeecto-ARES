from django.contrib import admin
from .models import Evidencia

@admin.register(Evidencia)
class EvidenciaAdmin(admin.ModelAdmin):
    list_display = ('id', 'tipo', 'mision', 'usuario', 'robot', 'fecha_captura')