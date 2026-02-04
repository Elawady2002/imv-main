'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Hexagon, ArrowRight, UserPlus } from 'lucide-react'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.session) {
        router.push('/dashboard')
        router.refresh()
      } else if (data.user && !data.session) {
        setError('Please check your email to confirm your account, then sign in.')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo */}
      <div className="text-center mb-8">
        <motion.div 
          className="inline-flex items-center justify-center mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Hexagon className="w-16 h-16 text-cyan-400" strokeWidth={1} />
        </motion.div>
        <h1 className="text-3xl font-bold gradient-text mb-2">INBOX VAULT</h1>
        <p className="text-zinc-500 text-sm uppercase tracking-widest">Lead Allocation System</p>
      </div>

      <Card glow>
        <CardHeader className="text-center">
          <CardTitle className="text-xl gradient-text flex items-center justify-center gap-2">
            <UserPlus className="w-5 h-5" />
            Create Account
          </CardTitle>
          <CardDescription>
            Initialize your access credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  {error}
                </span>
              </motion.div>
            )}

            <Input
              type="text"
              label="Full Name"
              placeholder="John Smith"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
            />

            <Input
              type="email"
              label="Email Address"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              type="password"
              label="Password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            <Input
              type="password"
              label="Confirm Password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              className="w-full group"
              size="lg"
              loading={loading}
              glow
            >
              <span>Initialize Account</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-xs text-zinc-600 bg-[#0a0a0f] uppercase tracking-widest">
                  Existing User
                </span>
              </div>
            </div>

            <Link href="/login">
              <Button type="button" variant="outline" className="w-full">
                Access System
              </Button>
            </Link>
          </form>
        </CardContent>
      </Card>

      {/* Version info */}
      <p className="text-center text-zinc-600 text-xs mt-6 uppercase tracking-widest">
        Secure Connection • v2.0.1
      </p>
    </motion.div>
  )
}
