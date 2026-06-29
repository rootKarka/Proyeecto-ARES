# ares_backend/asgi.py
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ares_backend.settings')

from django.core.asgi import get_asgi_application
django_asgi_app = get_asgi_application()  # esto inicializa el registro de apps de Django

from channels.routing import ProtocolTypeRouter, URLRouter
from ares_backend.routing import websocket_urlpatterns  # ahora sí es seguro importar esto

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": URLRouter(
        websocket_urlpatterns
    ),
})