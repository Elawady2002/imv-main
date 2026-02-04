import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { logActivity } from '@/lib/server-utils'

const SaveSchema = z.object({
  leadId: z.string().uuid().optional().nullable(),
  offerId: z.string().uuid().optional().nullable(),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Email body is required'),
  followUp: z.string().optional().nullable(),
  tone: z.enum(['friendly', 'professional', 'direct']).default('professional')
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = SaveSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { leadId, offerId, subject, body: emailBody, followUp, tone } = validation.data

    const { data: savedEmail, error: saveError } = await supabase
      .from('email_templates')
      .insert({
        user_id: user.id,
        lead_id: leadId || null,
        offer_id: offerId || null,
        subject,
        body: emailBody,
        follow_up: followUp || null,
        tone: tone || 'professional'
      })
      .select()
      .single()

    if (saveError) {
      return NextResponse.json({ error: 'Failed to save email' }, { status: 500 })
    }

    // Log activity using helper
    await logActivity(
      'email_saved',
      `Saved email: ${subject}`,
      { emailId: savedEmail.id, leadId }
    )

    return NextResponse.json({
      success: true,
      email: savedEmail
    })

  } catch (error) {
    console.error('Email save error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
