-- FIX: Storage RLS (Permissive for Local Dev)
DO $$
BEGIN
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    
    -- Drop all restrictive policies
    EXECUTE 'DROP POLICY IF EXISTS "Public Read Avatars" ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS "Auth Upload Avatars" ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS "Auth Update Avatars" ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS "Public Read Logos" ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS "Auth Upload Logos" ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS "Auth Update Logos" ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS "local_avatars_access" ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS "local_logos_access" ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS "avatars_insert" ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS "logos_insert" ON storage.objects';

    -- Create new permissive policies
    -- Only create if buckets exist
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') THEN
        EXECUTE 'CREATE POLICY "local_avatars_access" ON storage.objects FOR ALL TO public USING (bucket_id = ''avatars'') WITH CHECK (bucket_id = ''avatars'')';
    END IF;

    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'logos') THEN
        EXECUTE 'CREATE POLICY "local_logos_access" ON storage.objects FOR ALL TO public USING (bucket_id = ''logos'') WITH CHECK (bucket_id = ''logos'')';
    END IF;

    UPDATE storage.buckets SET public = true WHERE id IN ('avatars', 'logos');
END $$;
