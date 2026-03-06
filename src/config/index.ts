import 'dotenv/config';

export const config = {
    telegram: {
        botToken: process.env.TELEGRAM_BOT_TOKEN || '',
        ceoChatId: process.env.TELEGRAM_CEO_CHAT_ID || '', // TBD by CEO
    },
    line: {
        channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
        channelSecret: process.env.LINE_CHANNEL_SECRET || '',
    },
    notion: {
        botToken: process.env.NOTION_BOT_TOKEN || '',
        databaseId: process.env.NOTION_DATABASE_ID || '',
    },
    supabase: {
        url: process.env.SUPABASE_URL || '',
        anonKey: process.env.SUPABASE_ANON_KEY || '',
    },
    anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY || '',
    },
    app: {
        port: parseInt(process.env.PORT || '3000', 10),
    },
};
