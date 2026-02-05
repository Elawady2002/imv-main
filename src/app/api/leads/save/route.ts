import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logActivity, checkAndUpdateUsage } from '@/lib/server-utils'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { leads } = await request.json()

        if (!leads || !Array.isArray(leads) || leads.length === 0) {
            return NextResponse.json({ error: 'No leads provided' }, { status: 400 })
        }

        const leadsToInsert = leads.map((lead: any) => ({
            ...lead,
            user_id: user.id,
            status: 'allocated'
        }))

        const { data: insertedLeads, error: insertError } = await supabase
            .from('leads')
            .insert(leadsToInsert)
            .select()

        if (insertError) {
            console.error('Save leads error:', insertError)
            return NextResponse.json({ error: 'Failed to save leads to database' }, { status: 500 })
        }

        const count = insertedLeads?.length || 0

        // Update usage and log activity
        await checkAndUpdateUsage('leads_allocated', count)
        await logActivity(
            'lead_allocated',
            `Manually saved ${count} leads`,
            { count }
        )

        return NextResponse.json({
            success: true,
            count,
            leads: insertedLeads
        })

    } catch (error) {
        console.error('Save leads route error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
