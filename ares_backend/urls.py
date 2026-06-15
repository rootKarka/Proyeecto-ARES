from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Apps existentes
    path('api/', include('robots.urls')),
    path('api/', include('sensores.urls')),
    path('api/', include('lecturas.urls')),
    path('api/', include('alertas.urls')),
    path('api/', include('misiones.urls')),

    # Apps nuevas
    path('api/', include('usuarios.urls')),
    path('api/', include('telemetria.urls')),
    path('api/', include('reportes.urls')),
    path('api/', include('mensajes.urls')),
    path('api/', include('evidencias.urls')),
    path('api/', include('bitacora.urls')),
]