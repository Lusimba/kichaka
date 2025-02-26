.PHONY: help dev prod build stop clean logs shell-backend shell-frontend ssl-setup setup-dev-env setup

# Colors for better formatting
GREEN = \033[0;32m
NC = \033[0m # No Color
YELLOW = \033[0;33m
CYAN = \033[0;36m

help: ## Show this help
	@echo "${CYAN}Available commands:${NC}"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "${GREEN}%-20s${NC} %s\n", $$1, $$2}'

# Setup functions
setup: ## Run the automated setup script
	@echo "${YELLOW}Running setup script...${NC}"
	@chmod +x setup.sh
	@./setup.sh
	@echo "${GREEN}Setup completed.${NC}"

setup-dev-env: ## Setup development environment
	@echo "${YELLOW}Setting up development environment...${NC}"
	@mkdir -p nginx/conf.d
	@mkdir -p data/certbot
	@[ -f nginx/conf.d/default.conf ] || cp nginx/conf.d/default.dev.conf nginx/conf.d/default.conf
	@echo "${GREEN}Development environment setup complete.${NC}"

setup-prod-env: ## Setup production environment
	@echo "${YELLOW}Setting up production environment...${NC}"
	@mkdir -p nginx/conf.d
	@mkdir -p data/certbot
	@[ -f nginx/conf.d/default.conf ] || cp nginx/conf.d/default.prod.conf nginx/conf.d/default.conf
	@[ -f .env ] || cp .env.prod .env
	@echo "${GREEN}Production environment setup complete. Don't forget to update your SECRET_KEY in the .env file!${NC}"

# Development commands
dev: ## Start development environment
	@echo "${YELLOW}Starting development environment...${NC}"
	@chmod +x setup.sh
	@make setup-dev-env
	@export DJANGO_ENV=development && export TARGET=development && export NODE_ENV=development && docker compose up -d
	@echo "${GREEN}Development environment started at http://localhost${NC}"

# Production commands
build: ## Build for production
	@echo "${YELLOW}Building containers for production...${NC}"
	@chmod +x setup.sh
	@export DJANGO_ENV=production && export TARGET=production && export NODE_ENV=production && docker compose build
	@echo "${GREEN}Production build complete.${NC}"

prod: ## Start production environment
	@echo "${YELLOW}Starting production environment...${NC}"
	@chmod +x setup.sh
	@make setup-prod-env
	@export DJANGO_ENV=production TARGET=production NODE_ENV=production FRONTEND_COMMAND=build && docker compose up -d
	@echo "${GREEN}Production environment started!${NC}"

# Utility commands
stop: ## Stop all containers
	@echo "${YELLOW}Stopping containers...${NC}"
	@docker compose down
	@echo "${GREEN}Containers stopped.${NC}"

clean: ## Remove all containers, volumes, and networks
	@echo "${YELLOW}Cleaning up...${NC}"
	@docker compose down -v --remove-orphans
	@echo "${GREEN}Cleanup complete.${NC}"

logs: ## View logs from all containers
	@docker compose logs -f

shell-backend: ## Open a shell in the backend container
	@docker compose exec backend /bin/bash || docker compose exec backend /bin/sh

shell-frontend: ## Open a shell in the frontend container
	@docker compose exec frontend /bin/bash || docker compose exec frontend /bin/sh

# Django specific commands
migrate: ## Run Django migrations
	@docker compose exec backend python manage.py migrate

makemigrations: ## Make Django migrations
	@docker compose exec backend python manage.py makemigrations

collectstatic: ## Collect Django static files
	@docker compose exec backend python manage.py collectstatic --noinput

createsuperuser: ## Create Django superuser
	@docker compose exec backend python manage.py createsuperuser

# Development utilities
restart: ## Restart all containers
	@docker compose restart

restart-backend: ## Restart only the backend container
	@docker compose restart backend

restart-frontend: ## Restart only the frontend container
	@docker compose restart frontend

restart-nginx: ## Restart only the nginx container
	@docker compose restart nginx