'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { PromoBanner } from '@/components/ui/promo-banner'
import { ACTIVITY_ACTIONS } from '@/lib/constants'
import { UserPlus, Mail, Save, Plus, Edit, Activity, Terminal } from 'lucide-react'
import { format } from 'date-fns'
import { useActivityLog } from '@/hooks/useActivityLog'
import { PageContainer, PageSection } from '@/components/layout/page-container'
import { PageHeader } from '@/components/layout/page-header'

const iconMap = {
  UserPlus: UserPlus,
  Mail: Mail,
  Save: Save,
  Plus: Plus,
  Edit: Edit
}

export default function ActivityPage() {
  const { logs, loading } = useActivityLog()
  const [filter, setFilter] = useState('all')

  const filteredLogs = filter === 'all'
    ? logs
    : logs.filter(log => log.action === filter)

  const getIcon = (action: keyof typeof ACTIVITY_ACTIONS) => {
    const iconName = ACTIVITY_ACTIONS[action]?.icon as keyof typeof iconMap
    const Icon = iconMap[iconName] || Mail
    return <Icon size={18} strokeWidth={1.5} />
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'lead_allocated':
        return { bg: 'bg-cyan-400/10', border: 'border-cyan-400/20', text: 'text-cyan-400' }
      case 'email_generated':
        return { bg: 'bg-purple-400/10', border: 'border-purple-400/20', text: 'text-purple-400' }
      case 'email_saved':
        return { bg: 'bg-green-400/10', border: 'border-green-400/20', text: 'text-green-400' }
      case 'offer_created':
        return { bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', text: 'text-yellow-400' }
      case 'offer_updated':
        return { bg: 'bg-orange-400/10', border: 'border-orange-400/20', text: 'text-orange-400' }
      default:
        return { bg: 'bg-zinc-400/10', border: 'border-zinc-400/20', text: 'text-zinc-400' }
    }
  }

  return (
    <PageContainer className="max-w-4xl">
      {/* Promo Banner */}
      <PageSection>
        <PromoBanner />
      </PageSection>

      {/* Header */}
      <PageHeader
        title="Activity Log"
        description="System event monitoring and audit trail"
        tooltipTitle="Activity Tracking"
        tooltipContent="Every action you take is logged here for transparency and auditing. Use filters to find specific events or review your daily productivity."
      />

      {/* Filters */}
      <PageSection>
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-zinc-400">
                <Terminal className="w-4 h-4" />
                <span className="text-sm uppercase tracking-wider">Filter</span>
              </div>
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Events' },
                  { value: 'lead_allocated', label: 'Lead Allocations' },
                  { value: 'email_generated', label: 'Email Generations' },
                  { value: 'offer_created', label: 'Offer Creates' },
                  { value: 'offer_updated', label: 'Offer Updates' }
                ]}
                className="max-w-xs"
              />
            </div>
          </CardContent>
        </Card>
      </PageSection>

      {/* Activity List */}
      <PageSection>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-cyan-400/10 border border-cyan-400/20">
                <Activity className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <CardTitle>Event Stream</CardTitle>
                <CardDescription>
                  <span className="text-cyan-400 font-mono">{filteredLogs.length}</span> events recorded
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full mx-auto"
                />
                <p className="text-zinc-500 mt-4">Loading events...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-12 text-center">
                <Activity className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500">No events recorded</p>
                <p className="text-zinc-600 text-sm">Begin operations to generate activity</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/50">
                {filteredLogs.map((activity, index) => {
                  const colors = getActionColor(activity.action)
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="px-6 py-4 flex items-start gap-4 hover:bg-zinc-800/20 transition-colors"
                    >
                      <div className={`p-2.5 rounded-lg ${colors.bg} border ${colors.border} shrink-0`}>
                        <span className={colors.text}>
                          {getIcon(activity.action as keyof typeof ACTIVITY_ACTIONS)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white">
                          {ACTIVITY_ACTIONS[activity.action as keyof typeof ACTIVITY_ACTIONS]?.label || activity.action}
                        </p>
                        <p className="text-zinc-500 text-sm mt-1 truncate">
                          {activity.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-zinc-500 font-mono">
                          {format(new Date(activity.created_at), 'MMM d, yyyy')}
                        </p>
                        <p className="text-xs text-cyan-400/60 font-mono">
                          {format(new Date(activity.created_at), 'HH:mm:ss')}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </PageSection>
    </PageContainer>
  )
}
