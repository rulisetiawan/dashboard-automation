BEGIN;

CREATE TABLE IF NOT EXISTS dashboard_user (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(80) NOT NULL,
  email VARCHAR(160),
  display_name VARCHAR(160) NOT NULL,
  department VARCHAR(120) NOT NULL DEFAULT 'Digital Automation',
  role_code VARCHAR(32) NOT NULL DEFAULT 'VIEWER' CHECK (role_code IN ('ADMIN','ENGINEER','SUPERVISOR','OPERATOR','VIEWER')),
  password_hash TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  failed_login_count INTEGER NOT NULL DEFAULT 0 CHECK (failed_login_count >= 0),
  locked_until TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_dashboard_user_username_ci ON dashboard_user (LOWER(username));
CREATE UNIQUE INDEX IF NOT EXISTS uq_dashboard_user_email_ci ON dashboard_user (LOWER(email)) WHERE email IS NOT NULL;

CREATE TABLE IF NOT EXISTS dashboard_session (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES dashboard_user(user_id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  user_agent VARCHAR(500),
  ip_address INET,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_session_active ON dashboard_session (user_id, expires_at DESC) WHERE revoked_at IS NULL;

COMMIT;

