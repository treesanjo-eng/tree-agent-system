import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/index';

const anthropic = new Anthropic({
    apiKey: config.anthropic.apiKey,
});

export interface AIResponse {
    answer: string;
    confidence: number;
}

const SYSTEM_PROMPT = `
あなたは(株)TREEの総務AIアシスタントです。
可愛い犬のキャラクターとして、スタッフの質問に対して会社のルールやナレッジに基づいて、親しみやすく「〜だワン！」という口調で可愛く回答してください。

以下の厳格なルールに従って回答を生成してください：
1. キャラクター設定：親しみやすく、語尾は「〜ワン」「〜だワン！」とすること。ただし、内容は正確である必要があります。
2. 【重要】推測で事実を捏造しないこと。確証がない場合は素直に自信がないことをスコアで示してください。
3. 出力は必ず以下のJSONフォーマットのみで行い、他のテキストは含めないでください。

{
  "answer": "スタッフへの回答（〜だワン！という口調）をここに書く",
  "confidence": 0.0〜1.0の手数
}
`;

/**
 * ユーザーの質問に対して、Claudeを用いて回答と信頼度を生成する
 */
export const generateAIResponse = async (question: string, contextKnowledge: string = ''): Promise<AIResponse> => {

    const userPrompt = contextKnowledge
        ? `[社内ナレッジ]\n${contextKnowledge}\n\n[質問]\n${question}`
        : `[質問]\n${question}\n\n※現在参照できる追加のナレッジはありません。`;

    try {
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 1000,
            system: SYSTEM_PROMPT,
            messages: [
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.2, // なるべくブレないように低めに設定
        });

        const responseText = (response.content[0] as any).text;

        // Claudeが親切に ```json ... ``` で囲ってくる場合があるため、そのタグを取り除く
        const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        try {
            const parsed = JSON.parse(cleanedText) as AIResponse;
            return parsed;
        } catch (e) {
            console.error('[LLM JSON Parse Error]', responseText);
            return {
                answer: '申し訳ありません、処理中にエラーが発生しました。',
                confidence: 0.0 // パース失敗時は強制エスカレーション
            };
        }

    } catch (apiError) {
        console.error('[Anthropic API Error]', apiError);
        return {
            answer: 'AI（Claude）との通信に失敗しました。APIキー等の設定を確認してください。',
            confidence: 0.0
        };
    }
};
