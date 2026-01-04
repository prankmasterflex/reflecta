// components/assessment/ReadinessSummary.tsx
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
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Readiness Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main Score */}
                <div className="col-span-1 md:col-span-2 text-center py-8 bg-gray-50 rounded-lg">
                    <div className={`text-6xl font-bold ${getReadinessColor(summary.readinessPercent)}`}>
                        {summary.readinessPercent}%
                    </div>
                    <div className="text-xl text-gray-600 mt-2">
                        {getReadinessLabel(summary.readinessPercent)} Readiness
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-blue-700">
                        {summary.totalControls}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                        Total Controls
                    </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-purple-700">
                        {summary.applicableControls}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                        Applicable Controls
                    </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-green-700">
                        {summary.fullyMetCount}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                        Fully Met
                    </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-red-700">
                        {summary.gapCount}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                        Gaps Identified
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Implementation Progress</span>
                    <span>{summary.fullyMetCount} / {summary.applicableControls}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(summary.readinessPercent)}`}
                        style={{ width: `${summary.readinessPercent}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
