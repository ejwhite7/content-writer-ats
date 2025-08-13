import { JobStatus, ApplicationStatus, UserRole, NotificationType } from '@/lib/config'

// Base types
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

// Search and pagination types
export interface SearchParams {
  [key: string]: string | string[] | undefined
}

export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface FilterParams {
  [key: string]: any
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  code: string
  message: string
  details?: any
}

// File upload types
export interface FileUpload {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  url: string
  uploadedAt: Date
  uploadedBy: string
}

// Address and location types
export interface Address {
  street?: string
  city: string
  state: string
  country: string
  postalCode?: string
  coordinates?: {
    latitude: number
    longitude: number
  }
}

// Contact information
export interface ContactInfo {
  email: string
  phone?: string
  website?: string
  linkedin?: string
  github?: string
  portfolio?: string
}

// Employment and work experience
export interface WorkExperience {
  id: string
  company: string
  position: string
  startDate: Date
  endDate?: Date
  current: boolean
  description?: string
  skills?: string[]
  achievements?: string[]
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: Date
  endDate?: Date
  current: boolean
  gpa?: number
  description?: string
}

// Skills and certifications
export interface Skill {
  id: string
  name: string
  category: string
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  yearsOfExperience?: number
}

export interface Certification {
  id: string
  name: string
  issuer: string
  issueDate: Date
  expiryDate?: Date
  credentialId?: string
  url?: string
}

// Notification types
export interface Notification extends BaseEntity {
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  actionUrl?: string
  metadata?: Record<string, any>
}

// Activity log
export interface ActivityLog extends BaseEntity {
  userId: string
  action: string
  entityType: string
  entityId: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

// Settings and preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  emailNotifications: boolean
  pushNotifications: boolean
  marketingEmails: boolean
}

// Analytics and metrics
export interface Metric {
  name: string
  value: number
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  period: string
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }[]
}

// Form and validation types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file'
  required: boolean
  placeholder?: string
  options?: { label: string; value: string }[]
  validation?: {
    pattern?: string
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
  }
}

export interface FormState {
  isSubmitting: boolean
  errors: Record<string, string>
  touched: Record<string, boolean>
  values: Record<string, any>
}

// Theme and styling
export interface Theme {
  name: string
  colors: {
    primary: string
    secondary: string
    background: string
    foreground: string
    muted: string
    accent: string
    destructive: string
    border: string
    input: string
    ring: string
  }
}

// Component prop types
export interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
}

export interface InputProps {
  type?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  onFocus?: () => void
  disabled?: boolean
  required?: boolean
  error?: string
  className?: string
}

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

export interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  className?: string
}

// Modal and dialog types
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
}

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

// Toast and alert types
export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Data table types
export interface TableColumn<T = any> {
  key: string
  label: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, row: T) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  error?: string
  pagination?: PaginatedResponse<T>['pagination']
  onSort?: (column: string, order: 'asc' | 'desc') => void
  onFilter?: (filters: Record<string, any>) => void
  onPageChange?: (page: number) => void
  selectedRows?: string[]
  onRowSelect?: (rowId: string, selected: boolean) => void
  onSelectAll?: (selected: boolean) => void
  actions?: {
    label: string
    onClick: (row: T) => void
    icon?: React.ReactNode
    variant?: 'default' | 'destructive'
  }[]
}

// Export types for external use
export type {
  JobStatus,
  ApplicationStatus,
  UserRole,
  NotificationType,
}