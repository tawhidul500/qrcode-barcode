-- Run in the same Neon database as DATABASE_URL. Existing codes are unchanged.
CREATE TABLE IF NOT EXISTS account_profiles (
 user_id uuid PRIMARY KEY,
 profile jsonb NOT NULL DEFAULT '{}'::jsonb,
 updated_at timestamptz NOT NULL DEFAULT now()
);
