const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testSDKConfig() {
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
    } catch (e) { }

    if (!API_KEY) { console.error('No Key'); return; }

    const genAI = new GoogleGenerativeAI(API_KEY);
    console.log('Testing gemini-2.0-flash-001 with systemInstruction...');

    try {
        // Mimic the exact route code
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-001',
            systemInstruction: 'You are a helpful assistant.',
        });

        const result = await model.generateContent('Hello');
        const response = await result.response;
        console.log('✅ Success! output:', response.text());
    } catch (error) {
        console.error('❌ Failed:', error.message);
        // Fallback test: Try without systemInstruction property
        console.log('--- Retrying without systemInstruction property ---');
        try {
            const model2 = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });
            const result2 = await model2.generateContent(['System: You are helpful.', 'Hello']);
            const response2 = await result2.response;
            console.log('✅ Fallback Success! output:', response2.text());
        } catch (err2) {
            console.error('❌ Fallback Failed:', err2.message);
        }
    }
}

testSDKConfig();
