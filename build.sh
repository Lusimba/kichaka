#!/bin/bash
# build.sh

# Build frontend assets first
echo "Building frontend assets..."
docker build -t artfront-builder --target builder ./artfront
docker create --name artfront-extract artfront-builder
docker cp artfront-extract:/artfront/dist ./artfront/
docker rm artfront-extract

# Now build everything with docker-compose
echo "Building all containers..."
docker compose build

echo "Build complete!"