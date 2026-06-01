from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Rutas por app
    path('api/', include('robots.urls')),
    path('api/', include('sensores.urls')),
    path('api/', include('lecturas.urls')),
    path('api/', include('alertas.urls')),
    path('api/', include('misiones.urls')),
]
