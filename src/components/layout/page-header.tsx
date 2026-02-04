'use client'

import { HelpTooltip } from '@/components/ui/help-tooltip'
import { PageSection } from './page-container'

interface PageHeaderProps {
    title: string
    description?: string
    tooltipContent?: string
    tooltipTitle?: string
    learnMoreLink?: string
}

export function PageHeader({
    title,
    description,
    tooltipContent,
    tooltipTitle,
    learnMoreLink
}: PageHeaderProps) {
    return (
        <PageSection className="mb-6">
            <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold gradient-text">{title}</h1>
                {tooltipContent && (
                    <HelpTooltip
                        variant="info"
                        title={tooltipTitle || title}
                        content={tooltipContent}
                        learnMoreLink={learnMoreLink}
                    />
                )}
            </div>
            {description && (
                <p className="text-zinc-500 mt-2">{description}</p>
            )}
        </PageSection>
    )
}
