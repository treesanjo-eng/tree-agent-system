import { config } from '../src/config/index';

async function main() {
    try {
        console.log("Checking available Anthropic models...");
        const res = await fetch('https://api.anthropic.com/v1/models', {
            headers: {
                'x-api-key': config.anthropic.apiKey,
                'anthropic-version': '2023-06-01'
            }
        });
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

main();
