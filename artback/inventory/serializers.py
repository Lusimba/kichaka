from rest_framework import serializers
from .models import Category, Item, InventoryActivity

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ItemSerializer(serializers.ModelSerializer):
    category = serializers.CharField(write_only=True)
    category_details = CategorySerializer(source='category', read_only=True)
    total_production_cost = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Item
        fields = ['id', 'name', 'category', 'category_details', 'stock', 'sku', 'splitting_drawing_cost', 
                  'carving_cutting_cost', 'sanding_cost', 'painting_cost', 'finishing_cost', 
                  'packaging_cost', 'selling_price', 'total_production_cost']
        read_only_fields = ['id', 'sku', 'total_production_cost']

    def create(self, validated_data):
        category_name = validated_data.pop('category')
        category, _ = Category.objects.get_or_create(name=category_name)
        item = Item.objects.create(category=category, **validated_data)
        return item
    
    def update(self, instance, validated_data):
        category_name = validated_data.pop('category', None)
        if category_name:
            category, _ = Category.objects.get_or_create(name=category_name)
            instance.category = category
        return super().update(instance, validated_data)

class InventoryActivitySerializer(serializers.ModelSerializer):
    item = ItemSerializer(read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(queryset=Item.objects.all(), write_only=True)
    
    class Meta:
        model = InventoryActivity
        fields = ['id', 'item', 'item_id', 'activity_type', 'quantity', 'timestamp']

    def create(self, validated_data):
        item_id = validated_data.pop('item_id')
        validated_data['item'] = item_id
        return super().create(validated_data)