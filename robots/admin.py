from django.contrib import admin

from .models import Robot, Control

@admin.register(Robot)
class RobotAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'estado', 'latitud', 'longitud')


@admin.register(Control)
class ControlAdmin(admin.ModelAdmin):
    list_display = ('id', 'robot', 'comando', 'estado', 'fecha')