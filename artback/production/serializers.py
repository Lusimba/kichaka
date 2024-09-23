# production/serializers.py
from rest_framework import serializers
from .models import ProductionTask, QualityCheck, RejectionHistory, CompletedTask
from core.models import StaffMember
from authentication.models import Artist
from inventory.models import Item
from core.serializers import StaffMemberSerializer
# from authentication.serializers import ArtistSerializer
# from inventory.serializers import ItemSerializer

class ProductionTaskSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    artist_name = serializers.CharField(source='artist.name', read_only=True)
    new_artist_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = ProductionTask
        fields = ['id', 'item', 'item_name', 'artist', 'artist_name', 'quantity', 'start_date', 'end_date', 'status', 'notes', 'current_stage', 'accepted', 'rejection_count', 'new_artist_id']

    def create(self, validated_data):
        return ProductionTask.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        new_artist_id = validated_data.pop('new_artist_id', None)
        if new_artist_id:
            try:
                new_artist = Artist.objects.get(id=new_artist_id)
                instance.artist = new_artist
            except Artist.DoesNotExist:
                raise serializers.ValidationError("Artist with the given ID does not exist.")
        return super().update(instance, validated_data)
    
class CompletedTaskSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    artist_name = serializers.CharField(source='artist.name', read_only=True)

    class Meta:
        model = CompletedTask
        fields = ['id', 'item', 'item_name', 'artist', 'artist_name', 'accepted', 'current_stage', 'date']
        read_only_fields = ['id', 'date']
    
class RejectionHistorySerializer(serializers.ModelSerializer):
    production_task = serializers.PrimaryKeyRelatedField(queryset=ProductionTask.objects.all())
    stage_display = serializers.CharField(source='get_stage_display', read_only=True)
    department_display = serializers.CharField(source='get_department_display', read_only=True)
    product_name = serializers.CharField(source='production_task.item.name', read_only=True)
    artist_name = serializers.CharField(source='production_task.artist.name', read_only=True)
    referred_by_name = serializers.CharField(source='referred_by.name', read_only=True)

    class Meta:
        model = RejectionHistory
        fields = ['id', 'production_task', 'stage', 'stage_display', 'department', 'department_display', 'date', 'product_name', 'artist_name', 'referred_by_name']


class QualityCheckSerializer(serializers.ModelSerializer):
    production_task = ProductionTaskSerializer(read_only=True)
    production_task_id = serializers.PrimaryKeyRelatedField(queryset=ProductionTask.objects.all(), write_only=True)
    checked_by = StaffMemberSerializer(read_only=True)
    checked_by_id = serializers.PrimaryKeyRelatedField(queryset=StaffMember.objects.all(), write_only=True)

    class Meta:
        model = QualityCheck
        fields = ['id', 'production_task', 'production_task_id', 'checked_by', 'checked_by_id', 'check_date', 'result', 'notes']

    def create(self, validated_data):
        production_task_id = validated_data.pop('production_task_id')
        checked_by_id = validated_data.pop('checked_by_id')
        validated_data['production_task'] = production_task_id
        validated_data['checked_by'] = checked_by_id
        return super().create(validated_data)
    

