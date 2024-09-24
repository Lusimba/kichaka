FROM python:3.11-alpine

ENV PYTHONUNBUFFERED=1

WORKDIR /artback

COPY requirements.txt .

RUN apk add --no-cache gcc python3-dev musl-dev && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

# Create the static directory
RUN mkdir -p /artback/static

CMD ["sh", "-c", "\
    python manage.py collectstatic --noinput && \
    python manage.py makemigrations && \
    python manage.py migrate && \
    gunicorn artback.wsgi:application --bind 0.0.0.0:8000 \
    "]