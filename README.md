# ATS Platform - Content Writer Hiring System

A comprehensive Applicant Tracking System (ATS) specifically designed for hiring content writers, built with modern technologies and AI-powered assessment capabilities.

## 🚀 Features

### Core Functionality
- **Public Job Board**: SEO-optimized job listings with advanced filtering
- **AI-Powered Assessment**: Automated scoring for writing quality, readability, SEO, English proficiency, and AI detection
- **Multi-tenant Architecture**: White-labeling support for multiple organizations
- **Real-time Messaging**: Communication system between admins and candidates
- **Rich Assessment Editor**: TipTap-based rich text editor for content submissions
- **File Management**: Secure file uploads with Supabase Storage

### AI Scoring Pipeline
- **Readability Analysis**: Flesch-Kincaid, SMOG, and other readability metrics
- **Writing Quality**: Grammar, style, and content structure analysis
- **SEO Optimization**: Keyword usage, meta descriptions, and content structure
- **English Proficiency**: Language fluency and grammar assessment
- **AI Detection**: Advanced detection of AI-generated content
- **Anthropic Integration**: Enhanced analysis using Claude AI

### Admin Dashboard
- **Application Management**: Complete candidate lifecycle management
- **Analytics & Reporting**: Comprehensive hiring metrics and insights
- **Bulk Actions**: Efficient management of multiple applications
- **Job Management**: Create, edit, and manage job postings
- **Tenant Configuration**: White-labeling and branding customization

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **TipTap** - Rich text editor
- **Lucide React** - Icon library

### Backend & Database
- **Supabase** - PostgreSQL database with real-time capabilities
- **Row Level Security (RLS)** - Fine-grained access control
- **Supabase Storage** - File management system

### Authentication & Authorization
- **Clerk** - User authentication and management
- **Role-based Access Control** - Admin, candidate, and tenant roles
- **Webhook Integration** - Real-time user synchronization

### AI & External Services
- **Anthropic Claude** - Advanced AI analysis and scoring
- **Resend** - Transactional email delivery
- **Redis** - Caching and session management

### Monitoring & Security
- **Sentry** - Error monitoring and performance tracking
- **Cloudflare** - Security, DDoS protection, and CDN
- **Rate Limiting** - API protection and abuse prevention

### Deployment & DevOps
- **Vercel** - Serverless deployment platform
- **GitHub Actions** - CI/CD pipelines (ready for setup)
- **Environment Configuration** - Multi-environment support

## 🏗 Architecture

### Database Schema
- **Multi-tenant**: Isolated data per organization
- **Audit Logging**: Complete activity tracking
- **File Management**: Secure file storage and access
- **Real-time Subscriptions**: Live updates for messaging

### API Design
- **RESTful Endpoints**: Standard HTTP methods and status codes
- **Type-safe**: Zod validation and TypeScript interfaces
- **Error Handling**: Comprehensive error responses
- **Rate Limiting**: Protection against abuse

### Security Features
- **Content Security Policy (CSP)**: XSS protection
- **SQL Injection Prevention**: Parameterized queries
- **File Upload Security**: Type and size validation
- **Authentication Tokens**: Secure session management

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Clerk account
- Anthropic API key
- Resend account

### Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd ats-platform
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Configure all environment variables
   ```

3. **Database Setup**
   ```bash
   # Run database migrations
   npm run db:migrate
   ```

4. **Development Server**
   ```bash
   npm run dev
   ```

### Production Deployment

```bash
# Deploy to Vercel
./scripts/deploy-to-vercel.sh

# Set up Cloudflare security
npm run setup:cloudflare
```

## 🧪 Testing

### Test Suite
- **Unit Tests**: Jest with React Testing Library
- **E2E Tests**: Playwright for comprehensive user flows
- **API Tests**: Node.js environment testing
- **Coverage Reports**: Comprehensive test coverage

### Running Tests
```bash
# Run all tests
npm run test:all

# Run specific test types
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run test:coverage # Coverage report

# Watch mode
npm run test:watch

# Using test runner script
./scripts/run-tests.sh --type all --coverage
```

## 📊 Monitoring & Analytics

### Health Checks
- `/api/health` - Overall system health
- `/api/health/redis` - Cache system status
- `/api/health/sentry` - Error monitoring status
- `/api/health/cloudflare` - Security system status

### Performance Monitoring
- **Sentry Performance**: Real-time performance tracking
- **Vercel Analytics**: Traffic and performance insights
- **Cloudflare Analytics**: Security and CDN metrics

## 🔧 Configuration

### Environment Variables
See `.env.example` for complete configuration options.

Key variables:
- **Database**: Supabase connection and keys
- **Authentication**: Clerk publishable and secret keys
- **AI Services**: Anthropic API key
- **Email**: Resend API configuration
- **Caching**: Redis connection string
- **Monitoring**: Sentry DSN and configuration
- **Security**: Cloudflare API tokens

### Feature Flags
- `NEXT_PUBLIC_ENABLE_ANALYTICS` - Enable/disable analytics
- `NEXT_PUBLIC_ENABLE_DEBUG` - Debug mode toggle

## 📚 API Documentation

### Public Endpoints
- `GET /api/jobs` - List published jobs
- `POST /api/applications` - Submit job application
- `GET /api/health/*` - System health checks

### Protected Endpoints
- `POST /api/jobs` - Create job posting (admin)
- `POST /api/assessments/score` - Trigger AI scoring
- `GET /api/admin/*` - Admin dashboard APIs

### Webhook Endpoints
- `POST /api/webhooks/clerk` - User management sync
- `POST /api/webhooks/resend` - Email delivery status
- `POST /api/webhooks/external` - Third-party integrations

## 🎯 Performance Optimization

### Caching Strategy
- **Redis**: API responses and AI scores
- **Cloudflare**: Static asset and page caching
- **Next.js**: Built-in caching and optimization

### Database Optimization
- **Indexes**: Optimized query performance
- **Connection Pooling**: Efficient resource usage
- **Query Optimization**: Reduced database load

### AI Scoring Optimization
- **Result Caching**: Cached AI analysis results
- **Batch Processing**: Efficient assessment handling
- **Rate Limiting**: API quota management

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test:all`
5. Submit a pull request

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits

## 🐛 Troubleshooting

### Common Issues

**Build Failures**
- Check TypeScript errors: `npm run type-check`
- Verify environment variables
- Clear Next.js cache: `rm -rf .next`

**Database Connection**
- Verify Supabase credentials
- Check network connectivity
- Review RLS policies

**AI Scoring Issues**
- Check Anthropic API key and quota
- Verify request payload format
- Review error logs in Sentry

**Authentication Problems**
- Validate Clerk configuration
- Check webhook endpoints
- Review user role assignments

## 📝 License

This project is proprietary software. All rights reserved.

## 🚀 Future Enhancements

- **Mobile App**: React Native application
- **Advanced Analytics**: Machine learning insights
- **Integration Hub**: Third-party ATS integrations
- **Video Interviews**: Built-in video calling
- **Multilingual Support**: Internationalization

---

Built with ❤️ using modern web technologies for efficient content writer hiring.