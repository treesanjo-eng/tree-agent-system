import express from 'express';
import { telegramBot } from '../mcp/telegram';
import { lineWebhookMiddleware } from '../mcp/line';
import { config } from '../config/index';
import { processStandardMessage } from '../core/router';

const app = express();

export interface StandardMessage {
    source: 'line' | 'notion' | 'telegram' | 'system';
    userId: string;
    text: string;
    replyToken?: string;
}

/**
 * Initializes the API routes for LINE webhooks and potentially Notion callbacks
 * (Railway Deployment Ready)
 */
export const initInterfaces = async () => {
    // Health check endpoint (Useful for Railway probes)
    app.get('/health', (req, res) => {
        res.status(200).send('OK');
    });

    // LINE Webhook route MUST come before express.json()
    app.post('/webhook/line', lineWebhookMiddleware, (req: express.Request, res: express.Response) => {
        Promise
            .all(req.body.events.map(handleLineEvent))
            .then((result) => res.json(result))
            .catch((err) => {
                console.error('[LINE Webhook Error]', err);
                res.status(500).end();
            });
    });

    // Basic body parser for non-LINE routes if we add them later
    app.use(express.json());

    // Default Error Handler
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.error('[Global Express Error]', err.stack);
        res.status(500).send('Something broke!');
    });

    app.listen(config.app.port, () => {
        console.log(`🌍 Interfaces Server listening on port ${config.app.port}`);
    });
};

/**
 * Normalizes LINE events into a StandardMessage for the core logic
 */
const handleLineEvent = async (event: any) => {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }

    const standardMessage: StandardMessage = {
        source: 'line',
        userId: event.source.userId,
        text: event.message.text,
        replyToken: event.replyToken,
    };

    // Pass standardMessage to the Core routing layer
    await processStandardMessage(standardMessage);

    return Promise.resolve(null);
};
