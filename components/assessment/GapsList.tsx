// components/assessment/GapsList.tsx
'use client';

import React from 'react';
import { Gap } from '@/types/scoring';

interface GapsListProps {
    gaps: Gap[];
}

export function GapsList({ gaps }: GapsListProps) {
    if (gaps.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-4">Gaps Identified</h2>
                <div className="text-center py-8 text-gray-500">
                    <svg
                        className="mx-auto h-12 w-12 text-green-500 mb-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <p className="text-lg font-medium">No gaps identified</p>
                    <p className="text-sm mt-1">All applicable controls are fully met</p>
                </div>
            </div>
        );
    }

    const getSeverityBadge = (severity: Gap['severity']) => {
        const styles = {
            critical: 'bg-red-100 text-red-800 border-red-200',
            moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            low: 'bg-blue-100 text-blue-800 border-blue-200',
        };

        const labels = {
            critical: 'Critical',
            moderate: 'Moderate',
            low: 'Low',
        };

        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[severity]}`}
            >
                {labels[severity]}
            </span>
        );
    };

    const getResponseBadge = (response: string) => {
        const styles = {
            No: 'bg-red-50 text-red-700 border-red-200',
            Partial: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            Unknown: 'bg-gray-50 text-gray-700 border-gray-200',
        };

        return (
            <span
                className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium border ${styles[response as keyof typeof styles] || styles.Unknown
                    }`}
            >
                {response}
            </span>
        );
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Gaps Identified</h2>
                <span className="text-sm text-gray-500">
                    {gaps.length} {gaps.length === 1 ? 'gap' : 'gaps'} found
                </span>
            </div>

            <div className="space-y-3">
                {gaps.map((gap) => (
                    <div
                        key={gap.controlId}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-mono text-sm text-gray-500">
                                        {gap.controlId}
                                    </span>
                                    {getSeverityBadge(gap.severity)}
                                </div>
                                <h3 className="font-medium text-gray-900 mb-1">
                                    {gap.title}
                                </h3>
                            </div>
                            <div className="flex-shrink-0">
                                {getResponseBadge(gap.response)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary by Severity */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Gaps by Severity
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-red-600">
                            {gaps.filter((g) => g.severity === 'critical').length}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Critical</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-yellow-600">
                            {gaps.filter((g) => g.severity === 'moderate').length}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Moderate</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-blue-600">
                            {gaps.filter((g) => g.severity === 'low').length}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Low</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
