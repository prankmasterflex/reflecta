'use client';

import React, { useState } from 'react';
import { SAMPLE_CONTROLS, RESPONSE_OPTIONS, type ControlResponse, type ResponseOption } from './controlsData';

interface AssessmentFormProps {
    onResponseChange?: (controlId: string, response: ResponseOption) => void;
    onComplete?: () => void;
}

export default function AssessmentForm({ onResponseChange, onComplete }: AssessmentFormProps) {
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
    const isComplete = answeredCount === totalControls;

    return (
        <div className="space-y-6">
            {/* Secondary Progress Indicator (Mobile/Context) */}
            <div className="flex items-center justify-between text-sm text-gray-500 px-1">
                <span>Progress: {answeredCount} of {totalControls} completed</span>
                <span>{Math.round(progressPercentage)}%</span>
            </div>

            {/* Control Cards */}
            <div className="space-y-8">
                {SAMPLE_CONTROLS.map((control) => {
                    const response = responses[control.id];
                    const isAnswered = !!response?.response;
                    const notes = response?.notes || '';

                    return (
                        <div
                            key={control.id}
                            className={`
                                bg-white rounded-xl border transition-all duration-200
                                ${isAnswered ? 'border-blue-200 shadow-sm' : 'border-gray-200 shadow-sm'}
                            `}
                        >
                            {/* Card Header */}
                            <div className="flex items-start gap-4 p-6 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                                <div className="flex-shrink-0">
                                    <span className="inline-flex items-center justify-center h-8 px-3 rounded-md text-sm font-bold bg-blue-600 text-white shadow-sm">
                                        {control.id}
                                    </span>
                                </div>
                                <div className="flex-1 pt-1">
                                    <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                                        {control.title}
                                    </h3>
                                </div>
                                <div className="flex-shrink-0 pt-1">
                                    {isAnswered && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                            Answered
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Requirement Text */}
                                <p className="text-gray-700 leading-relaxed mb-8">
                                    {control.requirement}
                                </p>

                                {/* Decision Area */}
                                <div className="space-y-6">
                                    {/* Response Group */}
                                    <div className="bg-gray-50 rounded-lg p-4 sm:p-5 border border-gray-100">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                                            Decision
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                                            {RESPONSE_OPTIONS.map((option) => {
                                                const isSelected = response?.response === option;
                                                return (
                                                    <button
                                                        key={option}
                                                        type="button"
                                                        onClick={() => handleResponseChange(control.id, option)}
                                                        className={`
                                                            relative flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg border shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
                                                            ${isSelected
                                                                ? 'border-blue-600 bg-blue-600 text-white z-10 scale-[1.02]'
                                                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
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
                                    <div className="pt-4 border-t border-gray-100">
                                        <label
                                            htmlFor={`notes-${control.id}`}
                                            className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3"
                                        >
                                            Notes <span className="text-gray-400 font-normal normal-case">(Optional context or evidence)</span>
                                        </label>
                                        <textarea
                                            id={`notes-${control.id}`}
                                            rows={2}
                                            value={notes}
                                            onChange={(e) => handleNotesChange(control.id, e.target.value)}
                                            placeholder="Enter implementation details..."
                                            className="
                                                block w-full rounded-lg border-gray-300 shadow-sm 
                                                text-sm text-gray-900 
                                                focus:border-blue-500 focus:ring-blue-500 
                                                placeholder:text-gray-400
                                                resize-y min-h-[80px]
                                            "
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer Actions */}
            <div className="mt-12 p-8 bg-gray-900 rounded-xl shadow-lg text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                    <h4 className="text-lg font-bold text-white mb-1">Assessment Status</h4>
                    <p className="text-gray-400 text-sm">
                        {isComplete
                            ? "All section controls have been addressed."
                            : `${totalControls - answeredCount} controls remaining in this section.`}
                    </p>
                </div>
                <button
                    type="button"
                    disabled={!isComplete}
                    onClick={onComplete}
                    className={`
                        px-8 py-3 
                        rounded-lg font-medium 
                        border transition-all duration-200
                        ${isComplete
                            ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/25 cursor-pointer'
                            : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
                        }
                    `}
                >
                    Continue to Next Section
                </button>
            </div>
        </div>
    );
}
