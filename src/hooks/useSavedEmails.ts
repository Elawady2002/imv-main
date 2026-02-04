import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type EmailTemplate = Database['public']['Tables']['email_templates']['Row']

export function useSavedEmails() {
    const [emails, setEmails] = useState<EmailTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchEmails = useCallback(async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data, error } = await supabase
                .from('email_templates')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setEmails(data || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [supabase])

    const deleteEmail = async (id: string) => {
        try {
            const { error } = await supabase
                .from('email_templates')
                .delete()
                .eq('id', id)

            if (error) throw error
            setEmails(prev => prev.filter(e => e.id !== id))
            return { success: true }
        } catch (err: any) {
            return { error: err.message }
        }
    }

    useEffect(() => {
        fetchEmails()
    }, [fetchEmails])

    return { emails, loading, error, refresh: fetchEmails, deleteEmail }
}
