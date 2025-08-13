# ATS Platform Setup Guide

## Project Structure

The Next.js 14 app router structure has been set up with the following key components:

### Core Structure
```
app/
├── layout.tsx                 # Root layout with metadata, theme, auth
├── page.tsx                   # Root page with role-based redirects
├── globals.css               # Global styles with shadcn/ui variables
├── (public)/                 # Public routes (jobs, about, etc.)
│   ├── layout.tsx           # Public layout with header/footer
│   └── jobs/                # Job board pages
├── (auth)/                   # Authentication routes
│   ├── layout.tsx           # Auth layout with branding
│   ├── sign-in/[[...sign-in]]/
│   └── sign-up/[[...sign-up]]/
├── (admin)/                  # Protected admin routes
│   ├── layout.tsx           # Admin layout with sidebar
│   └── admin/               # Admin dashboard and management
└── (candidate)/              # Protected candidate routes
    ├── layout.tsx           # Candidate layout with sidebar
    └── candidate/           # Candidate dashboard and profile
```

### Key Features Implemented

1. **Route Groups**: Organized by user role with proper layouts
2. **Authentication**: Clerk integration with role-based access
3. **Theming**: Dark/light mode support with next-themes
4. **TypeScript**: Complete type definitions for the ATS domain
5. **Responsive Design**: Mobile-first approach with Tailwind CSS
6. **SEO**: Proper metadata and Open Graph tags
7. **Accessibility**: ARIA labels and focus management

### Component Structure
```
components/
├── layout/                   # Layout components (headers, sidebars)
├── ui/                      # Reusable UI components (shadcn/ui style)
├── job-board/               # Job listing and application components
├── admin/                   # Admin-specific components
├── candidate/               # Candidate-specific components
└── providers/               # React context providers
```

### Utility Functions
- `lib/utils.ts`: Common utilities (className merging, formatting, etc.)
- `lib/config.ts`: Environment configuration with validation
- `types/`: TypeScript definitions for all data models

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your actual values
   ```

3. **Type Check**
   ```bash
   npm run type-check
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Required Environment Variables

### Essential for Basic Functionality
- `DATABASE_URL`: PostgreSQL database connection
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk authentication
- `CLERK_SECRET_KEY`: Clerk server-side key

### Optional for Enhanced Features
- AI screening: `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`
- Email notifications: `RESEND_API_KEY`
- Caching: `REDIS_URL`
- Monitoring: `SENTRY_DSN`

## Next Steps

1. **Database Setup**: Create database schema using the types in `types/index.ts`
2. **Authentication**: Configure Clerk with user roles in metadata
3. **API Routes**: Implement CRUD operations for jobs, applications, etc.
4. **Component Implementation**: Build out the component stubs with real functionality
5. **Testing**: Add unit and integration tests
6. **Deployment**: Configure for your chosen platform

## Architecture Decisions

- **App Router**: Leverages Next.js 14's latest routing features
- **Route Groups**: Clean separation of concerns by user role
- **Server Components**: Default to server components for better performance
- **Client Components**: Only where interactivity is needed
- **TypeScript**: Strict type checking for better developer experience
- **Tailwind CSS**: Utility-first styling with custom design system
- **shadcn/ui**: Component system for consistent UI patterns

## File Naming Conventions

- **Pages**: `page.tsx` for route pages
- **Layouts**: `layout.tsx` for route layouts
- **Components**: kebab-case with descriptive names
- **Types**: PascalCase interfaces matching domain models
- **Utilities**: camelCase functions with clear purposes

This foundation provides a scalable, type-safe, and maintainable structure for building the complete ATS platform.