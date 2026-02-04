'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSupabase } from './useSupabase'
import { useAuth } from './useAuth'
import { Offer } from '@/types/database'

export function useOffers() {
    const [offers, setOffers] = useState<Offer[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const supabase = useSupabase()
    const { user } = useAuth()

    const fetchOffers = useCallback(async () => {
        if (!user) return
        setLoading(true)

        const { data, error } = await supabase
            .from('offers')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            setError(error.message)
        } else {
            setOffers(data as Offer[])
        }
        setLoading(false)
    }, [supabase, user])

    const saveOffer = async (offer: Partial<Offer>) => {
        if (!user) return { error: 'Not authenticated' }

        setLoading(true)
        const { data, error } = await supabase
            .from('offers')
            .insert([{ ...offer, user_id: user.id }])
            .select()
            .single()

        setLoading(false)
        if (error) return { error: error.message }

        await fetchOffers()
        return { data, success: true }
    }

    const updateOffer = async (id: string, offer: Partial<Offer>) => {
        if (!user) return { error: 'Not authenticated' }

        setLoading(true)
        const { data, error } = await supabase
            .from('offers')
            .update(offer)
            .eq('id', id)
            .select()
            .single()

        setLoading(false)
        if (error) return { error: error.message }

        await fetchOffers()
        return { data, success: true }
    }

    const deleteOffer = async (id: string) => {
        if (!user) return { error: 'Not authenticated' }

        setLoading(true)
        const { error } = await supabase
            .from('offers')
            .delete()
            .eq('id', id)

        setLoading(false)
        if (error) return { error: error.message }

        await fetchOffers()
        return { success: true }
    }

    useEffect(() => {
        fetchOffers()
    }, [fetchOffers])

    return { offers, loading, error, saveOffer, updateOffer, deleteOffer, refresh: fetchOffers }
}
