# 🚀 ATS Platform Deployment Guide

Complete step-by-step guide to deploy the ATS Platform to production.

## 📋 Pre-Deployment Checklist

### Required Accounts & Services
- [ ] **Vercel Account** - [vercel.com](https://vercel.com)
- [ ] **Supabase Account** - [supabase.com](https://supabase.com) 
- [ ] **Clerk Account** - [clerk.com](https://clerk.com)
- [ ] **Anthropic Account** - [console.anthropic.com](https://console.anthropic.com)
- [ ] **Resend Account** - [resend.com](https://resend.com)
- [ ] **Upstash Account** - [upstash.com](https://upstash.com) (for Redis)
- [ ] **Sentry Account** - [sentry.io](https://sentry.io)
- [ ] **Cloudflare Account** - [cloudflare.com](https://cloudflare.com) (optional but recommended)

### Required Tools
- [ ] **Node.js 18+** and npm
- [ ] **Git** for version control
- [ ] **Vercel CLI**: `npm i -g vercel`
- [ ] **Supabase CLI**: `npm i -g supabase` (optional)

---

## 🏗 Step 1: Environment Setup

### 1.1 Clone and Install Dependencies

```bash
git clone <your-repository-url>
cd ats-platform
npm install
```

### 1.2 Create Production Environment File

```bash
cp .env.production.example .env.production.local
```

### 1.3 Configure Environment Variables

Edit `.env.production.local` with your production values:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production

# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_role_key
NEXT_PUBLIC_SUPABASE_PROJECT_ID=your_production_supabase_project_id

# Clerk Authentication (Production)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_production_clerk_key
CLERK_SECRET_KEY=sk_live_your_production_clerk_secret
CLERK_WEBHOOK_SECRET=whsec_your_production_clerk_webhook_secret

# Anthropic AI
ANTHROPIC_API_KEY=your_production_anthropic_api_key

# Resend Email
RESEND_API_KEY=re_your_production_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Redis (Upstash)
REDIS_URL=rediss://your-production-redis-url

# Sentry
SENTRY_DSN=https://your-production-sentry-dsn@sentry.io/project-id
SENTRY_ORG=your_sentry_organization
SENTRY_PROJECT=your_sentry_project
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# Cloudflare (Optional)
CLOUDFLARE_API_TOKEN=your_production_cloudflare_api_token
CLOUDFLARE_ZONE_ID=your_production_cloudflare_zone_id

# Security
WEBHOOK_SECRET=your_production_webhook_secret_key
```

---

## 🗄 Step 2: Database Setup (Supabase)

### 2.1 Create Production Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose organization and fill project details
4. Wait for project creation (2-3 minutes)
5. Copy the project URL and keys

### 2.2 Run Database Migrations

```bash
# Set your production project ID
export SUPABASE_PROJECT_ID=your_production_project_id

# Run migrations
npm run db:migrate
```

### 2.3 Verify Database Schema

1. Go to Supabase Dashboard → Table Editor
2. Verify all 13 tables are created:
   - tenants
   - users
   - jobs
   - job_settings
   - applications
   - assessments
   - messages
   - files
   - branding_settings
   - email_templates
   - audit_logs
   - webhooks
   - notifications

### 2.4 Configure Row Level Security (RLS)

RLS policies are automatically created by migrations. Verify in:
- Supabase Dashboard → Authentication → Policies

---

## 🔐 Step 3: Authentication Setup (Clerk)

### 3.1 Create Production Clerk Application

1. Go to [clerk.com/dashboard](https://clerk.com/dashboard)
2. Create new application
3. Choose authentication providers (Email, Google, etc.)
4. Configure application settings

### 3.2 Configure Webhooks

1. In Clerk Dashboard → Webhooks
2. Add webhook endpoint: `https://your-domain.vercel.app/api/webhooks/clerk`
3. Select events: `user.created`, `user.updated`, `user.deleted`
4. Copy the webhook secret

### 3.3 Configure Allowed Redirect URLs

Add these URLs in Clerk Dashboard → Paths:
- `https://your-domain.vercel.app`
- `https://your-domain.vercel.app/admin`
- `https://your-domain.vercel.app/dashboard`

---

## 🤖 Step 4: AI Service Setup (Anthropic)

### 4.1 Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create API key
3. Set usage limits and billing
4. Copy the API key (starts with `sk-ant-`)

### 4.2 Test API Access

```bash
curl https://api.anthropic.com/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: your_api_key" \
  -d '{"model": "claude-3-sonnet-20240229", "max_tokens": 10, "messages": [{"role": "user", "content": "Hello"}]}'
```

---

## 📧 Step 5: Email Service Setup (Resend)

### 5.1 Configure Resend

1. Go to [resend.com/dashboard](https://resend.com/dashboard)
2. Add and verify your domain
3. Create API key
4. Configure SPF/DKIM records

### 5.2 Verify Email Configuration

```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer your_resend_api_key' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "noreply@yourdomain.com",
    "to": ["test@example.com"],
    "subject": "Test Email",
    "text": "This is a test email"
  }'
```

---

## 🗄 Step 6: Redis Setup (Upstash)

### 6.1 Create Redis Database

1. Go to [upstash.com/console](https://console.upstash.com)
2. Create new Redis database
3. Choose region closest to your Vercel deployment
4. Copy the Redis URL

### 6.2 Test Redis Connection

```bash
# Install redis-cli if needed
npm install -g redis-cli

# Test connection
redis-cli -u your_redis_url ping
```

---

## 📊 Step 7: Monitoring Setup (Sentry)

### 7.1 Create Sentry Project

1. Go to [sentry.io](https://sentry.io)
2. Create new project (Next.js)
3. Copy DSN and configuration details
4. Set up error alerts

### 7.2 Configure Sentry

Sentry configuration is already included in the project. Just ensure environment variables are set.

---

## 🛡 Step 8: Security Setup (Cloudflare)

### 8.1 Add Domain to Cloudflare

1. Go to [cloudflare.com/dashboard](https://dash.cloudflare.com)
2. Add your domain
3. Update nameservers at your domain registrar
4. Wait for DNS propagation

### 8.2 Get Cloudflare API Credentials

1. Go to Cloudflare Dashboard → My Profile → API Tokens
2. Create custom token with Zone:Read and Zone:Edit permissions
3. Copy API token and Zone ID

---

## 🚀 Step 9: Deploy to Vercel

### 9.1 Install and Login to Vercel CLI

```bash
npm i -g vercel
vercel login
```

### 9.2 Pre-deployment Checks

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Test build
npm run build
```

### 9.3 Deploy Using Script (Recommended)

```bash
# Make script executable
chmod +x scripts/deploy-to-vercel.sh

# Run deployment script
./scripts/deploy-to-vercel.sh
```

### 9.4 Manual Deployment (Alternative)

```bash
# Deploy to production
vercel --prod

# Set environment variables in Vercel dashboard
```

### 9.5 Configure Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all production environment variables
3. Ensure they're enabled for Production environment

---

## ⚙️ Step 10: Post-Deployment Configuration

### 10.1 Configure Custom Domain (Optional)

1. In Vercel Dashboard → Domains
2. Add your custom domain
3. Configure DNS records as instructed

### 10.2 Set Up Cloudflare Security

```bash
npm run setup:cloudflare
```

### 10.3 Verify Deployment Health

```bash
# Check main health endpoint
curl https://your-domain.vercel.app/api/health

# Check service health
curl https://your-domain.vercel.app/api/health/redis
curl https://your-domain.vercel.app/api/health/sentry
curl https://your-domain.vercel.app/api/health/cloudflare
```

---

## ✅ Step 11: Final Verification

### 11.1 Functional Testing

- [ ] **Job Board**: Visit homepage, search and filter jobs
- [ ] **Application Flow**: Complete a test job application
- [ ] **Authentication**: Sign up, sign in, sign out
- [ ] **Admin Dashboard**: Access admin area (create admin user first)
- [ ] **AI Scoring**: Submit assessment and verify scoring
- [ ] **Email Notifications**: Verify emails are sent
- [ ] **File Uploads**: Test resume and document uploads

### 11.2 Performance Testing

```bash
# Test page load times
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.vercel.app

# Test API endpoints
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.vercel.app/api/health
```

### 11.3 Security Testing

- [ ] **HTTPS**: Ensure all traffic is encrypted
- [ ] **Headers**: Check security headers are set
- [ ] **Rate Limiting**: Test API rate limits
- [ ] **Authentication**: Verify protected routes

---

## 📚 Step 12: Create Admin User

### 12.1 Sign Up as Admin

1. Go to your deployed application
2. Sign up with your admin email
3. Go to Supabase Dashboard → Table Editor → users
4. Find your user record and update `role` to `'admin'`

### 12.2 Create Tenant

1. In Supabase Dashboard → Table Editor → tenants
2. Insert a new tenant record:
   ```sql
   INSERT INTO tenants (name, slug, domain, branding_settings, email_settings)
   VALUES (
     'Your Company',
     'your-company',
     'yourdomain.com',
     '{"primary_color": "#3b82f6", "secondary_color": "#64748b"}',
     '{"from_email": "noreply@yourdomain.com", "from_name": "Your Company"}'
   );
   ```

3. Update your user record to link to this tenant:
   ```sql
   UPDATE users SET tenant_id = 'your-tenant-id' WHERE email = 'your-admin-email';
   ```

---

## 🔄 Step 13: Set Up Continuous Deployment

### 13.1 GitHub Integration

1. Connect your GitHub repository to Vercel
2. Enable automatic deployments
3. Configure branch protection rules

### 13.2 Environment Promotion

```bash
# Preview deployments for testing
vercel

# Promote to production when ready
vercel --prod
```

---

## 🐛 Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check
```

#### Environment Variable Issues
- Verify all variables are set in Vercel dashboard
- Check variable names match exactly (case-sensitive)
- Ensure no trailing spaces in values

#### Database Connection Issues
- Verify Supabase project URL and keys
- Check network connectivity from Vercel
- Review RLS policies

#### Authentication Issues
- Verify Clerk webhook endpoint is accessible
- Check webhook secret matches
- Review allowed redirect URLs

#### Email Delivery Issues
- Verify domain is verified in Resend
- Check SPF/DKIM records
- Review email templates

### Getting Help

1. **Check Logs**:
   - Vercel: Dashboard → Functions → View Logs
   - Sentry: Error reports and performance
   - Supabase: Dashboard → Logs

2. **Health Checks**:
   ```bash
   curl https://your-domain.vercel.app/api/health
   ```

3. **Test Individual Services**:
   ```bash
   # Test database
   curl https://your-domain.vercel.app/api/health

   # Test Redis
   curl https://your-domain.vercel.app/api/health/redis

   # Test Sentry
   curl https://your-domain.vercel.app/api/health/sentry
   ```

---

## 🎯 Post-Deployment Tasks

### Immediate (Day 1)
- [ ] Test all critical user flows
- [ ] Set up monitoring alerts
- [ ] Configure backup procedures
- [ ] Document admin procedures

### Short-term (Week 1)
- [ ] Performance optimization
- [ ] User acceptance testing
- [ ] Staff training
- [ ] Marketing site updates

### Long-term (Month 1)
- [ ] Analytics review
- [ ] User feedback collection
- [ ] Feature planning
- [ ] Scale optimization

---

## 📈 Monitoring & Maintenance

### Daily Checks
- Application uptime and performance
- Error rates in Sentry
- Email delivery status

### Weekly Reviews
- Performance metrics
- User engagement
- System resource usage
- Security alerts

### Monthly Tasks
- Update dependencies
- Review and rotate secrets
- Backup verification
- Capacity planning

---

## 🎉 Deployment Complete!

Your ATS Platform is now live in production! 

**Next Steps:**
1. Share the application URL with your team
2. Create test job postings
3. Process sample applications
4. Train your hiring team
5. Monitor system performance

**Support Resources:**
- Application logs: Vercel Dashboard
- Error monitoring: Sentry Dashboard
- Database: Supabase Dashboard
- Performance: Vercel Analytics

---

**🚨 Important Notes:**
- Keep all API keys and secrets secure
- Regularly update dependencies
- Monitor usage and billing
- Set up proper backup procedures
- Review security settings monthly

The platform is designed to handle high traffic and scale automatically with your needs. Monitor the health check endpoints and Sentry reports to ensure optimal performance.