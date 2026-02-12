-- FIX: Row Level Security for Local Storage
-- This migration ensures that the 'avatars' and 'logos' buckets are fully accessible in local dev

DO $$
BEGIN
    -- Enable RLS on storage.objects if disabled
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

    -- Drop any existing restrictive policies
    DROP POLICY IF EXISTS "Public Read Avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Auth Upload Avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Auth Update Avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Public Read Logos" ON storage.objects;
    DROP POLICY IF EXISTS "Auth Upload Logos" ON storage.objects;
    DROP POLICY IF EXISTS "Auth Update Logos" ON storage.objects;
    
    -- Create ultra-permissive policies for local development
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') THEN
        CREATE POLICY "local_avatars_access" ON storage.objects FOR ALL USING (bucket_id = 'avatars') WITH CHECK (bucket_id = 'avatars');
    END IF;

    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'logos') THEN
        CREATE POLICY "local_logos_access" ON storage.objects FOR ALL USING (bucket_id = 'logos') WITH CHECK (bucket_id = 'logos');
    END IF;

    -- Also ensure public status of buckets
    UPDATE storage.buckets SET public = true WHERE id IN ('avatars', 'logos');
END $$;
