from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import F, Sum
from .models import Customer, Order, OrderItem
from .serializers import CustomerSerializer, OrderItemSerializer, OrderSerializer
from inventory.models import Item

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-order_date')
    serializer_class = OrderSerializer

    @action(detail=True, methods=['get'])
    def details(self, request, pk=None):
        order = self.get_object()
        order_items = OrderItem.objects.filter(order=order).annotate(
            sku=F('item__sku'),
            product_name=F('item__name'),
            price=F('item__selling_price'),
            subtotal=F('quantity') * F('item__selling_price')
        ).values(
            'id', 'sku', 'product_name', 'quantity', 'price', 'subtotal', 'notes'
        )

        total_amount = sum(item['subtotal'] for item in order_items)

        response_data = {
            'order_id': order.id,
            'customer': order.customer.name,
            'date': order.order_date,
            'status': order.status,
            'employee': order.employee.name if order.employee else None,
            'items': list(order_items),
            'total_amount': total_amount
        }

        return Response(response_data)

    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        order = self.get_object()
        item_id = request.data['item_id']
        quantity = int(request.data.get('quantity', 1))

        try:
            item = Item.objects.get(id=item_id)
        except Item.DoesNotExist:
            return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if item.stock < quantity:
            return Response({'error': 'Insufficient stock'}, status=status.HTTP_400_BAD_REQUEST)
        
        order_item = OrderItem.objects.create(
            order=order,
            item=item,
            quantity=quantity,
            notes=request.data.get('notes', '')
        )

        return Response({'success': 'Item added to order successfully.'}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def update_item(self, request, pk=None):
        order = self.get_object()
        item_id = request.data['item_id']
        quantity = int(request.data.get('quantity', 1))
        notes = request.data.get('notes', '')

        try:
            order_item = OrderItem.objects.get(order=order, item_id=item_id)
        except OrderItem.DoesNotExist:
            return Response({'error': 'Order item not found'}, status=status.HTTP_404_NOT_FOUND)

        if quantity > order_item.item.stock + order_item.quantity:
            return Response({'error': 'Insufficient stock'}, status=status.HTTP_400_BAD_REQUEST)

        order_item.quantity = quantity
        order_item.notes = notes
        order_item.save()

        return Response({'success': 'Order item updated successfully.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def remove_item(self, request, pk=None):
        order = self.get_object()
        item_id = request.data['item_id']

        try:
            order_item = OrderItem.objects.get(order=order, item_id=item_id)
        except OrderItem.DoesNotExist:
            return Response({'error': 'Order item not found'}, status=status.HTTP_404_NOT_FOUND)

        order_item.delete()

        return Response({'success': 'Item removed from order successfully.'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')

        if new_status not in dict(Order.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

        order.status = new_status
        order.save()

        return Response({'success': 'Order status updated successfully.', 'new_status': new_status})
    
class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer