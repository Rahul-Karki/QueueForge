# QueueForge architecture

QueueForge is a modular monolith: one TypeScript codebase with an HTTP API process and one or more independently started worker processes. Both use PostgreSQL as the durable coordination point. This avoids a separate broker while still allowing worker replicas to scale.

```text
Client -> Express API -> application use cases -> PostgreSQL <- worker replicas
                                                ^                 |
                                                +-- claim/lease ---+
```

The domain layer will own job states and transition rules. Application services will coordinate use cases. Infrastructure will implement PostgreSQL, logging, metrics and configuration. API and worker are delivery mechanisms and depend inward; domain code never imports Express or `pg`.

PostgreSQL provides durable state and transactional concurrency. A worker will later claim work with `FOR UPDATE SKIP LOCKED`; that is atomic for database state but deliberately does not make handler effects exactly once. Handlers must therefore make external effects idempotent.
