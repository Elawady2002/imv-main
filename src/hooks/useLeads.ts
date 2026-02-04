'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from './useSupabase'
import { useAuth } from './useAuth'
import { Lead } from '@/types/database'
import { DAILY_LEAD_LIMIT } from '@/lib/constants'

export function useLeads() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const supabase = useSupabase()
    const { user } = useAuth()

    const fetchLeads = useCallback(async () => {
        if (!user) return
        setLoading(true)

        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .eq('user_id', user.id)
            .order('allocated_at', { ascending: false })
            .limit(100)

        if (error) {
            setError(error.message)
        } else {
            setLeads(data as Lead[])
        }
        setLoading(false)
    }, [supabase, user])

    const allocateLeads = async (industry: string, location?: string, campaign?: string) => {
        if (!user) return { error: 'Not authenticated' }

        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/leads/allocate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ industry, location, campaign })
            })

            const result = await response.json()

            if (!response.ok) {
                setError(result.error || 'Allocation failed')
                return { error: result.error || 'Allocation failed' }
            } else {
                await fetchLeads()
                return {
                    success: true,
                    allocated: result.allocated,
                    message: result.message
                }
            }
        } catch (err) {
            setError('System error during allocation')
            return { error: 'System error during allocation' }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLeads()
    }, [fetchLeads])

    return { leads, loading, error, allocateLeads, refresh: fetchLeads }
}
