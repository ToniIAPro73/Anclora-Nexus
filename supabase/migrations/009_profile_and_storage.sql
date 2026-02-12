-- Migration to enhance user profiles and storage
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS specialization JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Mallorca, ES',
ADD COLUMN IF NOT EXISTS job_title TEXT DEFAULT 'Luxury Estate Consultant',
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Ensure storage schema exists and create avatars bucket
-- Note: inserting into storage.buckets might require bypassrls or being an admin
-- In a real Supabase environment, this is often done via the dashboard or specific storage management tools.
-- But we'll try to do it via SQL for the v0 setup.

INSERT INTO storage.buckets (id, name, public)
SELECT 'avatars', 'avatars', true
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public read access to avatars
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- Policy to allow authenticated users to upload their own avatars
CREATE POLICY "Avatar Upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.role() = 'authenticated'
);

-- Policy to allow authenticated users to update their own objects
CREATE POLICY "Avatar Update" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND auth.uid() = owner
);
