.PHONY: build up down logs shell migrate makemigrations test clean rebuild start help dev prod

# Variables
DOCKER_COMPOSE = docker compose
ENVIRONMENT ?= dev
NODE_ENV ?= $(ENVIRONMENT)
DJANGO_ENV ?= $(ENVIRONMENT)

# Default target
.DEFAULT_GOAL := help

build: ## Build the Docker images
	ENVIRONMENT=$(ENVIRONMENT) \
	NODE_ENV=$(NODE_ENV) \
	DJANGO_ENV=$(DJANGO_ENV) \
	$(DOCKER_COMPOSE) build

up: ## Start the Docker containers
	ENVIRONMENT=$(ENVIRONMENT) \
	NODE_ENV=$(NODE_ENV) \
	DJANGO_ENV=$(DJANGO_ENV) \
	$(DOCKER_COMPOSE) up -d

down: ## Stop and remove the Docker containers
	$(DOCKER_COMPOSE) down

logs: ## View the logs of all containers
	$(DOCKER_COMPOSE) logs -f

shell: ## Open a shell in the backend container
	$(DOCKER_COMPOSE) exec backend sh

migrate: ## Run Django migrations
	$(DOCKER_COMPOSE) exec backend python manage.py migrate

makemigrations: ## Make Django migrations
	$(DOCKER_COMPOSE) exec backend python manage.py makemigrations

test: ## Run Django tests
	$(DOCKER_COMPOSE) exec backend python manage.py test

clean: ## Remove all Docker containers, volumes, and images related to the project
	$(DOCKER_COMPOSE) down -v --rmi all

rebuild: clean ## Rebuild the project from scratch
	ENVIRONMENT=$(ENVIRONMENT) make build up makemigrations migrate
	@echo "Rebuild complete. The application should now be running."

start: build up migrate ## Build, start the project, and run migrations
	@echo "Starting in $(ENVIRONMENT) environment"
	@echo "Project is now up and running."

dev: ## Start development environment
	ENVIRONMENT=dev \
	NODE_ENV=development \
	DJANGO_ENV=development \
	make start

prod: ## Start production environment
	ENVIRONMENT=prod \
	NODE_ENV=production \
	DJANGO_ENV=production \
	make start

collectstatic: ## Collect Django static files
	$(DOCKER_COMPOSE) exec backend python manage.py collectstatic --noinput

help: ## Display this help message
	@echo "Usage: make [target]"
	@echo "Environment: ENVIRONMENT=[dev|prod] (default: dev)"
	@echo ""
	@echo "Targets:"
	@awk -F ':|##' '/^[^\t].+?:.*?##/ { printf "  %-20s %s\n", $$1, $$NF }' $(MAKEFILE_LIST)