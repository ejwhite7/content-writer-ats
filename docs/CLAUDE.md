# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **Applicant Tracking System (ATS) for Content Writer Hiring** - a lightweight, open-source platform purpose-built to track, vet, and hire content writers. It streamlines public job postings, candidate applications, AI-powered assessments, automated review, messaging, and shortlisting.

**Key Goals:**
- Reduce time-to-hire for content writers to less than a week
- Automate screening with AI review and scoring (≥75% precision)
- Increase application completion rate to ≥70%
- Enable self-hosted, white-labeled deployments

## Technology Stack (Per PRD)

- **Frontend**: Next.js (app router), server actions, SSR for public pages
- **Backend**: Supabase (Postgres) with RLS, Supabase Storage, Supabase Realtime
- **Authentication**: Pluggable (default Clerk, optional Supabase Auth)
- **Email**: Resend for transactional emails
- **Background Processing**: Supabase functions/Edge functions or Next.js background tasks
- **Rich Text Editor**: Accessible editor with semantic HTML output

## Development Commands

*Note: Commands will be added once project is initialized with package.json*

## Project Structure (Planned)

Based on the PRD requirements:
```
/
├── app/                    # Next.js app router
│   ├── (public)/          # Public job board pages
│   ├── (auth)/            # Authentication flows
│   ├── (admin)/           # Admin dashboard
│   └── (candidate)/       # Candidate dashboard
├── components/            # Reusable UI components
├── lib/                   # Utilities and configurations
│   ├── ai-scoring/        # AI review components
│   ├── integrations/      # External API integrations
│   └── supabase/          # Database client and types
├── database/              # Supabase migrations and types
└── public/               # Static assets
```

## Core Features Architecture

1. **Job Board & Applications**: Public job listings with search/filter, candidate application flow
2. **AI-Powered Assessment**: Automated scoring for reading level, writing quality, SEO, English proficiency, AI-generation detection
3. **Admin Dashboard**: Candidate management, pipeline tracking, messaging
4. **White-labeling**: Custom branding, domain mapping
5. **Integrations**: Webhooks, APIs, job distribution feeds

## Data Models (High Level)

- `tenants`, `branding_settings` - Multi-tenant white-labeling
- `users`, `roles` - Authentication and permissions
- `jobs`, `job_settings` - Role management and assessment prompts
- `applications`, `assessments` - Candidate submissions and AI scoring
- `messages` - In-app communication
- `webhooks`, `api_keys` - External integrations

## AI Scoring Components (Open Source)

- **Reading Level**: Flesch-Kincaid, SMOG, Gunning Fog formulas
- **Writing Quality**: LanguageTool (self-hostable) for grammar/spelling
- **SEO Analysis**: Rule-based (headings, links, keywords, meta descriptions)
- **English Proficiency**: fastText language detection
- **AI Detection**: GPT-2/GPT-Neo perplexity analysis, stylometry

## Notes

- The repository name contains a typo: "Vetting Platfomr" should likely be "Vetting Platform"
- No existing code or configuration files are present
- Git repository is initialized and clean