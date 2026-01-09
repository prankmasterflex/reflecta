'use client';

import React from 'react';
import { ReadinessSummary } from '@/types/scoring';

interface ReadinessSummaryProps {
    summary: ReadinessSummary;
}

export function ReadinessSummaryCard({ summary }: ReadinessSummaryProps) {
    const getReadinessColor = (percent: number) => {
        if (percent >= 80) return 'text-green-600';
        if (percent >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getReadinessLabel = (percent: number) => {
        if (percent >= 80) return 'Strong';
        if (percent >= 60) return 'Moderate';
        return 'Needs Improvement';
    };

    const getProgressBarColor = (percent: number) => {
        if (percent >= 80) return 'bg-green-600';
        if (percent >= 60) return 'bg-yellow-600';
        return 'bg-red-600';
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-0">
            <div className="grid grid-cols-1 lg:grid-cols-12">

                {/* Left Column: Readiness Hero Block */}
                <div className="readiness-hero lg:col-span-5 p-8 flex flex-col items-center justify-center text-center gap-3">
                    <div className="readiness-label text-xs font-medium uppercase tracking-wide text-gray-500">
                        Readiness Score
                    </div>
                    <div className={`readiness-value text-6xl font-bold leading-none ${getReadinessColor(summary.readinessPercent)}`}>
                        {summary.readinessPercent}%
                    </div>
                    <div className={`readiness-status inline-flex rounded-full px-4 py-1 text-sm font-medium ${summary.readinessPercent >= 80 ? 'bg-green-100 text-green-800' :
                        summary.readinessPercent >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {getReadinessLabel(summary.readinessPercent)}
                    </div>
                </div>

                {/* Right Column: Metrics & Progress */}
                <div className="lg:col-span-7 p-8 flex flex-col gap-6 lg:border-l border-gray-100">

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-x-10 gap-y-6">
                        {/* Metric 1 */}
                        <div>
                            <div className="text-xs text-gray-500 mb-1">
                                Total Controls
                            </div>
                            <div className="text-3xl font-semibold leading-none text-gray-900">
                                {summary.totalControls}
                            </div>
                        </div>

                        {/* Metric 2 */}
                        <div>
                            <div className="text-xs text-gray-500 mb-1">
                                Applicable
                            </div>
                            <div className="text-3xl font-semibold leading-none text-gray-900">
                                {summary.applicableControls}
                            </div>
                        </div>

                        {/* Metric 3 */}
                        <div>
                            <div className="text-xs text-gray-500 mb-1">
                                Fully Met
                            </div>
                            <div className="text-3xl font-semibold leading-none text-green-600">
                                {summary.fullyMetCount}
                            </div>
                        </div>

                        {/* Metric 4 */}
                        <div>
                            <div className="text-xs text-gray-500 mb-1">
                                Gaps Identified
                            </div>
                            <div className="text-3xl font-semibold leading-none text-red-600">
                                {summary.gapCount}
                            </div>
                        </div>
                    </div>

                    {/* Implementation Progress */}
                    <div className="pt-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-700">Implementation Progress</span>
                            <span className="text-xs font-medium text-gray-500">
                                {summary.fullyMetCount} of {summary.applicableControls} controls met
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(summary.readinessPercent)}`}
                                style={{ width: `${summary.readinessPercent}%` }}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
