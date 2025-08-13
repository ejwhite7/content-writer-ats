# ATS Platform Components

This directory contains all the React components for the ATS (Applicant Tracking System) platform, built with modern TypeScript, shadcn/ui, and Tailwind CSS.

## Directory Structure

```
components/
├── ui/                     # Base UI components (shadcn/ui)
├── job-board/             # Job-related components
├── candidate/             # Candidate dashboard components  
├── admin/                 # Admin dashboard components
├── layout/                # Layout and navigation components
├── marketing/             # Marketing and landing page components
├── providers/             # Context providers
└── examples/              # Component examples and demos
```

## UI Components (shadcn/ui)

### Recently Created Components

#### Button (`components/ui/button.tsx`)
Versatile button component with multiple variants and sizes.

**Variants:** default, secondary, outline, ghost, link, destructive  
**Sizes:** default, sm, lg, icon

```tsx
import { Button } from '@/components/ui/button'

<Button variant="outline" size="lg">Click me</Button>
```

#### Badge (`components/ui/badge.tsx`)
Customizable badge component for status indicators and labels.

**Variants:** default, secondary, outline, destructive, success, warning, info

```tsx
import { Badge } from '@/components/ui/badge'

<Badge variant="success">Active</Badge>
```

#### Card (`components/ui/card.tsx`)
Flexible card container with header, content, and footer sections.

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Job Details</CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

#### Input (`components/ui/input.tsx`)
Styled input field component with consistent theming.

```tsx
import { Input } from '@/components/ui/input'

<Input type="email" placeholder="Enter email" />
```

#### DropdownMenu (`components/ui/dropdown-menu.tsx`)
Comprehensive dropdown menu system with nested options.

```tsx
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu'

<DropdownMenu>
  <DropdownMenuTrigger>Options</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Profile</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

#### Skeleton (`components/ui/skeleton.tsx`)
Loading placeholder component for better UX.

```tsx
import { Skeleton } from '@/components/ui/skeleton'

<Skeleton className="h-4 w-full" />
```

### Existing Components
- **Button** - Already implemented
- **Toast/Toaster** - Toast notification system
- **ThemeToggle** - Dark/light mode toggle

## Job Board Components

### JobDetail (`components/job-board/job-detail.tsx`)
Comprehensive job details page with full job information, application actions, and responsive design.

**Features:**
- Complete job information display
- Application and save functionality
- Responsive layout with sidebar
- Skills and requirements sections
- Company information panel
- Share and social actions

```tsx
import { JobDetail } from '@/components/job-board/job-detail'

<JobDetail 
  job={jobData}
  onApply={(jobId) => handleApply(jobId)}
  onSave={(jobId) => handleSave(jobId)}
  showBackButton={true}
/>
```

### JobBoardSkeleton (`components/job-board/job-board-skeleton.tsx`)
Enhanced loading skeleton for job listings with realistic card structure.

```tsx
import { JobBoardSkeleton } from '@/components/job-board/job-board-skeleton'

<JobBoardSkeleton count={6} />
```

### Existing Job Board Components
- **JobBoard** - Main job listing component
- **JobCard** - Individual job listing card
- **JobDetails** - Basic job details (enhanced by JobDetail)
- **JobFilters** - Job filtering interface
- **JobSearch** - Search functionality
- **JobApplicationForm** - Application form

## Marketing Components

### HeroSection (`components/marketing/hero-section.tsx`)
Modern landing page hero section with search functionality, stats, and call-to-action elements.

**Features:**
- Gradient background with grid pattern
- Job search form with location
- Popular search suggestions
- Company stats and testimonials
- Featured company logos
- Responsive design

```tsx
import { HeroSection } from '@/components/marketing/hero-section'

<HeroSection 
  onSearch={(query, location) => handleSearch(query, location)}
  stats={{
    totalJobs: 15420,
    totalCompanies: 2500,
    successfulPlacements: 8930
  }}
/>
```

## Layout Components

### PublicHeader (`components/layout/public-header.tsx`)
Enhanced navigation header with authentication, mobile menu, and dropdown navigation.

**Features:**
- Responsive mobile menu
- User authentication integration (Clerk)
- Dropdown menus for resources
- Professional branding
- Sticky positioning

### PublicFooter (`components/layout/public-footer.tsx`)
Comprehensive footer with links, company information, and newsletter signup.

**Features:**
- Multi-column link organization
- Social media links
- Newsletter subscription
- Contact information
- Responsive grid layout

## Design System

### Theme Integration
All components use CSS custom properties for theming:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96%;
  --muted: 210 40% 96%;
  --border: 214.3 31.8% 91.4%;
  /* ... */
}
```

### Color Variants
- **Primary**: Main brand color
- **Secondary**: Secondary actions
- **Muted**: Subtle backgrounds
- **Destructive**: Error/danger states
- **Success**: Success states (custom)
- **Warning**: Warning states (custom)
- **Info**: Information states (custom)

### Responsive Design
All components follow mobile-first responsive design:

```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

### Accessibility Features
- Proper ARIA attributes
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Color contrast compliance

## Usage Guidelines

### Component Import
Use the centralized index file for cleaner imports:

```tsx
import { Button, Badge, Card } from '@/components/ui'
```

### Styling Patterns
- Use Tailwind utility classes
- Follow the `cn()` utility for conditional classes
- Maintain consistent spacing and sizing
- Use semantic color variables

### TypeScript Integration
All components are fully typed with proper interfaces:

```tsx
interface JobDetailProps {
  job: Job
  showBackButton?: boolean
  onApply?: (jobId: string) => void
  // ...
}
```

### Performance Considerations
- Components use React.forwardRef for proper ref handling
- Memoization applied where appropriate
- Lazy loading for heavy components
- Optimized bundle splitting

## Development Tools

### UI Showcase
Use the UI showcase component for testing and documentation:

```tsx
import { UIShowcase } from '@/components/examples/ui-showcase'

<UIShowcase />
```

### Component Testing
Components are designed to be easily testable with:
- Clear prop interfaces
- Predictable class names
- Accessible selectors
- Mocked interaction handlers

## Contributing

When adding new components:

1. Follow the established naming conventions
2. Include proper TypeScript interfaces
3. Add JSDoc comments for public APIs
4. Ensure responsive design
5. Include accessibility features
6. Update this README with usage examples

## Dependencies

Core dependencies for the component system:
- **React 18+** - Component framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Headless component primitives
- **Lucide React** - Icon system
- **class-variance-authority** - Variant handling
- **clsx & tailwind-merge** - Class management