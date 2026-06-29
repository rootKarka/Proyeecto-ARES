# ares_backend/routing.py
from django.urls import path
from sensores.routing import websocket_urlpatterns as sensores_ws
from alertas.routing import websocket_urlpatterns as alertas_ws
# Cuando le pongas WS a lecturas, lo importas aquí también:
# from lecturas.routing import websocket_urlpatterns as lecturas_ws

# Juntamos todas las rutas en una sola lista maestra
websocket_urlpatterns = [
    *sensores_ws,
    *alertas_ws,
    # *lecturas_ws,
]