'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PromoBanner } from '@/components/ui/promo-banner'
import { HelpTooltip, QuickTip } from '@/components/ui/help-tooltip'
import { LEAD_STATUS } from '@/lib/constants'
import { ExternalLink, Mail, Users, Target, Zap } from 'lucide-react'
import { useLeads } from '@/hooks/useLeads'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { PageContainer, PageSection } from '@/components/layout/page-container'
import { PageHeader } from '@/components/layout/page-header'

import { Feedback } from '@/components/ui/feedback'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingState } from '@/components/ui/loading-state'
import { Accordion } from '@/components/ui/accordion'

const POPULAR_NICHES = [
  'E-commerce', 'Fitness', 'Real Estate', 'SaaS', 'Restaurants',
  'Health & Wellness', 'Digital Marketing', 'Coaching', 'Pet Supplies', 'Home Improvement'
]

export default function LeadsPage() {
  const [niche, setNiche] = useState('')
  const { leads: savedLeads, loading: leadsLoading, error: leadsError, refresh: refreshSavedLeads } = useLeads()
  const { stats, refresh: refreshUsage } = useUsageLimit()
  const [localError, setLocalError] = useState('')
  const [errorType, setErrorType] = useState<string | null>(null)
  const [isAllocating, setIsAllocating] = useState(false)

  const [discoveredLeads, setDiscoveredLeads] = useState<any[]>([])
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState(false)

  const handleAllocateLeads = async () => {
    if (!niche) {
      setLocalError('Please enter or select a niche')
      setErrorType(null)
      return
    }

    if (stats.leadsRemaining <= 0) {
      setLocalError('Daily allocation limit reached')
      setErrorType(null)
      return
    }

    setLocalError('')
    setErrorType(null)
    setIsAllocating(true)
    setDiscoveredLeads([])
    setSelectedLeadIds(new Set())

    try {
      const response = await fetch('/api/leads/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: niche })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        if (result.leads.length === 0) {
          setLocalError(result.message || 'No new unique leads found (duplicates skipped).')
        } else {
          // Generate temporary IDs for selection
          const leadsWithLegacyIds = result.leads.map((l: any, i: number) => ({ ...l, tempId: `temp-${i}` }))
          setDiscoveredLeads(leadsWithLegacyIds)
          setNiche('')
        }
      } else {
        setLocalError(result.error || 'Allocation failed')
        if (result.error?.includes('config_missing')) {
          setErrorType('config_missing')
        }
      }
    } catch (err) {
      setLocalError('System error during discovery')
    } finally {
      setIsAllocating(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedLeadIds.size === discoveredLeads.length) {
      setSelectedLeadIds(new Set())
    } else {
      setSelectedLeadIds(new Set(discoveredLeads.map(l => l.tempId)))
    }
  }

  const toggleSelectLead = (tempId: string) => {
    const newSelected = new Set(selectedLeadIds)
    if (newSelected.has(tempId)) {
      newSelected.delete(tempId)
    } else {
      newSelected.add(tempId)
    }
    setSelectedLeadIds(newSelected)
  }

  const handleSaveSelectedLeads = async () => {
    if (selectedLeadIds.size === 0) return

    setIsSaving(true)
    const leadsToSave = discoveredLeads
      .filter(l => selectedLeadIds.has(l.tempId))
      .map(({ tempId, ...rest }) => rest)

    try {
      const response = await fetch('/api/leads/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: leadsToSave })
      })

      if (response.ok) {
        await refreshSavedLeads()
        await refreshUsage()
        setDiscoveredLeads([])
        setSelectedLeadIds(new Set())
        // Redirect to email builder or just show success
        window.location.href = '/email-builder'
      } else {
        const error = await response.json()
        setLocalError(error.error || 'Failed to save leads')
      }
    } catch (err) {
      setLocalError('Failed to save selected leads')
    } finally {
      setIsSaving(false)
    }
  }

  const error = localError || leadsError
  const allLeads = discoveredLeads.length > 0 ? discoveredLeads : savedLeads

  return (
    <PageContainer>
      {/* Promo Banner */}
      <PageSection>
        <PromoBanner />
      </PageSection>

      {/* Header */}
      <PageHeader
        title="Lead Discovery"
        description="Search and discover business leads to grow your Lead Vault"
        tooltipContent="Discovery mode allows you to find leads before saving them. Use checklists to pick the most relevant ones."
        learnMoreLink="/support#leads"
      />

      <PageSection>
        <QuickTip tip="Discovering leads is free. You only use your daily limit when you actually SAVE the leads you want to work with." />
      </PageSection>

      {/* Allocation Form */}
      <PageSection>
        <Card className="mb-8" glow>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-cyan-400/10 border border-cyan-400/20">
                <Target className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <CardTitle>Discovery Parameters</CardTitle>
                <CardDescription>
                  Enter a niche to find potential leads from Instagram
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && !errorType && (
              <Feedback
                type="error"
                message={error}
                onDismiss={() => setLocalError('')}
                className="mb-6"
              />
            )}

            <div className="flex flex-col gap-6 mb-8">
              <Input
                label="Target Niche"
                placeholder="e.g. Fitness, Real Estate, SaaS"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="max-w-xl"
              />

              <div>
                <CardDescription className="mb-3">Popular Suggestions</CardDescription>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_NICHES.map((item) => (
                    <Button
                      key={item}
                      variant="outline"
                      size="sm"
                      onClick={() => setNiche(item)}
                      className={niche === item ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400' : ''}
                    >
                      {item}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={handleAllocateLeads}
              loading={isAllocating}
              disabled={stats.leadsRemaining <= 0}
              size="lg"
              glow
            >
              <Zap className="w-4 h-4 mr-2" />
              Discover Leads
            </Button>
          </CardContent>
        </Card>
      </PageSection>

      {/* Leads Table or Empty States */}
      <PageSection>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-400/10 border border-purple-400/20">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-none mb-2">
                {discoveredLeads.length > 0 ? 'Discovered Leads' : 'Lead Vault'}
              </h2>
              <p className="text-zinc-400 text-sm">
                <span className="text-purple-400 font-mono">{allLeads.length}</span> records
                {selectedLeadIds.size > 0 && (
                  <span className="ml-2 text-cyan-400">({selectedLeadIds.size} selected)</span>
                )}
              </p>
            </div>
          </div>

          {selectedLeadIds.size > 0 && (
            <Button
              size="lg"
              glow
              onClick={handleSaveSelectedLeads}
              loading={isSaving}
              className="bg-green-500 hover:bg-green-600 border-green-400"
            >
              Go to Next Step
              <Zap className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {leadsLoading ? (
          <LoadingState message="Retrieving leads..." />
        ) : errorType === 'config_missing' ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={Zap}
                title="System Connection Required"
                description="Real-time data acquisition is currently inactive. You must link your ScraperAPI key in the system environment to begin discovery."
              />
            </CardContent>
          </Card>
        ) : allLeads.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={Users}
                title="No Leads Found"
                description="Your lead database is currently empty. Start by discovering new leads above."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-6">
            {Object.entries(
              allLeads.reduce((groups: Record<string, any[]>, lead) => {
                const nicheName = lead.industry || 'Other'
                if (!groups[nicheName]) groups[nicheName] = []
                groups[nicheName].push(lead)
                return groups
              }, {})
            ).map(([nicheName, nicheLeads]) => {
              const nicheSelectedCount = nicheLeads.filter(l => selectedLeadIds.has(l.tempId)).length
              const isAllNicheSelected = nicheLeads.length > 0 && nicheSelectedCount === nicheLeads.length

              const toggleNicheSelectAll = () => {
                const newSelected = new Set(selectedLeadIds)
                if (isAllNicheSelected) {
                  nicheLeads.forEach(l => newSelected.delete(l.tempId))
                } else {
                  nicheLeads.forEach(l => newSelected.add(l.tempId))
                }
                setSelectedLeadIds(newSelected)
              }

              return (
                <Accordion
                  key={nicheName}
                  defaultOpen={true}
                  title={
                    <div className="flex items-center gap-4">
                      <Badge variant="info" className="border-purple-500/30 text-purple-400 bg-purple-500/5 capitalize">
                        {nicheName}
                      </Badge>
                      <span className="text-sm text-zinc-500">
                        {nicheLeads.length} records {nicheSelectedCount > 0 && `(${nicheSelectedCount} selected)`}
                      </span>
                    </div>
                  }
                >
                  <div className="overflow-x-auto border border-zinc-800/50 rounded-xl bg-zinc-900/30">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-zinc-700/50 bg-zinc-900/50">
                          <th className="px-4 py-3 text-left w-10">
                            {discoveredLeads.length > 0 && (
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                                checked={isAllNicheSelected}
                                onChange={toggleNicheSelectAll}
                              />
                            )}
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider w-[340px]">Name</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider w-[320px]">Email</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider w-[120px]">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50">
                        {nicheLeads.map((lead, idx) => (
                          <motion.tr
                            key={lead.id || lead.tempId}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            className={`group hover:bg-zinc-800/30 transition-all duration-200 ${selectedLeadIds.has(lead.tempId) ? 'bg-cyan-500/5' : ''}`}
                          >
                            <td className="px-4 py-3 align-middle">
                              {discoveredLeads.length > 0 && (
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                                  checked={selectedLeadIds.has(lead.tempId)}
                                  onChange={() => toggleSelectLead(lead.tempId)}
                                />
                              )}
                            </td>
                            <td className="px-4 py-3 align-middle">
                              <div className="max-w-[320px]">
                                {lead.website ? (
                                  <a
                                    href={lead.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-sm text-zinc-100 hover:text-cyan-400 transition-colors truncate block"
                                    title={lead.business_name}
                                  >
                                    {lead.business_name}
                                  </a>
                                ) : (
                                  <div className="font-medium text-sm text-zinc-100 truncate" title={lead.business_name}>
                                    {lead.business_name}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 align-middle">
                              <div className="max-w-[300px]">
                                <a
                                  href={`mailto:${lead.email}`}
                                  className="flex items-center gap-2 group/email text-zinc-300 hover:text-white transition-colors"
                                  title={lead.email}
                                >
                                  <div className="p-1.5 rounded-md bg-zinc-800 group-hover/email:bg-cyan-500/20 group-hover/email:text-cyan-400 transition-colors shrink-0">
                                    <Mail size={12} />
                                  </div>
                                  <span className="font-mono text-xs truncate opacity-80 group-hover/email:opacity-100">{lead.email}</span>
                                </a>
                              </div>
                            </td>
                            <td className="px-4 py-3 align-middle text-right">
                              <Badge
                                variant={
                                  lead.status === 'allocated' || lead.tempId ? 'success' :
                                    lead.status === 'used' ? 'info' : 'error'
                                }
                                className="text-[10px] px-2 py-0.5 h-auto uppercase tracking-wide"
                              >
                                {lead.tempId ? 'Ready' : (LEAD_STATUS[lead.status as keyof typeof LEAD_STATUS]?.label || 'Active')}
                              </Badge>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Accordion>
              )
            })}
          </div>
        )}
      </PageSection>
    </PageContainer>
  )
}
