from django.db import models

class Robot(models.Model):
    nombre = models.CharField(max_length=255)
    estado = models.CharField(max_length=255)
    latitud = models.FloatField()
    longitud = models.FloatField()
    fecha_registro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre
    
# Modelo para almacenar los comandos de control enviados a los robots
class Control(models.Model):
    robot = models.ForeignKey(Robot, on_delete=models.CASCADE)
    comando = models.CharField(max_length=50)
    velocidad = models.IntegerField(default=0)
    duracion = models.IntegerField(default=0)
    estado = models.CharField(max_length=20, default="pendiente")  
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.comando} - {self.estado} - {self.fecha}"