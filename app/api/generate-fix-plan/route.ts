import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || '',
});

interface Gap {
    control_id: string;
    control_title: string;
    requirement: string;
    response: 'No' | 'Partial' | 'Unknown';
}

interface RequestBody {
    industry: string;
    scopeNote: string;
    gaps: Gap[];
}

const SYSTEM_PROMPT = `You are a CMMC Level 2 readiness assistant aligned to NIST SP 800-171.
Your role is to transform assessment gaps into a practical, prioritized remediation checklist for a small defense contractor.

Be clear, concrete, and action-oriented.
Do not claim certification or audit outcomes.
Do not request Controlled Unclassified Information (CUI).
Output valid JSON only.`;

export async function POST(request: NextRequest) {
    try {
        const body: RequestBody = await request.json();
        const { industry, scopeNote, gaps } = body;

        // Validate input
        if (!gaps || gaps.length === 0) {
            return NextResponse.json(
                { error: 'No gaps provided' },
                { status: 400 }
            );
        }

        // Prepare gaps as JSON string
        const gapsJson = JSON.stringify(gaps, null, 2);

        // Construct user prompt
        const userPrompt = `Company context:
- Industry: ${industry}
- Notes on scope: ${scopeNote}

Assessment gaps:
${gapsJson}

Output JSON with:
1. readiness_summary: 3 bullet points
2. top_priorities: array of up to 10 items, each with:
   - control_id
   - why_it_matters (1 sentence)
   - what_to_do (array of 3–5 steps)
   - estimated_effort (S / M / L)
3. quick_wins_7_days: up to 5 items
4. audit_risk_notes: up to 5 items phrased as "If missing, an assessor will likely…"

Return ONLY valid JSON with no markdown formatting, no backticks, no preamble.`;

        // Call Groq API
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: SYSTEM_PROMPT,
                },
                {
                    role: 'user',
                    content: userPrompt,
                },
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.7,
            max_tokens: 2048,
        });

        const responseText = chatCompletion.choices[0]?.message?.content || '';

        // Parse JSON response
        let fixPlan;
        try {
            // Remove markdown code blocks if present
            const cleanedText = responseText
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();

            fixPlan = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Raw response:', responseText);
            return NextResponse.json(
                { error: 'Failed to parse AI response as JSON' },
                { status: 500 }
            );
        }

        // Validate response structure
        if (!fixPlan.readiness_summary || !fixPlan.top_priorities) {
            return NextResponse.json(
                { error: 'Invalid fix plan structure' },
                { status: 500 }
            );
        }

        return NextResponse.json(fixPlan);

    } catch (error: any) {
        console.error('Fix plan generation error:', error);

        // Log specific error details
        if (error.message) {
            console.error('Error message:', error.message);
        }

        return NextResponse.json(
            { error: 'Failed to generate fix plan' },
            { status: 500 }
        );
    }
}
