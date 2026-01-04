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
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-5xl mx-auto px-6 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">CMMC Assessment</h1>
                    <p className="text-base text-gray-600 mt-1">Layer 1 - Control Assessment</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-5xl mx-auto px-6 py-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-base font-medium text-gray-900">
                            Progress: {answeredCount} of {totalControls} completed
                        </span>
                        <span className="text-base font-medium text-gray-600">
                            {Math.round(progressPercentage)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Assessment Form */}
            <div className="max-w-5xl mx-auto px-6 py-8">
                <div className="space-y-6">
                    {SAMPLE_CONTROLS.map((control) => {
                        const response = responses[control.id];
                        const isAnswered = !!response?.response;

                        return (
                            <div
                                key={control.id}
                                className={`bg-white rounded-xl shadow border-2 transition-all ${isAnswered ? 'border-green-400' : 'border-gray-200'
                                    }`}
                            >
                                <div className="p-8">
                                    {/* Control Header */}
                                    <div className="mb-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold bg-blue-100 text-blue-800">
                                                {control.id}
                                            </span>
                                            {isAnswered && (
                                                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold bg-green-100 text-green-800">
                                                    ✓ Answered
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                                            {control.title}
                                        </h3>
                                        <p className="text-base text-gray-700 leading-relaxed">
                                            {control.requirement}
                                        </p>
                                    </div>

                                    {/* Response Options */}
                                    <div className="mb-6">
                                        <label className="block text-base font-semibold text-gray-900 mb-4">
                                            Response *
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                            {RESPONSE_OPTIONS.map((option) => {
                                                const isSelected = response?.response === option;
                                                return (
                                                    <button
                                                        key={option}
                                                        type="button"
                                                        onClick={() => handleResponseChange(control.id, option)}
                                                        className={`px-5 py-3 rounded-lg border-2 text-base font-medium transition-all ${isSelected
                                                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                                                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
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
                                            className="block text-base font-semibold text-gray-900 mb-3"
                                        >
                                            Notes (Optional)
                                        </label>
                                        <textarea
                                            id={`notes-${control.id}`}
                                            rows={4}
                                            value={response?.notes || ''}
                                            onChange={(e) => handleNotesChange(control.id, e.target.value)}
                                            placeholder="Add any additional context, evidence, or observations..."
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Actions */}
                <div className="mt-8 flex items-center justify-between p-6 bg-white rounded-xl shadow border border-gray-200">
                    <div className="text-base text-gray-700">
                        {answeredCount === totalControls ? (
                            <span className="text-green-600 font-semibold">
                                ✓ All controls answered
                            </span>
                        ) : (
                            <span className="font-medium">
                                {totalControls - answeredCount} control{totalControls - answeredCount !== 1 ? 's' : ''} remaining
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        disabled
                        className="px-8 py-3 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
                        title="This button will be functional in a future chapter"
                    >
                        Continue (Placeholder)
                    </button>
                </div>
            </div>
        </div>
    );
}
