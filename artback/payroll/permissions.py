# In a new file, e.g., payroll/permissions.py
from rest_framework import permissions

class IsManagerOrProprietor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and hasattr(request.user, 'staffmember') and request.user.staffmember.role in ['manager', 'proprietor']