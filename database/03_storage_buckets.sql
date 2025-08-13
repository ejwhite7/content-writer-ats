-- Supabase Storage Buckets for File Uploads
-- Handles resumes, portfolios, assessments, and message attachments

-- Insert storage buckets (this would typically be done via Supabase Dashboard or CLI)
-- But we'll document the required buckets here

/*
Required Storage Buckets:

1. resumes
   - For candidate resume uploads
   - File types: PDF, DOC, DOCX
   - Max size: 10MB
   - Public: false (requires authentication)

2. portfolios
   - For candidate portfolio files
   - File types: PDF, DOC, DOCX, JPG, PNG, MP4, etc.
   - Max size: 50MB
   - Public: false (requires authentication)

3. assessments
   - For assessment-related file uploads
   - File types: PDF, DOC, DOCX, TXT
   - Max size: 25MB
   - Public: false (requires authentication)

4. attachments
   - For message attachments
   - File types: PDF, DOC, DOCX, JPG, PNG, TXT
   - Max size: 25MB
   - Public: false (requires authentication)

5. branding
   - For tenant branding assets (logos, favicons)
   - File types: PNG, JPG, SVG, ICO
   - Max size: 5MB
   - Public: true (for website display)

These buckets should be created using:
supabase storage create-bucket <bucket-name>
*/

-- Storage RLS Policies
-- These policies ensure tenant isolation for file uploads

-- Function to extract tenant_id from file path
CREATE OR REPLACE FUNCTION storage.get_tenant_id_from_path(path text)
RETURNS UUID AS $$
BEGIN
  -- Assuming file paths follow pattern: {tenant_id}/{entity_type}/{file_name}
  RETURN (string_to_array(path, '/'))[1]::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can access file
CREATE OR REPLACE FUNCTION storage.can_access_file(path text, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  file_tenant_id UUID;
  user_tenant_id UUID;
  user_role user_role;
BEGIN
  -- Extract tenant ID from file path
  file_tenant_id := storage.get_tenant_id_from_path(path);
  
  -- Get user's tenant and role
  SELECT tenant_id, role INTO user_tenant_id, user_role
  FROM users 
  WHERE id = user_id AND is_active = true;
  
  -- Check if user belongs to same tenant or is admin
  RETURN file_tenant_id = user_tenant_id OR user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Resume bucket policies
CREATE POLICY "Users can upload resumes to their tenant folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'resumes' AND 
    storage.get_tenant_id_from_path(name) = (
      SELECT tenant_id FROM users WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can view resumes in their tenant" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'resumes' AND 
    storage.can_access_file(name, auth.uid())
  );

CREATE POLICY "Users can update their own resumes" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'resumes' AND 
    storage.can_access_file(name, auth.uid())
  );

CREATE POLICY "Users can delete their own resumes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'resumes' AND 
    storage.can_access_file(name, auth.uid())
  );

-- Portfolio bucket policies
CREATE POLICY "Users can upload portfolios to their tenant folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'portfolios' AND 
    storage.get_tenant_id_from_path(name) = (
      SELECT tenant_id FROM users WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can view portfolios in their tenant" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'portfolios' AND 
    storage.can_access_file(name, auth.uid())
  );

CREATE POLICY "Users can update their own portfolios" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'portfolios' AND 
    storage.can_access_file(name, auth.uid())
  );

CREATE POLICY "Users can delete their own portfolios" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'portfolios' AND 
    storage.can_access_file(name, auth.uid())
  );

-- Assessment bucket policies
CREATE POLICY "Users can upload assessment files to their tenant folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'assessments' AND 
    storage.get_tenant_id_from_path(name) = (
      SELECT tenant_id FROM users WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can view assessment files in their tenant" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'assessments' AND 
    storage.can_access_file(name, auth.uid())
  );

CREATE POLICY "Users can update their own assessment files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'assessments' AND 
    storage.can_access_file(name, auth.uid())
  );

CREATE POLICY "Users can delete their own assessment files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'assessments' AND 
    storage.can_access_file(name, auth.uid())
  );

