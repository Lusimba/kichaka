# production/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductionTaskViewSet, QualityCheckViewSet, RejectionHistoryViewSet

router = DefaultRouter()
router.register(r'production-tasks', ProductionTaskViewSet)
router.register(r'rejection-history', RejectionHistoryViewSet)
router.register(r'quality-checks', QualityCheckViewSet)

urlpatterns = [
    path('', include(router.urls)),
]