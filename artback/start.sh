#!/bin/sh

# Make migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Start Gunicorn
gunicorn artback.wsgi:application --bind 0.0.0.0:8000