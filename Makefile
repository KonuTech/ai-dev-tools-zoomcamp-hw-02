.PHONY: help start stop restart build clean logs test install shell-server shell-client ps status health up down dev prod

# Colors for output
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
NC     := \033[0m # No Color

## help: Display this help message
help:
	@echo "$(GREEN)Available commands:$(NC)"
	@echo ""
	@echo "$(YELLOW)Development:$(NC)"
	@echo "  make start          - Start the application (detached mode)"
	@echo "  make dev            - Start the application (attached mode, see logs)"
	@echo "  make stop           - Stop the application"
	@echo "  make restart        - Restart the application"
	@echo "  make build          - Build Docker images"
	@echo "  make rebuild        - Rebuild Docker images from scratch (no cache)"
	@echo ""
	@echo "$(YELLOW)Logs & Monitoring:$(NC)"
	@echo "  make logs           - View logs from all services"
	@echo "  make logs-server    - View server logs"
	@echo "  make logs-client    - View client logs"
	@echo "  make ps             - List running containers"
	@echo "  make status         - Show application status"
	@echo "  make health         - Check server health endpoint"
	@echo ""
	@echo "$(YELLOW)Testing:$(NC)"
	@echo "  make test           - Run all tests in Docker (integration + E2E)"
	@echo "  make test-int       - Run integration tests in Docker"
	@echo "  make test-e2e       - Run E2E tests in Docker"
	@echo "  make test-quick     - Run integration tests in running container (fast)"
	@echo ""
	@echo "$(YELLOW)Dependencies:$(NC)"
	@echo "  make install        - Install all dependencies"
	@echo "  make install-server - Install server dependencies"
	@echo "  make install-client - Install client dependencies"
	@echo ""
	@echo "$(YELLOW)Shell Access:$(NC)"
	@echo "  make shell-server   - Access server container shell"
	@echo "  make shell-client   - Access client container shell"
	@echo ""
	@echo "$(YELLOW)Cleanup:$(NC)"
	@echo "  make clean          - Stop containers and remove volumes"
	@echo "  make clean-all      - Clean everything (containers, volumes, images)"
	@echo "  make prune          - Remove unused Docker resources"
	@echo ""
	@echo "$(YELLOW)Production:$(NC)"
	@echo "  make prod-build     - Build production Docker image"
	@echo "  make prod-start     - Start production container"
	@echo "  make prod-stop      - Stop production container"
	@echo "  make prod-logs      - View production logs"
	@echo "  make prod           - Build and start production (combined)"
	@echo ""

## start: Start the application in detached mode
start:
	@echo "$(GREEN)Starting the application...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ Application started$(NC)"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend:  http://localhost:3000"

## dev: Start the application in development mode (attached)
dev:
	@echo "$(GREEN)Starting the application in development mode...$(NC)"
	docker-compose up

## up: Alias for start
up: start

## stop: Stop the application
stop:
	@echo "$(YELLOW)Stopping the application...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ Application stopped$(NC)"

## down: Alias for stop
down: stop

## restart: Restart the application
restart: stop start
	@echo "$(GREEN)✓ Application restarted$(NC)"

## build: Build Docker images
build:
	@echo "$(GREEN)Building Docker images...$(NC)"
	docker-compose build
	@echo "$(GREEN)✓ Build complete$(NC)"

## rebuild: Rebuild Docker images from scratch (no cache)
rebuild:
	@echo "$(GREEN)Rebuilding Docker images from scratch...$(NC)"
	docker-compose build --no-cache
	@echo "$(GREEN)✓ Rebuild complete$(NC)"

## logs: View logs from all services
logs:
	docker-compose logs -f

## logs-server: View server logs
logs-server:
	docker-compose logs -f server

## logs-client: View client logs
logs-client:
	docker-compose logs -f client

## ps: List running containers
ps:
	@echo "$(GREEN)Running containers:$(NC)"
	docker-compose ps

## status: Show application status
status:
	@echo "$(GREEN)Application Status:$(NC)"
	@docker-compose ps
	@echo ""
	@echo "$(GREEN)Server Health:$(NC)"
	@curl -s http://localhost:3000/health 2>/dev/null | grep -q "ok" && echo "$(GREEN)✓ Server is healthy$(NC)" || echo "$(RED)✗ Server is not responding$(NC)"

## health: Check server health endpoint
health:
	@echo "$(GREEN)Checking server health...$(NC)"
	@curl -s http://localhost:3000/health | jq . || echo "$(RED)Server not responding$(NC)"

## test: Run all tests in Docker
test:
	@echo "$(GREEN)Running all tests in Docker...$(NC)"
	npm run test

## test-int: Run integration tests in Docker
test-int:
	@echo "$(GREEN)Running integration tests in Docker...$(NC)"
	npm run test:integration

## test-e2e: Run E2E tests in Docker
test-e2e:
	@echo "$(GREEN)Running E2E tests in Docker...$(NC)"
	npm run test:e2e

## test-quick: Run integration tests in running server container (fast)
test-quick:
	@echo "$(GREEN)Running integration tests (quick)...$(NC)"
	docker-compose exec server npm run test:integration

## install: Install all dependencies
install:
	@echo "$(GREEN)Installing all dependencies...$(NC)"
	docker-compose run --rm server npm install
	docker-compose run --rm client npm install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

## install-server: Install server dependencies
install-server:
	@echo "$(GREEN)Installing server dependencies...$(NC)"
	docker-compose run --rm server npm install
	@echo "$(GREEN)✓ Server dependencies installed$(NC)"

## install-client: Install client dependencies
install-client:
	@echo "$(GREEN)Installing client dependencies...$(NC)"
	docker-compose run --rm client npm install
	@echo "$(GREEN)✓ Client dependencies installed$(NC)"

## shell-server: Access server container shell
shell-server:
	@echo "$(GREEN)Accessing server container...$(NC)"
	docker-compose exec server sh

## shell-client: Access client container shell
shell-client:
	@echo "$(GREEN)Accessing client container...$(NC)"
	docker-compose exec client sh

## clean: Stop containers and remove volumes
clean:
	@echo "$(YELLOW)Cleaning up...$(NC)"
	docker-compose down -v
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

## clean-all: Clean everything (containers, volumes, images)
clean-all:
	@echo "$(RED)Cleaning everything...$(NC)"
	docker-compose down -v --rmi all
	@echo "$(GREEN)✓ Deep cleanup complete$(NC)"

## prune: Remove unused Docker resources
prune:
	@echo "$(YELLOW)Pruning unused Docker resources...$(NC)"
	docker system prune -f
	@echo "$(GREEN)✓ Prune complete$(NC)"

## prod-build: Build production image
prod-build:
	@echo "$(GREEN)Building production image...$(NC)"
	docker-compose -f docker-compose.prod.yml build
	@echo "$(GREEN)✓ Production image built$(NC)"

## prod-start: Start production container
prod-start:
	@echo "$(GREEN)Starting production container...$(NC)"
	docker-compose -f docker-compose.prod.yml up -d
	@echo "$(GREEN)✓ Production container started$(NC)"
	@echo "Application: http://localhost:3000"

## prod-stop: Stop production container
prod-stop:
	@echo "$(YELLOW)Stopping production container...$(NC)"
	docker-compose -f docker-compose.prod.yml down
	@echo "$(GREEN)✓ Production container stopped$(NC)"

## prod-logs: View production logs
prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f

## prod: Build and run production (combined)
prod: prod-build prod-start
	@echo "$(GREEN)✓ Production environment ready$(NC)"
