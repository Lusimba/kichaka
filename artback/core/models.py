# core/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver

class StaffMember(models.Model):
    POSITION_CHOICES = [
        ('proprietor', 'Proprietor'),
        ('manager', 'Manager'),
        ('supervisor', 'Supervisor'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=POSITION_CHOICES, default='supervisor')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    hire_date = models.DateField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_role_display()}"

    class Meta:
        verbose_name = "Staff Member"
        verbose_name_plural = "Staff Members"

# Signal receiver to create a StaffMember profile when a new User is created
@receiver(post_save, sender=User)
def create_staff_member(sender, instance, created, **kwargs):
    if created:
        StaffMember.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_staff_member(sender, instance, **kwargs):
    instance.staffmember.save()
