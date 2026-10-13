BEGIN;
CREATE TABLE IF NOT EXISTS tracked_codes (
 id uuid PRIMARY KEY,
 user_id uuid NOT NULL,
 title text NOT NULL CHECK(length(title) BETWEEN 1 AND 80),
 target text NOT NULL CHECK(length(target)<=2048),
 active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(user_id,title,target)
);
CREATE INDEX IF NOT EXISTS tracked_codes_owner ON tracked_codes(user_id);
CREATE TABLE IF NOT EXISTS code_visits (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 code_id uuid NOT NULL REFERENCES tracked_codes(id) ON DELETE CASCADE,
 visited_at timestamptz NOT NULL DEFAULT now(),
 device_hash text NOT NULL,
 country text NOT NULL DEFAULT 'ZZ',
 device text NOT NULL CHECK(device IN ('Mobile','Tablet','Desktop','Unknown'))
);
CREATE INDEX IF NOT EXISTS code_visits_date ON code_visits(code_id,visited_at);
CREATE OR REPLACE FUNCTION create_account_tracking(p_user uuid,p_id uuid,p_title text,p_target text)
RETURNS SETOF tracked_codes LANGUAGE plpgsql AS $$
DECLARE existing tracked_codes;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended('tracking:'||p_user::text,0));
 SELECT * INTO existing FROM tracked_codes WHERE user_id=p_user AND title=p_title AND target=p_target;
 IF FOUND THEN RETURN NEXT existing; RETURN; END IF;
 IF (SELECT count(*) FROM tracked_codes WHERE user_id=p_user)>=50 THEN RAISE EXCEPTION 'tracking_capacity'; END IF;
 RETURN QUERY INSERT INTO tracked_codes(id,user_id,title,target) VALUES(p_id,p_user,p_title,p_target) RETURNING *;
END; $$;
CREATE OR REPLACE FUNCTION record_code_visit(p_id uuid,p_hash text,p_country text,p_device text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended('visits:'||p_id::text,0));
 DELETE FROM code_visits WHERE code_id=p_id AND visited_at<now()-interval '90 days';
 IF NOT EXISTS(SELECT 1 FROM tracked_codes WHERE id=p_id AND active) THEN RETURN; END IF;
 IF (SELECT count(*) FROM code_visits WHERE code_id=p_id AND visited_at>=date_trunc('day',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')>=10000 THEN RETURN; END IF;
 INSERT INTO code_visits(code_id,device_hash,country,device) VALUES(p_id,p_hash,p_country,p_device);
END; $$;
COMMIT;
