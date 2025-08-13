# Deployment Guide

This guide covers deploying the ATS Platform to production using Vercel with all necessary configurations.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally with `npm i -g vercel`
3. **Production Environment Variables**: Configure all required environment variables
4. **External Services**: Set up all third-party services (Supabase, Clerk, etc.)

## Quick Deployment

```bash
# Make deployment script executable (if not already)
chmod +x scripts/deploy-to-vercel.sh

# Run deployment script
./scripts/deploy-to-vercel.sh
```

## Manual Deployment Steps

### 1. Environment Configuration

Copy the production environment template:
```bash
cp .env.production.example .env.production.local
```

Configure all required variables:
- Supabase (production instance)
- Clerk (production keys)
- Anthropic API key
- Resend API key
- Redis URL (Upstash recommended)
- Sentry DSN
- Cloudflare credentials

### 2. Pre-deployment Checks

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Test build
npm run build
```

### 3. Deploy to Vercel

```bash
# Login to Vercel
vercel login

# Deploy (preview)
vercel

# Deploy to production
vercel --prod
```

### 4. Configure Domain (Production Only)

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Domains
4. Add your custom domain
5. Configure DNS with your provider

### 5. Post-deployment Setup

```bash
# Set up database (if needed)
npm run db:migrate

# Configure Cloudflare security
npm run setup:cloudflare
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Your app's URL | `https://yourapp.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role | `eyJhbGciOi...` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | `pk_live_...` |
| `CLERK_SECRET_KEY` | Clerk secret key | `sk_live_...` |
| `ANTHROPIC_API_KEY` | Anthropic API key | `sk-ant-...` |
| `RESEND_API_KEY` | Resend API key | `re_...` |
| `REDIS_URL` | Redis connection string | `rediss://...` |
| `SENTRY_DSN` | Sentry DSN | `https://...@sentry.io/...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token | - |
| `CLOUDFLARE_ZONE_ID` | Cloudflare zone ID | - |
| `WEBHOOK_SECRET` | Webhook secret key | Generated |

## Production Services Setup

### Supabase Production

1. Create production project at [supabase.com](https://supabase.com)
2. Run database migrations: `npm run db:migrate`
3. Configure Row Level Security policies
4. Set up Supabase Auth (if using alongside Clerk)

### Clerk Production

1. Create production application at [clerk.com](https://clerk.com)
2. Configure OAuth providers
3. Set up webhooks pointing to your production URL
4. Configure user roles and permissions

### Redis (Upstash)

1. Create Redis database at [upstash.com](https://upstash.com)
2. Copy connection string to `REDIS_URL`
3. Configure region close to your Vercel deployment

### Sentry Monitoring

1. Create project at [sentry.io](https://sentry.io)
2. Configure error reporting and performance monitoring
3. Set up alerts for critical errors

### Cloudflare Security

1. Add your domain to Cloudflare
2. Configure DNS to point to Vercel
3. Run security setup: `npm run setup:cloudflare`

## Health Checks

After deployment, verify all services:

```bash
# Check main health endpoint
curl https://yourapp.vercel.app/api/health

# Check individual services
curl https://yourapp.vercel.app/api/health/redis
curl https://yourapp.vercel.app/api/health/sentry
curl https://yourapp.vercel.app/api/health/cloudflare
```

## Monitoring and Maintenance

### Performance Monitoring

- Vercel Analytics (built-in)
- Sentry Performance Monitoring
- Cloudflare Analytics

### Error Monitoring

- Sentry Error Tracking
- Vercel Function Logs
- Supabase Logs

### Security Monitoring

- Cloudflare Security Events
- Failed authentication attempts
- Rate limiting violations

## Troubleshooting

### Common Issues

1. **Build Failures**: Check TypeScript errors and missing dependencies
2. **Environment Variables**: Ensure all required variables are set in Vercel
3. **Database Connection**: Verify Supabase credentials and connection
4. **Authentication Issues**: Check Clerk configuration and webhooks
5. **AI Scoring Failures**: Verify Anthropic API key and quota

### Debug Mode

Enable debug logging in production:
```bash
# In Vercel dashboard, add environment variable:
DEBUG=true
```

### Log Access

- Vercel Functions: Check Vercel dashboard → Functions → Logs
- Sentry: Check error reports and performance issues
- Supabase: Check project dashboard → Logs

## Scaling Considerations

- **Database**: Monitor Supabase usage and upgrade plan if needed
- **Redis**: Monitor memory usage and connection limits
- **Vercel Functions**: Monitor execution time and concurrent requests
- **External APIs**: Monitor rate limits (Anthropic, Resend, etc.)

## Security Checklist

- [ ] All environment variables properly secured
- [ ] Cloudflare security rules configured
- [ ] HTTPS enforced
- [ ] CSP headers configured
- [ ] Rate limiting enabled
- [ ] Bot protection active
- [ ] Database RLS policies enabled
- [ ] Authentication properly configured
- [ ] File upload security measures in place
- [ ] Webhook endpoints secured

## Backup and Recovery

### Database Backup
- Supabase automatic backups (retained based on plan)
- Manual exports via Supabase dashboard

### Application State
- User data in Supabase
- File uploads in Supabase Storage
- Cache in Redis (ephemeral)

### Recovery Process
1. Restore database from Supabase backup
2. Redeploy application from git
3. Reconfigure environment variables
4. Run health checks

## Support

For deployment issues:
1. Check Vercel deployment logs
2. Verify all environment variables
3. Test health check endpoints
4. Review Sentry error reports
5. Contact support if needed