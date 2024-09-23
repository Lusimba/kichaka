# makefile
.PHONY: build up down logs shell migrate makemigrations test clean rebuild start help

# Variables
DOCKER_COMPOSE = docker-compose

# Default target
.DEFAULT_GOAL := help

build: ## Build the Docker images
	$(DOCKER_COMPOSE) build
	$(DOCKER_COMPOSE) up -d
	$(DOCKER_COMPOSE) exec backend python manage.py makemigrations
	$(DOCKER_COMPOSE) exec backend python manage.py migrate
	$(DOCKER_COMPOSE) down

up: ## Start the Docker containers
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

rebuild: clean build up makemigrations migrate ## Rebuild the project from scratch
	@echo "Rebuild complete. The application should now be running on http://localhost:3000/."

start: build up migrate ## Build, start the project, and run migrations
	@echo "Project is now up and running. You can access it at http://localhost:3000/"

help: ## Display this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@awk -F ':|##' '/^[^\t].+?:.*?##/ { printf "  %-20s %s\n", $$1, $$NF }' $(MAKEFILE_LIST)