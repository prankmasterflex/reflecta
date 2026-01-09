
import React, { useEffect } from 'react'
import posthog from 'posthog-js'

interface ResumeModalProps {
    isOpen: boolean
    progressSummary: {
        answeredCount: number
        totalControls: number
        percentComplete: number
        lastUpdatedAt: string
    }
    onResume: () => void
    onStartOver: () => void
}

export default function ResumeModal({ isOpen, progressSummary, onResume, onStartOver }: ResumeModalProps) {
    useEffect(() => {
        if (isOpen) {
            posthog.capture('resume_modal_shown', {
                percent_complete: progressSummary.percentComplete,
                answered_count: progressSummary.answeredCount
            })
        }
    }, [isOpen, progressSummary])

    if (!isOpen) return null

    const handleResume = () => {
        posthog.capture('assessment_resumed', { percent_complete: progressSummary.percentComplete })
        onResume()
    }

    const handleStartOver = () => {
        posthog.capture('assessment_restarted', { percent_complete_abandoned: progressSummary.percentComplete })
        onStartOver()
    }

    // Format relative time (simple version)
    const getLastUpdatedText = (isoString: string) => {
        const date = new Date(isoString)
        const diffInHours = (Date.now() - date.getTime()) / (1000 * 60 * 60)

        if (diffInHours < 1) return 'Just now'
        if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`
        return date.toLocaleDateString()
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 transform transition-all">
                <div className="text-center mb-6">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Continue Your Assessment?</h2>
                    <p className="text-sm text-gray-500 mt-2">
                        You have a saved assessment in progress.
                    </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-bold text-blue-600">{progressSummary.percentComplete}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progressSummary.percentComplete}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>{progressSummary.answeredCount} of {progressSummary.totalControls} answered</span>
                        <span>Updated {getLastUpdatedText(progressSummary.lastUpdatedAt)}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleResume}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        Continue Assessment
                    </button>
                    <button
                        onClick={handleStartOver}
                        className="w-full bg-white text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 border border-gray-200 transition-colors"
                    >
                        Start Over
                    </button>
                </div>
            </div>
        </div>
    )
}
