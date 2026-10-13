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
