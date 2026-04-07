from django.db import models
from robots.models import Robot

class Sensor(models.Model):
    tipo = models.CharField(max_length=255)
    unidad = models.CharField(max_length=255)
    robot = models.ForeignKey(Robot, on_delete=models.CASCADE)

    def __str__(self):
        return self.tipo