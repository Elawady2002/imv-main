'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PromoBanner } from '@/components/ui/promo-banner'
import { VideoCard } from '@/components/ui/video-card'
import { LiveActivityCounter } from '@/components/ui/social-proof'
import { HelpTooltip, QuickTip } from '@/components/ui/help-tooltip'
import { Users, Mail, Clock, Zap, Activity, TrendingUp } from 'lucide-react'
import { DAILY_LEAD_LIMIT, DAILY_EMAIL_LIMIT } from '@/lib/constants'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { PageContainer, PageSection } from '@/components/layout/page-container'
import { PageHeader } from '@/components/layout/page-header'

import { LoadingState } from '@/components/ui/loading-state'

export default function DashboardPage() {
  const { stats, loading } = useUsageLimit()
  const [timeUntilReset, setTimeUntilReset] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [showTip, setShowTip] = useState(true)

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const diff = tomorrow.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeUntilReset({ hours, minutes, seconds })
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <LoadingState fullPage message="Synchronizing dashboard data..." />
  }

  const leadsPercentage = (stats.leadsRemaining / DAILY_LEAD_LIMIT) * 100
  const emailsPercentage = (stats.emailsRemaining / DAILY_EMAIL_LIMIT) * 100

  return (
    <PageContainer>
      {/* Promo Banner */}
      <PageSection>
        <PromoBanner />
      </PageSection>

      {/* Header */}
      <PageHeader
        title="Command Center"
        description="Real-time allocation monitoring and community activity"
        tooltipTitle="Your Dashboard"
        tooltipContent="This is your central hub for monitoring lead allocations, email generations, and system activity. All metrics refresh in real-time."
        learnMoreLink="/support#dashboard"
      />

      {/* Quick Tip */}
      {showTip && (
        <PageSection>
          <QuickTip
            tip="Pro tip: Allocate leads in the morning when business owners are most likely to check their emails. This can increase your response rate by up to 40%!"
            onDismiss={() => setShowTip(false)}
          />
        </PageSection>
      )}

      {/* Welcome Video - Centered */}
      <PageSection className="mb-6">
        <div className="max-w-3xl mx-auto">
          <VideoCard
            title="Welcome to Inbox Money Vault - Start Here"
            description="Watch this essential training to understand exactly how to use Inbox Money Vault to generate your first profitable leads and start making money with email outreach."
            duration="12:34"
            views="2,847"
            thumbnailText="START HERE"
          />
        </div>
      </PageSection>

      {/* Live Community Stats */}
      <PageSection className="mb-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-400/10 border border-green-400/20">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base text-zinc-400 uppercase tracking-wider">
                  Live Community Activity
                </CardTitle>
                <HelpTooltip
                  variant="info"
                  content="These numbers represent the combined activity of all Inbox Money Vault members worldwide. Updated in real-time."
                />
              </div>
              <span className="ml-auto flex items-center gap-2 text-xs text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                LIVE
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <LiveActivityCounter />
          </CardContent>
        </Card>
      </PageSection>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Leads Allocation */}
        <PageSection>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-cyan-400/10 border border-cyan-400/20">
                    <Users className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base text-zinc-400 uppercase tracking-wider">
                      Lead Allocation
                    </CardTitle>
                    <HelpTooltip
                      variant="help"
                      content="Leads are pre-verified business contacts ready for outreach. Each lead includes email, business name, and industry data."
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-zinc-500 text-xs">
                  <Clock className="w-3 h-3" />
                  <span className="font-mono text-cyan-400">
                    {String(timeUntilReset.hours).padStart(2, '0')}:{String(timeUntilReset.minutes).padStart(2, '0')}:{String(timeUntilReset.seconds).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-end justify-between mb-2">
                  <span className="text-5xl font-bold text-white">{stats.leadsRemaining}</span>
                  <span className="text-zinc-500 text-sm">/ {DAILY_LEAD_LIMIT} remaining</span>
                </div>
              </div>

              <div className="relative h-3 bg-zinc-800/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${leadsPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 data-bar rounded-full"
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Allocated Today</p>
                  <p className="text-2xl font-bold text-white">{stats.leadsAllocatedToday}</p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Usage Rate</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {Math.round((stats.leadsAllocatedToday / DAILY_LEAD_LIMIT) * 100)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </PageSection>

        {/* Email Generation */}
        <PageSection>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-purple-400/10 border border-purple-400/20">
                    <Mail className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base text-zinc-400 uppercase tracking-wider">
                      Email Generation
                    </CardTitle>
                    <HelpTooltip
                      variant="help"
                      content="AI-powered email generation creates personalized outreach messages. Each generation includes subject line, body, and follow-up."
                    />
                  </div>
                </div>
                <Zap className="w-5 h-5 text-zinc-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-end justify-between mb-2">
                  <span className="text-5xl font-bold text-white">{stats.emailsRemaining}</span>
                  <span className="text-zinc-500 text-sm">/ {DAILY_EMAIL_LIMIT} remaining</span>
                </div>
              </div>

              <div className="relative h-3 bg-zinc-800/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${emailsPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #a855f7, #ec4899)',
                    boxShadow: '0 0 10px rgba(168, 85, 247, 0.3)'
                  }}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Generated Today</p>
                  <p className="text-2xl font-bold text-white">{stats.emailsGeneratedToday}</p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Usage Rate</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {Math.round((stats.emailsGeneratedToday / DAILY_EMAIL_LIMIT) * 100)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </PageSection>
      </div>

      {/* Quick Actions */}
      <PageSection>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base text-zinc-400 uppercase tracking-wider">
                Quick Actions
              </CardTitle>
              <HelpTooltip
                variant="tip"
                title="Quick Start"
                content="Use these shortcuts to quickly access the most important features. Start with Lead Allocation, then build your emails."
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/leads"
                className="group p-4 rounded-lg bg-cyan-400/5 border border-cyan-400/20 hover:bg-cyan-400/10 hover:border-cyan-400/40 transition-all duration-300"
              >
                <Users className="w-8 h-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white mb-1">Allocate Leads</h3>
                <p className="text-sm text-zinc-500">Generate new business leads</p>
              </a>

              <a
                href="/email-builder"
                className="group p-4 rounded-lg bg-purple-400/5 border border-purple-400/20 hover:bg-purple-400/10 hover:border-purple-400/40 transition-all duration-300"
              >
                <Mail className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white mb-1">Build Email</h3>
                <p className="text-sm text-zinc-500">Create AI-powered outreach</p>
              </a>

              <a
                href="/activity"
                className="group p-4 rounded-lg bg-pink-400/5 border border-pink-400/20 hover:bg-pink-400/10 hover:border-pink-400/40 transition-all duration-300"
              >
                <Activity className="w-8 h-8 text-pink-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white mb-1">View Activity</h3>
                <p className="text-sm text-zinc-500">Monitor system logs</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </PageSection>
    </PageContainer>
  )
}
