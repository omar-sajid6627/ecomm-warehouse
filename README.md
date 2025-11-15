# Eco Bottle — Next.js + Express + Postgres + Redis (Dockerized)

[![Node >=20](https://img.shields.io/badge/Node-%3E%3D20.10-brightgreen)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-9.x-orange)](https://pnpm.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue)](https://docs.docker.com/compose/)
[![CI](https://img.shields.io/badge/CI-GitHub_Actions-lightgrey)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Production-like monorepo showcasing a modern web stack:
- Next.js SSR landing with Tailwind, SWR, Framer Motion
- Node/Express API with TypeORM/Postgres, JWT auth, Redis cache/ratelimit, Prometheus metrics
- Nginx reverse proxy and Docker Compose orchestration
- Artillery load tests with HTML report

### Table of Contents
- [Architecture Overview](#architecture-overview)
- [Getting Started (Local Dev)](#getting-started-local-dev)
- [Run Everything in Containers (One Command)](#run-everything-in-containers-one-command)
- [Environment Variables](#environment-variables)
- [API Reference & Auth](#api-reference--auth)
- [Caching, Rate Limiting & Headers](#caching-rate-limiting--headers)
- [Frontend Features](#frontend-features)
- [Observability & Health](#observability--health)
- [Load Testing (Artillery)](#load-testing-artillery)
- [Deployment Notes](#deployment-notes)
- [Security & Production Hardening](#security--production-hardening)
- [Troubleshooting](#troubleshooting)
- [Validation & Smoke Tests](#validation--smoke-tests)
- [Appendices](#appendices)

## Architecture Overview
Next.js frontend and Express backend sit behind Nginx. The API uses PostgreSQL (TypeORM) and Redis (cache, rate limit, token blacklist). Prometheus scrapes backend metrics. All services run via Docker Compose.

```
Client → Nginx:8080 ─┬─ / → frontend:3000 (Next.js SSR)
                     └─ /api → backend-1:4000, backend-2:4000 (Express)
                           ├─ PostgreSQL:5432 (pgdata)
                           └─ Redis:6379
                     └─ /metrics → backend-1:4000/metrics
```

- **frontend**: Next.js (SSR, Tailwind, SWR, Framer Motion, Zod + React Hook Form)
- **backend**: Express, TypeORM, JWT (access tokens), Redis cache + blacklist, Prometheus metrics
- **postgres**: persistent volume `pgdata`
- **redis**: cache + rate-limit store
- **nginx**: reverse proxy + simulated load balancing to two backends
- **prometheus** (optional): scrapes backend metrics

See `apps/` and `infra/` directories.

## Getting Started (Local Dev)
Prereqs: Node >= 20.10, pnpm >= 9

Install deps:
```bash
pnpm install
```

Backend:
- Env: copy `.env.example` to `apps/backend/.env` and set: `DATABASE_URL`, `JWT_SECRET`, `REDIS_URL`, `FRONTEND_ORIGIN`
- Migrations:
```bash
pnpm -C apps/backend migration:run
```
- Seed:
```bash
pnpm -C apps/backend seed
```
- Start dev:
```bash
pnpm -C apps/backend dev
```

Frontend:
- Env: copy `.env.example` to `apps/frontend/.env.local` and set: `NEXT_PUBLIC_API_URL`, `CLOUDINARY_BASE`
- Start dev:
```bash
pnpm -C apps/frontend dev
```

Verify:
- API health: `http://localhost:4000/health`
- Frontend: `http://localhost:3000`

## Run Everything in Containers (One Command)
🚀 One-Command Run:
- Option A (script):
```bash
pnpm run up
```
- Option B (Make):
```bash
make up
```
- Option C (bash helper):
```bash
./run.sh
```

Teardown:
```bash
pnpm run down
# or
make down
```

Ports:
- Nginx: `http://localhost:8080` (frontend)
- API via Nginx: `http://localhost:8080/api`
- Metrics: `http://localhost:8080/metrics` (backend-1)

First run builds images; Postgres/Redis volumes initialize automatically.

## Environment Variables
| Name | Scope | Default | Notes |
|------|-------|---------|-------|
| DATABASE_URL | backend | postgres://eco_user:eco_pass@postgres:5432/eco_db | Postgres DSN |
| JWT_SECRET | backend | dev_super_secret_change_me | Use strong secret in prod |
| REDIS_URL | backend | redis://redis:6379 | Redis DSN |
| FRONTEND_ORIGIN | backend | (prod only) | CORS allowlist origin |
| PORT | backend | 4000 | Container port |
| NEXT_PUBLIC_API_URL | frontend | http://localhost:8080/api | API base URL |
| CLOUDINARY_BASE | frontend | https://res.cloudinary.com/demo/image/upload | CDN base for images |

See `.env.example` files; do not commit real secrets.

## API Reference & Auth
Docs:
- Swagger UI: `http://localhost:8080/docs`
- OpenAPI JSON: `http://localhost:8080/openapi.json`

Auth examples:
```bash
# Register
curl -s -X POST http://localhost:8080/api/auth/register \
  -H 'content-type: application/json' \
  -d '{"email":"t@e.com","password":"Passw0rd!"}'

# Login
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"t@e.com","password":"Passw0rd!"}' | jq -r .token)

# Me
curl -s http://localhost:8080/api/auth/me -H "authorization: Bearer $TOKEN"
```
Products:
```bash
curl -s 'http://localhost:8080/api/products?page=1&limit=12'
curl -s 'http://localhost:8080/api/products/eco-bottle-pro'
```
Leads:
```bash
curl -s -X POST http://localhost:8080/api/leads \
  -H 'content-type: application/json' \
  -d '{"name":"Jane","email":"jane@example.com","message":"Hi"}'
```

JWT: Send as `Authorization: Bearer <token>`. 401 for invalid/expired; logout blacklists the token JTI in Redis until expiry.

## Caching, Rate Limiting & Headers
- Redis cache with stampede protection for product list/detail; invalidated on create/update/delete
- Rate limiting backed by Redis with `RateLimit-*` headers and `Retry-After` on 429
- HTTP caching: `Cache-Control`, ETag-based 304 flow
- `Server-Timing`: includes `db` and `cache;desc="HIT|MISS"`

## Frontend Features
- A/B headline via `?variant=b` (default A)
- Parallax hero (Framer Motion), honors `prefers-reduced-motion`
- Lead form: Zod + React Hook Form, instant validation, toasts, 429 handling
- Product grid: SSR + SWR hydration, Cloudinary images, skeletons, retry on error

## Observability & Health
- Metrics: `prom-client` at `/metrics`
- Health: `/health` and Compose healthchecks
- Prometheus (optional) scrapes backend metrics
- Logs: pino structured logs with request IDs

## Load Testing (Artillery)
🧪 Run:
```bash
pnpm load:test && pnpm load:report
open reports/run.html
```
Targets: product list & detail. Goals: p95 < 200ms, 0% errors (hardware permitting). Adjust `tests/load.yml` rates for constrained laptops.

## Deployment Notes
- Frontend: Vercel/Netlify (set `NEXT_PUBLIC_API_URL`)
- Backend: Render/Fly/Heroku/AWS ECS/Fargate (set `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`)
- Postgres: managed (Multi-AZ), consider `pgbouncer`
- Redis: managed (replicas/sentinel/cluster)
- Nginx: replace with cloud LB (ALB / Ingress) in prod

## Security & Production Hardening
- JWT rotation/refresh, secrets in Vault/SSM, HTTPS termination, strict CORS allowlist
- Input validation (Zod), Helmet; tune CSP
- DoS protections, circuit breakers, timeouts
- Backups, migration/roll-forward strategy

## Troubleshooting
| Issue | Tip |
|------|-----|
| Ports in use | Stop other services or change ports in compose |
| Docker memory | Increase Docker Desktop memory (Resources) |
| DB refused | Check `DATABASE_URL`, container logs, network |
| Redis down | Verify container health, `redis-cli ping` |
| EADDRINUSE | Ensure dev servers aren’t running locally |
| CORS blocked | Set `FRONTEND_ORIGIN` correctly in backend |

Debug:
```bash
docker compose ps
docker compose logs -f backend-1
docker compose exec postgres psql -U eco_user -d eco_db -c "\dt"
```

## Validation & Smoke Tests
After `pnpm up`:
- Visit `http://localhost:8080` (landing OK)
- `curl http://localhost:8080/api/health` → 200 JSON
- Register/login, call `/api/products`
- Submit lead form; expect 200/201
- Visit `/metrics` for Prometheus exposition

## Appendices

### Scripts quick-reference

| Action | pnpm | npm | yarn |
|-------|------|-----|------|
| Install | `pnpm install` | `npm i` | `yarn` |
| Typecheck | `pnpm typecheck` | `npm run typecheck` | `yarn typecheck` |
| Up (compose) | `pnpm run up` | `npm run up` | `yarn up` |
| Down (compose) | `pnpm run down` | `npm run down` | `yarn down` |
| Load test | `pnpm load:test` | `npm run load:test` | `yarn load:test` |
| Load report | `pnpm load:report` | `npm run load:report` | `yarn load:report` |

### Repo layout
```
apps/
  frontend/
  backend/
infra/
  docker/
  nginx/
reports/
tests/
```

### License
MIT

### Credits
Sample images via Cloudinary demo.
