from django.contrib import admin
from .models import Payroll, AnnualBonus

# Register your models here.

admin.site.register(Payroll)
admin.site.register(AnnualBonus)