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
2. 【重要】推測で事実を捏造しないこと。確証がない場合（回答が全く見つからず、質問もできない場合）は素直に自信がないことをスコアで示してください（0.7未満に設定）。
3. 【重要: 自主的な聞き返しと深掘りについて（エスカレーション防止）】
   - ①表現のズレ（例: ユーザーが「開店準備」と聞き、ナレッジに「開店作業」しかない場合）: 少し表現が異なるが意味が同じ可能性が高い場合は「わからない」と諦めず、「〇〇については見つからなかったけど、もしかして△△のことだワン？」とユーザーに聞き返してください。
   - ②条件の絞り込み（例: ユーザーが「開店作業を教えて」と聞き、ナレッジに「カフェ」「ホール」「キッチン」と複数ある場合）: 全ての情報を長々と答えるのではなく、概要だけ伝えた上で「ちなみにカフェ、ホール、キッチンのどれについて詳しく知りたいワン？」と深掘りの質問をしてください。
   - ※上記のように「ユーザーに聞き返す」または「絞り込みの質問をする」場合は、システムが正常に会話を進行している状態なので、confidenceスコアを 0.9 以上（できれば1.0）に設定してください。
4. 提供された[社内ナレッジ]の情報を元に完全な回答をした場合は、必ず回答の末尾に「📚 参考: [コンテキスト名]」のように、どの情報を参考にしたかを明記すること。（質問で聞き返すだけの場合は不要）
5. 出力は必ず以下のJSONフォーマットのみで行い、他のテキストは含めないでください。

{
  "answer": "スタッフへの回答（聞き返しや深掘りの質問もここに入れる）",
  "confidence": 0.0〜1.0の数値
}
`;

/**
 * ユーザーの質問に対して、Claudeを用いて回答と信頼度を生成する
 */
export const generateAIResponse = async (question: string, contextKnowledge: string = '', history: any[] = []): Promise<AIResponse> => {

    let historyText = '';
    if (history.length > 0) {
        historyText = '[直近の会話履歴]\n';
        history.forEach(log => {
            historyText += `User: ${log.user_query}\nAI: ${log.ai_response}\n`;
        });
        historyText += '\n';
    }

    const userPrompt = historyText + (contextKnowledge
        ? `[社内ナレッジ]\n${contextKnowledge}\n\n[現在の質問]\n${question}`
        : `[現在の質問]\n${question}\n\n※現在参照できる追加のナレッジはありません。`);


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

        // Claudeが説明文などを混ぜてきた場合でもJSONを取り出せるようにする
        let cleanedText = responseText;
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            cleanedText = jsonMatch[0];
        } else {
            cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        }

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
