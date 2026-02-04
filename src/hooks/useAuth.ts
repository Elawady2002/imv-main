'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useSupabase } from './useSupabase'

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = useSupabase()

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user ?? null)
            setLoading(false)
        }

        getSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [supabase])

    return { user, loading }
}
