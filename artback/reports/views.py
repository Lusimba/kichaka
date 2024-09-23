# reports/views.py
from rest_framework import viewsets
from .models import SalesReport, ProductionReport
from .serializers import SalesReportSerializer, ProductionReportSerializer

class SalesReportViewSet(viewsets.ModelViewSet):
    queryset = SalesReport.objects.all()
    serializer_class = SalesReportSerializer

class ProductionReportViewSet(viewsets.ModelViewSet):
    queryset = ProductionReport.objects.all()
    serializer_class = ProductionReportSerializer