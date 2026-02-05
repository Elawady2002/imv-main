'use client'

import { Card, CardContent } from '@/components/ui/card'
import { PageContainer, PageSection } from '@/components/layout/page-container'
import { PageHeader } from '@/components/layout/page-header'
import { VideoCard } from '@/components/ui/video-card'
import { School, BookOpen, Clock, GraduationCap } from 'lucide-react'

const TRAINING_MODULES = [
    {
        title: "Getting Started with Inbox Vault",
        description: "Learn the basics of setting up your account, understanding the dashboard, and preparing for your first campaign.",
        duration: "8:45",
        views: "1.2k",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
        level: "Beginner" as const,
        thumbnailText: "START HERE"
    },
    {
        title: "Mastering Lead Discovery",
        description: "Deep dive into finding high-quality leads in any niche using our advanced search and filtering tools.",
        duration: "12:30",
        views: "850",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
        level: "Intermediate" as const,
        thumbnailText: "FIND LEADS"
    },
    {
        title: "Email Automation Secrets",
        description: "Unlock the power of automated traffic generation and smart email marketing sequences.",
        duration: "15:20",
        views: "640",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
        level: "Advanced" as const,
        thumbnailText: "AUTOMATE"
    },
    {
        title: "Analytics & Performance Tracking",
        description: "How to read your analytics data and make data-driven decisions to optimize your campaigns.",
        duration: "10:15",
        views: "420",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
        level: "Intermediate" as const,
        thumbnailText: "ANALYTICS"
    },
    {
        title: "Scaling Your Income",
        description: "Advanced strategies for scaling your outreach and maximizing your monthly revenue.",
        duration: "18:00",
        views: "310",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
        level: "Advanced" as const,
        thumbnailText: "SCALE UP"
    }
]

export default function TrainingPage() {
    return (
        <PageContainer>
            <PageHeader
                title="Training Center"
                description="Master the art of lead generation and cold outreach"
                tooltipContent="Access tutorials, guides, and best practices to maximize your results."
            />

            {/* Stats Row */}
            <PageSection>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="relative group rounded-3xl p-px bg-linear-to-r from-cyan-500/20 to-cyan-500/0 hover:from-cyan-500/40 hover:to-cyan-500/10 transition-all duration-300">
                        <div className="absolute inset-0 bg-cyan-500/5 blur-xl group-hover:bg-cyan-500/10 transition-colors" />
                        <div className="relative h-full bg-[#0D0D10] rounded-3xl p-6 flex items-center gap-5 border border-white/5 group-hover:border-cyan-500/20 transition-colors">
                            <div className="p-3.5 rounded-2xl bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/20">
                                <BookOpen size={24} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-white tracking-tight">5</h3>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mt-1">Total Videos</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative group rounded-3xl p-px bg-linear-to-r from-yellow-500/20 to-yellow-500/0 hover:from-yellow-500/40 hover:to-yellow-500/10 transition-all duration-300">
                        <div className="absolute inset-0 bg-yellow-500/5 blur-xl group-hover:bg-yellow-500/10 transition-colors" />
                        <div className="relative h-full bg-[#0D0D10] rounded-3xl p-6 flex items-center gap-5 border border-white/5 group-hover:border-yellow-500/20 transition-colors">
                            <div className="p-3.5 rounded-2xl bg-yellow-500/10 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.15)] ring-1 ring-yellow-500/20">
                                <Clock size={24} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-white tracking-tight">64 <span className="text-sm font-normal text-zinc-500">min</span></h3>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mt-1">Total Duration</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative group rounded-3xl p-px bg-linear-to-r from-purple-500/20 to-purple-500/0 hover:from-purple-500/40 hover:to-purple-500/10 transition-all duration-300">
                        <div className="absolute inset-0 bg-purple-500/5 blur-xl group-hover:bg-purple-500/10 transition-colors" />
                        <div className="relative h-full bg-[#0D0D10] rounded-3xl p-6 flex items-center gap-5 border border-white/5 group-hover:border-purple-500/20 transition-colors">
                            <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/20">
                                <GraduationCap size={24} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-white tracking-tight">3 <span className="text-sm font-normal text-zinc-500">Levels</span></h3>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mt-1">Skill Tracks</p>
                            </div>
                        </div>
                    </div>
                </div>
            </PageSection>

            {/* Videos Grid */}
            <PageSection>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TRAINING_MODULES.map((module, index) => (
                        <VideoCard
                            key={index}
                            {...module}
                        />
                    ))}

                    {/* Coming Soon Card */}
                    <div className="glass-card flex flex-col items-center justify-center p-8 text-center min-h-[300px] border-dashed border-zinc-800">
                        <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
                            <School className="w-8 h-8 text-zinc-600" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-400 mb-2">More Coming Soon</h3>
                        <p className="text-zinc-600 text-sm max-w-xs">
                            We're constantly adding new training materials. Check back later for more updates.
                        </p>
                    </div>
                </div>
            </PageSection>
        </PageContainer>
    )
}
