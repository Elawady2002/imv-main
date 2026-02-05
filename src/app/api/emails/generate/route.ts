import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { DAILY_EMAIL_LIMIT } from '@/lib/constants'
import { UsageLimit } from '@/types/database'
import { z } from 'zod'
import { logActivity, checkAndUpdateUsage } from '@/lib/server-utils'

const GenerateSchema = z.object({
  leadId: z.string().uuid('Invalid Lead ID'),
  offerId: z.string().uuid('Invalid Offer ID').optional().nullable(),
  customOffer: z.string().optional().nullable(),
  tone: z.enum(['friendly', 'professional', 'direct']).default('professional')
}).refine(data => data.offerId || data.customOffer, {
  message: 'Either an offer or custom description is required',
  path: ['offerId']
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = GenerateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { leadId, offerId, customOffer, tone } = validation.data

    // Check usage
    const today = new Date().toISOString().split('T')[0]
    const { data: usageData } = await supabase
      .from('usage_limits')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single()

    const currentUsage = (usageData as UsageLimit)?.emails_generated || 0

    if (currentUsage >= DAILY_EMAIL_LIMIT) {
      return NextResponse.json({ error: 'Daily email limit reached' }, { status: 429 })
    }

    // Get lead (Ensuring it belongs to the user)
    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .eq('user_id', user.id)
      .single()

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // Get offer description (Ensuring it belongs to the user)
    let offerDescription = customOffer || ''
    if (offerId) {
      const { data: offer } = await supabase
        .from('offers')
        .select('*')
        .eq('id', offerId)
        .eq('user_id', user.id)
        .single()

      if (offer) {
        offerDescription = `${offer.name}: ${offer.description}`
        if (offer.link) offerDescription += ` (Link: ${offer.link})`
      }
    }

    const toneDescriptions = {
      friendly: 'warm, approachable, and conversational',
      professional: 'formal, business-like, and polished',
      direct: 'clear, concise, and to the point'
    }

    const prompt = `You are a professional B2B email copywriter.
    Generate a personalized cold outreach email for the following prospect:

    Prospect Details:
    - Business Name: ${lead.business_name}
    - Industry: ${lead.industry}
    - Location: ${lead.location}
    
    Offer to Promote:
    ${offerDescription}
    
    Tone: ${toneDescriptions[tone] || 'professional'}
    
    INSTRUCTIONS:
    - Write a compelling Subject Line.
    - Write a Body that is persuasive but concise (under 150 words).
    - Write a short Follow-up email (under 50 words) to send 3 days later.
    - RETURN ONLY VALID JSON. No markdown formatting, no backticks.
    
    Expected JSON Format:
    {
      "subject": "Email Subject",
      "body": "Email Body content...",
      "followUp": "Follow up email content..."
    }`

    // Use RapidAPI instead of OpenAI SDK
    const apiKey = process.env.RAPIDAPI_AI_KEY
    const apiHost = process.env.RAPIDAPI_AI_HOST || 'chatgpt-42.p.rapidapi.com'

    if (!apiKey) {
      // Fallback to offline generation if no key
      const fallback = generateFallbackEmail(lead, offerDescription, tone)
      await checkAndUpdateUsage('emails_generated')
      await logActivity('email_generated', `Generated (Offline) email for ${lead.business_name}`, { leadId, tone })
      return NextResponse.json({ success: true, ...fallback })
    }

    try {
      const response = await fetch(`https://${apiHost}/gpt4`, {
        method: 'POST',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': apiHost,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          web_access: false
        }),
        signal: AbortSignal.timeout(45000) // 45s timeout for long generation
      })

      if (!response.ok) {
        throw new Error(`RapidAPI Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      let content = data.result || data.choices?.[0]?.message?.content || ''

      // Clean cleanup markdown if present
      content = content.replace(/```json\n?|\n?```/g, '').trim()

      let generatedEmail
      try {
        generatedEmail = JSON.parse(content)
      } catch (e) {
        console.error('JSON Parse Error:', content)
        // If JSON parsing fails, return a partial result or fallback
        generatedEmail = generateFallbackEmail(lead, offerDescription, tone)
      }

      if (!generatedEmail.subject || !generatedEmail.body) {
        generatedEmail = generateFallbackEmail(lead, offerDescription, tone)
      }

      // Update usage and log activity
      await checkAndUpdateUsage('emails_generated')
      await logActivity(
        'email_generated',
        `Generated ${tone} email for ${lead.business_name}`,
        { leadId, tone }
      )

      return NextResponse.json({ success: true, ...generatedEmail })

    } catch (err: any) {
      console.error('AI API Error:', err)
      return NextResponse.json({
        error: `AI Generation Failed: ${err.message || 'Unknown error'}`,
        details: err.toString()
      }, { status: 502 })
    }

  } catch (error) {
    console.error('Email generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateFallbackEmail(lead: any, offerDescription: string, tone: string) {
  const greetings = { friendly: "Hi there!", professional: "Dear Business Owner,", direct: "Hello," }
  const closings = {
    friendly: "Looking forward to chatting!\n\nBest,\n[Your Name]",
    professional: "I look forward to your response.\n\nBest regards,\n[Your Name]",
    direct: "Let me know.\n\n[Your Name]"
  }
  const greeting = (greetings as any)[tone] || greetings.professional
  const closing = (closings as any)[tone] || closings.professional

  return {
    subject: `Quick question for ${lead.business_name}`,
    body: `${greeting}\n\nI was impressed by ${lead.business_name} in the ${lead.industry} space in ${lead.location}.\n\nI wanted to share this: ${offerDescription}\n\n${closing}`,
    followUp: `Following up on my email about ${lead.business_name}. Interested?\n\n${closing}`
  }
}
