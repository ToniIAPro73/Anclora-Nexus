-- FIX: Row Level Security for Local Storage
-- Simple, direct SQL commands without PL/pgSQL wrapper

-- Enable RLS (standard)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Clean up old policies to avoid conflicts
DROP POLICY IF EXISTS "Public Read Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Logos" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload Logos" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update Logos" ON storage.objects;
DROP POLICY IF EXISTS "local_avatars_access" ON storage.objects;
DROP POLICY IF EXISTS "local_logos_access" ON storage.objects;

-- Create permissive policies for local dev
-- Avatars
CREATE POLICY "local_avatars_access" ON storage.objects 
FOR ALL 
TO public 
USING (bucket_id = 'avatars') 
WITH CHECK (bucket_id = 'avatars');

-- Logos
CREATE POLICY "local_logos_access" ON storage.objects 
FOR ALL 
TO public 
USING (bucket_id = 'logos') 
WITH CHECK (bucket_id = 'logos');

-- Ensure buckets are public (this updates data, not schema, but permitted in migrations)
-- Note: Buckets table might be empty if seed.sql failed!
-- We should ensure buckets exist first!
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true), ('logos', 'logos', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- Ensure default organization exists for profile creation
INSERT INTO public.organizations (id, name, slug) 
VALUES ('9d6cb56d-3f21-4f7b-80ea-797a7c2c62cf', 'Anclora Private Estates', 'anclora-private-estates') 
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.organizations (id, name, slug) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Anclora Nexus Zero', 'anclora-nexus-zero') 
ON CONFLICT (id) DO NOTHING;
