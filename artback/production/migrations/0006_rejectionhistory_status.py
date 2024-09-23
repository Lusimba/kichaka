# Generated by Django 5.1 on 2024-08-20 16:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('production', '0005_rejectionhistory_referred_by_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='rejectionhistory',
            name='status',
            field=models.CharField(blank=True, choices=[('P', 'Pending'), ('F', 'Fixed')], max_length=1, null=True),
        ),
    ]
