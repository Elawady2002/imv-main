import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { formatDistanceToNow } from 'date-fns'

export async function GET() {
    try {
        const supabase = await createClient()

        // Fetch the 5 most recent activity logs with user info
        const { data: logs, error } = await supabase
            .from('activity_logs')
            .select(`
        id,
        action,
        description,
        created_at,
        users (
          full_name,
          email
        )
      `)
            .order('created_at', { ascending: false })
            .limit(5)

        if (error) throw error

        const notifications = logs.map(log => {
            const user = log.users as any
            const name = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Someone'

            // Map actions to icons
            let icon = 'lead'
            if (log.action.includes('email')) icon = 'email'
            if (log.action.includes('offer')) icon = 'success'
            if (log.description.includes('$')) icon = 'dollar'

            return {
                id: log.id,
                name: name,
                location: 'Global', // We don't store location for users yet, so generic
                action: log.description,
                icon: icon,
                timeAgo: formatDistanceToNow(new Date(log.created_at), { addSuffix: true })
            }
        })

        return NextResponse.json(notifications)

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }
}
