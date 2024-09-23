from django.contrib import admin
from .models import ProductionTask, QualityCheck, RejectionHistory, CompletedTask

admin.site.register(ProductionTask)
admin.site.register(QualityCheck)
admin.site.register(RejectionHistory)
@admin.register(CompletedTask)
class CompletedTaskAdmin(admin.ModelAdmin):
    list_display = ['item', 'artist', 'accepted', 'current_stage', 'date']
    list_filter = ['current_stage', 'date', 'artist']
    search_fields = ['item__name', 'artist__name']
    date_hierarchy = 'date'

    fieldsets = [
        (None, {
            'fields': ['item', 'artist', 'accepted', 'current_stage']
        }),
        ('Date Information', {
            'fields': ['date'],
        })
    ]

