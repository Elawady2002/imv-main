import { createClient } from './supabase/server'
import { ActivityAction } from '@/types/database'

export async function logActivity(
    action: ActivityAction,
    description: string,
    metadata?: Record<string, unknown>
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    return await supabase.from('activity_logs').insert({
        user_id: user.id,
        action,
        description,
        metadata
    })
}

export async function checkAndUpdateUsage(
    type: 'leads_allocated' | 'emails_generated',
    increment: number = 1
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    const today = new Date().toISOString().split('T')[0]

    // 1. Get current usage
    const { data: usageData } = await supabase
        .from('usage_limits')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle()

    const currentUsage = usageData?.[type] || 0

    // 2. We don't check the limit here, we just handle the update/insert
    // The limit check should happen in the route before calling this if needed, 
    // or we can pass the limit as an argument.

    if (usageData) {
        const { error } = await supabase
            .from('usage_limits')
            .update({ [type]: currentUsage + increment })
            .eq('id', usageData.id)
        if (error) return { error: error.message }
    } else {
        const { error } = await supabase
            .from('usage_limits')
            .insert({
                user_id: user.id,
                date: today,
                leads_allocated: type === 'leads_allocated' ? increment : 0,
                emails_generated: type === 'emails_generated' ? increment : 0
            })
        if (error) return { error: error.message }
    }

    return { success: true, currentUsage: currentUsage + increment }
}
