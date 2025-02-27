#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get environment type from first argument or environment variable
ENV_TYPE=${1:-${ENV_TYPE:-""}}

echo -e "${YELLOW}Setting up project structure...${NC}"

# Create required directories
mkdir -p nginx/conf.d
mkdir -p artback/data
mkdir -p artback/media
mkdir -p artback/staticfiles

# Copy nginx configuration files
cp nginx.conf nginx/nginx.conf 2>/dev/null || echo -e "${YELLOW}nginx.conf already exists${NC}"
cp default.dev.conf nginx/conf.d/default.dev.conf 2>/dev/null || echo -e "${YELLOW}default.dev.conf already exists${NC}"
cp default.prod.conf nginx/conf.d/default.prod.conf 2>/dev/null || echo -e "${YELLOW}default.prod.conf already exists${NC}"

# Configure based on environment type
if [ "$ENV_TYPE" == "dev" ] || [ "$ENV_TYPE" == "development" ]; then
    echo -e "${YELLOW}Setting up development environment...${NC}"
    cp nginx/conf.d/default.dev.conf nginx/conf.d/default.conf
    # Ensure this file is also copied to where nginx is actually looking
    mkdir -p nginx/dev
    cp nginx/conf.d/default.dev.conf nginx/dev/default.conf
    # Create a symlink in conf.d to ensure it's loaded
    rm -f nginx/conf.d/default.conf
    ln -sf default.dev.conf nginx/conf.d/default.conf
    cp .env.example .env 2>/dev/null || echo -e "${YELLOW}.env already exists${NC}"
    echo -e "${GREEN}Development environment configured.${NC}"
elif [ "$ENV_TYPE" == "prod" ] || [ "$ENV_TYPE" == "production" ]; then
    echo -e "${YELLOW}Setting up production environment...${NC}"
    cp nginx/conf.d/default.prod.conf nginx/conf.d/default.conf
    # Ensure this file is also copied to where nginx is actually looking
    mkdir -p nginx/dev
    cp nginx/conf.d/default.prod.conf nginx/dev/default.conf
    # Create a symlink in conf.d to ensure it's loaded
    rm -f nginx/conf.d/default.conf
    ln -sf default.prod.conf nginx/conf.d/default.conf
    cp .env.prod .env 2>/dev/null || echo -e "${YELLOW}.env already exists${NC}"
    
    # Secret key is already set in .env.prod
    
    echo -e "${GREEN}Production environment configured for kichakapoa.com.${NC}"
else
    echo -e "${RED}Invalid or missing environment type. Please specify 'dev' or 'prod' as the first argument.${NC}"
    echo -e "${YELLOW}Usage: ./setup.sh [dev|prod]${NC}"
    exit 1
fi

# Make debugging scripts executable
chmod +x debug-nginx.sh 2>/dev/null || echo -e "${YELLOW}debug-nginx.sh not yet created${NC}"
chmod +x fix-permissions.sh 2>/dev/null || echo -e "${YELLOW}fix-permissions.sh not yet created${NC}"

echo -e "${GREEN}Setup complete! Run 'make dev' or 'make prod' to start your application.${NC}"
echo -e "${YELLOW}If you encounter 403 errors, run 'make fix-permissions' and 'make debug-nginx' to help troubleshoot.${NC}"