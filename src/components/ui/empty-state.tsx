import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface EmptyStateProps {
    icon: LucideIcon
    title: string
    description: string
    action?: {
        label: string
        onClick: () => void
    }
    className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "flex flex-col items-center justify-center p-12 text-center rounded-xl",
                "bg-zinc-900/40 border border-zinc-800/50 border-dashed",
                className
            )}
        >
            <div className="p-4 rounded-full bg-zinc-800/50 mb-4">
                <Icon className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-zinc-500 max-w-sm mb-6 uppercase tracking-wider text-xs leading-loose">
                {description}
            </p>
            {action && (
                <Button onClick={action.onClick} variant="outline" size="sm" glow>
                    {action.label}
                </Button>
            )}
        </motion.div>
    )
}
