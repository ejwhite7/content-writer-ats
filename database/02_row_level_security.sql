-- Row Level Security (RLS) Policies for Multi-Tenant Isolation
-- Ensures data isolation between tenants for white-label support

-- Enable RLS on all tenant-specific tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's tenant_id
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_tenant_id', true)::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user's ID
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN current_setting('app.current_user_id', true)::UUID;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = get_current_user_id() 
    AND tenant_id = get_current_tenant_id()
    AND role = 'admin'
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user owns a record
CREATE OR REPLACE FUNCTION user_owns_record(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_current_user_id() = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tenants policies
CREATE POLICY "Tenants can view their own tenant" ON tenants
  FOR SELECT USING (id = get_current_tenant_id());

CREATE POLICY "Admins can update their tenant" ON tenants
  FOR UPDATE USING (id = get_current_tenant_id() AND is_admin());

-- Branding settings policies
CREATE POLICY "Tenant members can view branding settings" ON branding_settings
  FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Admins can manage branding settings" ON branding_settings
  FOR ALL USING (tenant_id = get_current_tenant_id() AND is_admin());

-- Users policies
CREATE POLICY "Users can view users in their tenant" ON users
  FOR SELECT USING (tenant_id = get_current_tenant_id());

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (
    tenant_id = get_current_tenant_id() AND 
    (id = get_current_user_id() OR is_admin())
  );

CREATE POLICY "Admins can create users in their tenant" ON users
  FOR INSERT WITH CHECK (tenant_id = get_current_tenant_id() AND is_admin());

CREATE POLICY "Admins can delete users in their tenant" ON users
  FOR DELETE USING (tenant_id = get_current_tenant_id() AND is_admin());

-- Jobs policies
CREATE POLICY "Everyone can view published jobs in tenant" ON jobs
  FOR SELECT USING (
    tenant_id = get_current_tenant_id() AND 
    (status = 'published' OR is_admin())
  );

CREATE POLICY "Admins can manage jobs" ON jobs
  FOR ALL USING (tenant_id = get_current_tenant_id() AND is_admin());

-- Applications policies
CREATE POLICY "Users can view their own applications or admin can view all" ON applications
  FOR SELECT USING (
    tenant_id = get_current_tenant_id() AND 
    (candidate_id = get_current_user_id() OR is_admin())
  );

CREATE POLICY "Candidates can create applications" ON applications
  FOR INSERT WITH CHECK (
    tenant_id = get_current_tenant_id() AND 
    candidate_id = get_current_user_id()
  );

CREATE POLICY "Users can update their own applications or admin can update any" ON applications
  FOR UPDATE USING (
    tenant_id = get_current_tenant_id() AND 
    (candidate_id = get_current_user_id() OR is_admin())
  );

CREATE POLICY "Admins can delete applications" ON applications
  FOR DELETE USING (tenant_id = get_current_tenant_id() AND is_admin());

-- Assessments policies
CREATE POLICY "Users can view assessments for their applications or admin can view all" ON assessments
  FOR SELECT USING (
    tenant_id = get_current_tenant_id() AND 
    (EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = assessments.application_id 
      AND applications.candidate_id = get_current_user_id()
    ) OR is_admin())
  );

CREATE POLICY "Users can update their own assessments or admin can update any" ON assessments
  FOR ALL USING (
    tenant_id = get_current_tenant_id() AND 
    (EXISTS (
      SELECT 1 FROM applications 
      WHERE applications.id = assessments.application_id 
      AND applications.candidate_id = get_current_user_id()
    ) OR is_admin())
  );

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    tenant_id = get_current_tenant_id() AND 
    (sender_id = get_current_user_id() OR 
     recipient_id = get_current_user_id() OR 
     is_admin())
  );

CREATE POLICY "Users can send messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    tenant_id = get_current_tenant_id() AND 
    (sender_id = get_current_user_id() OR is_admin())
  );

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (
    tenant_id = get_current_tenant_id() AND 
    (sender_id = get_current_user_id() OR is_admin())
  );

-- File attachments policies
CREATE POLICY "Users can view their own files or admin can view all" ON file_attachments
  FOR SELECT USING (
    tenant_id = get_current_tenant_id() AND 
    (user_id = get_current_user_id() OR is_admin())
  );

CREATE POLICY "Users can upload files" ON file_attachments
  FOR INSERT WITH CHECK (
    tenant_id = get_current_tenant_id() AND 
    user_id = get_current_user_id()
  );

