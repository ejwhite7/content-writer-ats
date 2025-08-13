-- Supabase Edge Functions for AI Scoring Pipeline
-- These functions handle background processing and external integrations

-- Function to queue AI scoring job
CREATE OR REPLACE FUNCTION queue_ai_scoring_job(assessment_id UUID)
RETURNS JSONB AS $$
DECLARE
  job_payload JSONB;
  application_row applications%ROWTYPE;
  assessment_row assessments%ROWTYPE;
BEGIN
  -- Get assessment and application data
  SELECT * INTO assessment_row FROM assessments WHERE id = assessment_id;
  SELECT * INTO application_row FROM applications WHERE id = assessment_row.application_id;
  
  -- Build job payload
  job_payload := jsonb_build_object(
    'assessment_id', assessment_id,
    'tenant_id', assessment_row.tenant_id,
    'application_id', assessment_row.application_id,
    'content', assessment_row.submission_content,
    'prompt', assessment_row.prompt,
    'job_id', application_row.job_id,
    'candidate_id', application_row.candidate_id,
    'priority', 'normal',
    'created_at', NOW()
  );
  
  -- Insert into pg_jobs table (if using pg_jobs extension)
  -- Or send to external queue service
  
  -- For now, we'll store in a simple jobs table
  INSERT INTO background_jobs (job_type, payload, status, created_at)
  VALUES ('ai_scoring', job_payload, 'queued', NOW());
  
  RETURN job_payload;
END;
$$ LANGUAGE plpgsql;

-- Function to process webhook deliveries
CREATE OR REPLACE FUNCTION deliver_webhook(
  webhook_id UUID,
  event_type webhook_event,
  payload JSONB
)
RETURNS JSONB AS $$
DECLARE
  webhook_row webhooks%ROWTYPE;
  delivery_id UUID;
  result JSONB;
