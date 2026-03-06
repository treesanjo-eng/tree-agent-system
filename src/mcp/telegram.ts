import { Telegraf } from 'telegraf';
import { config } from '../config/index';

// Telegram Bot instance
export const telegramBot = new Telegraf(config.telegram.botToken);

/**
 * Initializes the Telegram bot
 */
export const initTelegram = async () => {
    // Basic error handling
    telegramBot.catch((err, ctx) => {
        console.error(`Ooops, encountered an error for ${ctx.updateType}`, err);
    });

    // Start the bot using long-polling for now
    await telegramBot.launch();
    console.log('⚡️ Telegram Bot is running!');

    // Enable graceful stop
    process.once('SIGINT', () => telegramBot.stop('SIGINT'));
    process.once('SIGTERM', () => telegramBot.stop('SIGTERM'));
};

/**
 * Sends a message to a specific chat ID (e.g., the CEO's chat ID)
 * @param chatId The recipient's chat ID
 * @param message The message to send
 */
export const sendTelegramMessage = async (chatId: string | number, message: string) => {
    try {
        await telegramBot.telegram.sendMessage(chatId, message, {
            parse_mode: 'Markdown'
        });
    } catch (error) {
        console.error('Failed to send Telegram message:', error);
    }
};
