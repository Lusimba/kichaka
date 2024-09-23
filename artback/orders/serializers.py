from rest_framework import serializers
from .models import Customer, Order, OrderItem
from inventory.models import Item
from core.models import StaffMember
from core.serializers import StaffMemberSerializer
from inventory.serializers import ItemSerializer

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(queryset=Customer.objects.all(), write_only=True)
    employee = StaffMemberSerializer(read_only=True)
    employee_id = serializers.PrimaryKeyRelatedField(queryset=StaffMember.objects.all(), write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Order
        fields = ['id', 'customer', 'customer_id', 'employee', 'employee_id', 'order_date', 'status']

    def create(self, validated_data):
        customer = validated_data.pop('customer_id')
        employee = validated_data.pop('employee_id', None)
        return Order.objects.create(customer=customer, employee=employee, **validated_data)

    def update(self, instance, validated_data):
        if 'customer_id' in validated_data:
            instance.customer = validated_data.pop('customer_id')
        if 'employee_id' in validated_data:
            instance.employee = validated_data.pop('employee_id')
        return super().update(instance, validated_data)

class OrderItemSerializer(serializers.ModelSerializer):
    item = ItemSerializer(read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(queryset=Item.objects.all(), write_only=True)
    order = OrderSerializer(read_only=True)
    order_id = serializers.PrimaryKeyRelatedField(queryset=Order.objects.all(), write_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'order_id', 'item', 'item_id', 'quantity', 'notes', 'status']

    def create(self, validated_data):
        order = validated_data.pop('order_id')
        item = validated_data.pop('item_id')
        return OrderItem.objects.create(order=order, item=item, **validated_data)
    
    def update(self, instance, validated_data):
        if 'item_id' in validated_data:
            instance.item = validated_data.pop('item_id')
        return super().update(instance, validated_data)