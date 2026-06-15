from django.urls import path
from .views import listar_alertas

urlpatterns = [
    path('alertas/', listar_alertas),
]