// lib/scoring.ts

import { ResponseValue, Gap, ReadinessSummary } from '@/types/scoring';
import { Control } from '@/components/assessment/controlsData';

/**
 * Convert a response value to a numeric score
 * Yes = 1.0, Partial = 0.5, No/Unknown = 0, Not Applicable = 0 (excluded from calculation)
 */
export function calculateScore(response: ResponseValue): number {
    switch (response) {
        case 'Yes':
            return 1.0;
        case 'Partial':
            return 0.5;
        case 'No':
        case 'Unknown':
            return 0;
        case 'Not Applicable':
            return 0; // Excluded from denominator in calculateReadiness
        default:
            return 0;
    }
}

/**
 * Determine if a response represents a gap
 * Gaps are: No, Partial, or Unknown
 */
export function isGap(response: ResponseValue): boolean {
    return response === 'No' || response === 'Partial' || response === 'Unknown';
}

/**
 * Get severity level for a gap
 * No = critical, Partial = moderate, Unknown = low
 */
export function getGapSeverity(response: ResponseValue): 'critical' | 'moderate' | 'low' {
    switch (response) {
        case 'No':
            return 'critical';
        case 'Partial':
            return 'moderate';
        case 'Unknown':
            return 'low';
        default:
            return 'low';
    }
}

/**
 * Calculate complete readiness summary from controls and responses
 * @param controls - Array of all controls being assessed
 * @param responses - Map of controlId to response value
 * @returns ReadinessSummary with score, counts, and sorted gaps
 */
export function calculateReadiness(
    controls: Control[],
    responses: Map<string, ResponseValue>
): ReadinessSummary {
    let totalScore = 0;
    let applicableCount = 0;
    let fullyMetCount = 0;
    const gaps: Gap[] = [];

    controls.forEach((control) => {
        const response = responses.get(control.id) || 'Unknown';

        // Skip Not Applicable controls from calculation
        if (response === 'Not Applicable') {
            return;
        }

        applicableCount++;
        const score = calculateScore(response);
        totalScore += score;

        if (score === 1.0) {
            fullyMetCount++;
        }

        if (isGap(response)) {
            gaps.push({
                controlId: control.id,
                title: control.title,
                response,
                severity: getGapSeverity(response),
            });
        }
    });

    // Sort gaps by severity: critical -> moderate -> low
    gaps.sort((a, b) => {
        const severityOrder = { critical: 0, moderate: 1, low: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
    });

    // Calculate readiness percentage, round to nearest whole number
    const readinessPercent = applicableCount > 0
        ? Math.round((totalScore / applicableCount) * 100)
        : 0;

    return {
        readinessPercent,
        totalControls: controls.length,
        applicableControls: applicableCount,
        gapCount: gaps.length,
        fullyMetCount,
        gaps,
    };
}
