.PHONY: dev dev-build seed reset test

# ── Development ──

## Start all services (PostgreSQL + app)
dev:
	docker compose up -d
	@echo "Waiting for database to be ready..."
	@sleep 3
	npx prisma db push
	npx prisma db seed
	@echo "✅ App ready at http://localhost:3000"
	@echo "   API docs at http://localhost:3000/api/docs"

## Rebuild and start
dev-build:
	docker compose up -d --build
	npx prisma db push
	npx prisma db seed

## Seed the database with sample data
seed:
	npx prisma db seed

## Reset database and re-seed
reset:
	docker compose down -v
	docker compose up -d
	@sleep 3
	npx prisma db push
	npx prisma db seed

## Run unit tests
test:
	npm test

## Run e2e tests
test-e2e:
	npm run test:e2e

## View logs
logs:
	docker compose logs -f

## Stop all services
stop:
	docker compose down
