from django.contrib import admin
from .models import TelemetriaRobot

@admin.register(TelemetriaRobot)
class TelemetriaRobotAdmin(admin.ModelAdmin):
    list_display = ('id', 'robot', 'mision', 'bateria_nivel', 'inclinacion_lateral', 'senal_rssi', 'fecha')