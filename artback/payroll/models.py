from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from authentication.models import Artist

class Payroll(models.Model):
    STATUS_CHOICES = [
        ('PAID', 'Paid'),
        ('PENDING', 'Pending'),
    ]

    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name='payrolls')
    item_qty = models.PositiveIntegerField()
    total_earnings = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    month = models.DateField()  # To store the month for which the payroll is generated
    date_created = models.DateTimeField(default=timezone.now)  # New field to store the exact date and time of payroll creation

    class Meta:
        unique_together = ['artist', 'month']  # Ensure only one payroll entry per artist per month
        ordering = ['-month', 'artist']

    def __str__(self):
        return f"{self.artist.name} - {self.month.strftime('%B %Y')}"
    

class AnnualBonus(models.Model):
    STATUS_CHOICES = [
        ('PAID', 'Paid'),
        ('PENDING', 'Pending'),
    ]

    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name='annual_bonuses')
    year = models.PositiveIntegerField()
    annual_earnings = models.DecimalField(max_digits=12, decimal_places=2)
    bonus_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    bonus_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['artist', 'year']  # Ensure only one bonus entry per artist per year
        ordering = ['-year', 'artist']

    def __str__(self):
        return f"{self.artist.name} - {self.year} Bonus"

    def save(self, *args, **kwargs):
        # Calculate bonus amount before saving
        self.bonus_amount = (self.annual_earnings * self.bonus_percentage) / 100
        super().save(*args, **kwargs)
    
