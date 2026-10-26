-- ==============================================================================
-- 004_storage_setup.sql
-- Storage bucket and policies for bot logos
-- ==============================================================================

-- Create public 'logos' storage bucket if it does not already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'logos',
    'logos',
    true,
    2097152, -- 2 MB
    ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp'];

-- ------------------------------------------------------------------------------
-- Storage Policies for 'logos' bucket
-- ------------------------------------------------------------------------------

-- Ensure legacy / insecure policies are dropped
DROP POLICY IF EXISTS "Public can view logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload logos to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their own logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their own logos" ON storage.objects;

-- 1. Allow public read access to all logos (needed for website widgets and previews)
CREATE POLICY "Public can view logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'logos');

-- 2. Allow authenticated users to upload logos ONLY into their own user-scoped directory
CREATE POLICY "Authenticated users can upload logos to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (LOWER(storage.extension(name)) IN ('png', 'jpg', 'jpeg', 'webp'))
);

-- 3. Allow authenticated users to update logos in their own directory
CREATE POLICY "Authenticated users can update their own logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (LOWER(storage.extension(name)) IN ('png', 'jpg', 'jpeg', 'webp'))
);

-- 4. Allow authenticated users to delete logos in their own directory
CREATE POLICY "Authenticated users can delete their own logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
);
