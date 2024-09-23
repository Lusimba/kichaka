from rest_framework import serializers
from .models import Payroll

class PayrollSerializer(serializers.ModelSerializer):
    artist_name = serializers.CharField(source='artist.name', read_only=True)

    class Meta:
        model = Payroll
        fields = ['id', 'artist', 'artist_name', 'item_qty', 'total_earnings', 'status', 'month']
        read_only_fields = ['id', 'artist_name', 'month']