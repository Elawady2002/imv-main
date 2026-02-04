'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from './card'

interface LoadingStateProps {
    message?: string
    fullPage?: boolean
}

export function LoadingState({ message = 'Loading...', fullPage = false }: LoadingStateProps) {
    const content = (
        <div className="flex flex-col items-center justify-center p-12 text-center">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full"
            />
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-zinc-500 font-mono tracking-widest text-xs uppercase"
            >
                {message}
            </motion.p>
        </div>
    )

    if (fullPage) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                {content}
            </div>
        )
    }

    return (
        <Card className="w-full">
            <CardContent className="p-0">
                {content}
            </CardContent>
        </Card>
    )
}
