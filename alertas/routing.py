from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Agrega el símbolo ^ justo antes de ws/
    re_path(r"^ws/alertas/$", consumers.AlertasConsumer.as_asgi()),
]