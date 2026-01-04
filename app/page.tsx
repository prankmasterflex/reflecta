'use client'

import { useRouter } from 'next/navigation'
import { usePostHog } from 'posthog-js/react'

export default function Home() {
    const router = useRouter()
    const posthog = usePostHog()

    const handleStartCheck = async () => {
        posthog.capture('cta_clicked', {
            cta_name: 'start_readiness_check',
            page: 'landing'
        })

        // Small delay to ensure event is sent before navigation
        await new Promise(resolve => setTimeout(resolve, 300));

        router.push('/assessment')
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 p-4">
            <div className="max-w-2xl w-full text-center space-y-8">
                <h1 className="text-5xl font-bold tracking-tight text-gray-900">
                    Ready to Get Started?
                </h1>
                <p className="text-xl text-gray-600">
                    Take our comprehensive readiness assessment to see how prepared you are for the journey ahead.
                </p>
                <button
                    onClick={handleStartCheck}
                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition duration-150 ease-in-out"
                >
                    Start Readiness Check
                </button>
            </div>
        </div>
    )
}
