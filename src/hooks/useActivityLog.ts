'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from './useSupabase'
import { useAuth } from './useAuth'
import { ActivityLog } from '@/types/database'

export function useActivityLog() {
    const [logs, setLogs] = useState<ActivityLog[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const supabase = useSupabase()
    const { user } = useAuth()

    const fetchLogs = useCallback(async () => {
        if (!user) return
        setLoading(true)

        const { data, error } = await supabase
            .from('activity_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) {
            setError(error.message)
        } else {
            setLogs(data as ActivityLog[])
        }
        setLoading(false)
    }, [supabase, user])

    useEffect(() => {
        fetchLogs()
    }, [fetchLogs])

    return { logs, loading, error, refresh: fetchLogs }
}
