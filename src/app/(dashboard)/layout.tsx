import { ReactNode } from 'react'
import { Sidebar } from '@/components/ui/sidebar'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { SocialProofNotifications } from '@/components/ui/social-proof'

export const dynamic = 'force-dynamic'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <Sidebar />
      <SocialProofNotifications />
      <main className="lg:pl-[280px]">
        <div className="p-4 lg:p-8 pt-20 lg:pt-8 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  )
}
