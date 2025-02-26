#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

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

# Determine environment and set up appropriate nginx config
read -p "Configure for development or production? (dev/prod): " ENV_TYPE

if [ "$ENV_TYPE" == "dev" ] || [ "$ENV_TYPE" == "development" ]; then
    echo -e "${YELLOW}Setting up development environment...${NC}"
    cp nginx/conf.d/default.dev.conf nginx/conf.d/default.conf
    cp .env.example .env 2>/dev/null || echo -e "${YELLOW}.env already exists${NC}"
    echo -e "${GREEN}Development environment configured.${NC}"
elif [ "$ENV_TYPE" == "prod" ] || [ "$ENV_TYPE" == "production" ]; then
    echo -e "${YELLOW}Setting up production environment...${NC}"
    cp nginx/conf.d/default.prod.conf nginx/conf.d/default.conf
    cp .env.prod .env 2>/dev/null || echo -e "${YELLOW}.env already exists${NC}"
    
    # Secret key is already set in .env.prod
    
    echo -e "${GREEN}Production environment configured for kichakapoa.com.${NC}"
else
    echo -e "${RED}Invalid environment type. Please specify 'dev' or 'prod'.${NC}"
    exit 1
fi

echo -e "${GREEN}Setup complete! Run 'make dev' or 'make prod' to start your application.${NC}"