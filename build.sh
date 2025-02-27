#!/bin/bash
# build.sh

# Colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Building frontend for production...${NC}"

# Ensure the dist directory exists and has proper permissions
mkdir -p ./artfront/dist
chmod -R 755 ./artfront/dist 2>/dev/null || sudo chmod -R 755 ./artfront/dist

# Option 1: Build with local Node.js if available
if command -v npm &> /dev/null; then
  echo -e "${GREEN}Using local Node.js installation${NC}"
  (cd artfront && npm ci && npm run build)
  if [ $? -ne 0 ]; then
    echo -e "${RED}Local build failed, trying with Docker...${NC}"
    # Fall back to Docker if local build fails
    docker run --rm -v $(pwd)/artfront:/app -w /app node:18-slim npm ci && npm run build
  fi
else
  # Option 2: Build with Docker if local Node.js is not available
  echo -e "${YELLOW}Node.js not found locally, building with Docker...${NC}"
  docker run --rm -v $(pwd)/artfront:/app -w /app node:18-slim sh -c "npm ci && npm run build"
fi

# Ensure permissions after build
chmod -R 755 ./artfront/dist 2>/dev/null || sudo chmod -R 755 ./artfront/dist

echo -e "${GREEN}Frontend build complete!${NC}"