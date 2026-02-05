// Usage Limits
export const DAILY_LEAD_LIMIT = parseInt(process.env.NEXT_PUBLIC_DAILY_LEAD_LIMIT || '1000', 10)
export const DAILY_EMAIL_LIMIT = parseInt(process.env.NEXT_PUBLIC_DAILY_EMAIL_LIMIT || '500', 10)

// Industry Options
export const INDUSTRIES = [
  'Restaurants & Cafes',
  'Retail Stores',
  'Professional Services',
  'Health & Wellness',
  'Home Services',
  'Automotive',
  'Real Estate',
  'Legal Services',
  'Financial Services',
  'Education & Training',
  'Technology Services',
  'Marketing & Advertising',
  'Construction',
  'Manufacturing',
  'Other'
] as const

// Email Tones
export const EMAIL_TONES = [
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
  { value: 'professional', label: 'Professional', description: 'Formal and business-like' },
  { value: 'direct', label: 'Direct', description: 'Clear and to the point' }
] as const

// Lead Status
export const LEAD_STATUS = {
  allocated: { label: 'Active', color: 'bg-green-100 text-green-800' },
  used: { label: 'Used', color: 'bg-blue-100 text-blue-800' },
  invalid: { label: 'Invalid', color: 'bg-red-100 text-red-800' }
} as const

// Activity Actions
export const ACTIVITY_ACTIONS = {
  lead_allocated: { label: 'Lead Allocated', icon: 'UserPlus' },
  email_generated: { label: 'Email Generated', icon: 'Mail' },
  offer_created: { label: 'Offer Created', icon: 'Plus' },
  offer_updated: { label: 'Offer Updated', icon: 'Edit' },
  email_saved: { label: 'Email Saved', icon: 'Save' },
  campaign_started: { label: 'Campaign Started', icon: 'Rocket' }
} as const

// Navigation Items
export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/leads', label: 'Lead Allocation', icon: 'Users' },
  { href: '/email-builder', label: 'Email Builder', icon: 'Mail' },
  { href: '/send-instructions', label: 'Send Instructions', icon: 'Send' },
  { href: '/training', label: 'Training', icon: 'School' },
  { href: '/activity', label: 'Activity Log', icon: 'FileText' },
  { href: '/offers', label: 'Offer Builder', icon: 'Gift' },
  { href: '/support', label: 'Support', icon: 'HelpCircle' }
] as const
