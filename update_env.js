const fs = require('fs');
const { execSync } = require('child_process');

try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const match = env.match(/GEMINI_API_KEY=(.*)/);
    if (!match) throw new Error('Key not found');
    const key = match[1].trim().replace(/^["']|["']$/g, '');

    console.log('Removing old key...');
    try {
        execSync('npx vercel env rm GEMINI_API_KEY production -y', { stdio: 'inherit' });
    } catch (e) {
        console.log('Key might not exist or removal failed.');
    }

    console.log('Adding new key...');
    // Use simple echo for piping. Vercel CLI reads from stdin for the value.
    // Note: Vercel CLI v32+ supports `vercel env add NAME production <value>`? No, it's interactive.
    // We use `echo value | vercel env add ...`
    execSync(`echo ${key} | npx vercel env add GEMINI_API_KEY production`, { stdio: 'inherit' });

    console.log('✅ Key updated.');
} catch (e) {
    console.error('Script Failed:', e.message);
    process.exit(1);
}
