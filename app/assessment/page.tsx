'use client'

import { useEffect, useState, useRef } from 'react'
import { usePostHog } from 'posthog-js/react'

export default function AssessmentPage() {
    const posthog = usePostHog()
    const [isCompleted, setIsCompleted] = useState(false)
    const eventSent = useRef(false)

    useEffect(() => {
        if (posthog && !eventSent.current) {
            posthog.capture('assessment_started', {
                entry_point: 'landing_page'
            })
            eventSent.current = true
        }
    }, [posthog])

    const handleComplete = async () => {
        posthog.capture('assessment_completed', { status: 'completed' })
        await new Promise(resolve => setTimeout(resolve, 300));
        setIsCompleted(true)
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 p-4">
            <div className="max-w-2xl w-full text-center space-y-8 p-8 bg-white rounded-xl shadow-lg">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                    Readiness Assessment
                </h1>

                {!isCompleted ? (
                    <div className="space-y-8">
                        <p className="text-xl text-gray-600">
                            Welcome to the assessment area. This is where you will evaluate your readiness.
                        </p>

                        <div className="py-4">
                            <button
                                onClick={handleComplete}
                                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out shadow-sm"
                            >
                                Complete Assessment
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 py-8 animate-in fade-in duration-500">
                        <div className="text-green-500 text-6xl mb-4 mx-auto flex justify-center">
                            <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h2 className="text-3xl font-bold text-green-700">Assessment Complete!</h2>
                        <p className="text-lg text-gray-600">Thank you for completing the readiness check.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
