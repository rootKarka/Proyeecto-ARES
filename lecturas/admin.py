from django.contrib import admin
from .models import LecturaSensor

@admin.register(LecturaSensor)
class LecturaSensorAdmin(admin.ModelAdmin):
    list_display = ('id', 'sensor', 'robot', 'valor', 'nivel_alerta', 'estado_procesamiento', 'fecha')