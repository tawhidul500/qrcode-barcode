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
