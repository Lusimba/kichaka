FROM python:3.11-slim-bookworm AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_DEFAULT_TIMEOUT=100

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /artback

COPY requirements.txt .

RUN pip wheel --no-cache-dir --no-deps --wheel-dir /artback/wheels -r requirements.txt

# Final stage
FROM python:3.11-slim-bookworm

# Create a non-root user and install dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    netcat-openbsd \
    dos2unix \  
    && rm -rf /var/lib/apt/lists/* \
    && useradd -m -u 1000 appuser

# Set env variables
ENV PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=artback.settings \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /artback

# Copy wheels from builder and install
COPY --from=builder /artback/wheels /wheels
COPY --from=builder /artback/requirements.txt .
RUN pip install --no-cache-dir /wheels/*

# Copy entrypoint script first
COPY entrypoint.sh /artback/

# Fix line endings and set permissions
RUN dos2unix /artback/entrypoint.sh \
    && chmod +x /artback/entrypoint.sh

# Copy project files
COPY . .

# Set proper ownership
RUN chown -R appuser:appuser /artback \
    && chmod -R 755 /artback

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

ENTRYPOINT ["sh", "/artback/entrypoint.sh"]