'use client';

import React, { useState, useMemo, useEffect } from 'react';
import posthog from 'posthog-js';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ResponseValue } from '@/types/scoring';
import { calculateReadiness } from '@/lib/scoring';
import { SAMPLE_CONTROLS } from '@/components/assessment/controlsData';
import AssessmentForm from '@/components/assessment/AssessmentForm';
import { ReadinessSummaryCard } from '@/components/assessment/ReadinessSummary';
import { GapsList } from '@/components/assessment/GapsList';
import { FixPlan, Gap, FixPlanRequest } from '@/types/fixplan';
import EmailVerificationModal from '@/components/assessment/EmailVerificationModal';

export default function AssessmentPage() {
    // State for tracking responses
    const [responses, setResponses] = useState<Map<string, ResponseValue>>(new Map());
    const [activeTab, setActiveTab] = useState<'assessment' | 'summary'>('assessment');
    const [fixPlan, setFixPlan] = useState<FixPlan | null>(null);
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
    const [planError, setPlanError] = useState<string | null>(null);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Email verification state
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

    // Check for previously verified email
    useEffect(() => {
        const stored = localStorage.getItem('reflecta_verified_email');
        if (stored) {
            try {
                const { email, timestamp } = JSON.parse(stored);
                const hoursSince = (Date.now() - timestamp) / (1000 * 60 * 60);
                if (hoursSince < 24) {
                    setIsEmailVerified(true);
                    setVerifiedEmail(email);
                } else {
                    localStorage.removeItem('reflecta_verified_email');
                }
            } catch {
                localStorage.removeItem('reflecta_verified_email');
            }
        }
    }, []);

    // Reactively calculate readiness whenever responses change
    const readinessSummary = useMemo(() => {
        return calculateReadiness(SAMPLE_CONTROLS, responses);
    }, [responses]);

    // Track scoring analytics (optional)
    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).posthog) {
            const answeredCount = Array.from(responses.values()).filter(
                (r) => r !== 'Unknown'
            ).length;

            // Only track if user has answered at least one control
            if (answeredCount > 0) {
                (window as any).posthog.capture('readiness_scored', {
                    readiness_percent: readinessSummary.readinessPercent,
                    gap_count: readinessSummary.gapCount,
                    fully_met_count: readinessSummary.fullyMetCount,
                    answered_count: answeredCount,
                    total_controls: readinessSummary.totalControls,
                    applicable_controls: readinessSummary.applicableControls,
                });
            }
        }
    }, [readinessSummary, responses]);

    // Track paywall view
    useEffect(() => {
        if (fixPlan && !isUnlocked && typeof window !== 'undefined' && (window as any).posthog) {
            (window as any).posthog.capture('paywall_viewed', {
                timestamp: new Date().toISOString()
            });
        }
    }, [fixPlan, isUnlocked]);

    // Track assessment completion milestone
    useEffect(() => {
        const answeredCount = Array.from(responses.values()).filter(
            (r) => r !== 'Unknown'
        ).length;

        if (answeredCount === readinessSummary.totalControls && typeof window !== 'undefined' && (window as any).posthog) {
            (window as any).posthog.capture('assessment_completed', {
                readiness_percent: readinessSummary.readinessPercent,
                gap_count: readinessSummary.gapCount,
                fully_met_count: readinessSummary.fullyMetCount,
            });
        }
    }, [responses, readinessSummary]);

    // Handler for when a response button is clicked
    const handleResponseChange = (controlId: string, response: ResponseValue) => {
        setResponses((prev) => {
            const next = new Map(prev);
            next.set(controlId, response);
            return next;
        });
    };

    const transformGapsForAPI = (currentSummary: typeof readinessSummary): Gap[] => {
        return currentSummary.gaps.map(gap => ({
            control_id: gap.controlId,
            control_title: gap.title,
            requirement: gap.title, // Use title as requirement for now as simplified in Gap interface
            response: gap.response as 'No' | 'Partial' | 'Unknown'
        }));
    };

    const generateFixPlan = async () => {
        // Track button click
        posthog.capture('fix_plan_button_clicked', {
            gap_count: readinessSummary.gaps.length
        });

        setIsGeneratingPlan(true);
        setPlanError(null);

        // Pre-calculate apiGaps to use in tracking if needed before or inside try/catch blocks scope
        const apiGaps = transformGapsForAPI(readinessSummary);

        try {
            const response = await fetch('/api/generate-fix-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    industry: 'Defense Contracting',
                    scopeNote: 'Small contractor conducting CMMC Level 2 assessment',
                    gaps: apiGaps
                } as FixPlanRequest)
            });

            if (!response.ok) {
                throw new Error('Failed to generate fix plan');
            }

            const plan: FixPlan = await response.json();
            setFixPlan(plan);

            // Track successful generation
            posthog.capture('fix_plan_generated', {
                gap_count: apiGaps.length,
                industry: 'Defense Contracting',
                has_critical_gaps: apiGaps.some(g => g.response === 'No'),
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            setPlanError('Unable to generate fix plan. Please try again.');
            console.error('Fix plan error:', error);

            // Track generation failure
            posthog.capture('fix_plan_generation_failed', {
                gap_count: apiGaps.length, // apiGaps is now available in scope
                error_message: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
            });
        } finally {
            setIsGeneratingPlan(false);
        }
    };

    const handleUnlock = () => {
        setIsUnlocked(true);
        posthog.capture('payment_unlocked', {
            timestamp: new Date().toISOString()
        });
    };

    const handleEmailVerified = (email: string) => {
        localStorage.setItem('reflecta_verified_email', JSON.stringify({
            email,
            timestamp: Date.now()
        }));
        setIsEmailVerified(true);
        setVerifiedEmail(email);
        setShowEmailModal(false);
        handlePdfDownload();
        posthog.capture('pdf_downloaded', { verified: true, returning_user: false });
    };

    const onDownloadClick = () => {
        if (isEmailVerified) {
            handlePdfDownload();
            posthog.capture('pdf_downloaded', { verified: true, returning_user: true });
        } else {
            setShowEmailModal(true);
        }
    };

    const handlePdfDownload = async () => {
        if (!isUnlocked) return;
        setIsExporting(true);

        try {
            const reportElement = document.getElementById('report-content');
            if (!reportElement) return;

            const canvas = await html2canvas(reportElement, {
                scale: 2,
                logging: false,
                useCORS: true
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

            // Add Footer
            const pageCount = pdf.internal.pages.length - 1; // jsPDF fix
            pdf.setFontSize(10);
            pdf.setTextColor(150);
            pdf.text('This report supports readiness planning only. It does not provide certification or audit results.', 105, 290, { align: 'center' });

            pdf.save('reflecta-readiness-report.pdf');

            posthog.capture('report_exported', {
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

                {/* Main Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">CMMC Assessment</h1>
                    <p className="text-gray-600 mt-2">Level 2 - Control Assessment</p>
                </div>

                {/* Tab Navigation */}
                <div className="mb-8 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('assessment')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'assessment'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Assessment
                        </button>
                        <button
                            onClick={() => setActiveTab('summary')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'summary'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Summary & Gaps
                            {readinessSummary.gapCount > 0 && (
                                <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                                    {readinessSummary.gapCount}
                                </span>
                            )}
                        </button>
                    </nav>
                </div>

                {/* Quick Stats Bar - Shows on Assessment Tab */}
                {activeTab === 'assessment' && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {readinessSummary.readinessPercent}%
                                </div>
                                <div className="text-xs text-gray-600">Readiness</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-700">
                                    {responses.size} / {readinessSummary.totalControls}
                                </div>
                                <div className="text-xs text-gray-600">Answered</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {readinessSummary.fullyMetCount}
                                </div>
                                <div className="text-xs text-gray-600">Fully Met</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-red-600">
                                    {readinessSummary.gapCount}
                                </div>
                                <div className="text-xs text-gray-600">Gaps</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Area - Conditionally render based on active tab */}
                {activeTab === 'assessment' ? (
                    <div>
                        <AssessmentForm
                            onResponseChange={handleResponseChange}
                            onComplete={() => setActiveTab('summary')}
                        />
                    </div>
                ) : (
                    <div className="space-y-6" id="report-content">
                        <ReadinessSummaryCard summary={readinessSummary} />
                        <GapsList gaps={readinessSummary.gaps} />

                        {readinessSummary.gaps.length > 0 && (
                            <div className="mt-8">
                                <button
                                    onClick={generateFixPlan}
                                    disabled={isGeneratingPlan}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    {isGeneratingPlan ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                            Generating Fix Plan...
                                        </>
                                    ) : (
                                        'Generate AI Remediation Plan'
                                    )}
                                </button>

                                {planError && (
                                    <div className="mt-4 bg-red-50 border border-red-200 rounded p-4 text-red-700">
                                        {planError}
                                    </div>
                                )}

                                {fixPlan && (
                                    <div className="mt-8 relative">
                                        {/* Blur Mask for Locked State */}
                                        {!isUnlocked && (
                                            <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-lg border border-gray-200">
                                                <div className="bg-white p-8 rounded-xl shadow-2xl border border-blue-100 max-w-md text-center">
                                                    <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Unlock Full Remediation Plan</h3>
                                                    <p className="text-gray-600 mb-6">Get detailed AI-driven fix steps, effort estimates, and a downloadable PDF report.</p>
                                                    <button
                                                        onClick={handleUnlock}
                                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-md transform hover:-translate-y-0.5"
                                                    >
                                                        Unlock Report - $49
                                                    </button>
                                                    <p className="text-xs text-gray-400 mt-4">One-time payment. Secure checkout.</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className={`mt-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm transition-all ${!isUnlocked ? 'filter blur-sm select-none pointer-events-none opacity-50' : ''}`}>
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-xl font-bold text-gray-900">AI Remediation Plan</h3>
                                                {isUnlocked && (
                                                    <button
                                                        onClick={onDownloadClick}
                                                        disabled={isExporting}
                                                        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                                                    >
                                                        {isExporting ? 'Exporting...' : (
                                                            <>
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                </svg>
                                                                Download PDF
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>

                                            <div className="mb-6">
                                                <h4 className="font-semibold text-gray-900 mb-2">Readiness Summary</h4>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    {fixPlan.readiness_summary.map((item, i) => (
                                                        <li key={i} className="text-gray-700">{item}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="mb-6">
                                                <h4 className="font-semibold text-gray-900 mb-2">Top Priorities</h4>
                                                <div className="space-y-4">
                                                    {fixPlan.top_priorities.map((priority, i) => (
                                                        <div key={i} className="border-l-4 border-blue-500 pl-4 py-1">
                                                            <div className="flex justify-between items-start">
                                                                <span className="font-bold text-gray-800">{priority.control_id}</span>
                                                                <span className={`text-xs px-2 py-1 rounded font-medium ${priority.estimated_effort === 'L' ? 'bg-red-100 text-red-800' :
                                                                    priority.estimated_effort === 'M' ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-green-100 text-green-800'
                                                                    }`}>
                                                                    Effort: {priority.estimated_effort}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-600 mt-1 italic">{priority.why_it_matters}</p>
                                                            <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
                                                                {priority.what_to_do.map((action, j) => (
                                                                    <li key={j}>{action}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-2 text-green-700">Quick Wins (7 Days)</h4>
                                                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                                                        {fixPlan.quick_wins_7_days.map((win, i) => (
                                                            <li key={i}>{win}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-2 text-red-700">Audit Risks</h4>
                                                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                                                        {fixPlan.audit_risk_notes.map((risk, i) => (
                                                            <li key={i}>{risk}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <EmailVerificationModal
                isOpen={showEmailModal}
                onClose={() => setShowEmailModal(false)}
                onVerified={handleEmailVerified}
                scoreData={{
                    score: readinessSummary.readinessPercent,
                    gapCount: readinessSummary.gapCount,
                    gaps: readinessSummary.gaps.map(g => g.controlId)
                }}
            />
        </div>
    );
}
