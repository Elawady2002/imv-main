import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { DAILY_EMAIL_LIMIT } from '@/lib/constants'
import { Lead, Offer, UsageLimit } from '@/types/database'
import OpenAI from 'openai'
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

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) return null
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

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

    const prompt = `Generate a business outreach email for the following:
Business Name: ${lead.business_name}
Industry: ${lead.industry}
Location: ${lead.location}
Offer/Service to Promote: ${offerDescription}
Tone: ${toneDescriptions[tone] || 'professional'}

Format response as JSON:
{
  "subject": "Subject line",
  "body": "Email body",
  "followUp": "Follow-up email"
}`

    let generatedEmail = { subject: '', body: '', followUp: '' }
    const openai = getOpenAIClient()

    if (!openai) {
      return NextResponse.json({
        error: 'AI Engine Offline: Content generation requires system configuration. Please link your OpenAI API key to proceed.',
        type: 'config_missing'
      }, { status: 403 })
    }

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a professional email copywriter.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' }
      })
      generatedEmail = JSON.parse(completion.choices[0]?.message?.content || '{}')

      if (!generatedEmail.subject || !generatedEmail.body) {
        throw new Error('Incomplete data from AI')
      }
    } catch (err) {
      console.error('AI Processing error:', err)
      return NextResponse.json({ error: 'AI processing failed. Please try again.' }, { status: 502 })
    }

    // Update usage and log activity
    await checkAndUpdateUsage('emails_generated')
    await logActivity(
      'email_generated',
      `Generated ${tone} email for ${lead.business_name}`,
      { leadId, tone }
    )

    return NextResponse.json({ success: true, ...generatedEmail })

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
