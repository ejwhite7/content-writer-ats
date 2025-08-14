// Import Jest DOM for extended matchers
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      replace: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }) => {
    return <a href={href} {...props}>{children}</a>
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_clerk'
process.env.ANTHROPIC_API_KEY = 'sk-ant-test'
process.env.RESEND_API_KEY = 're_test'

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(() => ({
    user: {
      id: 'user_test',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      firstName: 'Test',
      lastName: 'User',
    },
    isLoaded: true,
    isSignedIn: true,
  })),
  useAuth: jest.fn(() => ({
    userId: 'user_test',
    isLoaded: true,
    isSignedIn: true,
  })),
  SignIn: jest.fn(({ children }) => children),
  SignUp: jest.fn(({ children }) => children),
  UserButton: jest.fn(() => <div data-testid="user-button">User Button</div>),
  ClerkProvider: jest.fn(({ children }) => children),
}))

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
}))

// Mock Redis
jest.mock('@/lib/redis/client', () => ({
  getRedisClient: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    ping: jest.fn().mockResolvedValue('PONG'),
  })),
  checkRedisHealth: jest.fn().mockResolvedValue(true),
}))

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setUser: jest.fn(),
  setTag: jest.fn(),
  withScope: jest.fn((callback) => callback({ setTag: jest.fn(), setContext: jest.fn() })),
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  MapPin: ({ className, ...props }) => <svg className={className} {...props} data-testid="map-pin-icon" />,
  Clock: ({ className, ...props }) => <svg className={className} {...props} data-testid="clock-icon" />,
  DollarSign: ({ className, ...props }) => <svg className={className} {...props} data-testid="dollar-sign-icon" />,
  Building: ({ className, ...props }) => <svg className={className} {...props} data-testid="building-icon" />,
  User: ({ className, ...props }) => <svg className={className} {...props} data-testid="user-icon" />,
  Search: ({ className, ...props }) => <svg className={className} {...props} data-testid="search-icon" />,
  Filter: ({ className, ...props }) => <svg className={className} {...props} data-testid="filter-icon" />,
  ChevronDown: ({ className, ...props }) => <svg className={className} {...props} data-testid="chevron-down-icon" />,
  X: ({ className, ...props }) => <svg className={className} {...props} data-testid="x-icon" />,
  Plus: ({ className, ...props }) => <svg className={className} {...props} data-testid="plus-icon" />,
  Minus: ({ className, ...props }) => <svg className={className} {...props} data-testid="minus-icon" />,
  Edit: ({ className, ...props }) => <svg className={className} {...props} data-testid="edit-icon" />,
  Trash: ({ className, ...props }) => <svg className={className} {...props} data-testid="trash-icon" />,
  Save: ({ className, ...props }) => <svg className={className} {...props} data-testid="save-icon" />,
  Cancel: ({ className, ...props }) => <svg className={className} {...props} data-testid="cancel-icon" />,
}))

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '2 days ago'),
  format: jest.fn(() => '2024-01-15'),
  parseISO: jest.fn((date) => new Date(date)),
  isValid: jest.fn(() => true),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock CSS module classes
jest.mock('*.module.css', () => ({}))
jest.mock('*.module.scss', () => ({}))

// Mock CSS imports
jest.mock('*.css', () => ({}))
jest.mock('*.scss', () => ({}))

// Global test utilities
global.testUtils = {
  createMockJob: (overrides = {}) => ({
    id: 'test-job-1',
    title: 'Test Job',
    company: 'Test Company',
    location: 'Test Location',
    job_type: 'full_time',
    salary_min: 50000,
    salary_max: 70000,
    description: 'Test job description',
    requirements: ['Test requirement'],
    posted_at: '2024-01-15',
    remote_allowed: false,
    tenants: {
      name: 'Test Company',
      branding_settings: {
        primary_color: '#000000',
        logo_url: 'https://test.com/logo.png'
      }
    },
    ...overrides
  }),
}