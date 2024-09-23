from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ItemViewSet, CategoryViewSet, InventoryActivityViewSet

router = DefaultRouter()
router.register(r'items', ItemViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'inventory-activities', InventoryActivityViewSet)

urlpatterns = [
    path('', include(router.urls)),
]