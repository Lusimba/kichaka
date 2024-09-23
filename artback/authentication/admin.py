from django.contrib import admin
from .models import Artist, Specialization

class ArtistAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone_number', 'specialization', 'hire_date', 'is_active')
    list_filter = ('specialization', 'hire_date', 'is_active')
    search_fields = ('name', 'phone_number', 'specialization')
    readonly_fields = ('hire_date', 'is_active')
    fieldsets = (
        (None, {
            'fields': ('name', 'phone_number', 'specialization')
        }),
        ('Timestamps', {
            'fields': ('hire_date', 'is_active'),
            'classes': ('collapse',)
        }),
    )

admin.site.register(Artist, ArtistAdmin)
admin.site.register(Specialization)