from django.contrib import admin
from .models import LecturaSensor

@admin.register(LecturaSensor)
class LecturaSensorAdmin(admin.ModelAdmin):
    list_display = ('id', 'sensor', 'valor', 'estado_procesamiento', 'fecha')
    list_filter = ('sensor', 'estado_procesamiento')
    search_fields = ('sensor__tipo',)
    ordering = ('-fecha',)