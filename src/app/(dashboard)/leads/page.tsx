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
  const { leads, loading: leadsLoading, error: leadsError, allocateLeads } = useLeads()
  const { stats, refresh: refreshUsage } = useUsageLimit()
  const [localError, setLocalError] = useState('')
  const [errorType, setErrorType] = useState<string | null>(null)
  const [isAllocating, setIsAllocating] = useState(false)

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

    const result = await allocateLeads(niche)

    if (result.success) {
      await refreshUsage()

      if (result.allocated === 0) {
        setLocalError(result.message || 'No new unique leads found (duplicates skipped).')
      } else {
        setNiche('')
      }
    } else {
      setLocalError(result.error || 'Allocation failed')
      // Assuming result.type might be returned or we can infer it
      if (result.error?.includes('connection required') || result.error?.includes('config_missing')) {
        setErrorType('config_missing')
      } else if (result.error?.includes('No records found')) {
        setErrorType('no_data')
      }
    }

    setIsAllocating(false)
  }

  const error = localError || leadsError

  return (
    <PageContainer>
      {/* Promo Banner */}
      <PageSection>
        <PromoBanner />
      </PageSection>

      {/* Header */}
      <PageHeader
        title="Lead Allocation"
        description="Deploy targeting parameters to acquire business leads"
        tooltipContent="This is where you generate new business leads. Select an industry and location, and the system will allocate verified business contacts for your outreach."
        learnMoreLink="/support#leads"
      />

      <PageSection>
        <QuickTip tip="Target industries where you have experience or knowledge. Your emails will be more authentic and convert better when you understand the business's pain points." />
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
                <CardTitle>Allocation Parameters</CardTitle>
                <CardDescription>
                  Configure your target parameters to acquire new business records
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
              Execute Allocation
            </Button>
          </CardContent>
        </Card>
      </PageSection>

      {/* Leads Table or Empty States */}
      <PageSection>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-purple-400/10 border border-purple-400/20">
            <Users className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white leading-none mb-2">Allocated Leads</h2>
            <p className="text-zinc-400 text-sm">
              <span className="text-purple-400 font-mono">{leads.length}</span> records grouped by niche
            </p>
          </div>
        </div>

        {leadsLoading ? (
          <LoadingState message="Retrieving allocated leads..." />
        ) : errorType === 'config_missing' ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={Zap}
                title="System Connection Required"
                description="Real-time data acquisition is currently inactive. You must link your SerpApi key in the system environment to begin lead allocation."
                action={{
                  label: "View Configuration Guide",
                  onClick: () => window.open('/support#configuration', '_blank')
                }}
              />
            </CardContent>
          </Card>
        ) : errorType === 'no_data' ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={Target}
                title="No Records Found"
                description={`We couldn't find any business results for "${niche}". Try selecting a broader niche.`}
              />
            </CardContent>
          </Card>
        ) : leads.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={Users}
                title="No Leads Allocated"
                description="Your lead database is currently empty. Configure your target parameters above and execute an allocation to find potential clients."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {Object.entries(
              leads.reduce((groups: Record<string, typeof leads>, lead) => {
                const nicheName = lead.industry || 'Other'
                if (!groups[nicheName]) groups[nicheName] = []
                groups[nicheName].push(lead)
                return groups
              }, {})
            ).map(([nicheName, nicheLeads]) => (
              <Accordion
                key={nicheName}
                defaultOpen={true}
                title={
                  <div className="flex items-center gap-4">
                    <Badge variant="info" className="border-purple-500/30 text-purple-400 bg-purple-500/5">
                      {nicheName}
                    </Badge>
                    <span className="text-sm text-zinc-500">
                      {nicheLeads.length} leads found
                    </span>
                  </div>
                }
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-700/50 bg-zinc-900/50">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider w-[240px]">Business</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider w-[220px]">Email</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider w-[140px]">Location</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider w-[100px]">Status</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider min-w-[120px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {nicheLeads.map((lead, idx) => (
                        <motion.tr
                          key={lead.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          className="group hover:bg-zinc-800/30 transition-all duration-200"
                        >
                          <td className="px-4 py-3 align-top">
                            <div className="max-w-[220px]">
                              <div className="font-medium text-sm text-zinc-100 truncate mb-0.5" title={lead.business_name}>
                                {lead.business_name}
                              </div>
                              {lead.website && (
                                <a
                                  href={lead.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs text-cyan-400/80 hover:text-cyan-300 transition-colors truncate max-w-full"
                                >
                                  <ExternalLink size={10} className="shrink-0" />
                                  <span className="truncate">{lead.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="max-w-[200px]">
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
                          <td className="px-4 py-3 align-middle">
                            <div className="text-zinc-400 text-xs truncate max-w-[120px]" title={lead.location}>
                              {lead.location}
                            </div>
                          </td>
                          <td className="px-4 py-3 align-middle">
                            <Badge
                              variant={
                                lead.status === 'allocated' ? 'info' :
                                  lead.status === 'used' ? 'success' : 'error'
                              }
                              className="text-[10px] px-2 py-0.5 h-auto uppercase tracking-wide"
                            >
                              {LEAD_STATUS[lead.status].label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 align-middle text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs hover:bg-cyan-950 hover:text-cyan-400"
                              onClick={() => window.location.href = `/email-builder?lead=${lead.id}`}
                            >
                              Create Email
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Accordion>
            ))}
          </div>
        )}
      </PageSection>
    </PageContainer>
  )
}
