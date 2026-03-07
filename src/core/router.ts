import { StandardMessage } from '../interfaces/index';
import { executeConfidenceHook } from '../hooks/confidence_check';
import { sendLineReply } from '../mcp/line';
import { generateAIResponse } from './llm';
import { searchKnowledge } from '../skills/knowledge_search';

/**
 * Core routing logic for incoming messages from all platforms (LINE, Notion, etc.)
 * Routes the message to the "Brain" and decides whether to respond directly or escalate
 */
export const processStandardMessage = async (msg: StandardMessage) => {
    console.log(`[ROUTER] Received message from ${msg.source}: ${msg.text}`);

    // (フェーズ3-3) ナレッジベースから社内ルールを検索して文脈として取り出します。
    const contextKnowledge = await searchKnowledge(msg.text);

    console.log(`[ROUTER] 🧠 Asking Claude-4.6-Sonnet...`);
    const aiResponse = await generateAIResponse(msg.text, contextKnowledge);
    console.log(`[ROUTER] Claude Response Confidence: ${aiResponse.confidence}`);

    // 1. 信頼度フックを実行し、CEOへのエスカレーション要否を判断
    const isSafeToSend = await executeConfidenceHook(msg.text, aiResponse.answer, aiResponse.confidence);

    // 2. もしAIが自信を持っており(0.8以上)、かつLINEからの問い合わせであれば直接返答する
    if (isSafeToSend && msg.replyToken && msg.source === 'line') {
        console.log(`[ROUTER] Confidence high. Replying directly to user.`);
        await sendLineReply(msg.replyToken, aiResponse.answer);
    }
    // 3. 自信がなくエスカレーションされた場合、ユーザーには「確認中」の旨を伝える
    else if (!isSafeToSend && msg.replyToken && msg.source === 'line') {
        console.log(`[ROUTER] Confidence low. Escalated to Telegram. Sending hold message to user.`);
        await sendLineReply(msg.replyToken, `申し訳ありません。まだ私には判断ができない質問です🙇‍♂️\nこの質問は中川代表か社員の方に問い合わせてください。ただ数日後、私は成長しているかもしれないので次は答えれるかもです！\n\n[現在考えられている回答案]\n${aiResponse.answer}`);
    }
};
