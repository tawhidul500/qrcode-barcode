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
-- Run in the same Neon database as DATABASE_URL. Existing codes are unchanged.
CREATE TABLE IF NOT EXISTS account_profiles (
 user_id uuid PRIMARY KEY,
 profile jsonb NOT NULL DEFAULT '{}'::jsonb,
 updated_at timestamptz NOT NULL DEFAULT now()
);
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

BEGIN;
CREATE TABLE IF NOT EXISTS code_folders(id uuid PRIMARY KEY,user_id uuid NOT NULL,name text NOT NULL CHECK(length(name) BETWEEN 1 AND 80),created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(user_id,name));
ALTER TABLE saved_codes ADD COLUMN IF NOT EXISTS folder_id uuid REFERENCES code_folders(id) ON DELETE SET NULL;
ALTER TABLE saved_codes ADD COLUMN IF NOT EXISTS editor jsonb;
ALTER TABLE saved_codes ADD COLUMN IF NOT EXISTS tracking_id uuid REFERENCES tracked_codes(id) ON DELETE SET NULL;
ALTER TABLE saved_codes DROP CONSTRAINT IF EXISTS saved_codes_user_id_image_hash_key;
ALTER TABLE tracked_codes ADD COLUMN IF NOT EXISTS slug text UNIQUE;
CREATE INDEX IF NOT EXISTS saved_codes_image_lookup ON saved_codes(user_id,image_hash);
CREATE TABLE IF NOT EXISTS code_transfers(token_hash text PRIMARY KEY,code_id uuid NOT NULL,sender_id uuid NOT NULL,recipient_email text NOT NULL,expires_at timestamptz NOT NULL);

CREATE OR REPLACE FUNCTION save_managed_code(p_user uuid,p_id uuid,p_name text,p_kind text,p_type text,p_image text,p_hash text,p_date timestamptz,p_archived boolean,p_editor jsonb,p_tracking uuid,p_folder uuid,p_copy boolean DEFAULT false)
RETURNS SETOF saved_codes LANGUAGE plpgsql AS $$
DECLARE existing saved_codes; used_bytes bigint;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(p_user::text,0));
 IF p_tracking IS NOT NULL AND NOT EXISTS(SELECT 1 FROM tracked_codes WHERE id=p_tracking AND user_id=p_user) THEN RAISE EXCEPTION 'invalid_tracking'; END IF;
 IF p_folder IS NOT NULL AND NOT EXISTS(SELECT 1 FROM code_folders WHERE id=p_folder AND user_id=p_user) THEN RAISE EXCEPTION 'invalid_folder'; END IF;
 SELECT * INTO existing FROM saved_codes WHERE user_id=p_user AND id=p_id;
 IF NOT FOUND AND NOT p_copy THEN
  SELECT * INTO existing FROM saved_codes WHERE user_id=p_user AND image_hash=p_hash AND kind=p_kind AND NOT archived ORDER BY created_at LIMIT 1;
  IF FOUND THEN
   RETURN QUERY UPDATE saved_codes SET editor=coalesce(p_editor,editor),tracking_id=coalesce(p_tracking,tracking_id),folder_id=coalesce(p_folder,folder_id),type=CASE WHEN p_editor IS NULL THEN type ELSE p_type END WHERE user_id=p_user AND id=existing.id RETURNING *;
   RETURN;
  END IF;
 END IF;
 SELECT coalesce(sum(octet_length(image)),0) INTO used_bytes FROM saved_codes WHERE user_id=p_user AND id<>p_id;
 IF used_bytes+octet_length(p_image)>256000000 OR (existing.id IS NULL AND (SELECT count(*) FROM saved_codes WHERE user_id=p_user)>=50) THEN RAISE EXCEPTION 'code_capacity'; END IF;
 IF existing.id IS NOT NULL THEN
  RETURN QUERY UPDATE saved_codes SET name=p_name,kind=p_kind,type=p_type,image=p_image,image_hash=p_hash,editor=coalesce(p_editor,editor),tracking_id=p_tracking,folder_id=coalesce(p_folder,folder_id) WHERE user_id=p_user AND id=p_id RETURNING *;
 ELSE
  RETURN QUERY INSERT INTO saved_codes(user_id,id,name,kind,type,image,image_hash,created_at,archived,editor,tracking_id,folder_id) VALUES(p_user,p_id,p_name,p_kind,p_type,p_image,p_hash,p_date,p_archived,p_editor,p_tracking,p_folder) RETURNING *;
 END IF;
