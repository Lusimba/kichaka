# artback/start.sh
#!/bin/sh

# Create the static directory
mkdir -p /artback/static

# Collect static files
python manage.py collectstatic --noinput

# Make migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Start Gunicorn
gunicorn artback.wsgi:application --bind 0.0.0.0:8000