'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Hexagon, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
        router.refresh()
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
          <CardTitle className="text-xl gradient-text">System Access</CardTitle>
          <CardDescription>
            Enter your credentials to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              className="w-full group"
              size="lg"
              loading={loading}
              glow
            >
              <span>Initialize Session</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-xs text-zinc-600 bg-[#0a0a0f] uppercase tracking-widest">
                  New User
                </span>
              </div>
            </div>

            <Link href="/signup">
              <Button type="button" variant="outline" className="w-full">
                Create Account
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
