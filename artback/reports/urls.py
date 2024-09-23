# reports/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SalesReportViewSet, ProductionReportViewSet

router = DefaultRouter()
router.register(r'sales-reports', SalesReportViewSet)
router.register(r'production-reports', ProductionReportViewSet)

urlpatterns = [
    path('', include(router.urls)),
]