END; $$;
CREATE OR REPLACE FUNCTION accept_code_transfer(p_hash text,p_recipient uuid,p_email text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE invitation code_transfers; source saved_codes; track tracked_codes;
BEGIN
 SELECT * INTO invitation FROM code_transfers WHERE token_hash=p_hash;
 IF NOT FOUND THEN RAISE EXCEPTION 'invalid_transfer'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(least(invitation.sender_id::text,p_recipient::text),0));
 PERFORM pg_advisory_xact_lock(hashtextextended(greatest(invitation.sender_id::text,p_recipient::text),0));
 SELECT * INTO invitation FROM code_transfers WHERE token_hash=p_hash FOR UPDATE;
 IF NOT FOUND OR invitation.expires_at<now() OR invitation.recipient_email<>lower(p_email) OR invitation.sender_id=p_recipient THEN RAISE EXCEPTION 'invalid_transfer'; END IF;
 SELECT * INTO source FROM saved_codes WHERE id=invitation.code_id AND user_id=invitation.sender_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'invalid_transfer'; END IF;
 IF (SELECT count(*) FROM saved_codes WHERE user_id=p_recipient)>=50 OR (SELECT coalesce(sum(octet_length(image)),0) FROM saved_codes WHERE user_id=p_recipient)+octet_length(source.image)>256000000 THEN RAISE EXCEPTION 'code_capacity'; END IF;
 IF source.tracking_id IS NOT NULL THEN
  IF EXISTS(SELECT 1 FROM saved_codes WHERE user_id=invitation.sender_id AND tracking_id=source.tracking_id AND id<>source.id) THEN RAISE EXCEPTION 'shared_tracking'; END IF;
  SELECT * INTO track FROM tracked_codes WHERE id=source.tracking_id AND user_id=invitation.sender_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'invalid_tracking'; END IF;
  IF (SELECT count(*) FROM tracked_codes WHERE user_id=p_recipient)>=50 OR EXISTS(SELECT 1 FROM tracked_codes WHERE user_id=p_recipient AND title=track.title AND target=track.target) THEN RAISE EXCEPTION 'tracking_conflict'; END IF;
  UPDATE tracked_codes SET user_id=p_recipient WHERE id=source.tracking_id;
 END IF;
 UPDATE saved_codes SET user_id=p_recipient,folder_id=NULL WHERE id=source.id AND user_id=invitation.sender_id;
 DELETE FROM code_transfers WHERE code_id=source.id AND sender_id=invitation.sender_id;
END; $$;
CREATE OR REPLACE FUNCTION create_account_folder(p_user uuid,p_id uuid,p_name text)
RETURNS SETOF code_folders LANGUAGE plpgsql AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended('folders:'||p_user::text,0));
 IF (SELECT count(*) FROM code_folders WHERE user_id=p_user)>=50 THEN RAISE EXCEPTION 'folder_capacity'; END IF;
 RETURN QUERY INSERT INTO code_folders(id,user_id,name) VALUES(p_id,p_user,p_name) RETURNING *;
END; $$;
COMMIT;

-- Hosted QR content pages
CREATE TABLE IF NOT EXISTS qr_content_pages (
 id uuid PRIMARY KEY, user_id uuid NOT NULL, type text NOT NULL, data jsonb NOT NULL,
 password_hash text, active boolean NOT NULL DEFAULT true, visits bigint NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE qr_content_pages ADD COLUMN IF NOT EXISTS visits bigint NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS qr_content_pages_owner ON qr_content_pages(user_id);
CREATE TABLE IF NOT EXISTS qr_content_access_attempts(page_id uuid NOT NULL REFERENCES qr_content_pages(id) ON DELETE CASCADE, visitor_hash text NOT NULL, period bigint NOT NULL, attempts integer NOT NULL DEFAULT 1, PRIMARY KEY(page_id,visitor_hash,period));
CREATE OR REPLACE FUNCTION save_account_content(p_user uuid,p_id uuid,p_type text,p_data jsonb,p_password text,p_clear boolean)
RETURNS SETOF qr_content_pages LANGUAGE plpgsql AS $$
DECLARE existing qr_content_pages;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(p_user::text,0));
 SELECT * INTO existing FROM qr_content_pages WHERE id=p_id;
 IF existing.id IS NOT NULL AND existing.user_id<>p_user THEN RAISE EXCEPTION 'content_not_owned'; END IF;
 IF existing.id IS NULL AND (SELECT count(*) FROM qr_content_pages WHERE user_id=p_user)>=50 THEN RAISE EXCEPTION 'content_capacity'; END IF;
 IF existing.id IS NULL THEN INSERT INTO qr_content_pages(id,user_id,type,data,password_hash) VALUES(p_id,p_user,p_type,p_data,p_password);
 ELSE UPDATE qr_content_pages SET type=p_type,data=p_data,password_hash=CASE WHEN p_clear THEN NULL WHEN p_password IS NOT NULL THEN p_password ELSE password_hash END,active=true,updated_at=now() WHERE id=p_id AND user_id=p_user; END IF;
 RETURN QUERY SELECT * FROM qr_content_pages WHERE id=p_id AND user_id=p_user;
