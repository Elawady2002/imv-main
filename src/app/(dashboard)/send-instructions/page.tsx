'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PromoBanner } from '@/components/ui/promo-banner'
import { Rocket, CheckCircle, Mail, Trash2 } from 'lucide-react'
import { PageContainer, PageSection } from '@/components/layout/page-container'
import { PageHeader } from '@/components/layout/page-header'
import { useSavedEmails } from '@/hooks/useSavedEmails'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Feedback } from '@/components/ui/feedback'

export default function SendProtocolPage() {
  const { emails, loading, error, deleteEmail } = useSavedEmails()
  const [activating, setActivating] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const handleActivate = async (email: any) => {
    setActivating(email.id)
    setFeedback(null)

    try {
      const response = await fetch('/api/campaigns/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailId: email.id,
          subject: email.subject
        })
      })

      // Open email client
      // @ts-ignore - Supabase type for joined data is tricky to infer automatically here
      const targetEmail = email.leads?.email || ''
      if (targetEmail) {
        const mailtoLink = `mailto:${targetEmail}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`
        window.open(mailtoLink, '_blank')
      }

      if (!response.ok) throw new Error('Activation failed')

      setFeedback({
        type: 'success',
        message: `Campaign "${email.subject}" activated successfully. System is monitoring progress.`
      })
    } catch (error) {
      setFeedback({
        type: 'error',
        message: 'Failed to activate campaign.'
      })
    } finally {
      setActivating(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      await deleteEmail(id)
      setFeedback({
        type: 'success',
        message: 'Campaign deleted successfully.'
      })
    }
  }

  return (
    <PageContainer>
      {/* Promo Banner */}
      <PageSection>
        <PromoBanner />
      </PageSection>

      {/* Header */}
      <PageHeader
        title="Send Protocol & Control Room"
        description="Manage and activate your outreach campaigns"
        tooltipTitle="Control Room"
        tooltipContent="This is your command center. Review saved emails and click 'Activate' to mark them as in-progress. The system will track your activity."
        learnMoreLink="/support#sending"
      />

      <PageSection>
        {error && (
          <Feedback
            type="error"
            message={`Error loading campaigns: ${error}`}
            className="mb-6"
          />
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        ) : emails.length === 0 ? (
          <Card className="border-dashed border-zinc-800 bg-zinc-900/50">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-800 mx-auto flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-zinc-600" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No Saved Campaigns</h3>
              <p className="text-zinc-500 max-w-sm mx-auto mb-6">
                You haven't saved any emails yet. Go to the Email Builder to generate and save your first campaign.
              </p>
              <Button onClick={() => window.location.href = '/email-builder'} glow>
                Go to Email Builder
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {emails.map((email, index) => (
                <motion.div
                  key={email.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group hover:border-cyan-400/30 transition-all duration-300">
                    <CardContent className="p-5 flex flex-col md:flex-row gap-5 items-start md:items-center">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={email.tone === 'friendly' ? 'success' : 'info'} className="uppercase text-[10px]">
                            {email.tone} Tone
                          </Badge>
                          <span className="text-xs text-zinc-500 font-mono">
                            {format(new Date(email.created_at), 'MMM d, HH:mm')}
                          </span>
                        </div>
                        <h3 className="font-semibold text-white text-lg mb-1 truncate pr-4">
                          {email.subject}
                        </h3>
                        <p className="text-zinc-400 text-sm line-clamp-2 mb-3">
                          {email.body}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                          {email.lead_id && (
                            <span className="flex items-center gap-1.5">
                              <CheckCircle className="w-3 h-3 text-cyan-400" />
                              Lead Attached
                            </span>
                          )}
                          {email.offer_id && (
                            <span className="flex items-center gap-1.5">
                              <CheckCircle className="w-3 h-3 text-cyan-400" />
                              Offer Attached
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-zinc-800">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(email.id)}
                          className="text-zinc-500 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>

                        <Button
                          onClick={() => handleActivate(email)}
                          loading={activating === email.id}
                          glow
                          className="flex-1 md:flex-none"
                        >
                          {activating === email.id ? (
                            'Initializing...'
                          ) : (
                            <>
                              <Rocket className="w-4 h-4 mr-2" />
                              Activate
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </PageSection>
    </PageContainer>
  )
}
