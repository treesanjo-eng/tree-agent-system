import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(__dirname, '../../logs');
const AUDIT_LOG_FILE = path.join(LOG_DIR, 'audit.log');

/**
 * 破壊的コマンドや重要な状態変更をログに記録する（監査用）
 * @param action 実行されたアクションの概要 (例: 'FILE_DELETE', 'KNOWLEDGE_UPDATE')
 * @param details 詳細情報
 * @param actor 実行者 (例: 'AI', 'CEO', 'System')
 */
export const logAudit = (action: string, details: string | object, actor: string = 'AI') => {
    // ログディレクトリが存在しない場合は作成
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString();
    const detailsStr = typeof details === 'string' ? details : JSON.stringify(details);
    const logEntry = `[${timestamp}] [ACTOR: ${actor}] [ACTION: ${action}] - ${detailsStr}\n`;

    fs.appendFileSync(AUDIT_LOG_FILE, logEntry, 'utf8');

    // コンソールにも併用して出力 (オプション)
    console.log(`[AUDIT] ${action} by ${actor}`);
};
