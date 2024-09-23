# reports/serializers.py
from rest_framework import serializers
from .models import SalesReport, ProductionReport

class SalesReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesReport
        fields = '__all__'

class ProductionReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductionReport
        fields = '__all__'