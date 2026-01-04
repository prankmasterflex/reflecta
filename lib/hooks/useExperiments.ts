'use client'

import { useEffect, useState } from 'react'
import { usePostHog } from 'posthog-js/react'

interface ExperimentVariants {
    headlineVariant: 'control' | 'variant'
    ctaVariant: 'control' | 'variant'
}

export function useExperiments(): ExperimentVariants {
    const posthog = usePostHog()
    const [variants, setVariants] = useState<ExperimentVariants>({
        headlineVariant: 'control',
        ctaVariant: 'control'
    })

    useEffect(() => {
        if (!posthog) return

        const loadVariants = () => {
            const headline = posthog.getFeatureFlag('headline_variant')
            const cta = posthog.getFeatureFlag('cta_variant')

            setVariants({
                headlineVariant: (headline === 'variant' ? 'variant' : 'control') as 'control' | 'variant',
                ctaVariant: (cta === 'variant' ? 'variant' : 'control') as 'control' | 'variant'
            })
        }

        if (posthog.isFeatureEnabled) {
            loadVariants()
        }

        posthog.onFeatureFlags(() => {
            loadVariants()
        })
    }, [posthog])

    return variants
}

export const EXPERIMENT_CONTENT = {
    headline: {
        control: "CMMC Level 2 Readiness — Know Your Score Before the Audit",
        variant: "Check Your CMMC Level 2 Readiness in 30 Minutes"
    },
    cta: {
        control: "Start Free Readiness Check",
        variant: "Get My Readiness Score"
    }
} as const
