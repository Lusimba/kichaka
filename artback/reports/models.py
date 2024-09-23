# reports/models.py
from django.db import models

class SalesReport(models.Model):
    date = models.DateField(unique=True)
    total_sales = models.DecimalField(max_digits=10, decimal_places=2)
    total_orders = models.PositiveIntegerField()
    average_order_value = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Sales Report for {self.date}"

class ProductionReport(models.Model):
    date = models.DateField(unique=True)
    total_items_produced = models.PositiveIntegerField()
    total_tasks_completed = models.PositiveIntegerField()
    quality_pass_rate = models.FloatField()

    def __str__(self):
        return f"Production Report for {self.date}"
    
