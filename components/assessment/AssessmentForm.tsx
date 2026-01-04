'use client';

import React, { useState } from 'react';
import { SAMPLE_CONTROLS, RESPONSE_OPTIONS, type ControlResponse, type ResponseOption } from './controlsData';

export default function AssessmentForm() {
    const [responses, setResponses] = useState<Record<string, ControlResponse>>({});

    const handleResponseChange = (controlId: string, response: ResponseOption) => {
        setResponses(prev => ({
            ...prev,
            [controlId]: {
                response,
                notes: prev[controlId]?.notes || ''
            }
        }));

        // PostHog tracking
        if (typeof window !== 'undefined' && (window as any).posthog) {
            (window as any).posthog.capture('control_answered', {
                control_id: controlId,
                answer: response.toLowerCase(),
            });
        }
    };

    const handleNotesChange = (controlId: string, notes: string) => {
        setResponses(prev => ({
            ...prev,
            [controlId]: {
                response: prev[controlId]?.response,
                notes
            }
        }));
    };

    // Calculate progress
    const answeredCount = Object.values(responses).filter(r => r.response).length;
    const totalControls = SAMPLE_CONTROLS.length;
    const progressPercentage = (answeredCount / totalControls) * 100;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-gray-900">CMMC Assessment</h1>
                    <p className="text-sm text-gray-600 mt-1">Layer 1 - Control Assessment</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                            Progress: {answeredCount} of {totalControls} completed
                        </span>
                        <span className="text-sm text-gray-600">
                            {Math.round(progressPercentage)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Assessment Form */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="space-y-6">
                    {SAMPLE_CONTROLS.map((control) => {
                        const response = responses[control.id];
                        const isAnswered = !!response?.response;

                        return (
                            <div
                                key={control.id}
                                className={`bg-white rounded-lg shadow-sm border-2 transition-all ${isAnswered ? 'border-green-300' : 'border-gray-200'
                                    }`}
                            >
                                <div className="p-6">
                                    {/* Control Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                                    {control.id}
                                                </span>
                                                {isAnswered && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
                                                        ✓ Answered
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {control.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-2">
                                                {control.requirement}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Response Options */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Response *
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                            {RESPONSE_OPTIONS.map((option) => {
                                                const isSelected = response?.response === option;
                                                return (
                                                    <button
                                                        key={option}
                                                        type="button"
                                                        onClick={() => handleResponseChange(control.id, option)}
                                                        className={`px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${isSelected
                                                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {option}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Notes Field */}
                                    <div>
                                        <label
                                            htmlFor={`notes-${control.id}`}
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Notes (Optional)
                                        </label>
                                        <textarea
                                            id={`notes-${control.id}`}
                                            rows={3}
                                            value={response?.notes || ''}
                                            onChange={(e) => handleNotesChange(control.id, e.target.value)}
                                            placeholder="Add any additional context, evidence, or observations..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Actions */}
                <div className="mt-8 flex items-center justify-between p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="text-sm text-gray-600">
                        {answeredCount === totalControls ? (
                            <span className="text-green-600 font-medium">
                                ✓ All controls answered
                            </span>
                        ) : (
                            <span>
                                {totalControls - answeredCount} control{totalControls - answeredCount !== 1 ? 's' : ''} remaining
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        disabled
                        className="px-6 py-2.5 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                        title="This button will be functional in a future chapter"
                    >
                        Continue (Placeholder)
                    </button>
                </div>
            </div>
        </div>
    );
}
