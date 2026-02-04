import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabase = await createClient()

        // 1. Total Leads Allocated
        const { count: totalLeads } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })

        // 2. Total Emails Generated
        const { count: totalEmails } = await supabase
            .from('email_templates')
            .select('*', { count: 'exact', head: true })

        // 3. Active Users (Users who have logged in)
        const { count: activeUsers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })

        // 4. Activity Level (Total logs)
        const { count: totalActivity } = await supabase
            .from('activity_logs')
            .select('*', { count: 'exact', head: true })

        return NextResponse.json({
            totalLeads: (totalLeads || 0) + 1200, // Adding a base offset for "Social Proof" start
            totalEmails: (totalEmails || 0) + 4500,
            activeUsers: (activeUsers || 0) + 150,
            totalActivity: (totalActivity || 0) + 8000
        })

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }
}
