from django.contrib import admin
from .models import Bitacora

@admin.register(Bitacora)
class BitacoraAdmin(admin.ModelAdmin):
    list_display = ('id', 'tipo_entrada', 'mision', 'usuario', 'es_voz', 'fecha')