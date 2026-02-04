'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { PromoBanner } from '@/components/ui/promo-banner'
import { ChevronDown, ChevronUp, HelpCircle, Mail, FileText, CheckCircle, MessageSquare } from 'lucide-react'
import { PageContainer, PageSection } from '@/components/layout/page-container'
import { PageHeader } from '@/components/layout/page-header'

const faqs = [
  {
    question: 'What is the daily lead allocation limit?',
    answer: 'Your allocation is capped at 25 leads per 24-hour cycle. This resets at midnight local time. Limits ensure lead quality and prevent system abuse.'
  },
  {
    question: 'How many emails can I generate daily?',
    answer: 'The system allows 10 AI-generated emails per cycle. Each generation includes subject, body, and optional follow-up content.'
  },
  {
    question: 'Why are some business emails unavailable?',
    answer: 'We only surface publicly available business contact information. Personal emails are never collected, ensuring regulatory compliance.'
  },
  {
    question: 'Does the system send emails automatically?',
    answer: 'No. This system generates content only. You maintain full control over transmission through your personal email infrastructure.'
  },
  {
    question: 'How do I send generated emails?',
    answer: 'Navigate to the Send Protocol section for detailed transmission guidelines. Basic flow: copy content from archive, paste into your email client, execute send.'
  },
  {
    question: 'Are allocated leads validated?',
    answer: 'Yes. All email addresses undergo format validation and deliverability checks. However, 100% deliverability cannot be guaranteed due to dynamic server configurations.'
  },
  {
    question: 'Can I export lead data in bulk?',
    answer: 'Bulk export is restricted by default to prevent misuse. Individual record copying is available through the interface.'
  },
  {
    question: 'Which industries can I target?',
    answer: 'Available sectors include: restaurants, retail, professional services, health/wellness, home services, automotive, real estate, legal, financial, education, technology, marketing, construction, and manufacturing.'
  }
]

export default function SupportPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSubmitted(true)
    setLoading(false)
    setName('')
    setEmail('')
    setMessage('')
  }

  return (
    <PageContainer>
      {/* Promo Banner */}
      <PageSection>
        <PromoBanner />
      </PageSection>

      {/* Header */}
      <PageHeader
        title="Support Center"
        description="Documentation and assistance resources"
      />

      {/* FAQ Section */}
      <PageSection>
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-cyan-400/10 border border-cyan-400/20">
                <HelpCircle className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Common queries and system documentation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-800/50">
              {faqs.map((faq, index) => (
                <div key={index}>
                  <button
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-zinc-800/20 transition-colors"
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  >
                    <span className="font-medium text-zinc-200 pr-4">{faq.question}</span>
                    {expandedFaq === index ? (
                      <ChevronUp size={18} className="text-cyan-400 shrink-0" />
                    ) : (
                      <ChevronDown size={18} className="text-zinc-500 shrink-0" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-4 text-zinc-400 text-sm leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </PageSection>

      {/* Contact Form */}
      <PageSection>
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-400/10 border border-green-400/20">
                <MessageSquare className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>Submit inquiry for human assistance</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-green-400/10 border border-green-400/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Transmission Complete</h3>
                <p className="text-zinc-400">
                  Inquiry received. Response expected within 24-48 hours.
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => setSubmitted(false)}
                >
                  Submit Another Inquiry
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Identifier"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  label="Contact Address"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Textarea
                  label="Message Content"
                  placeholder="Describe your inquiry..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
                <Button type="submit" loading={loading} glow>
                  <Mail className="w-4 h-4 mr-2" />
                  Transmit Message
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </PageSection>

      {/* Refund Policy */}
      <PageSection>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-400/10 border border-purple-400/20">
                <FileText className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <CardTitle>Refund Protocol</CardTitle>
                <CardDescription>Satisfaction guarantee terms</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
                <h4 className="font-medium text-cyan-400 mb-2 uppercase tracking-wider text-sm">30-Day Guarantee</h4>
                <p className="text-zinc-400 text-sm">
                  Full refund available within 30 days of purchase. No interrogation required.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
                <h4 className="font-medium text-cyan-400 mb-2 uppercase tracking-wider text-sm">Request Procedure</h4>
                <p className="text-zinc-400 text-sm">
                  Submit request via contact form above. Include account email and acquisition date.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
                <h4 className="font-medium text-cyan-400 mb-2 uppercase tracking-wider text-sm">Processing Timeline</h4>
                <p className="text-zinc-400 text-sm">
                  Refunds processed within 5-7 business days. Confirmation transmitted upon completion.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageSection>
    </PageContainer>
  )
}
