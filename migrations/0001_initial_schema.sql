CREATE TYPE job_status AS ENUM ('queued', 'running', 'succeeded', 'failed', 'dead_letter', 'cancelled');

CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type text NOT NULL CHECK (char_length(job_type) BETWEEN 1 AND 100),
  payload jsonb NOT NULL,
  status job_status NOT NULL DEFAULT 'queued',
  priority smallint NOT NULL DEFAULT 0 CHECK (priority BETWEEN -1000 AND 1000),
  run_at timestamptz NOT NULL DEFAULT now(),
  idempotency_key text UNIQUE,
  request_fingerprint char(64),
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  max_attempts integer NOT NULL DEFAULT 3 CHECK (max_attempts BETWEEN 1 AND 100),
  claim_generation bigint NOT NULL DEFAULT 0 CHECK (claim_generation >= 0),
  claimed_by text,
  lease_expires_at timestamptz,
  last_error jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((idempotency_key IS NULL) = (request_fingerprint IS NULL)),
  CHECK ((status <> 'running') OR (claimed_by IS NOT NULL AND lease_expires_at IS NOT NULL))
);

CREATE TABLE job_attempts (
  id bigserial PRIMARY KEY,
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE RESTRICT,
  attempt_number integer NOT NULL CHECK (attempt_number > 0),
  claim_generation bigint NOT NULL CHECK (claim_generation > 0),
  worker_id text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  outcome text CHECK (outcome IN ('succeeded', 'failed', 'abandoned', 'cancelled')),
  error jsonb,
  UNIQUE (job_id, attempt_number)
);

CREATE INDEX jobs_claimable_idx ON jobs (priority DESC, run_at ASC, created_at ASC)
  WHERE status = 'queued';
CREATE INDEX jobs_status_created_idx ON jobs (status, created_at DESC);
CREATE INDEX jobs_expired_lease_idx ON jobs (lease_expires_at) WHERE status = 'running';
CREATE INDEX job_attempts_job_id_idx ON job_attempts (job_id, attempt_number DESC);
