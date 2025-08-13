-- ATS Platform Database Schema for Content Writer Hiring
-- Optimized for multi-tenant white-label support with RLS

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'candidate');
CREATE TYPE job_status AS ENUM ('draft', 'published', 'closed', 'archived');
CREATE TYPE application_status AS ENUM (
  'applied',
  'assessment_submitted', 
  'ai_reviewed',
  'shortlisted',
  'manual_review',
  'paid_assignment',
  'live_assignment',
  'hired',
  'rejected',
  'terminated'
);
CREATE TYPE assessment_type AS ENUM ('writing_prompt', 'skills_test', 'portfolio_review');
CREATE TYPE message_type AS ENUM ('candidate_message', 'admin_message', 'system_notification');
CREATE TYPE webhook_event AS ENUM (
  'job_published',
  'application_created',
  'assessment_submitted',
  'application_status_changed',
  'candidate_hired',
  'candidate_rejected'
);
CREATE TYPE compensation_frequency AS ENUM ('per_word', 'per_article', 'per_hour', 'per_project', 'monthly');
CREATE TYPE work_type AS ENUM ('full_time', 'part_time', 'contract', 'freelance');

-- Core Tables

-- Tenants table for multi-tenant white-labeling
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  domain VARCHAR(255),
  custom_domain VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  subscription_plan VARCHAR(50) DEFAULT 'free',
  subscription_expires_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Branding settings for white-label customization
CREATE TABLE branding_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#3b82f6',
  secondary_color VARCHAR(7) DEFAULT '#64748b',
  accent_color VARCHAR(7) DEFAULT '#f59e0b',
  background_color VARCHAR(7) DEFAULT '#ffffff',
  text_color VARCHAR(7) DEFAULT '#1f2937',
  font_family VARCHAR(100) DEFAULT 'Inter',
  company_name VARCHAR(255),
  tagline TEXT,
  website_url TEXT,
  social_links JSONB DEFAULT '{}',
  email_sender_name VARCHAR(255),
  email_sender_address VARCHAR(255),
  custom_css TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id)
);

-- Users table with Clerk integration
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  profile_image_url TEXT,
  role user_role NOT NULL DEFAULT 'candidate',
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  email_verified_at TIMESTAMPTZ,
  phone VARCHAR(20),
  timezone VARCHAR(50) DEFAULT 'UTC',
  locale VARCHAR(10) DEFAULT 'en',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table for role postings
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  responsibilities TEXT[],
  requirements TEXT[],
  preferred_qualifications TEXT[],
  work_type work_type DEFAULT 'contract',
  is_remote BOOLEAN DEFAULT true,
  location_city VARCHAR(100),
  location_country VARCHAR(100),
  compensation_min DECIMAL(10,2),
  compensation_max DECIMAL(10,2),
  compensation_currency VARCHAR(3) DEFAULT 'USD',
  compensation_frequency compensation_frequency DEFAULT 'per_article',
  experience_level VARCHAR(20) DEFAULT 'mid',
  sample_topics TEXT[],
  status job_status DEFAULT 'draft',
  assessment_prompt TEXT,
  assessment_word_count_min INTEGER,
  assessment_word_count_max INTEGER,
  assessment_time_limit_hours INTEGER,
  ai_scoring_threshold DECIMAL(3,2) DEFAULT 0.75,
  auto_reply_template TEXT,
  application_deadline TIMESTAMPTZ,
  posted_by UUID REFERENCES users(id),
  posted_at TIMESTAMPTZ,
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  seo_title VARCHAR(255),
  seo_description TEXT,
  tags TEXT[],
  external_job_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

-- Applications table for candidate submissions
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status application_status DEFAULT 'applied',
  cover_letter TEXT,
  resume_file_id UUID,
  portfolio_url TEXT,
  desired_compensation_amount DECIMAL(10,2),
  desired_compensation_frequency compensation_frequency,
  desired_compensation_currency VARCHAR(3) DEFAULT 'USD',
  availability_date DATE,
  location_city VARCHAR(100),
  location_country VARCHAR(100),
  time_zone VARCHAR(50),
  years_experience INTEGER,
  languages JSONB DEFAULT '[]',
  specialties TEXT[],
  ai_composite_score DECIMAL(3,2),
  ai_scores JSONB,
  ai_analysis JSONB,
  is_shortlisted BOOLEAN DEFAULT false,
  shortlisted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  hired_at TIMESTAMPTZ,
  external_candidate_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);

