from rest_framework import viewsets
from .models import Mision
from .serializers import MisionSerializer

class MisionViewSet(viewsets.ModelViewSet):
    queryset = Mision.objects.all()  # ← requerido por el router
    serializer_class = MisionSerializer

    def get_queryset(self):
        qs = Mision.objects.all().order_by('-created_at')
        sede = self.request.query_params.get('sede')
        if sede:
            qs = qs.filter(sede=sede)
        return qs