END $$;

-- Transfer hosted pages with their saved codes; private-file ownership remains separate.
CREATE OR REPLACE FUNCTION accept_code_transfer(p_hash text,p_recipient uuid,p_email text)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE invitation code_transfers; source saved_codes; track tracked_codes; content qr_content_pages;
BEGIN
 SELECT * INTO invitation FROM code_transfers WHERE token_hash=p_hash;
 IF NOT FOUND THEN RAISE EXCEPTION 'invalid_transfer'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(least(invitation.sender_id::text,p_recipient::text),0));
 PERFORM pg_advisory_xact_lock(hashtextextended(greatest(invitation.sender_id::text,p_recipient::text),0));
 SELECT * INTO invitation FROM code_transfers WHERE token_hash=p_hash FOR UPDATE;
 IF NOT FOUND OR invitation.expires_at<now() OR invitation.recipient_email<>lower(p_email) OR invitation.sender_id=p_recipient THEN RAISE EXCEPTION 'invalid_transfer'; END IF;
 SELECT * INTO source FROM saved_codes WHERE id=invitation.code_id AND user_id=invitation.sender_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'invalid_transfer'; END IF;
 IF (SELECT count(*) FROM saved_codes WHERE user_id=p_recipient)>=50 OR (SELECT coalesce(sum(octet_length(image)),0) FROM saved_codes WHERE user_id=p_recipient)+octet_length(source.image)>256000000 THEN RAISE EXCEPTION 'code_capacity'; END IF;
 IF source.tracking_id IS NOT NULL THEN
  IF EXISTS(SELECT 1 FROM saved_codes WHERE user_id=invitation.sender_id AND tracking_id=source.tracking_id AND id<>source.id) THEN RAISE EXCEPTION 'shared_tracking'; END IF;
  SELECT * INTO track FROM tracked_codes WHERE id=source.tracking_id AND user_id=invitation.sender_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'invalid_tracking'; END IF;
  IF (SELECT count(*) FROM tracked_codes WHERE user_id=p_recipient)>=50 OR EXISTS(SELECT 1 FROM tracked_codes WHERE user_id=p_recipient AND title=track.title AND target=track.target) THEN RAISE EXCEPTION 'tracking_conflict'; END IF;
  UPDATE tracked_codes SET user_id=p_recipient WHERE id=source.tracking_id;
 END IF;
 IF source.editor->'hosted'->>'id' IS NOT NULL THEN
  SELECT * INTO content FROM qr_content_pages WHERE id=(source.editor->'hosted'->>'id')::uuid AND user_id=invitation.sender_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'invalid_transfer'; END IF;
  IF coalesce(content.data->>'filePath','')<>'' THEN RAISE EXCEPTION 'hosted_file_transfer'; END IF;
  IF EXISTS(SELECT 1 FROM saved_codes WHERE user_id=invitation.sender_id AND editor->'hosted'->>'id'=content.id::text AND id<>source.id) THEN RAISE EXCEPTION 'shared_content'; END IF;
  IF (SELECT count(*) FROM qr_content_pages WHERE user_id=p_recipient)>=50 THEN RAISE EXCEPTION 'content_capacity'; END IF;
  UPDATE qr_content_pages SET user_id=p_recipient WHERE id=content.id AND user_id=invitation.sender_id;
 END IF;
 UPDATE saved_codes SET user_id=p_recipient,folder_id=NULL WHERE id=source.id AND user_id=invitation.sender_id;
 DELETE FROM code_transfers WHERE code_id=source.id AND sender_id=invitation.sender_id;
END; $$;
