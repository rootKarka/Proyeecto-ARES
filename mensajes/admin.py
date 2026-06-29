from django.contrib import admin
from .models import MensajeOperador, Notificacion

@admin.register(MensajeOperador)
class MensajeOperadorAdmin(admin.ModelAdmin):
    list_display = ('id', 'remitente', 'destinatario', 'tipo', 'prioridad', 'leido', 'created_at')

@admin.register(Notificacion)
class NotificacionAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario', 'origen', 'titulo', 'entregada', 'leida', 'created_at')