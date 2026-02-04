import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logActivity } from '@/lib/server-utils'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { emailId, subject } = await request.json()

        if (!emailId) {
            return NextResponse.json({ error: 'Email ID required' }, { status: 400 })
        }

        // Update status logic could go here (e.g. mark as 'active' in DB if we had that column)
        // For now, we mainly log the activity as requested.

        await logActivity(
            'campaign_started',
            `Activated campaign: ${subject}`,
            { emailId }
        )

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Activation error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
