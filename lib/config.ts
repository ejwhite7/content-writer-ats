import { z } from 'zod'

// Environment variable schema for validation
const envSchema = z.object({
  // App Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('ATS Platform'),

  // Database Configuration
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_PROJECT_ID: z.string().optional(),

  // Authentication Configuration
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default('/sign-in'),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default('/sign-up'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().default('/dashboard'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().default('/onboarding'),

  // AI Configuration
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),

  // Email Configuration
  RESEND_API_KEY: z.string().optional(),
  NEXT_PUBLIC_RESEND_FROM_EMAIL: z.string().email().optional(),

  // Redis Configuration
  REDIS_URL: z.string().url().optional(),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),

  // File Upload Configuration
  NEXT_PUBLIC_MAX_FILE_SIZE: z.string().default('10485760'), // 10MB
  NEXT_PUBLIC_ALLOWED_FILE_TYPES: z.string().default('pdf,doc,docx'),

  // Monitoring Configuration
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

  // Feature Flags
  NEXT_PUBLIC_ENABLE_AI_SCREENING: z.string().default('true'),
  NEXT_PUBLIC_ENABLE_VIDEO_INTERVIEWS: z.string().default('false'),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().default('true'),

  // SEO Configuration
  NEXT_PUBLIC_SITE_DESCRIPTION: z.string().default('Modern applicant tracking system with AI-powered candidate vetting'),
  NEXT_PUBLIC_SITE_KEYWORDS: z.string().default('ATS,hiring,recruitment,talent acquisition'),

  // Social Media
  NEXT_PUBLIC_TWITTER_HANDLE: z.string().optional(),
  NEXT_PUBLIC_LINKEDIN_URL: z.string().url().optional(),
})

// Parse and validate environment variables
function parseEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    console.error('❌ Invalid environment variables:', error)
    throw new Error('Invalid environment configuration')
  }
}

export const env = parseEnv()

// App Configuration
export const appConfig = {
  name: env.NEXT_PUBLIC_APP_NAME,
  url: env.NEXT_PUBLIC_APP_URL,
  description: env.NEXT_PUBLIC_SITE_DESCRIPTION,
  keywords: env.NEXT_PUBLIC_SITE_KEYWORDS.split(','),
  
  // Feature flags
  features: {
    aiScreening: env.NEXT_PUBLIC_ENABLE_AI_SCREENING === 'true',
    videoInterviews: env.NEXT_PUBLIC_ENABLE_VIDEO_INTERVIEWS === 'true',
    analytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  },

  // File upload limits
  fileUpload: {
    maxSize: parseInt(env.NEXT_PUBLIC_MAX_FILE_SIZE),
    allowedTypes: env.NEXT_PUBLIC_ALLOWED_FILE_TYPES.split(','),
  },

  // Social media
  social: {
    twitter: env.NEXT_PUBLIC_TWITTER_HANDLE,
    linkedin: env.NEXT_PUBLIC_LINKEDIN_URL,
  },
} as const

// Database Configuration
export const dbConfig = {
  url: env.DATABASE_URL,
  supabase: {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    projectId: env.NEXT_PUBLIC_SUPABASE_PROJECT_ID,
  },
} as const

// Authentication Configuration
export const authConfig = {
  clerk: {
    publishableKey: env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    secretKey: env.CLERK_SECRET_KEY,
    signInUrl: env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    signUpUrl: env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    afterSignInUrl: env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
    afterSignUpUrl: env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
  },
} as const

// AI Configuration
export const aiConfig = {
  anthropic: {
    apiKey: env.ANTHROPIC_API_KEY,
  },
  openai: {
    apiKey: env.OPENAI_API_KEY,
  },
} as const

// Email Configuration
export const emailConfig = {
  resend: {
    apiKey: env.RESEND_API_KEY,
    fromEmail: env.NEXT_PUBLIC_RESEND_FROM_EMAIL,
  },
} as const

// Redis Configuration
export const redisConfig = {
  url: env.REDIS_URL,
  host: env.REDIS_HOST,
  port: env.REDIS_PORT ? parseInt(env.REDIS_PORT) : undefined,
  password: env.REDIS_PASSWORD,
} as const

// Monitoring Configuration
export const monitoringConfig = {
  sentry: {
    dsn: env.SENTRY_DSN,
    publicDsn: env.NEXT_PUBLIC_SENTRY_DSN,
  },
} as const

// Navigation Configuration
export const navigationConfig = {
  public: [
    { name: 'Jobs', href: '/jobs' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ],
  admin: [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Jobs', href: '/admin/jobs' },
    { name: 'Candidates', href: '/admin/candidates' },
    { name: 'Analytics', href: '/admin/analytics' },
    { name: 'Settings', href: '/admin/settings' },
  ],
  candidate: [
    { name: 'Dashboard', href: '/candidate/dashboard' },
    { name: 'Applications', href: '/candidate/applications' },
    { name: 'Profile', href: '/candidate/profile' },
    { name: 'Settings', href: '/candidate/settings' },
  ],
} as const

// Application Constants
export const constants = {
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // File Upload
  MAX_FILE_SIZE: appConfig.fileUpload.maxSize,
  ALLOWED_FILE_TYPES: appConfig.fileUpload.allowedTypes,

  // Job Status
  JOB_STATUS: ['draft', 'published', 'closed', 'archived'] as const,

  // Application Status
  APPLICATION_STATUS: [
    'pending',
    'screening',
    'interview',
    'offer',
    'hired',
    'rejected',
  ] as const,

  // User Roles
  USER_ROLES: ['admin', 'candidate'] as const,

  // Notification Types
  NOTIFICATION_TYPES: [
    'application_received',
    'application_status_changed',
    'interview_scheduled',
    'job_published',
    'system_update',
  ] as const,

  // Cache TTL (in seconds)
  CACHE_TTL: {
    SHORT: 300, // 5 minutes
    MEDIUM: 3600, // 1 hour
    LONG: 86400, // 24 hours
    WEEK: 604800, // 7 days
  },
} as const

export type JobStatus = typeof constants.JOB_STATUS[number]
export type ApplicationStatus = typeof constants.APPLICATION_STATUS[number]
export type UserRole = typeof constants.USER_ROLES[number]
export type NotificationType = typeof constants.NOTIFICATION_TYPES[number]