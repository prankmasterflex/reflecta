/**
 * Represents a single assessment gap identified in the CMMC assessment.
 * Matches the structure of the input gaps sent to the remediation API.
 */
export interface Gap {
    control_id: string;
    control_title: string;
    requirement: string;
    response: 'No' | 'Partial' | 'Unknown';
}

/**
 * Represents a single remediation priority item in the fix plan.
 * Contains the control ID, business justification, action items, and effort estimate.
 */
export interface Priority {
    control_id: string;
    why_it_matters: string;
    what_to_do: string[];
    estimated_effort: 'S' | 'M' | 'L';
}

/**
 * Represents the complete AI-generated remediation plan.
 * Structured to provide a summary, prioritized actions, quick wins, and risk notes.
 */
export interface FixPlan {
    readiness_summary: string[];
    top_priorities: Priority[];
    quick_wins_7_days: string[];
    audit_risk_notes: string[];
}

/**
 * Represents the request payload sent to the fix plan generation API.
 */
export interface FixPlanRequest {
    industry: string;
    scopeNote: string;
    gaps: Gap[];
}
