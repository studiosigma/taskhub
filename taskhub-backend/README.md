# TaskHub Backend

NestJS REST API untuk TaskHub marketplace.

## Quick Start

```bash
# 1. Start PostgreSQL + app
docker compose up -d

# 2. Push schema & seed data
npx prisma db push
npx prisma db seed

# 3. Start dev server
npm run start:dev
```

Atau pake Make:

```bash
make dev      # Start everything + seed
make reset    # Full reset + re-seed
make test     # Run tests (40+)
```

## Seed Credentials

| Role   | Email              | Password    |
|--------|--------------------|-------------|
| Owner  | andi@taskhub.test  | password123 |
| Owner  | siti@taskhub.test  | password123 |
| Helper | budi@taskhub.test  | password123 |
| Helper | citra@taskhub.test | password123 |
| Admin  | admin@taskhub.test | password123 |

## Seed Data

- **6 categories**: Pindahan, Kebersihan, Event Crew, Tukang, Driver, Belanja
- **6 users**: 2 owners, 3 helpers, 1 admin
- **6 tasks**: in various statuses (OPEN, IN_PROGRESS, COMPLETED)
- **5 applications**: on OPEN tasks
- **2 assignments**: for IN_PROGRESS/COMPLETED tasks
- **Conversation + messages**: between owner and assigned helper
- **1 review**: for completed task
- **1 donation**: sample support donation
- **3 notifications**: for various events

## API Docs

Swagger UI: http://localhost:3000/api/docs

Health check: `GET /health`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Start with hot reload |
| `npm run prisma:reset` | Force reset DB + re-seed |
| `npm run docker:up` | Start Docker services |
| `npm run docker:reset` | Reset Docker volumes + re-seed |
| `npm test` | Unit tests |
| `npm run test:e2e` | E2E integration tests |

## Test Coverage

```
Test Suites: 5 passed, 5 total
Tests:       40 passed, 40 total
```

Covered modules: Auth (10), Tasks (14), Chats (5), Applications (11)
