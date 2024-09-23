from django.contrib import admin
from .models import Item, InventoryActivity, Category

# Register your models here.
admin.site.register(Item)
admin.site.register(InventoryActivity)
admin.site.register(Category)
