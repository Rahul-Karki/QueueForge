# QueueForge

QueueForge is a learning-focused, PostgreSQL-backed background job platform. It intentionally targets **at-least-once** execution; job handlers must make external side effects idempotent.

## Local setup

1. Install Node.js **22.20.0** (LTS) and enable Corepack: `corepack enable`.
2. Copy `.env.example` to `.env`, then replace both occurrences of `replace-with-a-local-development-password` with the same local password.
3. Install the pinned dependencies: `pnpm install --frozen-lockfile`.
4. Start PostgreSQL: `docker compose up -d postgres`.
5. Apply the schema: `pnpm migrate`.
6. Start the API: `pnpm dev` (or `pnpm build && pnpm start`).
7. Check process liveness: `curl http://localhost:3000/health/live`.
8. Check database readiness: `curl http://localhost:3000/health/ready`.
9. Run local checks: `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.

To run the intentionally idle milestone-1 worker process, use `pnpm worker` after creating `.env`.

## Health semantics

`GET /health/live` only confirms that the HTTP process can respond; it never touches PostgreSQL. `GET /health/ready` runs a parameter-free `SELECT 1` through the connection pool and returns `503` if the database cannot be reached. This distinction prevents a transient database outage from masking whether the API process itself is alive.

## Current scope

Milestone 1 establishes strict TypeScript configuration, Docker PostgreSQL, a transactional migration runner, and the durable jobs/attempts schema. API routes and workers arrive in later milestones.
