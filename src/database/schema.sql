-- ZeroBug PostgreSQL Schema
-- Uses UUIDs for primary keys, timestamps for auditing

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id VARCHAR(32) UNIQUE NOT NULL,
  requests_today INTEGER NOT NULL DEFAULT 0,
  last_request_date DATE DEFAULT CURRENT_DATE,
  total_requests INTEGER NOT NULL DEFAULT 0,
  guild_id VARCHAR(32),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);

-- Request logs (for analytics)
CREATE TABLE IF NOT EXISTS request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  command VARCHAR(20) NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  model VARCHAR(32),
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_request_logs_user ON request_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_request_logs_created ON request_logs(created_at);

-- Saved debugging history
CREATE TABLE IF NOT EXISTS debug_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  command VARCHAR(20) NOT NULL,
  input_code TEXT,
  error_message TEXT,
  output_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_debug_history_user ON debug_history(user_id);
