
import { useState, useEffect } from 'react'
import posthog from 'posthog-js'

interface EmailVerificationModalProps {
    isOpen: boolean
    onClose: () => void
    onVerified: (email: string) => void
    scoreData: {
        score: number
        gapCount: number
        gaps: string[]
    }
}

export default function EmailVerificationModal({ isOpen, onClose, onVerified, scoreData }: EmailVerificationModalProps) {
    const [step, setStep] = useState<'email' | 'code'>('email')
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [resendCooldown, setResendCooldown] = useState(0)

    useEffect(() => {
        if (isOpen) {
            posthog.capture('email_modal_shown', { trigger: 'pdf_download' })
        }
    }, [isOpen])

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [resendCooldown])

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/send-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    score: scoreData.score,
                    gapCount: scoreData.gapCount,
                    gaps: scoreData.gaps
                })
            })

            if (!res.ok) {
                throw new Error('Failed to send verification code')
            }

            posthog.capture('verification_code_sent', { email_domain: email.split('@')[1] })
            setStep('code')
            setResendCooldown(60)
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    const handleResend = async () => {
        if (resendCooldown > 0) return
        setIsLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/send-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    score: scoreData.score,
                    gapCount: scoreData.gapCount,
                    gaps: scoreData.gaps
                })
            })

            if (!res.ok) throw new Error('Failed to resend code')

            posthog.capture('verification_code_resent')
            setResendCooldown(60)
        } catch (err: any) {
            setError(err.message || 'Failed to resend')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            })

            const data = await res.json()

            if (!res.ok || data.error) {
                throw new Error(data.error || 'Invalid code')
            }

            posthog.capture('email_verified', { source: 'pdf_gate', score: scoreData.score })
            onVerified(email)
        } catch (err: any) {
            setError(err.message || 'Verification failed')
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
                {step === 'email' ? (
                    <form onSubmit={handleEmailSubmit}>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Download Your Readiness Report</h2>
                        <p className="text-gray-600 mb-6">Enter your email to receive a verification code.</p>

                        <div className="mb-6">
                            <input
                                type="email"
                                required
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                'Send Verification Code'
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleCodeSubmit}>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Verification Code</h2>
                        <p className="text-gray-600 mb-6">We sent a 6-digit code to <span className="font-semibold">{email}</span></p>

                        <div className="mb-6">
                            <input
                                type="text"
                                required
                                maxLength={6}
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-center text-3xl tracking-[0.5em] font-mono"
                            />
                            {error && <p className="text-red-600 text-sm mt-2 text-center">{error}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || code.length !== 6}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center mb-4"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                'Verify & Download Report'
                            )}
                        </button>

                        <div className="flex justify-between items-center text-sm">
                            <button
                                type="button"
                                onClick={() => setStep('email')}
                                className="text-blue-600 hover:underline"
                            >
                                Use different email
                            </button>

                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resendCooldown > 0}
                                className="text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
                            >
                                {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend code'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
