from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # ws/mensajes/<usuario_id>/  →  cada operador escucha solo sus mensajes
    re_path(r"^ws/mensajes/(?P<usuario_id>\d+)/$", consumers.MensajesConsumer.as_asgi()),
]