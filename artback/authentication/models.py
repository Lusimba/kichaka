from django.db import models
from django.contrib.auth.models import AbstractUser

class Specialization(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Artist(models.Model):
    name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20)
    specialization = models.ForeignKey(Specialization, on_delete=models.SET_NULL, null=True, related_name='artists')
    is_active = models.BooleanField(default=True)
    hire_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance