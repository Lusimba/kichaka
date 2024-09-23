# core/serializers.py
from rest_framework import serializers
from .models import StaffMember
from authentication.models import Artist
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class StaffMemberSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    role = serializers.ChoiceField(choices=StaffMember.POSITION_CHOICES)
    status = serializers.ChoiceField(choices=StaffMember.STATUS_CHOICES)

    class Meta:
        model = StaffMember
        fields = ['id', 'name', 'role', 'status', 'hire_date']

    def get_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"