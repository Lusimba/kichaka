#!/bin/bash

# Set environment variables if not already set
export DJANGO_ENV=${DJANGO_ENV:-development}
export ENVIRONMENT=${ENVIRONMENT:-dev}

# Wait for postgres if you're using it
# while ! nc -z db 5432; do
#   echo "Waiting for postgres..."
#   sleep 0.1
# done

# Create the static directory
mkdir -p /artback/static
mkdir -p /artback/staticfiles

# Collect static files
python manage.py collectstatic --noinput

echo "Checking static folder "
ls /artback/static/

echo "Checking staticfiles folder "
ls /artback/staticfiles/

echo "Running migrations ..."
python manage.py makemigrations --noinput
python manage.py migrate --noinput

echo "Starting server..."
if [ "$DJANGO_ENV" = "production" ]; then
    gunicorn artback.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120
else
    python manage.py runserver 0.0.0.0:8000
fi