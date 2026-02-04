'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from './useSupabase'
import { useAuth } from './useAuth'
import { UsageLimit } from '@/types/database'
import { DAILY_LEAD_LIMIT, DAILY_EMAIL_LIMIT } from '@/lib/constants'

export function useUsageLimit() {
    const [stats, setStats] = useState({
        leadsAllocatedToday: 0,
        emailsGeneratedToday: 0,
        leadsRemaining: DAILY_LEAD_LIMIT,
        emailsRemaining: DAILY_EMAIL_LIMIT
    })
    const [loading, setLoading] = useState(true)
    const supabase = useSupabase()
    const { user } = useAuth()

    const fetchStats = useCallback(async () => {
        if (!user) return

        const today = new Date().toISOString().split('T')[0]

        const { data, error } = await supabase
            .from('usage_limits')
            .select('*')
            .eq('user_id', user.id)
            .eq('date', today)
            .maybeSingle()

        if (error) {
            console.warn('Error fetching usage limits (using defaults):', JSON.stringify(error, null, 2))
            setStats({
                leadsAllocatedToday: 0,
                emailsGeneratedToday: 0,
                leadsRemaining: DAILY_LEAD_LIMIT,
                emailsRemaining: DAILY_EMAIL_LIMIT
            })
            setLoading(false)
            return
        }

        const usage = data as UsageLimit | null

        if (usage) {
            setStats({
                leadsAllocatedToday: usage.leads_allocated,
                emailsGeneratedToday: usage.emails_generated,
                leadsRemaining: DAILY_LEAD_LIMIT - usage.leads_allocated,
                emailsRemaining: DAILY_EMAIL_LIMIT - usage.emails_generated
            })
        } else {
            // Default stats for new day
            setStats({
                leadsAllocatedToday: 0,
                emailsGeneratedToday: 0,
                leadsRemaining: DAILY_LEAD_LIMIT,
                emailsRemaining: DAILY_EMAIL_LIMIT
            })
        }

        setLoading(false)
    }, [supabase, user])

    useEffect(() => {
        if (user) {
            fetchStats()
        }
    }, [user, fetchStats])

    return { stats, loading, refresh: fetchStats }
}