-- Attachment bucket policies
CREATE POLICY "Users can upload attachments to their tenant folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'attachments' AND 
    storage.get_tenant_id_from_path(name) = (
      SELECT tenant_id FROM users WHERE id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can view attachments in their tenant" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'attachments' AND 
    storage.can_access_file(name, auth.uid())
  );

CREATE POLICY "Users can update their own attachments" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'attachments' AND 
    storage.can_access_file(name, auth.uid())
  );

CREATE POLICY "Users can delete their own attachments" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'attachments' AND 
    storage.can_access_file(name, auth.uid())
  );

-- Branding bucket policies (public access for logos)
CREATE POLICY "Public access to branding assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'branding');

CREATE POLICY "Admins can upload branding assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'branding' AND 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can update branding assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'branding' AND 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can delete branding assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'branding' AND 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND is_active = true
    )
  );

-- Utility functions for file management

-- Function to get file download URL
CREATE OR REPLACE FUNCTION get_file_download_url(bucket_name text, file_path text)
RETURNS text AS $$
BEGIN
  -- This would integrate with Supabase Storage API
  -- Implementation depends on your specific setup
  RETURN format('https://your-project.supabase.co/storage/v1/object/sign/%s/%s', bucket_name, file_path);
END;
$$ LANGUAGE plpgsql;

-- Function to validate file type
CREATE OR REPLACE FUNCTION validate_file_type(bucket_name text, file_name text, mime_type text)
RETURNS boolean AS $$
BEGIN
  CASE bucket_name
    WHEN 'resumes' THEN
      RETURN mime_type IN ('application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    WHEN 'portfolios' THEN
      RETURN mime_type LIKE 'image/%' OR mime_type LIKE 'video/%' OR mime_type IN ('application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    WHEN 'assessments' THEN
      RETURN mime_type IN ('application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain');
    WHEN 'attachments' THEN
      RETURN mime_type IN ('application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png');
    WHEN 'branding' THEN
      RETURN mime_type IN ('image/png', 'image/jpeg', 'image/svg+xml', 'image/x-icon');
    ELSE
      RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to get file size limits
CREATE OR REPLACE FUNCTION get_file_size_limit(bucket_name text)
RETURNS bigint AS $$
BEGIN
  CASE bucket_name
    WHEN 'resumes' THEN RETURN 10 * 1024 * 1024; -- 10MB
    WHEN 'portfolios' THEN RETURN 50 * 1024 * 1024; -- 50MB
    WHEN 'assessments' THEN RETURN 25 * 1024 * 1024; -- 25MB
    WHEN 'attachments' THEN RETURN 25 * 1024 * 1024; -- 25MB
    WHEN 'branding' THEN RETURN 5 * 1024 * 1024; -- 5MB
    ELSE RETURN 1024 * 1024; -- 1MB default
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update file_attachments table when files are uploaded
CREATE OR REPLACE FUNCTION storage.handle_file_upload()
RETURNS trigger AS $$
DECLARE
  tenant_uuid UUID;
  user_uuid UUID;
BEGIN
  -- Extract tenant ID from path
  tenant_uuid := storage.get_tenant_id_from_path(NEW.name);
  
  -- Get user ID from auth context
  user_uuid := auth.uid();
  
  -- Insert record into file_attachments table
  INSERT INTO file_attachments (
    tenant_id,
    user_id,
    file_name,
    file_size,
    file_type,
    mime_type,
    storage_path,
    public_url
  ) VALUES (
    tenant_uuid,
    user_uuid,
    (string_to_array(NEW.name, '/'))[array_length(string_to_array(NEW.name, '/'), 1)],
    NEW.metadata->>'size',
    NEW.metadata->>'mimetype',
    NEW.metadata->>'mimetype',
    NEW.name,
    CASE 
      WHEN NEW.bucket_id = 'branding' THEN 
        format('https://your-project.supabase.co/storage/v1/object/public/%s/%s', NEW.bucket_id, NEW.name)
      ELSE NULL
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: The actual trigger creation depends on Supabase's storage implementation
-- This would typically be handled through Supabase Edge Functions or hooks