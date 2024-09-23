FROM python:3.11-alpine

ENV PYTHONUNBUFFERED=1

WORKDIR /artback

COPY requirements.txt .

RUN apk add --no-cache postgresql-dev gcc python3-dev musl-dev && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Create a script to run migrations and start the server
RUN echo '#!/bin/sh\n\
    python manage.py migrate\n\
    gunicorn artback.wsgi:application --bind 0.0.0.0:8000' > /start.sh && \
    chmod +x /start.sh

CMD ["/start.sh"]