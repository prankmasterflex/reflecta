'use client'

import { useRouter } from 'next/navigation'
import { usePostHog } from 'posthog-js/react'
import { useExperiments, EXPERIMENT_CONTENT } from '@/lib/hooks/useExperiments'

export default function HomePage() {
    const router = useRouter()
    const posthog = usePostHog()
    const { headlineVariant, ctaVariant } = useExperiments()

    const handleCtaClick = () => {
        posthog?.capture('cta_clicked', {
            cta_name: 'start_readiness_check',
            page: 'landing',
            headline_variant: headlineVariant,
            cta_variant: ctaVariant
        })

        setTimeout(() => {
            router.push('/assessment')
        }, 300)
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <section className="container mx-auto px-4 py-16 md:py-24">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                        {EXPERIMENT_CONTENT.headline[headlineVariant]}
                    </h1>

                    <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                        Get a comprehensive assessment of your organization's CMMC compliance status.
                        Identify gaps and receive actionable recommendations.
                    </p>

                    <button
                        onClick={handleCtaClick}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                    >
                        {EXPERIMENT_CONTENT.cta[ctaVariant]}
                    </button>

                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-left max-w-md mx-auto">
                            <p className="font-semibold text-yellow-800 mb-2">🧪 Active Experiments (Dev Only)</p>
                            <p className="text-yellow-700">Headline: <span className="font-mono">{headlineVariant}</span></p>
                            <p className="text-yellow-700">CTA: <span className="font-mono">{ctaVariant}</span></p>
                        </div>
                    )}
                </div>
            </section>

            <section className="container mx-auto px-4 py-16">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
                        Why Check Your Readiness?
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="text-3xl mb-4">📋</div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-3">
                                Comprehensive Assessment
                            </h3>
                            <p className="text-slate-600">
                                Evaluate all 110 practices across 17 domains required for CMMC Level 2 certification.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="text-3xl mb-4">🎯</div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-3">
                                Identify Gaps Early
                            </h3>
                            <p className="text-slate-600">
                                Discover compliance gaps before your audit and receive prioritized remediation guidance.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <div className="text-3xl mb-4">💰</div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-3">
                                Save Time & Money
                            </h3>
                            <p className="text-slate-600">
                                Avoid costly surprises and streamline your certification process with clear action items.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-slate-50 py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            Trusted by Defense Contractors
                        </h2>
                        <p className="text-slate-600 mb-8">
                            Join hundreds of organizations preparing for CMMC Level 2 certification
                        </p>

                        <button
                            onClick={handleCtaClick}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                        >
                            {EXPERIMENT_CONTENT.cta[ctaVariant]}
                        </button>
                    </div>
                </div>
            </section>
        </div>
    )
}
