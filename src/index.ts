import { initInterfaces } from './interfaces/index';
import { bindCEOCommands } from './skills/telegram_feedback';
import { dailyReportService } from './core/daily_report';

/**
 * TREE総務AI「自律進化型アーキテクチャ」エントリポイント
 * LINE/Notion/Telegram の起動を管理する。
 */
const main = async () => {
    try {
        // 1. 各種インターフェース（APIサーバー）の起動
        await initInterfaces();

        // 2. Telegram Botのコマンドをバインドしてから起動する
        const { initTelegram } = await import('./mcp/telegram');
        bindCEOCommands();
        initTelegram(); // awaitしない（launchがブロックする可能性があるため）

        console.log('TREE Total Administration AI is now active! 🚀');
    } catch (error) {
        console.error('Initialization failed:', error);
        process.exit(1);
    }
};

main();
