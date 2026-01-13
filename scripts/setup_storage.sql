-- This script contains only the storage setup commands.
-- Useful for setting up storage if the main schema has already been applied.

-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('vault-assets', 'vault-assets', false);

-- 2. Enable RLS on objects (it should be on by default, but good to ensure)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies

-- Policy: Users can upload their own assets
CREATE POLICY "Users can upload their own assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vault-assets' AND auth.uid() = owner);

-- Policy: Users can view their own assets
CREATE POLICY "Users can view their own assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'vault-assets' AND auth.uid() = owner);

-- Policy: Users can update their own assets
CREATE POLICY "Users can update their own assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vault-assets' AND auth.uid() = owner);

-- Policy: Users can delete their own assets
CREATE POLICY "Users can delete their own assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'vault-assets' AND auth.uid() = owner);
