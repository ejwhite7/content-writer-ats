# ATS Platform Database Schema

This directory contains the complete database schema for the ATS (Applicant Tracking System) platform, designed specifically for content writer hiring with multi-tenant white-label support.

## Overview

The database is optimized for:
- **Multi-tenant isolation** with Row Level Security (RLS)
- **AI-powered content assessment** with automated scoring
- **Real-time messaging** and notifications
- **File storage** for resumes, portfolios, and assessments
- **Webhook integrations** for external systems
- **Audit logging** for compliance
- **Performance** for 10-50k monthly visitors and 1-5k applications/month

## Database Files

### 1. `01_create_tables.sql`
Core database schema with all tables, indexes, and triggers.

**Key Tables:**
- `tenants` - Multi-tenant organization data
- `branding_settings` - White-label customization
- `users` - Admin and candidate users (Clerk integration)
- `jobs` - Job postings with assessment prompts
- `applications` - Candidate applications with AI scoring
- `assessments` - Writing submissions and AI analysis
- `messages` - Threaded communication system
- `file_attachments` - File storage metadata
- `webhooks` & `api_keys` - External integrations
- `audit_logs` - Compliance and tracking

### 2. `02_row_level_security.sql`
Comprehensive RLS policies ensuring multi-tenant data isolation.

**Features:**
- Tenant-scoped data access
- Role-based permissions (admin/candidate)
- Helper functions for context management
- Performance-optimized policies

### 3. `03_storage_buckets.sql`
Supabase Storage configuration for file uploads.

**Buckets:**
- `resumes` - PDF/DOC resume files (10MB max)
- `portfolios` - Portfolio files (50MB max) 
- `assessments` - Assessment submissions (25MB max)
- `attachments` - Message attachments (25MB max)
- `branding` - Logos and branding assets (5MB max, public)

### 4. `04_ai_scoring_functions.sql`
AI analysis and scoring pipeline for writing assessments.

**Scoring Components:**
- **Reading Level** - Flesch-Kincaid, SMOG analysis
- **Writing Quality** - Grammar, structure, clarity
- **SEO Analysis** - Headings, links, keyword optimization
- **English Proficiency** - Language detection and fluency
- **AI Detection** - Stylometry and pattern analysis

### 5. `05_seed_data.sql`
Sample data for development and testing.

**Includes:**
- Demo tenants with branding
- Sample admin and candidate users
- Example job postings
- Sample applications with AI scores
- Message threads
- Email templates

### 6. `06_supabase_functions.sql`
Edge functions for background processing and integrations.

**Functions:**
- AI scoring job queue
- Webhook delivery system
- Public API endpoints
- Application workflow automation

## Setup Instructions

### Prerequisites

1. **Supabase Project**: Create a new Supabase project
2. **Supabase CLI**: Install the Supabase CLI
3. **Environment Variables**: Configure your `.env.local`

### 1. Initialize Supabase

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Initialize local development
supabase init
```

### 2. Run Migrations

```bash
# Create migration files
supabase migration new create_ats_schema
supabase migration new setup_rls_policies  
supabase migration new create_storage_buckets
supabase migration new add_ai_functions
supabase migration new insert_seed_data
supabase migration new setup_edge_functions

# Copy SQL content to migration files, then run:
supabase db push
```

### 3. Create Storage Buckets

```bash
# Create required storage buckets
supabase storage create-bucket resumes --public=false
supabase storage create-bucket portfolios --public=false
supabase storage create-bucket assessments --public=false
supabase storage create-bucket attachments --public=false
supabase storage create-bucket branding --public=true
```

### 4. Configure Environment Variables

```bash
# Add to .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Additional services
RESEND_API_KEY=your_resend_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### 5. Generate TypeScript Types

```bash
# Generate types from database schema
npm run db:generate
```

## Schema Design Principles

### Multi-Tenancy
- Every table includes `tenant_id` for data isolation
- RLS policies enforce tenant boundaries
- Shared resources (users) are tenant-scoped

### Performance Optimization
- Strategic indexes on frequently queried columns
- Composite indexes for multi-column filters
- Optimized RLS policies to avoid table scans

### Data Integrity
- Foreign key constraints maintain relationships
- Check constraints validate enum values
- Triggers maintain data consistency

### Audit Trail
- Comprehensive audit logging for compliance
- Automatic timestamp tracking
- User action attribution

