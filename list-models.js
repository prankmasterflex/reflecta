const fs = require('fs');
const path = require('path');

async function listModels() {
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

    if (!API_KEY) {
        console.error('No Key Found');
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

    try {
        const resp = await fetch(url);
        const data = await resp.json();
        console.log('--- MODELS START ---');
        if (data.models) {
            data.models.forEach(m => {
                if (m.name.includes('gemini') && m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(m.name.replace('models/', ''));
                }
            });
        }
        console.log('--- MODELS END ---');
    } catch (err) {
        console.error(err);
    }
}

listModels();