CREATE POLICY "Users can manage their own files or admin can manage all" ON file_attachments
  FOR ALL USING (
    tenant_id = get_current_tenant_id() AND 
    (user_id = get_current_user_id() OR is_admin())
  );

-- API keys policies (admin only)
CREATE POLICY "Admins can manage API keys" ON api_keys
  FOR ALL USING (tenant_id = get_current_tenant_id() AND is_admin());

-- Webhooks policies (admin only)
CREATE POLICY "Admins can manage webhooks" ON webhooks
  FOR ALL USING (tenant_id = get_current_tenant_id() AND is_admin());

-- Webhook deliveries policies (admin only)
CREATE POLICY "Admins can view webhook deliveries" ON webhook_deliveries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM webhooks 
      WHERE webhooks.id = webhook_deliveries.webhook_id 
      AND webhooks.tenant_id = get_current_tenant_id()
    ) AND is_admin()
  );

-- Audit logs policies (admin only)
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (tenant_id = get_current_tenant_id() AND is_admin());

-- Email templates policies (admin only)
CREATE POLICY "Admins can manage email templates" ON email_templates
  FOR ALL USING (tenant_id = get_current_tenant_id() AND is_admin());

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Create role for anonymous (public job board access)
CREATE ROLE anon;
GRANT USAGE ON SCHEMA public TO anon;

-- Allow anonymous users to view published jobs only
CREATE POLICY "Anonymous users can view published jobs" ON jobs
  FOR SELECT TO anon USING (status = 'published');

CREATE POLICY "Anonymous users can view public tenant info" ON tenants
  FOR SELECT TO anon USING (is_active = true);

CREATE POLICY "Anonymous users can view public branding" ON branding_settings
  FOR SELECT TO anon USING (true);

GRANT SELECT ON jobs TO anon;
GRANT SELECT ON tenants TO anon;
GRANT SELECT ON branding_settings TO anon;

-- Security functions for application logic

-- Function to set tenant context (called by application)
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_id UUID, user_id UUID DEFAULT NULL)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', tenant_id::text, true);
  IF user_id IS NOT NULL THEN
    PERFORM set_config('app.current_user_id', user_id::text, true);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear context
CREATE OR REPLACE FUNCTION clear_context()
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', '', true);
  PERFORM set_config('app.current_user_id', '', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate tenant access
CREATE OR REPLACE FUNCTION validate_tenant_access(clerk_user_id text, tenant_slug text)
RETURNS TABLE(
  tenant_id UUID,
  user_id UUID,
  user_role user_role,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as tenant_id,
    u.id as user_id,
    u.role as user_role,
    u.is_active
  FROM tenants t
  JOIN users u ON u.tenant_id = t.id
  WHERE t.slug = tenant_slug
    AND u.clerk_id = clerk_user_id
    AND t.is_active = true
    AND u.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_id UUID)
RETURNS TABLE(
  can_manage_jobs BOOLEAN,
  can_manage_candidates BOOLEAN,
  can_manage_settings BOOLEAN,
  can_view_analytics BOOLEAN,
  can_manage_webhooks BOOLEAN
) AS $$
DECLARE
  user_role user_role;
BEGIN
  SELECT role INTO user_role FROM users WHERE id = user_id;
  
  RETURN QUERY SELECT
    CASE WHEN user_role = 'admin' THEN true ELSE false END as can_manage_jobs,
    CASE WHEN user_role = 'admin' THEN true ELSE false END as can_manage_candidates,
    CASE WHEN user_role = 'admin' THEN true ELSE false END as can_manage_settings,
    CASE WHEN user_role = 'admin' THEN true ELSE false END as can_view_analytics,
    CASE WHEN user_role = 'admin' THEN true ELSE false END as can_manage_webhooks;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Index for RLS performance
CREATE INDEX idx_users_tenant_id_role ON users(tenant_id, role) WHERE is_active = true;
CREATE INDEX idx_jobs_tenant_id_status ON jobs(tenant_id, status);
CREATE INDEX idx_applications_tenant_candidate ON applications(tenant_id, candidate_id);
CREATE INDEX idx_messages_tenant_participants ON messages(tenant_id, sender_id, recipient_id);
CREATE INDEX idx_file_attachments_tenant_user ON file_attachments(tenant_id, user_id);