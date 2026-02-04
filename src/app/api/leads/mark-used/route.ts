import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const MarkUsedSchema = z.object({
  leadId: z.string().uuid('Invalid Lead ID')
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = MarkUsedSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { leadId } = validation.data

    const { error: updateError } = await supabase
      .from('leads')
      .update({ status: 'used' })
      .eq('id', leadId)
      .eq('user_id', user.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Lead update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
