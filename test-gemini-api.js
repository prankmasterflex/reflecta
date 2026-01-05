const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
    // 1. Get API Key
    let API_KEY = '';
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const match = envContent.match(/GEMINI_API_KEY=(.*)/);
            if (match) {
                API_KEY = match[1].trim().replace(/^["']|["']$/g, '');
            }
        }
    } catch (e) {
        console.log('Warning: Could not read .env.local');
    }

    if (!API_KEY) {
        console.error('❌ ERROR: Could not find GEMINI_API_KEY in .env.local');
        process.exit(1);
    }

    console.log(`Testing Gemini API key (length: ${API_KEY.length})...`);
    console.log('Model: gemini-1.5-flash');

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const result = await model.generateContent('Say hello.');
        const response = await result.response;
        const text = response.text();
        console.log('✅ SUCCESS!');
        console.log('Response:', text);

    } catch (error) {
        console.error('❌ ERROR FAILED:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('StatusText:', error.response.statusText);
        }
    }
}

testGeminiAPI();
