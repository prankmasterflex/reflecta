import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface FixPlanRequest {
    industry: string;
    scopeNote: string;
    gaps: Array<{
        control_id: string;
        control_title: string;
        requirement: string;
        response: 'No' | 'Partial' | 'Unknown';
    }>;
}

const SYSTEM_PROMPT = "You are a CMMC Level 2 readiness assistant aligned to NIST SP 800-171. Your role is to transform assessment gaps into a practical, prioritized remediation checklist for a small defense contractor. Be clear, concrete, and action-oriented. Do not claim certification or audit outcomes. Do not request Controlled Unclassified Information (CUI). Output valid JSON only.";

export async function POST(req: NextRequest) {
    console.log('[FixPlanAPI] Request received');

    try {
        const body: FixPlanRequest = await req.json();
        console.log('[FixPlanAPI] Body parsed successfully');

        if (!body.gaps || !Array.isArray(body.gaps) || body.gaps.length === 0) {
            console.warn('[FixPlanAPI] Invalid gaps array');
            return NextResponse.json(
                { error: 'Invalid request: gaps array is required' },
                { status: 400 }
            );
        }

        // Check for API key
        if (!process.env.GEMINI_API_KEY) {
            console.error('[FixPlanAPI] GEMINI_API_KEY is not configured');
            return NextResponse.json(
                { error: 'Server configuration error: GEMINI_API_KEY is missing' },
                { status: 500 }
            );
        }
        console.log('[FixPlanAPI] API Key present');

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-001',
            systemInstruction: SYSTEM_PROMPT,
        });

        const userPrompt = `
Context:
Industry: ${body.industry}
Scope Note: ${body.scopeNote}

Assessment Gaps:
${JSON.stringify(body.gaps, null, 2)}

Request:
Generate a remediation plan in JSON format with the following structure:
{
  "readiness_summary": ["3 bullet points summarizing the overall state"],
  "top_priorities": [
    {
      "control_id": "string",
      "why_it_matters": "string",
      "what_to_do": ["specific action items"],
      "estimated_effort": "Low/Medium/High"
    }
  ] (limit to 10 items),
  "quick_wins_7_days": [
    "up to 5 specific tasks that can be done in a week"
  ],
  "audit_risk_notes": [
    "up to 5 notes starting with 'If missing, an assessor will likely...'"
  ]
}
`;

        console.log('[FixPlanAPI] Sending request to Gemini...');
        const result = await model.generateContent(userPrompt);

        const responseText = result.response.text();
        console.log('[FixPlanAPI] Received response from Gemini. Length:', responseText.length);

        // Clean up potential markdown formatting (```json ... ```)
        const cleanedText = responseText
            .replace(/^```json\s*/, '')
            .replace(/^```\s*/, '')
            .replace(/\s*```$/, '');

        try {
            const parsedJson = JSON.parse(cleanedText);
            console.log('[FixPlanAPI] JSON parsed successfully');
            return NextResponse.json(parsedJson);
        } catch (parseError) {
            console.error('[FixPlanAPI] Error parsing Gemini response:', parseError);
            console.error('[FixPlanAPI] Raw response:', responseText);
            return NextResponse.json(
                { error: 'Failed to parse remediation plan', raw_response: responseText },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error('[FixPlanAPI] Error generating fix plan:', error);
        console.error('[FixPlanAPI] Stack:', error?.stack);
        return NextResponse.json(
            { error: 'Internal server error', details: error?.message || String(error) },
            { status: 500 }
        );
    }
}
