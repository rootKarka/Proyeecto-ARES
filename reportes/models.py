from django.db import models
from misiones.models import Mision
from usuarios.models import Usuario


class ReporteActualizacion(models.Model):
    NIVEL_CHOICES = [
        ('NORMAL',      'Normal'),
        ('PRECAUCION',  'Precaución'),
        ('ALTO_RIESGO', 'Alto riesgo'),
        ('CRITICO',     'Crítico'),
    ]

    mision               = models.ForeignKey(Mision,  on_delete=models.CASCADE)
    autor                = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True)
    nivel_riesgo         = models.CharField(max_length=20, choices=NIVEL_CHOICES)
    resumen              = models.TextField()
    victimas_fallecidas  = models.IntegerField(default=0)
    victimas_heridas     = models.IntegerField(default=0)
    victimas_rescatadas  = models.IntegerField(default=0)
    accion_recomendada   = models.TextField(blank=True)
    notificacion_enviada = models.BooleanField(default=False)
    created_at           = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.nivel_riesgo}] {self.mision} - {self.created_at}"


class ReporteFinal(models.Model):
    ESTADO_CHOICES = [
        ('GENERANDO', 'Generando'),
        ('LISTO',     'Listo'),
        ('ERROR',     'Error'),
    ]

    mision                       = models.OneToOneField(Mision,  on_delete=models.CASCADE)
    generado_por                 = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True)
    estado_generacion            = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='GENERANDO')
    url_pdf                      = models.FileField(upload_to='reportes/', null=True, blank=True) 
    victimas_fallecidas          = models.IntegerField(default=0)
    victimas_heridas             = models.IntegerField(default=0)
    victimas_rescatadas          = models.IntegerField(default=0)
    victimas_sin_confirmar       = models.IntegerField(default=0)
    duracion_minutos             = models.IntegerField(default=0)
    tiempo_respuesta_minutos     = models.IntegerField(default=0)
    tiempo_promedio_alerta_ms    = models.IntegerField(default=0)
    total_alertas                = models.IntegerField(default=0)
    alertas_criticas             = models.IntegerField(default=0)
    alertas_advertencia          = models.IntegerField(default=0)
    total_lecturas               = models.IntegerField(default=0)
    total_reportes_actualizacion = models.IntegerField(default=0)
    nivel_riesgo_maximo          = models.CharField(max_length=20, blank=True)
    distancia_recorrida_m        = models.FloatField(default=0)
    bateria_inicio               = models.FloatField(default=0)
    bateria_fin                  = models.FloatField(default=0)
    promedio_senal_rssi          = models.FloatField(default=0)
    total_snapshots_telemetria   = models.IntegerField(default=0)
    area_cubierta_m2             = models.FloatField(default=0)
    coordenadas_trayectoria      = models.JSONField(default=list)
    resumen_sensores             = models.JSONField(default=list)
    created_at                   = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reporte Final - {self.mision}"