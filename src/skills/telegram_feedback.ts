import { sendTelegramMessage, telegramBot } from '../mcp/telegram';
import { config } from '../config/index';
import { upsertKnowledge } from './knowledge_upsert';

/**
 * Escalate a question or uncertain response to the CEO
 */
export const escalateToCEO = async (questionContext: string, proposedAnswer?: string) => {
    const message = `
🚨 **エスカレーション通知 (TREE総務AI)** 🚨
**質問/コンテキスト:**
${questionContext}

${proposedAnswer ? `**AIが考えた回答案 (自信なし):**\n${proposedAnswer}\n` : ''}
---
中川代表、こちらの質問に対する正しい回答、またはAIへの指示をお願いいたします。
回答を直接送信するか、 \`/learn <内容>\` 形式でお教えください。
`;
    await sendTelegramMessage(config.telegram.ceoChatId, message);
};

/**
 * Binds the Telegram bot commands to learn from the CEO
 */
export const bindCEOCommands = () => {

    // セキュリティ強化：代表の中川氏以外からのアクセスは全て遮断するミドルウェア
    telegramBot.use((ctx, next) => {
        if (String(ctx.chat?.id) !== config.telegram.ceoChatId) {
            console.warn(`[SECURITY] Unauthorized Telegram access attempt from Chat ID: ${ctx.chat?.id}`);
            // オプション: ここで auditLgger.ts を呼び出して記録することも可能
            return; // next() を呼ばないことで以降の処理をブロック
        }
        return next();
    });

    // Basic approval command
    telegramBot.command('approve', (ctx) => {
        ctx.reply('✅ AIの回答案を承認しました。ユーザーに返答します。');
        // Logic to release the held message to the user would go here
    });

    // Learn command to ingest new knowledge
    telegramBot.command('learn', async (ctx) => {
        const text = ctx.message.text.replace('/learn', '').trim();
        if (!text) {
            ctx.reply('⚠️ 学習内容が空です。例: /learn 就業規則の改定について...');
            return;
        }

        ctx.reply('🧠 ナレッジベースを更新・学習しています...');

        try {
            await upsertKnowledge(text);
            ctx.reply('✅ ナレッジの学習が完了しました！以降の質問からAIがこのルールを考慮します。');
        } catch (e) {
            console.error(e);
            ctx.reply('❌ 学習処理中にエラーが発生しました。');
        }
    });
};
