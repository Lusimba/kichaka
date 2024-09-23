# production/models.py
from django.db import models
from django.utils import timezone
from authentication.models import Artist
from inventory.models import Item

# Shared choices
STATUS_CHOICES = [
    ('P', 'Pending'),
    ('I', 'In Progress'),
    ('C', 'Completed'),
    ('X', 'Cancelled'),
]
CURRENT_STAGE_CHOICES = [
    ('0', 'Ordered'),
    ('1', 'Splitting/drawing'),
    ('2', 'Carving/cutting'),
    ('3', 'Sanding'),
    ('4', 'Painting'),
    ('5', 'Finishing'),
    ('6', 'Packaging'),
    ('7', 'Done')
]
DEPARTMENT_CHOICES = [
    ('C', 'Carpentry'),
    ('P', 'Painting'),
]

class ProductionTask(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='production_tasks')
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name='production_tasks')
    notes = models.TextField(blank=True)
    quantity = models.PositiveIntegerField()
    start_date = models.DateField()
    end_date = models.DateField()
    current_stage = models.CharField(max_length=1, choices=CURRENT_STAGE_CHOICES, default='1')
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default='I')
    accepted = models.IntegerField(default=0)

    rejection_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.item.name} - {self.artist.name} - {self.start_date}"
    
class CompletedTask(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='completed_tasks')
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name='completed_tasks')
    accepted = models.PositiveIntegerField()
    current_stage = models.CharField(max_length=1, choices=CURRENT_STAGE_CHOICES)
    date = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.item.name} - {self.artist.name} - Stage {self.current_stage} - {self.date.date()}"

    class Meta:
        ordering = ['-date']

class RejectionHistory(models.Model):
    DEPARTMENT_CHOICES = [
        ('C', 'Carpentry'),
        ('S', 'Sanding'),
        ('P', 'Painting'),
    ]

    STATUS_CHOICES = [
        ('P', 'Pending'),
        ('F', 'Fixed'),
    ]
    production_task = models.ForeignKey(ProductionTask, on_delete=models.CASCADE, related_name='rejection_history', null=True, blank=True)
    referred_by = models.ForeignKey('core.StaffMember', on_delete=models.CASCADE, related_name='rejection_history', null=True, blank=True)
    stage = models.CharField(max_length=1, choices=CURRENT_STAGE_CHOICES, null=True, blank=True)
    department = models.CharField(max_length=1, choices=DEPARTMENT_CHOICES, null=True, blank=True)
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default='P', null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def __str__(self):
        return f"Rejection for {self.production_task} at stage {self.get_stage_display()} in {self.get_department_display()}"

class QualityCheck(models.Model):
    RESULT_CHOICES = [
        ('PASS', 'Pass'),
        ('FAIL', 'Fail'),
    ]

    production_task = models.ForeignKey(ProductionTask, on_delete=models.CASCADE, related_name='quality_checks')
    checked_by = models.ForeignKey('core.StaffMember', on_delete=models.CASCADE, related_name='quality_checks')
    check_date = models.DateTimeField(auto_now_add=True)
    result = models.CharField(max_length=4, choices=RESULT_CHOICES)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Quality Check for {self.production_task} - {self.result}"