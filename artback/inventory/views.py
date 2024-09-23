from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Q
from .models import Category, Item, InventoryActivity
from .serializers import CategorySerializer, ItemSerializer, InventoryActivitySerializer

import logging

logger = logging.getLogger(__name__)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def create(self, request, *args, **kwargs):
        logger.info(f"Received data for category creation: {request.data}")
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        search_query = request.query_params.get('search', '')
        
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(category__name__icontains=search_query) |
                Q(sku__icontains=search_query)
            )
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_stock(self, request, pk=None):
        item = self.get_object()
        stock_to_add = request.data.get('stock')

        if stock_to_add is None:
            return Response({'error': 'Stock to add is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            stock_to_add = int(stock_to_add)
        except ValueError:
            return Response({'error': 'Stock to add must be an integer'}, status=status.HTTP_400_BAD_REQUEST)

        if stock_to_add == 0:
            return Response({'error': 'Stock to add must be non-zero'}, status=status.HTTP_400_BAD_REQUEST)
        
        old_stock = item.stock
        item.stock += stock_to_add
        item.save()

        activity_type = 'ADD' if stock_to_add > 0 else 'REMOVE'
        InventoryActivity.objects.create(
            item=item,
            activity_type=activity_type,
            quantity=abs(stock_to_add)
        )

        return Response({
            'success': 'Stock updated successfully',
            'item_id': item.id,
            'item_name': item.name,
            'old_stock': old_stock,
            'new_stock': item.stock,
            'change': stock_to_add
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def batch_update_stock(self, request):
        items_data = request.data.get('items', [])
        
        if not items_data:
            return Response({'error': 'No items provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        updated_items = []
        with transaction.atomic():
            for item_data in items_data:
                for item_id, new_stock in item_data.items():
                    try:
                        item = Item.objects.get(id=int(item_id))
                    except Item.DoesNotExist:
                        return Response({'error': f'Item with id {item_id} not found'}, status=status.HTTP_404_NOT_FOUND)
                    except ValueError:
                        return Response({'error': f'Invalid item id: {item_id}'}, status=status.HTTP_400_BAD_REQUEST)
                    
                    try:
                        new_stock = int(new_stock)
                    except ValueError:
                        return Response({'error': f'Invalid stock value for item {item_id}: {new_stock}'}, status=status.HTTP_400_BAD_REQUEST)
                    
                    old_stock = item.stock
                    stock_change = new_stock - old_stock
                    item.stock = new_stock
                    item.save()
                    
                    activity_type = 'ADD' if stock_change > 0 else 'REMOVE'
                    InventoryActivity.objects.create(
                        item=item,
                        activity_type=activity_type,
                        quantity=abs(stock_change)
                    )
                    
                    updated_items.append({
                        'item_id': item.id,
                        'item_name': item.name,
                        'old_stock': old_stock,
                        'new_stock': new_stock,
                        'change': stock_change
                    })
        
        return Response({
            'message': 'Stocks updated successfully',
            'updated_items': updated_items
        }, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        # Remove 'sku' from the request data if it's present
        if 'sku' in request.data:
            del request.data['sku']
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        # Remove 'sku' from the request data if it's present
        if 'sku' in request.data:
            del request.data['sku']
        return super().partial_update(request, *args, **kwargs)
    

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        threshold = int(request.query_params.get('threshold', 50))
        search_query = request.query_params.get('search', '')
        
        low_stock_items = Item.objects.filter(stock__lt=threshold)
        
        if search_query:
            low_stock_items = low_stock_items.filter(
                Q(name__icontains=search_query) |
                Q(category__name__icontains=search_query)
            )
        
        page = self.paginate_queryset(low_stock_items)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(low_stock_items, many=True)
        return Response(serializer.data)

class InventoryActivityViewSet(viewsets.ModelViewSet):
    queryset = InventoryActivity.objects.all()
    serializer_class = InventoryActivitySerializer