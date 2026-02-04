'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, TrendingUp, Mail, Users, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Notification {
  id: number
  name: string
  location: string
  action: string
  amount?: string
  icon: 'dollar' | 'email' | 'lead' | 'success'
  timeAgo: string
}

const firstNames = [
  'Michael', 'Sarah', 'David', 'Jennifer', 'Robert', 'Lisa', 'James', 'Emily',
  'John', 'Amanda', 'William', 'Jessica', 'Richard', 'Ashley', 'Thomas', 'Michelle',
  'Daniel', 'Stephanie', 'Matthew', 'Nicole', 'Anthony', 'Elizabeth', 'Mark', 'Heather',
  'Steven', 'Megan', 'Paul', 'Rachel', 'Andrew', 'Laura', 'Kenneth', 'Christina',
  'George', 'Kimberly', 'Edward', 'Brittany', 'Brian', 'Samantha', 'Ronald', 'Katherine'
]

const locations = [
  'New York, USA', 'Los Angeles, USA', 'Chicago, USA', 'Houston, USA', 'Phoenix, USA',
  'London, UK', 'Toronto, Canada', 'Sydney, Australia', 'Miami, USA', 'Dallas, USA',
  'Atlanta, USA', 'Denver, USA', 'Seattle, USA', 'Boston, USA', 'Austin, USA',
  'San Diego, USA', 'Portland, USA', 'Nashville, USA', 'Charlotte, USA', 'Orlando, USA',
  'Vancouver, Canada', 'Melbourne, Australia', 'Manchester, UK', 'Dublin, Ireland'
]

const actions = [
  { text: 'just received a response', icon: 'email' as const, hasAmount: false },
  { text: 'closed a deal worth', icon: 'dollar' as const, hasAmount: true },
  { text: 'generated', icon: 'lead' as const, hasAmount: false, suffix: 'new leads' },
  { text: 'just made', icon: 'dollar' as const, hasAmount: true },
  { text: 'successfully sent', icon: 'success' as const, hasAmount: false, suffix: 'emails' },
  { text: 'earned', icon: 'dollar' as const, hasAmount: true },
  { text: 'booked a call worth', icon: 'dollar' as const, hasAmount: true },
]

const amounts = ['$127', '$250', '$89', '$340', '$175', '$420', '$195', '$310', '$85', '$550', '$275', '$180']
const leadCounts = ['15', '22', '18', '25', '12', '30', '28', '20']
const emailCounts = ['45', '32', '28', '50', '38', '42', '55', '35']
const timeAgos = ['just now', '2 min ago', '5 min ago', '8 min ago', '12 min ago', '15 min ago']

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateNotification(id: number): Notification {
  const action = getRandomItem(actions)
  let actionText = action.text

  if (action.suffix === 'new leads') {
    actionText = `${action.text} ${getRandomItem(leadCounts)} ${action.suffix}`
  } else if (action.suffix === 'emails') {
    actionText = `${action.text} ${getRandomItem(emailCounts)} ${action.suffix}`
  }

  return {
    id,
    name: getRandomItem(firstNames),
    location: getRandomItem(locations),
    action: actionText,
    amount: action.hasAmount ? getRandomItem(amounts) : undefined,
    icon: action.icon,
    timeAgo: getRandomItem(timeAgos)
  }
}

const iconComponents = {
  dollar: DollarSign,
  email: Mail,
  lead: Users,
  success: CheckCircle
}

const iconColors = {
  dollar: 'text-green-400 bg-green-400/20',
  email: 'text-cyan-400 bg-cyan-400/20',
  lead: 'text-purple-400 bg-purple-400/20',
  success: 'text-emerald-400 bg-emerald-400/20'
}

export function SocialProofNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null)

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const response = await fetch('/api/stats/recent-activity')
        const data = await response.json()
        if (Array.isArray(data)) {
          setNotifications(data)
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      }
    }

    fetchRecentActivity()
    const interval = setInterval(fetchRecentActivity, 60000) // Refresh data every minute
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (notifications.length === 0) return

    // Show next notification
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % notifications.length)
    }, 15000 + Math.random() * 5000) // Every 15-20s

    return () => clearInterval(interval)
  }, [notifications])

  useEffect(() => {
    if (notifications.length > 0) {
      setActiveNotification(notifications[currentIndex])

      // Clear notification after 6 seconds
      const timeout = setTimeout(() => {
        setActiveNotification(null)
      }, 6000)

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, notifications])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-[300px]">
      <AnimatePresence mode="popLayout">
        {activeNotification && (
          <motion.div
            key={activeNotification.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="rounded-xl p-4 shadow-2xl border border-zinc-700/50"
            style={{
              background: 'linear-gradient(135deg, rgba(24, 24, 27, 0.98) 0%, rgba(39, 39, 42, 0.98) 100%)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            }}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2.5 rounded-lg",
                iconColors[activeNotification.icon as keyof typeof iconColors]
              )}>
                {(() => {
                  const Icon = iconComponents[activeNotification.icon as keyof typeof iconComponents]
                  return <Icon size={20} />
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-white text-sm truncate">
                    {activeNotification.name}
                  </p>
                  <span className="shrink-0 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </div>
                <p className="text-zinc-400 text-xs mt-0.5">
                  {activeNotification.location}
                </p>
                <p className="text-zinc-200 text-sm mt-2 font-medium">
                  {activeNotification.action}
                </p>
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-zinc-700/50">
                  <TrendingUp size={12} className="text-green-400" />
                  <p className="text-zinc-500 text-xs">
                    {activeNotification.timeAgo}
                  </p>
                  <span className="text-zinc-600">•</span>
                  <span className="text-green-500 text-xs font-medium">Verified</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Live counter component for dashboard
export function LiveActivityCounter() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalEmails: 0,
    activeUsers: 0,
    totalActivity: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats/community')
        const data = await response.json()
        if (data && !data.error) {
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-zinc-800/50" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center p-4 rounded-lg bg-green-400/5 border border-green-400/20">
        <p className="text-2xl font-bold text-green-400 font-mono">
          {formatNumber(stats.totalActivity)}
        </p>
        <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">System Actions</p>
      </div>
      <div className="text-center p-4 rounded-lg bg-cyan-400/5 border border-cyan-400/20">
        <p className="text-2xl font-bold text-cyan-400 font-mono">
          {formatNumber(stats.activeUsers)}
        </p>
        <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Active Members</p>
      </div>
      <div className="text-center p-4 rounded-lg bg-purple-400/5 border border-purple-400/20">
        <p className="text-2xl font-bold text-purple-400 font-mono">
          {formatNumber(stats.totalEmails)}
        </p>
        <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Emails Sent</p>
      </div>
      <div className="text-center p-4 rounded-lg bg-pink-400/5 border border-pink-400/20">
        <p className="text-2xl font-bold text-pink-400 font-mono">
          {formatNumber(stats.totalLeads)}
        </p>
        <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Leads Allocated</p>
      </div>
    </div>
  )
}
