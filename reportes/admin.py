from django.contrib import admin
from .models import ReporteActualizacion, ReporteFinal

@admin.register(ReporteActualizacion)
class ReporteActualizacionAdmin(admin.ModelAdmin):
    list_display = ('id', 'mision', 'autor', 'nivel_riesgo', 'notificacion_enviada', 'created_at')

@admin.register(ReporteFinal)
class ReporteFinalAdmin(admin.ModelAdmin):
    list_display = ('id', 'mision', 'generado_por', 'estado_generacion', 'created_at')