## API Usage Examples

### Setting Tenant Context

```sql
-- Set tenant context for RLS
SELECT set_tenant_context(
  'tenant-uuid'::UUID,
  'user-uuid'::UUID
);
```

### Creating an Application

```sql
-- Create application with automatic assessment
SELECT create_application(
  'tenant-id'::UUID,
  'job-id'::UUID, 
  'candidate-id'::UUID,
  'Cover letter text',
  'https://portfolio.com',
  '{"amount": 150, "frequency": "per_article", "currency": "USD"}'::JSONB,
  '{"city": "New York", "country": "USA", "timezone": "America/New_York"}'::JSONB,
  '{"years_experience": 5, "specialties": ["SEO", "B2B SaaS"]}'::JSONB
);
```

### Submitting Assessment

```sql
-- Submit assessment and trigger AI scoring
SELECT submit_assessment(
  'assessment-id'::UUID,
  'Assessment content...',
  '[]'::JSONB, -- file attachments
  true, -- no AI attestation
  120 -- time spent in minutes
);
```

### AI Scoring Analysis

```sql
-- Get AI scoring results
SELECT calculate_ai_assessment_score('assessment-id'::UUID);

-- Get scoring statistics
SELECT get_ai_scoring_stats('tenant-id'::UUID);
```

## Security Considerations

### Row Level Security
- All tables have RLS enabled
- Policies enforce tenant isolation
- Admin/candidate role separation
- API key scoping for external access

### File Upload Security
- File type validation
- Size limits per bucket
- Virus scanning integration points
- Secure signed URLs for private files

### Data Privacy
- GDPR-ready with audit trails
- PII encryption at rest
- Secure API key storage
- Session-based context management

## Monitoring and Maintenance

### Key Metrics to Monitor
- Application processing times
- AI scoring accuracy and performance
- Webhook delivery success rates
- Storage usage and costs
- Database performance (query times, index usage)

### Regular Maintenance Tasks
- Vacuum and analyze tables
- Archive old audit logs
- Clean up failed webhook deliveries
- Monitor storage usage
- Review and update AI scoring thresholds

### Backup Strategy
- Supabase automatic backups
- Point-in-time recovery capability
- File storage redundancy
- Database dump exports for compliance

## Development Workflow

### Local Development

```bash
# Start local Supabase
supabase start

# Reset database with seed data
supabase db reset

# Apply new migrations
supabase db push

# Generate updated types
npm run db:generate
```

### Testing

```bash
# Run database tests
supabase test db

# Test RLS policies
supabase test rls

# Test storage policies
supabase test storage
```

### Production Deployment

```bash
# Deploy migrations to production
supabase db push --linked

# Deploy edge functions
supabase functions deploy

# Update production environment variables
supabase secrets set KEY=value
```

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**
   - Ensure tenant context is set
   - Check user permissions
   - Verify policy conditions

2. **File Upload Failures**
   - Check bucket permissions
   - Verify file size and type
   - Ensure storage policies are correct

3. **AI Scoring Issues**
   - Check background job queue
   - Verify assessment content exists
   - Monitor function execution logs

4. **Webhook Failures**
   - Check webhook URL accessibility
   - Verify secret configuration
   - Monitor delivery attempts

### Debug Queries

```sql
-- Check RLS context
SELECT current_setting('app.current_tenant_id', true);
SELECT current_setting('app.current_user_id', true);

-- Monitor background jobs
SELECT * FROM background_jobs WHERE status = 'failed';

-- Check webhook deliveries
SELECT * FROM webhook_deliveries WHERE success = false;

-- Review audit logs
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;
```

## Contributing

When modifying the database schema:

1. **Create Migration**: Use `supabase migration new description`
2. **Update Types**: Run `npm run db:generate` after schema changes
3. **Test Locally**: Verify with `supabase db reset`
4. **Update Documentation**: Keep this README current
5. **Test RLS**: Ensure policies work correctly
6. **Performance Test**: Verify query performance with sample data

## Support

For database-related issues:

1. Check the troubleshooting section above
2. Review Supabase logs in the dashboard
3. Test with the seed data provided
4. Check RLS policy configuration
5. Verify storage bucket setup

The database schema is designed to be robust, scalable, and maintainable for the ATS platform's content writer hiring workflow.