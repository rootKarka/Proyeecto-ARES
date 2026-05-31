from django.contrib import admin
from .models import Robot


@admin.register(Robot)
class RobotAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'estado', 'bateria_nivel', 'latitud', 'longitud', 'created_at')