// types/scoring.ts

export type ResponseValue = 'Yes' | 'Partial' | 'No' | 'Unknown' | 'Not Applicable';

export interface Gap {
    controlId: string;
    title: string;
    response: ResponseValue;
    severity: 'critical' | 'moderate' | 'low';
}

export interface ReadinessSummary {
    readinessPercent: number;
    totalControls: number;
    applicableControls: number;
    gapCount: number;
    fullyMetCount: number;
    gaps: Gap[];
}