BEGIN
  -- Get webhook configuration
  SELECT * INTO webhook_row FROM webhooks WHERE id = webhook_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Webhook not found or inactive');
  END IF;
  
  -- Check if event type is configured for this webhook
  IF NOT (event_type = ANY(webhook_row.events)) THEN
    RETURN jsonb_build_object('error', 'Event type not configured for webhook');
  END IF;
  
  -- Create delivery record
  delivery_id := uuid_generate_v4();
  
  INSERT INTO webhook_deliveries (
    id, webhook_id, event_type, payload, attempt_number, delivered_at
  ) VALUES (
    delivery_id, webhook_id, event_type, payload, 1, NOW()
  );
  
  -- Return job information for external processor
  result := jsonb_build_object(
    'delivery_id', delivery_id,
    'webhook_url', webhook_row.url,
    'webhook_secret', webhook_row.secret,
    'headers', webhook_row.headers,
    'payload', payload,
    'timeout_seconds', webhook_row.timeout_seconds
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to handle webhook delivery response
CREATE OR REPLACE FUNCTION handle_webhook_response(
  delivery_id UUID,
  response_status INTEGER,
  response_body TEXT DEFAULT NULL,
  response_time_ms INTEGER DEFAULT NULL,
  error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  success BOOLEAN;
  webhook_uuid UUID;
BEGIN
  success := response_status >= 200 AND response_status < 300;
  
  -- Update delivery record
  UPDATE webhook_deliveries SET
    response_status = handle_webhook_response.response_status,
    response_body = handle_webhook_response.response_body,
    response_time_ms = handle_webhook_response.response_time_ms,
    success = handle_webhook_response.success,
    error_message = handle_webhook_response.error_message
  WHERE id = delivery_id
  RETURNING webhook_id INTO webhook_uuid;
  
  -- Update webhook failure count
  IF NOT success THEN
    UPDATE webhooks SET
      failure_count = failure_count + 1
    WHERE id = webhook_uuid;
  ELSE
    UPDATE webhooks SET
      last_triggered_at = NOW(),
      failure_count = 0
    WHERE id = webhook_uuid;
  END IF;
  
  RETURN success;
END;
$$ LANGUAGE plpgsql;

-- Function to get job board data for public API
CREATE OR REPLACE FUNCTION get_public_job_board(
  tenant_slug TEXT,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
  tenant_row tenants%ROWTYPE;
  jobs_data JSONB;
  total_count INTEGER;
BEGIN
  -- Get tenant info
  SELECT * INTO tenant_row FROM tenants 
  WHERE slug = tenant_slug AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Tenant not found');
  END IF;
  
  -- Get total count
  SELECT COUNT(*) INTO total_count
  FROM jobs 
  WHERE tenant_id = tenant_row.id AND status = 'published';
  
  -- Get jobs data
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', j.id,
      'title', j.title,
      'slug', j.slug,
      'description', j.description,
      'work_type', j.work_type,
      'is_remote', j.is_remote,
      'location_city', j.location_city,
      'location_country', j.location_country,
      'compensation_min', j.compensation_min,
      'compensation_max', j.compensation_max,
      'compensation_currency', j.compensation_currency,
      'compensation_frequency', j.compensation_frequency,
      'experience_level', j.experience_level,
      'tags', j.tags,
      'posted_at', j.posted_at,
      'applications_count', j.applications_count
    )
  ) INTO jobs_data
  FROM jobs j
  WHERE j.tenant_id = tenant_row.id 
    AND j.status = 'published'
  ORDER BY j.posted_at DESC
  LIMIT limit_count OFFSET offset_count;
  
  RETURN jsonb_build_object(
    'data', COALESCE(jobs_data, '[]'::jsonb),
    'total_count', total_count,
    'limit', limit_count,
    'offset', offset_count,
    'tenant', jsonb_build_object(
      'name', tenant_row.name,
      'slug', tenant_row.slug
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create application with automatic status progression
CREATE OR REPLACE FUNCTION create_application(
  p_tenant_id UUID,
  p_job_id UUID,
  p_candidate_id UUID,
  p_cover_letter TEXT DEFAULT NULL,
  p_portfolio_url TEXT DEFAULT NULL,
  p_compensation_data JSONB DEFAULT NULL,
  p_location_data JSONB DEFAULT NULL,
  p_profile_data JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  application_id UUID;
  assessment_id UUID;
  job_row jobs%ROWTYPE;
  result JSONB;
BEGIN
  -- Get job details
  SELECT * INTO job_row FROM jobs WHERE id = p_job_id AND tenant_id = p_tenant_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Job not found');
  END IF;
  
  -- Check if application already exists
  IF EXISTS (SELECT 1 FROM applications WHERE job_id = p_job_id AND candidate_id = p_candidate_id) THEN
    RETURN jsonb_build_object('error', 'Application already exists for this job');
  END IF;
  
  -- Create application
  application_id := uuid_generate_v4();
  
  INSERT INTO applications (
    id, tenant_id, job_id, candidate_id, status, cover_letter, portfolio_url,
    desired_compensation_amount, desired_compensation_frequency, desired_compensation_currency,
    availability_date, location_city, location_country, time_zone,
    years_experience, languages, specialties, metadata
  ) VALUES (
    application_id, p_tenant_id, p_job_id, p_candidate_id, 'applied', p_cover_letter, p_portfolio_url,
    (p_compensation_data->>'amount')::DECIMAL, (p_compensation_data->>'frequency')::compensation_frequency, 
    COALESCE(p_compensation_data->>'currency', 'USD'),
    (p_profile_data->>'availability_date')::DATE, p_location_data->>'city', p_location_data->>'country',
    p_location_data->>'timezone', (p_profile_data->>'years_experience')::INTEGER,
    COALESCE((p_profile_data->>'languages')::JSONB, '[]'::JSONB),
    COALESCE(ARRAY(SELECT jsonb_array_elements_text(p_profile_data->'specialties')), ARRAY[]::TEXT[]),
    COALESCE(p_profile_data, '{}'::JSONB)
  );
  
  -- Create assessment if job has assessment prompt
  IF job_row.assessment_prompt IS NOT NULL THEN
    assessment_id := uuid_generate_v4();
    
    INSERT INTO assessments (
      id, tenant_id, application_id, type, prompt
    ) VALUES (
      assessment_id, p_tenant_id, application_id, 'writing_prompt', job_row.assessment_prompt
    );
  END IF;
  
  -- Queue webhook for application created
  INSERT INTO webhook_events_queue (event_type, tenant_id, entity_id, payload)
  SELECT 'application_created', p_tenant_id, application_id, jsonb_build_object(
    'application_id', application_id,
    'job_id', p_job_id,
    'candidate_id', p_candidate_id
  );
  
  result := jsonb_build_object(
    'application_id', application_id,
    'assessment_id', assessment_id,
    'status', 'applied',
    'requires_assessment', job_row.assessment_prompt IS NOT NULL
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to submit assessment and trigger AI scoring
CREATE OR REPLACE FUNCTION submit_assessment(
  p_assessment_id UUID,
  p_submission_content TEXT,
  p_submission_files JSONB DEFAULT '[]',
  p_no_ai_attestation BOOLEAN DEFAULT true,
  p_time_spent_minutes INTEGER DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  assessment_row assessments%ROWTYPE;
  application_row applications%ROWTYPE;
  scoring_result JSONB;
  result JSONB;
BEGIN
  -- Get assessment
  SELECT * INTO assessment_row FROM assessments WHERE id = p_assessment_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Assessment not found');
  END IF;
  
  IF assessment_row.submitted_at IS NOT NULL THEN
    RETURN jsonb_build_object('error', 'Assessment already submitted');
  END IF;
  
  -- Update assessment
  UPDATE assessments SET
    submission_content = p_submission_content,
    word_count = array_length(string_to_array(regexp_replace(p_submission_content, '[^\w\s]', ' ', 'g'), ' '), 1),
    submission_files = p_submission_files,
    no_ai_attestation = p_no_ai_attestation,
    submitted_at = NOW(),
    time_spent_minutes = p_time_spent_minutes,
    updated_at = NOW()
  WHERE id = p_assessment_id;
  
  -- Update application status
  UPDATE applications SET
    status = 'assessment_submitted',
    updated_at = NOW()
  WHERE id = assessment_row.application_id
  RETURNING * INTO application_row;
  
  -- Trigger AI scoring
  scoring_result := calculate_ai_assessment_score(p_assessment_id);
  
  -- Queue webhook for assessment submitted
  INSERT INTO webhook_events_queue (event_type, tenant_id, entity_id, payload)
  SELECT 'assessment_submitted', assessment_row.tenant_id, p_assessment_id, jsonb_build_object(
    'assessment_id', p_assessment_id,
    'application_id', assessment_row.application_id,
    'scoring_result', scoring_result
  );
  
  result := jsonb_build_object(
    'assessment_id', p_assessment_id,
    'application_id', assessment_row.application_id,
    'status', 'assessment_submitted',
    'ai_scoring_result', scoring_result
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to update application status with notifications
CREATE OR REPLACE FUNCTION update_application_status(
  p_application_id UUID,
  p_new_status application_status,
  p_reason TEXT DEFAULT NULL,
  p_updated_by UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  application_row applications%ROWTYPE;
  old_status application_status;
  result JSONB;
BEGIN
  -- Get current application
  SELECT * INTO application_row FROM applications WHERE id = p_application_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Application not found');
  END IF;
  
  old_status := application_row.status;
  
  -- Update application
  UPDATE applications SET
    status = p_new_status,
    rejection_reason = CASE WHEN p_new_status = 'rejected' THEN p_reason ELSE rejection_reason END,
    rejected_at = CASE WHEN p_new_status = 'rejected' THEN NOW() ELSE rejected_at END,
    hired_at = CASE WHEN p_new_status = 'hired' THEN NOW() ELSE hired_at END,
    updated_at = NOW()
  WHERE id = p_application_id;
  
  -- Queue webhook for status change
  INSERT INTO webhook_events_queue (event_type, tenant_id, entity_id, payload)
  SELECT 'application_status_changed', application_row.tenant_id, p_application_id, jsonb_build_object(
    'application_id', p_application_id,
    'old_status', old_status,
    'new_status', p_new_status,
    'reason', p_reason,
    'updated_by', p_updated_by
  );
  
  -- Queue specific event webhooks
  IF p_new_status = 'hired' THEN
    INSERT INTO webhook_events_queue (event_type, tenant_id, entity_id, payload)
    SELECT 'candidate_hired', application_row.tenant_id, p_application_id, jsonb_build_object(
      'application_id', p_application_id,
      'hired_by', p_updated_by
    );
  ELSIF p_new_status = 'rejected' THEN
    INSERT INTO webhook_events_queue (event_type, tenant_id, entity_id, payload)
    SELECT 'candidate_rejected', application_row.tenant_id, p_application_id, jsonb_build_object(
      'application_id', p_application_id,
      'rejection_reason', p_reason,
      'rejected_by', p_updated_by
    );
  END IF;
  
  result := jsonb_build_object(
    'application_id', p_application_id,
    'old_status', old_status,
    'new_status', p_new_status,
    'updated_at', NOW()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create tables for background job processing
CREATE TABLE IF NOT EXISTS background_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'queued',
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_events_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type webhook_event NOT NULL,
  tenant_id UUID NOT NULL,
  entity_id UUID NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for background processing
CREATE INDEX idx_background_jobs_status ON background_jobs(status, created_at);
CREATE INDEX idx_webhook_events_queue_processed ON webhook_events_queue(processed, created_at);

-- Function to get pending background jobs
CREATE OR REPLACE FUNCTION get_pending_background_jobs(job_type TEXT DEFAULT NULL, limit_count INTEGER DEFAULT 10)
RETURNS SETOF background_jobs AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM background_jobs
  WHERE status = 'queued'
    AND attempts < max_attempts
    AND (job_type IS NULL OR background_jobs.job_type = get_pending_background_jobs.job_type)
  ORDER BY created_at ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to mark background job as processed
CREATE OR REPLACE FUNCTION mark_background_job_processed(
  job_id UUID,
  success BOOLEAN,
  error_msg TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE background_jobs SET
    status = CASE WHEN success THEN 'completed' ELSE 'failed' END,
    attempts = attempts + 1,
    error_message = error_msg,
    processed_at = NOW(),
    updated_at = NOW()
  WHERE id = job_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to get pending webhook events
CREATE OR REPLACE FUNCTION get_pending_webhook_events(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  event_id UUID,
  event_type webhook_event,
  tenant_id UUID,
  entity_id UUID,
  payload JSONB,
  webhooks JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id as event_id,
    q.event_type,
    q.tenant_id,
    q.entity_id,
    q.payload,
    jsonb_agg(
      jsonb_build_object(
        'id', w.id,
        'url', w.url,
        'secret', w.secret,
        'headers', w.headers,
        'retry_attempts', w.retry_attempts,
        'timeout_seconds', w.timeout_seconds
      )
    ) as webhooks
  FROM webhook_events_queue q
  LEFT JOIN webhooks w ON w.tenant_id = q.tenant_id 
    AND w.is_active = true 
    AND q.event_type = ANY(w.events)
  WHERE q.processed = false
  GROUP BY q.id, q.event_type, q.tenant_id, q.entity_id, q.payload
  ORDER BY q.created_at ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to mark webhook event as processed
CREATE OR REPLACE FUNCTION mark_webhook_event_processed(event_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE webhook_events_queue SET processed = true WHERE id = event_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;