'use client';

import React, { useState } from 'react';
import { SAMPLE_CONTROLS, RESPONSE_OPTIONS, type ControlResponse, type ResponseOption } from './controlsData';

interface AssessmentFormProps {
    onResponseChange?: (controlId: string, response: ResponseOption) => void;
}

export default function AssessmentForm({ onResponseChange }: AssessmentFormProps) {
    const [responses, setResponses] = useState<Record<string, ControlResponse>>({});

    const handleResponseChange = (controlId: string, response: ResponseOption) => {
        setResponses(prev => ({
            ...prev,
            [controlId]: {
                response,
                notes: prev[controlId]?.notes || ''
            }
        }));

        // Notify parent
        onResponseChange?.(controlId, response);

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
            {/* Header - Fixed at top */}
            <div className="bg-white border-b border-gray-300 sticky top-0 z-10">
                <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-5">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-left">
                        CMMC Assessment
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1 text-left">
                        Layer 1 - Control Assessment
                    </p>
                </div>
            </div>

            {/* Progress Bar Section */}
            <div className="bg-white border-b border-gray-300">
                <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm sm:text-base font-medium text-gray-900">
                            Progress: {answeredCount} of {totalControls} completed
                        </span>
                        <span className="text-sm sm:text-base font-medium text-gray-600">
                            {Math.round(progressPercentage)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="space-y-5">
                    {SAMPLE_CONTROLS.map((control) => {
                        const response = responses[control.id];
                        const isAnswered = !!response?.response;

                        return (
                            <div
                                key={control.id}
                                className={`bg-white rounded-lg border-2 transition-all duration-200 ${isAnswered
                                    ? 'border-green-400 shadow-md'
                                    : 'border-gray-200 shadow-sm hover:shadow-md'
                                    }`}
                            >
                                <div className="p-5 sm:p-6">
                                    {/* Control ID and Status Badges */}
                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                            {control.id}
                                        </span>
                                        {isAnswered && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                                                ✓ Answered
                                            </span>
                                        )}
                                    </div>

                                    {/* Control Title */}
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 text-left">
                                        {control.title}
                                    </h3>

                                    {/* Control Requirement */}
                                    <p className="text-sm sm:text-base text-gray-700 mb-6 leading-relaxed text-left">
                                        {control.requirement}
                                    </p>

                                    {/* Response Section */}
                                    <div className="mb-5">
                                        <label className="block text-sm font-semibold text-gray-900 mb-3 text-left">
                                            Response <span className="text-red-500">*</span>
                                        </label>

                                        {/* Response Button Grid */}
                                        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                                            {RESPONSE_OPTIONS.map((option) => {
                                                const isSelected = response?.response === option;
                                                return (
                                                    <button
                                                        key={option}
                                                        type="button"
                                                        onClick={() => handleResponseChange(control.id, option)}
                                                        className={`
                              px-4 py-3 rounded-lg border-2 text-sm font-medium 
                              transition-all duration-150 text-center
                              ${isSelected
                                                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-2 ring-blue-100'
                                                                : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600'
                                                            }
                            `}
                                                    >
                                                        {option}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Notes Section */}
                                    <div>
                                        <label
                                            htmlFor={`notes-${control.id}`}
                                            className="block text-sm font-semibold text-gray-900 mb-2 text-left"
                                        >
                                            Notes (Optional)
                                        </label>
                                        <textarea
                                            id={`notes-${control.id}`}
                                            rows={3}
                                            value={response?.notes || ''}
                                            onChange={(e) => handleNotesChange(control.id, e.target.value)}
                                            placeholder="Add any additional context, evidence, or observations..."
                                            className="
                        w-full px-3 py-2.5 text-sm
                        border border-gray-300 rounded-lg 
                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                        placeholder:text-gray-400
                        resize-none transition-all
                      "
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Actions */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-sm sm:text-base text-gray-700 text-center sm:text-left">
                        {answeredCount === totalControls ? (
                            <span className="text-green-600 font-semibold flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                All controls answered
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
                        className="
              w-full sm:w-auto
              px-6 py-2.5 
              bg-gray-200 text-gray-500 
              rounded-lg font-medium 
              cursor-not-allowed
              opacity-60
            "
                        title="This button will be functional in a future chapter"
                    >
                        Continue (Placeholder)
                    </button>
                </div>
            </div>
        </div>
    );
}
