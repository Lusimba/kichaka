# artback/Dockerfile
FROM python:3.11-alpine

ENV PYTHONUNBUFFERED=1

WORKDIR /artback

COPY requirements.txt .

RUN apk add --no-cache postgresql-dev gcc python3-dev musl-dev && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

# Create the static directory
RUN mkdir -p /artback/static

# Collect static files
RUN python manage.py collectstatic --noinput

# Make sure the script is executable
RUN chmod +x /artback/start.sh

CMD ["/artback/start.sh"]