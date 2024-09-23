from django.db import models
from django.core.validators import MinValueValidator

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Item(models.Model):
    name = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='items')
    stock = models.PositiveIntegerField(default=0)
    sku = models.CharField(max_length=9, null=True, blank=True, unique=True)
    
    # Production costs
    splitting_drawing_cost = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], default=0)
    carving_cutting_cost = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], default=0)
    sanding_cost = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], default=0)
    painting_cost = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], default=0)
    finishing_cost = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], default=0)
    packaging_cost = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], default=0)
    
    # Selling price
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.sku:
            super().save(*args, **kwargs)  # Save first to get an ID
            self.sku = self.generate_sku()
            super().save(update_fields=['sku'])  # Save again with the SKU
        else:
            super().save(*args, **kwargs)

    def generate_sku(self):
        category_prefix = self.category.name[:3].upper()
        category_id = f"{self.category.id:02d}"
        item_id = f"{self.id:03d}"
        return f"{category_prefix}{category_id}{item_id}"

    @property
    def total_production_cost(self):
        return (
            self.splitting_drawing_cost +
            self.carving_cutting_cost +
            self.sanding_cost +
            self.painting_cost +
            self.finishing_cost +
            self.packaging_cost
        )

class InventoryActivity(models.Model):
    ACTIVITY_TYPES = [
        ('ADD', 'Added to inventory'),
        ('REMOVE', 'Removed from inventory'),
        ('UPDATE', 'Updated inventory'),
    ]

    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=10, choices=ACTIVITY_TYPES)
    quantity = models.PositiveIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.item.name} - {self.get_activity_type_display()}"