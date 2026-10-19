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

-- Allow public read access to all logos
CREATE POLICY "Public can view logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'logos');

-- Allow authenticated users to upload logos
CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'logos'
    AND (LOWER(storage.extension(name)) IN ('png', 'jpg', 'jpeg', 'webp'))
);

-- Allow users to delete their own uploaded logos
CREATE POLICY "Users can delete their own logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'logos' AND auth.uid() = owner);
