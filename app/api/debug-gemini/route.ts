import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const key = process.env.GEMINI_API_KEY;
        if (!key) {
            return NextResponse.json({ error: 'API Key missing' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(key);
        // Sometimes listModels is on the class/client, sometimes on a manager.
        // For @google/generative-ai, it is usually via a model request or implicit?
        // Actually, the SDK has a 'getGenerativeModel' but for listing...
        // Wait, the SDK creates a 'GoogleGenerativeAI' instance.
        // Checking documentation memory: the SDK might not expose listModels directly on the main class in all versions.
        // However, we can try a simple generation with a known model to see if we get a specific error, or try to find a list method.
        // Actually, for the REST API it's GET /v1beta/models.
        // I will do a raw fetch to the Google API to list models using the key, bypassing the SDK wrapper if needed.

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        if (!response.ok) {
            const text = await response.text();
            return NextResponse.json({ error: 'Failed to list models', status: response.status, details: text }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
