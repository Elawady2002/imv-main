import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { DAILY_LEAD_LIMIT } from '@/lib/constants'
import { UsageLimit } from '@/types/database'
import { z } from 'zod'
import { logActivity, checkAndUpdateUsage } from '@/lib/server-utils'

const AllocateSchema = z.object({
  industry: z.string().min(1, 'Niche is required'),
  location: z.string().optional(),
  campaign: z.string().optional()
})

// Mock business data generator
function generateMockLeads(industry: string, location: string, count: number) {
  const businessPrefixes = [
    'Prime', 'Elite', 'Metro', 'City', 'Local', 'Express', 'Pro', 'Quality',
    'First', 'Best', 'Top', 'Star', 'Golden', 'Premium', 'Classic'
  ]

  const businessSuffixes: Record<string, string[]> = {
    'Restaurants & Cafes': ['Restaurant', 'Cafe', 'Bistro', 'Grill', 'Kitchen', 'Diner'],
    'Retail Stores': ['Shop', 'Store', 'Boutique', 'Outlet', 'Mart', 'Emporium'],
    'Professional Services': ['Consulting', 'Solutions', 'Partners', 'Associates', 'Group'],
    'Health & Wellness': ['Wellness Center', 'Health Clinic', 'Spa', 'Fitness', 'Medical'],
    'Home Services': ['Home Services', 'Maintenance', 'Repair', 'Contractors', 'Solutions'],
    'Automotive': ['Auto', 'Motors', 'Automotive', 'Car Care', 'Auto Services'],
    'Real Estate': ['Realty', 'Properties', 'Real Estate', 'Homes', 'Estates'],
    'Legal Services': ['Law Firm', 'Legal', 'Attorneys', 'Law Office', 'Legal Services'],
    'Financial Services': ['Financial', 'Advisors', 'Wealth Management', 'Capital', 'Finance'],
    'Education & Training': ['Academy', 'Institute', 'Learning Center', 'School', 'Training'],
    'Technology Services': ['Tech', 'IT Solutions', 'Digital', 'Systems', 'Software'],
    'Marketing & Advertising': ['Marketing', 'Media', 'Creative', 'Agency', 'Advertising'],
    'Construction': ['Construction', 'Builders', 'Development', 'Contracting', 'Build Co'],
    'Manufacturing': ['Manufacturing', 'Industries', 'Products', 'Factory', 'Production'],
    'Other': ['Services', 'Company', 'Business', 'Enterprise', 'Corp']
  }

  const suffixes = businessSuffixes[industry] || businessSuffixes['Other']

  const leads = []
  for (let i = 0; i < count; i++) {
    const prefix = businessPrefixes[Math.floor(Math.random() * businessPrefixes.length)]
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
    const businessName = `${prefix} ${suffix}`

    const domain = businessName.toLowerCase().replace(/\s+/g, '') + '.com'
    const email = `info@${domain}`

    leads.push({
      business_name: businessName,
      website: `https://www.${domain}`,
      email: email,
      location: location,
      industry: industry
    })
  }

  return leads
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    console.log('Active Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = AllocateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { industry: niche, location: providedLocation, campaign: providedCampaign } = validation.data
    const location = providedLocation || 'World'
    const campaign = providedCampaign || `${niche} Outreach`

    // Check today's usage
    const today = new Date().toISOString().split('T')[0]
    const { data: usageData } = await supabase
      .from('usage_limits')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    const currentUsage = (usageData as UsageLimit)?.leads_allocated || 0

    if (currentUsage >= DAILY_LEAD_LIMIT) {
      return NextResponse.json({ error: 'Daily lead limit reached' }, { status: 429 })
    }

    const remaining = DAILY_LEAD_LIMIT - currentUsage
    const toAllocate = Math.min(15, remaining)

    // 1. Generate Hashtags using AI
    let hashtags: string[] = []
    try {
      const { generateHashtags } = await import('@/lib/instagram')
      hashtags = await generateHashtags(niche)
    } catch (err) {
      console.error('Hashtag generation error:', err)
      hashtags = [niche.toLowerCase().replace(/\s+/g, '')]
    }

    // 2. Discover Leads (using AI Search Strategy)
    let leadsToInsert = []
    try {
      const { searchInstagramLeads } = await import('@/lib/instagram')
      const discoveredLeads = await searchInstagramLeads(niche, toAllocate)

      leadsToInsert = discoveredLeads.map((lead: any) => ({
        ...lead,
        user_id: user.id,
        industry: niche,
        campaign: campaign,
        location: location || lead.location
      }))
    } catch (err: any) {
      console.error('Lead discovery error:', err)
      if (err.message === 'config_missing_keys') {
        return NextResponse.json({
          error: 'Search Engine Offline: ScraperAPI key is missing in your system configuration.',
          type: 'config_missing'
        }, { status: 403 })
      }
      return NextResponse.json({ error: `Failed to discover leads: ${err.message}` }, { status: 502 })
    }

    // 3. Filter Duplicates
    const newWebsites = leadsToInsert.map((l: any) => l.website)

    if (newWebsites.length > 0) {
      const { data: existingLeads } = await supabase
        .from('leads')
        .select('website')
        .eq('user_id', user.id)
        .in('website', newWebsites)

      const existingSet = new Set(existingLeads?.map(l => l.website) || [])
      leadsToInsert = leadsToInsert.filter((l: any) => !existingSet.has(l.website))
    }

    return NextResponse.json({
      success: true,
      leads: leadsToInsert,
      allocated: leadsToInsert.length,
      message: leadsToInsert.length === 0 ? 'No new unique leads found.' : `Found ${leadsToInsert.length} potential leads.`
    })

  } catch (error) {
    console.error('Lead discovery error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
