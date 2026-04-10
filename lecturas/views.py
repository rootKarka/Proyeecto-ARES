from rest_framework import viewsets
from .models import LecturaSensor
from .serializers import LecturaSerializer

class LecturaViewSet(viewsets.ModelViewSet):
    queryset = LecturaSensor.objects.all()
    serializer_class = LecturaSerializer
