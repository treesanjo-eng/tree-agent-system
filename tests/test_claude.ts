import { generateAIResponse } from '../src/core/llm';

async function test() {
    console.log("Testing Claude JSON output...");
    const res = await generateAIResponse("健康診断はいつですか？");
    console.log("Final Result:", res);
}

test();
