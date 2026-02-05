'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PromoBanner } from '@/components/ui/promo-banner'
import { QuickTip } from '@/components/ui/help-tooltip'
import { Offer } from '@/types/database'
import { Plus, Edit, Trash2, ExternalLink, Gift, FolderOpen, X } from 'lucide-react'
import { useOffers } from '@/hooks/useOffers'
import { PageContainer, PageSection } from '@/components/layout/page-container'
import { PageHeader } from '@/components/layout/page-header'

import { Feedback } from '@/components/ui/feedback'

export default function OffersPage() {
  const { offers, loading: offersLoading, saveOffer, updateOffer, deleteOffer } = useOffers()
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const resetForm = () => {
    setName('')
    setDescription('')
    setLink('')
    setEditingOffer(null)
    setError('')
  }

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer)
    setName(offer.name)
    setDescription(offer.description)
    setLink(offer.link || '')
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSave = async () => {
    if (!name || !description) {
      setError('Name and description required')
      return
    }

    setActionLoading(true)
    setError('')

    const payload = { name, description, link }
    const result = editingOffer
      ? await updateOffer(editingOffer.id, payload)
      : await saveOffer(payload)

    if (result.success) {
      resetForm()
    } else {
      setError(result.error || 'Operation failed')
    }
    setActionLoading(false)
  }

  const handleDelete = async (offer: Offer) => {
    if (!confirm('Confirm deletion of this offer template?')) return
    await deleteOffer(offer.id)
  }


  return (
    <PageContainer>
      {/* Promo Banner */}
      <PageSection>
        <PromoBanner />
      </PageSection>

      {/* Header */}
      <PageSection className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <PageHeader
          title="Offer Builder"
          description="Create your high-converting affiliate offers"
          tooltipTitle="Offer Builder"
          tooltipContent="This is your 'Fishing Hook'. Create offers here (Name, Description, Affiliate Link) so the system knows what you are promoting when generating emails."
          learnMoreLink="/support#offers"
        />
      </PageSection>

      <PageSection>
        <QuickTip tip="Create multiple offer templates for different industries. A generic offer converts less than one tailored to specific business needs." />
      </PageSection>

      {/* Add/Edit Form - Always Visible */}
      <PageSection>
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card glow className="border-purple-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-purple-400/10 border border-purple-400/20">
                    {editingOffer ? <Edit className="w-6 h-6 text-purple-400" /> : <Plus className="w-6 h-6 text-purple-400" />}
                  </div>
                  <div>
                    <CardTitle>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</CardTitle>
                    <CardDescription>
                      {editingOffer ? 'Modify your offer details' : 'Define your affiliate offer properties'}
                    </CardDescription>
                  </div>
                </div>
                {editingOffer && (
                  <Button variant="ghost" size="sm" onClick={resetForm}>
                    <X className="w-4 h-4 mr-2" /> Cancel Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <Feedback
                  type="error"
                  message={error}
                  onDismiss={() => setError('')}
                  className="mb-6"
                />
              )}

              <div className="space-y-4">
                <Input
                  label="Template Name"
                  placeholder="e.g., Web Design Services"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <Textarea
                  label="Description"
                  placeholder="Describe the offer value proposition..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <Input
                  label="Link (Optional)"
                  placeholder="https://example.com/offer"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />


                <div className="flex gap-4 pt-4">
                  <Button onClick={handleSave} loading={actionLoading} glow className="min-w-[120px]">
                    {editingOffer ? 'Update Offer' : 'Save Offer'}
                  </Button>
                  {editingOffer && (
                    <Button variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </PageSection>


      {/* User's Offers */}
      <PageSection>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-400/10 border border-purple-400/20">
                <Gift className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <CardTitle>Your Templates</CardTitle>
                <CardDescription>
                  <span className="text-purple-400 font-mono">{offers.length}</span> custom templates
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {offersLoading ? (
              <div className="p-12 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full mx-auto"
                />
              </div>
            ) : offers.length === 0 ? (
              <div className="p-12 text-center">
                <Gift className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500">No offers created yet</p>
                <p className="text-zinc-600 text-sm">Add your first affiliate offer above</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/50">
                {offers.map((offer, index) => (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-zinc-800/20 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white text-lg mb-2">{offer.name}</h4>
                        <p className="text-zinc-400">{offer.description}</p>
                        {offer.link && (
                          <a
                            href={offer.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1 mt-2"
                          >
                            <ExternalLink size={12} />
                            <span className="font-mono">{offer.link}</span>
                          </a>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(offer)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(offer)}
                        >
                          <Trash2 size={16} className="text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </PageSection>
    </PageContainer>
  )
}
