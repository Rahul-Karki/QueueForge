# Milestone 1: foundation

The initial schema is intentionally broader than a simple queue because later reliability work needs durable fields from day one: `claim_generation` fences stale workers, `lease_expires_at` enables crash recovery, and `job_attempts` preserves execution history. No worker behavior is implemented yet.

Migrations are immutable, numbered SQL files. The migration runner serializes runners with a PostgreSQL advisory lock, applies each unrecorded file in its own transaction, and records it only after the SQL succeeds. This makes repeated invocations safe and prevents two application instances from concurrently applying the same migration.

The public demo API must remain unauthenticated only for local use. It will need authentication, authorization, rate limits, payload controls, and abuse protection before exposure to arbitrary users.

## Source layout

```text
src/
  domain/          # pure job model and state rules
  application/     # use cases and retry orchestration
  infrastructure/  # config, PostgreSQL, logs and metrics
  api/             # Express HTTP adapter
  worker/          # process loop and handler adapter
migrations/        # immutable, ordered SQL files
tests/             # unit, integration and concurrency tests
docs/              # design and operational documents
```
