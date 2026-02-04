'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

interface PageContainerProps {
    children: ReactNode
    className?: string
}

export function PageContainer({ children, className = "" }: PageContainerProps) {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`max-w-6xl mx-auto ${className}`}
        >
            {children}
        </motion.div>
    )
}

export const PageSection = ({ children, className = "" }: { children: ReactNode, className?: string }) => {
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <motion.div variants={itemVariants} className={className}>
            {children}
        </motion.div>
    )
}
