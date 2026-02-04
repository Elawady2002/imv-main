'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { PromoBanner } from '@/components/ui/promo-banner'
import { QuickTip } from '@/components/ui/help-tooltip'
import { EMAIL_TONES } from '@/lib/constants'
import { Sparkles, Copy, Save, RefreshCw, Mail, Cpu, CheckCircle } from 'lucide-react'
import { useLeads } from '@/hooks/useLeads'
import { useOffers } from '@/hooks/useOffers'
import { useUsageLimit } from '@/hooks/useUsageLimit'
import { PageContainer, PageSection } from '@/components/layout/page-container'
import { PageHeader } from '@/components/layout/page-header'

import { Feedback } from '@/components/ui/feedback'
import { EmptyState } from '@/components/ui/empty-state'

function EmailBuilderContent() {
  const searchParams = useSearchParams()
  const leadId = searchParams.get('lead')

  const { leads, loading: leadsLoading } = useLeads()
  const { offers, loading: offersLoading } = useOffers()
  const { stats, refresh: refreshUsage } = useUsageLimit()

  const [selectedLead, setSelectedLead] = useState('')
  const [selectedOffer, setSelectedOffer] = useState('')
  const [customOffer, setCustomOffer] = useState('')
  const [tone, setTone] = useState<'friendly' | 'professional' | 'direct'>('professional')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [followUp, setFollowUp] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [errorType, setErrorType] = useState<string | null>(null)
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (leadId) setSelectedLead(leadId)
  }, [leadId])

  const handleSave = async () => {
    setIsSaving(true)
    setError('')
    try {
      const response = await fetch('/api/emails/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLead || null,
          offerId: selectedOffer || null,
          subject,
          body,
          followUp,
          tone
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save email')
      }

      setSuccess('Email saved to database successfully!')
      // Optionally redirect or clear form, but keeping it for now in case they want to copy
    } catch (err: any) {
      setError(err.message || 'Error saving email')
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerate = async () => {
    if (!selectedLead) {
      setError('Select a target lead')
      setErrorType(null)
      return
    }

    if (!selectedOffer && !customOffer) {
      setError('Provide an offer or custom description')
      setErrorType(null)
      return
    }

    if (stats.emailsRemaining <= 0) {
      setError('Daily generation limit reached')
      setErrorType(null)
      return
    }

    setError('')
    setErrorType(null)
    setLoading(true)

    try {
      const response = await fetch('/api/emails/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: selectedLead,
          offerId: selectedOffer || null,
          customOffer: customOffer || null,
          tone
        })
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Generation failed')
        if (result.type === 'config_missing' || result.error?.includes('OpenAI API key')) {
          setErrorType('config_missing')
        }
      } else {
        setSubject(result.subject)
        setBody(result.body)
        setFollowUp(result.followUp || '')
        setSuccess('Outreach content generated successfully!')
        await refreshUsage()
      }
    } catch {
      setError('System error during generation')
      setErrorType(null)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const selectedLeadData = leads.find(l => l.id === selectedLead)

  return (
    <PageContainer>
      {/* Promo Banner */}
      <PageSection>
        <PromoBanner />
      </PageSection>

      {/* Header */}
      <PageSection className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <PageHeader
            title="Email Builder"
            description="AI-powered outreach generation system"
            tooltipTitle="AI Email Generator"
            tooltipContent="Our AI creates personalized, compliant outreach emails. Select a lead, choose your offer, and let the system generate professional messages that convert."
            learnMoreLink="/support#email-builder"
          />
          <Badge variant="info" pulse className="mb-6">
            <Cpu className="w-3 h-3 mr-1" />
            {stats.emailsRemaining} generations available
          </Badge>
        </div>
      </PageSection>

      <PageSection>
        <QuickTip tip="The 'Professional' tone works best for first-time outreach. Save 'Friendly' for follow-ups or industries like restaurants and retail." />
      </PageSection>

      {/* Configuration */}
      <PageSection>
        <Card className="mb-6" glow>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-400/10 border border-purple-400/20">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <CardTitle>Generation Parameters</CardTitle>
                <CardDescription>Configure AI output settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && !errorType && (
              <Feedback
                type="error"
                message={error}
                onDismiss={() => setError('')}
                className="mb-6"
              />
            )}

            {success && (
              <Feedback
                type="success"
                message={success}
                onDismiss={() => setSuccess('')}
                className="mb-6"
              />
            )}

            {errorType === 'config_missing' ? (
              <EmptyState
                icon={Cpu}
                title="AI Engine Offline"
                description="System configuration required for content generation. Please link your OpenAI API key in the environment settings to enable AI outreach generation."
                action={{
                  label: "System Status Page",
                  onClick: () => window.open('/support#status', '_blank')
                }}
              />
            ) : (

              <div className="space-y-4">
                <Select
                  label="Target Lead"
                  placeholder={leadsLoading ? "Loading targets..." : "Select allocation target"}
                  value={selectedLead}
                  onChange={(e) => setSelectedLead(e.target.value)}
                  options={leads.map(lead => ({
                    value: lead.id,
                    label: `${lead.business_name} — ${lead.email}`
                  }))}
                  disabled={leadsLoading}
                />

                {selectedLeadData && (
                  <div className="p-4 rounded-lg bg-cyan-400/5 border border-cyan-400/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                      <span className="text-xs text-cyan-400 uppercase tracking-wider">Target Data</span>
                    </div>
                    <p className="font-medium text-white">{selectedLeadData.business_name}</p>
                    <p className="text-sm text-zinc-400 font-mono">{selectedLeadData.email}</p>
                    <p className="text-sm text-zinc-500">{selectedLeadData.location} • {selectedLeadData.industry}</p>
                  </div>
                )}

                <Select
                  label="Offer Template"
                  placeholder={offersLoading ? "Loading templates..." : "Select from library"}
                  value={selectedOffer}
                  onChange={(e) => {
                    setSelectedOffer(e.target.value)
                    setCustomOffer('')
                  }}
                  options={[
                    { value: '', label: 'Use custom description' },
                    ...offers.map(offer => ({
                      value: offer.id,
                      label: offer.name
                    }))
                  ]}
                  disabled={offersLoading}
                />

                {!selectedOffer && (
                  <Textarea
                    label="Custom Offer"
                    placeholder="Describe the offer or service..."
                    value={customOffer}
                    onChange={(e) => setCustomOffer(e.target.value)}
                  />
                )}

                <Select
                  label="Output Tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value as 'friendly' | 'professional' | 'direct')}
                  options={EMAIL_TONES.map(t => ({
                    value: t.value,
                    label: `${t.label} — ${t.description}`
                  }))}
                />

                <Button
                  onClick={handleGenerate}
                  loading={loading}
                  disabled={stats.emailsRemaining <= 0}
                  size="lg"
                  className="w-full"
                  glow
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Content
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </PageSection>

      {/* Generated Email */}
      {(subject || body) && (
        <PageSection>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-400/10 border border-green-400/20">
                  <Mail className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <CardTitle>Generated Output</CardTitle>
                  <CardDescription>Review and modify before saving</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-cyan-300/80 uppercase tracking-wider">Subject Line</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(subject, 'subject')}
                  >
                    {copied === 'subject' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    <span className="ml-1">{copied === 'subject' ? 'Copied' : 'Copy'}</span>
                  </Button>
                </div>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-cyan-300/80 uppercase tracking-wider">Email Body</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(body, 'body')}
                  >
                    {copied === 'body' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    <span className="ml-1">{copied === 'body' ? 'Copied' : 'Copy'}</span>
                  </Button>
                </div>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="min-h-[200px]"
                />
              </div>

              {followUp && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-cyan-300/80 uppercase tracking-wider">Follow-Up</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(followUp, 'followUp')}
                    >
                      {copied === 'followUp' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      <span className="ml-1">{copied === 'followUp' ? 'Copied' : 'Copy'}</span>
                    </Button>
                  </div>
                  <Textarea
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-zinc-800">
                <Button
                  onClick={handleSave}
                  loading={isSaving}
                  glow
                  className="w-full"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save to Database
                </Button>
                <Button
                  onClick={handleGenerate}
                  variant="outline"
                  loading={loading}
                  disabled={stats.emailsRemaining <= 0}
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
              </div>
            </CardContent>
          </Card>
        </PageSection>
      )}
    </PageContainer>
  )
}

export default function EmailBuilderPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full"
        />
      </div>
    }>
      <EmailBuilderContent />
    </Suspense>
  )
}
