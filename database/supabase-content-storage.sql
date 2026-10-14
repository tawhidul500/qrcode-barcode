-- Run this in SUPABASE SQL Editor, not Neon. Files stay private.
INSERT INTO storage.buckets(id,name,public,file_size_limit) VALUES('qr-content','qr-content',false,10485760)
ON CONFLICT(id) DO UPDATE SET public=false,file_size_limit=10485760;
CREATE OR REPLACE FUNCTION public.qr_content_owner_access(object_name text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF auth.uid() IS NULL OR (storage.foldername(object_name))[1]<>auth.uid()::text THEN RETURN false; END IF;
 IF EXISTS(SELECT 1 FROM auth.mfa_factors WHERE user_id=auth.uid() AND status='verified') AND coalesce(auth.jwt()->>'aal','aal1')<>'aal2' THEN RETURN false; END IF;
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.qr_content_owner_access(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.qr_content_owner_access(text) TO authenticated;
CREATE OR REPLACE FUNCTION public.qr_content_upload_allowed(object_name text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NOT public.qr_content_owner_access(object_name) THEN RETURN false; END IF;
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(auth.uid()::text,3019));
 RETURN (SELECT count(*) FROM storage.objects WHERE bucket_id='qr-content' AND (storage.foldername(name))[1]=auth.uid()::text)<50;
END $$;
REVOKE ALL ON FUNCTION public.qr_content_upload_allowed(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.qr_content_upload_allowed(text) TO authenticated;
DROP POLICY IF EXISTS "qr_content_owner_insert" ON storage.objects;
CREATE POLICY "qr_content_owner_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='qr-content' AND public.qr_content_upload_allowed(name));
DROP POLICY IF EXISTS "qr_content_owner_read" ON storage.objects;
CREATE POLICY "qr_content_owner_read" ON storage.objects FOR SELECT TO authenticated USING(bucket_id='qr-content' AND public.qr_content_owner_access(name));
DROP POLICY IF EXISTS "qr_content_owner_delete" ON storage.objects;
CREATE POLICY "qr_content_owner_delete" ON storage.objects FOR DELETE TO authenticated USING(bucket_id='qr-content' AND public.qr_content_owner_access(name));
