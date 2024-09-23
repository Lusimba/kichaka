# Generated by Django 5.1 on 2024-08-23 06:27

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('production', '0007_completedtask'),
    ]

    operations = [
        migrations.AlterField(
            model_name='completedtask',
            name='date',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
        migrations.AlterField(
            model_name='rejectionhistory',
            name='status',
            field=models.CharField(blank=True, choices=[('P', 'Pending'), ('F', 'Fixed')], default='P', max_length=1, null=True),
        ),
    ]
