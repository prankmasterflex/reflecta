'use client'

import { useRouter } from 'next/navigation'
import { usePostHog } from 'posthog-js/react'
import { useExperiments, EXPERIMENT_CONTENT } from '@/lib/hooks/useExperiments'
import VideoSection from '@/components/landing/VideoSection'

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
                        CMMC Level 2 Readiness Assessment
                    </h1>

                    <div className="mb-8 max-w-2xl mx-auto space-y-4">
                        <p className="text-xl text-slate-600">
                            Assess your organization's alignment with NIST SP 800-171 requirements used for CMMC Level 2 compliance.
                        </p>
                        <p className="text-base text-slate-500">
                            Designed for defense contractors handling Controlled Unclassified Information (CUI).
                        </p>
                    </div>

                    <button
                        onClick={handleCtaClick}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                    >
                        Start Level 2 Readiness Assessment
                    </button>

                    <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Framework Aligned
                        </span>
                        <span className="hidden md:block text-slate-300">•</span>
                        <span>NIST SP 800-171 Rev. 2</span>
                        <span className="hidden md:block text-slate-300">•</span>
                        <span>CMMC Level 2 (CUI Protection)</span>
                    </div>

                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-left max-w-md mx-auto">
                            <p className="font-semibold text-yellow-800 mb-2">🧪 Active Experiments (Dev Only)</p>
                            <p className="text-yellow-700">Headline: <span className="font-mono">{headlineVariant}</span></p>
                            <p className="text-yellow-700">CTA: <span className="font-mono">{ctaVariant}</span></p>
                        </div>
                    )}
                </div>
            </section>

            {/* Video Placeholder Section */}
            <VideoSection />

            {/* Assessment Scope / Methodology Section */}
            <section className="bg-slate-50 py-12 border-y border-slate-200">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Assessment Scope</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            This readiness assessment evaluates your organization against 10 core control areas derived from <span className="font-semibold text-slate-700">NIST SP 800-171 Rev. 2</span>, the security framework underlying CMMC Level 2 requirements.
                        </p>
                        <p className="text-slate-600 mt-2 max-w-2xl mx-auto">
                            The assessment focuses on foundational controls that typically represent the highest-priority gaps for defense contractors beginning their compliance journey.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Control Areas Evaluated:</h3>
                        <div className="grid md:grid-cols-2 gap-y-3 gap-x-8">
                            {[
                                'Access Control Fundamentals',
                                'Identification & Authentication',
                                'System & Communications Protection',
                                'Configuration Management Basics',
                                'Incident Response Readiness',
                                'Audit & Accountability',
                                'Security Awareness Training',
                                'Media Protection',
                                'Physical Protection',
                                'Maintenance Guidelines'
                            ].map((item) => (
                                <div key={item} className="flex items-center text-slate-700">
                                    <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {item}
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <p className="text-sm text-slate-500 italic">
                                Note: This assessment covers a focused subset of CMMC Level 2 requirements and is designed for internal readiness planning. A complete CMMC Level 2 assessment includes 110 practices across 14 control families.
                            </p>
                        </div>
                    </div>
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
                                Foundational Assessment
                            </h3>
                            <p className="text-slate-600">
                                Evaluate your stance on 10 critical control areas required for CMMC Level 2 compliance.
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
                            <div className="text-3xl mb-4">kb</div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-3">
                                Structured Remediation
                            </h3>
                            <p className="text-slate-600">
                                Receive clear, prioritized action items to address identified compliance gaps.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-slate-50 py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            Designed for Defense Contractors
                        </h2>
                        <p className="text-slate-600 mb-8">
                            Prepare for CMMC Level 2 certification with a structured assessment
                        </p>

                        <button
                            onClick={handleCtaClick}
                            className="bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-600 font-semibold px-8 py-4 rounded-lg text-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                        >
                            Check My CMMC Level 2 Readiness
                        </button>
                    </div>
                </div>
            </section>

            <section className="bg-white py-12 border-t border-slate-100">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">About This Assessment</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Reflecta provides an internal readiness assessment tool for defense contractors preparing for CMMC Level 2 certification. This tool evaluates foundational control areas based on NIST SP 800-171 and is intended for planning purposes only.
                    </p>
                </div>
            </section>

            <footer className="container mx-auto px-4 py-8 text-center border-t border-slate-100 bg-white">
                <p className="text-xs text-slate-400 max-w-3xl mx-auto">
                    This tool provides an internal readiness assessment and does not constitute certification, attestation, or a formal CMMC audit. Results are for internal planning purposes only.
                </p>
            </footer>
        </div>
    )
}
