from django.contrib import admin
from .models import Sensor

@admin.register(Sensor)
class SensorAdmin(admin.ModelAdmin):
    list_display = ('id', 'tipo', 'robot')
    list_filter = ('tipo', 'robot')
    search_fields = ('tipo', 'robot__nombre')
    ordering = ('id',)