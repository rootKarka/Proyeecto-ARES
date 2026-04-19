from django.contrib import admin
from .models import Alerta

@admin.register(Alerta)
class AlertaAdmin(admin.ModelAdmin):
    list_display = ('id', 'nivel', 'mensaje', 'lectura', 'fecha')
    list_filter = ('nivel', 'fecha')
    search_fields = ('mensaje',)
    ordering = ('-fecha',)