'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ResponseValue } from '@/types/scoring';
import { calculateReadiness } from '@/lib/scoring';
import { SAMPLE_CONTROLS } from '@/components/assessment/controlsData';
import AssessmentForm from '@/components/assessment/AssessmentForm';
import { ReadinessSummaryCard } from '@/components/assessment/ReadinessSummary';
import { GapsList } from '@/components/assessment/GapsList';

export default function AssessmentPage() {
    // State for tracking responses
    const [responses, setResponses] = useState<Map<string, ResponseValue>>(new Map());
    const [activeTab, setActiveTab] = useState<'assessment' | 'summary'>('assessment');

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

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">

                {/* Tab Navigation */}
                <div className="mb-6 border-b border-gray-200">
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
                                    {Array.from(responses.values()).filter((r) => r !== 'Unknown').length} / {readinessSummary.totalControls}
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
                        <AssessmentForm onResponseChange={handleResponseChange} />
                    </div>
                ) : (
                    <div className="space-y-6">
                        <ReadinessSummaryCard summary={readinessSummary} />
                        <GapsList gaps={readinessSummary.gaps} />
                    </div>
                )}

            </div>
        </div>
    );
}
