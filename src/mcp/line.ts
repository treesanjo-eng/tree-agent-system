import { Client as LineClient, middleware as lineMiddleware } from '@line/bot-sdk';
import { config } from '../config/index';

// LINE Client instance
export const lineClient = new LineClient({
    channelAccessToken: config.line.channelAccessToken,
    channelSecret: config.line.channelSecret,
});

// Middleware for parsing LINE webhook events (used in Express apps typically)
export const lineWebhookMiddleware = lineMiddleware({
    channelAccessToken: config.line.channelAccessToken,
    channelSecret: config.line.channelSecret,
});

/**
 * Sends a reply message back to LINE
 * @param replyToken The reply token from the webhook event
 * @param message The text message to send
 */
export const sendLineReply = async (replyToken: string, message: string) => {
    try {
        await lineClient.replyMessage(replyToken, {
            type: 'text',
            text: message,
        });
    } catch (error) {
        console.error('Failed to send LINE reply:', error);
    }
};