-- Assessments table for writing submissions
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  type assessment_type DEFAULT 'writing_prompt',
  prompt TEXT NOT NULL,
  submission_content TEXT,
  word_count INTEGER,
  submission_files JSONB DEFAULT '[]',
  ai_plagiarism_checked BOOLEAN DEFAULT false,
  no_ai_attestation BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ,
  time_spent_minutes INTEGER,
  reading_level_score DECIMAL(3,2),
  writing_quality_score DECIMAL(3,2),
  seo_score DECIMAL(3,2),
  english_proficiency_score DECIMAL(3,2),
  ai_detection_score DECIMAL(3,2),
  composite_score DECIMAL(3,2),
  score_breakdown JSONB,
  ai_feedback TEXT,
  manual_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(application_id)
);

-- Messages table for threaded communication
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type message_type DEFAULT 'candidate_message',
  subject VARCHAR(255),
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  is_system_generated BOOLEAN DEFAULT false,
  parent_message_id UUID REFERENCES messages(id),
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- References table for file attachments
CREATE TABLE file_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  mime_type VARCHAR(100),
  storage_path TEXT NOT NULL,
  public_url TEXT,
  is_virus_scanned BOOLEAN DEFAULT false,
  virus_scan_result VARCHAR(50),
  virus_scanned_at TIMESTAMPTZ,
  entity_type VARCHAR(50),
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API keys table for integrations
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(20) NOT NULL,
  permissions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhooks table for external integrations
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  secret VARCHAR(255),
  events webhook_event[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  headers JSONB DEFAULT '{}',
  retry_attempts INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,
  last_triggered_at TIMESTAMPTZ,
  failure_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhook deliveries for tracking
CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type webhook_event NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  response_time_ms INTEGER,
  attempt_number INTEGER DEFAULT 1,
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  delivered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs for compliance and tracking
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  api_key_id UUID REFERENCES api_keys(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email templates for automated communications
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  template_variables JSONB DEFAULT '[]',
  event_trigger VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, name)
);

-- Performance indexes
CREATE INDEX idx_users_tenant_clerk ON users(tenant_id, clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_jobs_tenant_status ON jobs(tenant_id, status);
CREATE INDEX idx_jobs_slug ON jobs(tenant_id, slug);
CREATE INDEX idx_applications_job_candidate ON applications(job_id, candidate_id);
CREATE INDEX idx_applications_tenant_status ON applications(tenant_id, status);
CREATE INDEX idx_applications_ai_score ON applications(ai_composite_score) WHERE ai_composite_score IS NOT NULL;
CREATE INDEX idx_messages_thread ON messages(thread_id, created_at);
CREATE INDEX idx_messages_application ON messages(application_id, created_at);
CREATE INDEX idx_file_attachments_entity ON file_attachments(entity_type, entity_id);
CREATE INDEX idx_audit_logs_tenant_created ON audit_logs(tenant_id, created_at);
CREATE INDEX idx_webhook_deliveries_webhook_created ON webhook_deliveries(webhook_id, created_at);

-- Trigger functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_branding_settings_updated_at BEFORE UPDATE ON branding_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_file_attachments_updated_at BEFORE UPDATE ON file_attachments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit logging trigger function
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, new_values)
    VALUES (
      NEW.tenant_id,
      current_setting('app.current_user_id', true)::UUID,
      TG_OP,
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, old_values, new_values)
    VALUES (
      NEW.tenant_id,
      current_setting('app.current_user_id', true)::UUID,
      TG_OP,
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, old_values)
    VALUES (
      OLD.tenant_id,
      current_setting('app.current_user_id', true)::UUID,
      TG_OP,
      TG_TABLE_NAME,
      OLD.id,
      to_jsonb(OLD)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_jobs AFTER INSERT OR UPDATE OR DELETE ON jobs FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_applications AFTER INSERT OR UPDATE OR DELETE ON applications FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- Function to update application counts
CREATE OR REPLACE FUNCTION update_job_application_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE jobs SET applications_count = applications_count + 1 WHERE id = NEW.job_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE jobs SET applications_count = applications_count - 1 WHERE id = OLD.job_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_job_application_count_trigger
  AFTER INSERT OR DELETE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_job_application_count();

-- Function to generate thread IDs for messages
CREATE OR REPLACE FUNCTION generate_message_thread_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.thread_id IS NULL THEN
    -- Generate thread ID based on application_id if not provided
    NEW.thread_id = uuid_generate_v5(uuid_ns_oid(), NEW.application_id::text);
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_message_thread_id_trigger
  BEFORE INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION generate_message_thread_id();