from rest_framework import viewsets
from .models import Mision
from .serializers import MisionSerializer

class MisionViewSet(viewsets.ModelViewSet):
    queryset = Mision.objects.all().order_by('-created_at')
    serializer_class = MisionSerializer