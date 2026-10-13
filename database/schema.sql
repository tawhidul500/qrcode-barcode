-- Run once in the Neon SQL Editor, using the database from DATABASE_URL.
CREATE TABLE IF NOT EXISTS saved_codes (
 user_id uuid NOT NULL,
 id uuid NOT NULL,
 name text NOT NULL CHECK (length(name) BETWEEN 1 AND 80),
 kind text NOT NULL CHECK (kind IN ('qr','barcode')),
 type text NOT NULL CHECK (length(type) BETWEEN 1 AND 80),
 image text NOT NULL CHECK (octet_length(image) <= 32000000),
 image_hash text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 archived boolean NOT NULL DEFAULT false,
 PRIMARY KEY (user_id,id),
 UNIQUE (user_id,image_hash)
);
CREATE INDEX IF NOT EXISTS saved_codes_account_date ON saved_codes(user_id,created_at DESC);
-- Serializes saves for one account, so concurrent devices cannot bypass quotas.
CREATE OR REPLACE FUNCTION save_account_code(p_user uuid,p_id uuid,p_name text,p_kind text,p_type text,p_image text,p_hash text,p_date timestamptz,p_archived boolean)
RETURNS SETOF saved_codes LANGUAGE plpgsql AS $$
DECLARE existing saved_codes;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(p_user::text,0));
 SELECT * INTO existing FROM saved_codes WHERE user_id=p_user AND (id=p_id OR image_hash=p_hash) LIMIT 1;
 IF FOUND THEN RETURN NEXT existing; RETURN; END IF;
 IF (SELECT count(*) FROM saved_codes WHERE user_id=p_user)>=50 OR
    (SELECT coalesce(sum(octet_length(image)),0) FROM saved_codes WHERE user_id=p_user)+octet_length(p_image)>256000000 THEN
  RAISE EXCEPTION 'code_capacity';
 END IF;
 RETURN QUERY INSERT INTO saved_codes(user_id,id,name,kind,type,image,image_hash,created_at,archived)
 VALUES(p_user,p_id,p_name,p_kind,p_type,p_image,p_hash,p_date,p_archived) RETURNING *;
END;
$$;
