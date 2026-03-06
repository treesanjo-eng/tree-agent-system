import { logAudit } from '../utils/audit_logger';

/**
 * 外部（LINEやNotionなど）に送信するメッセージの中に、
 * 機密情報（口座番号、クレカ番号、マイナンバーなど）が含まれていないか検証・サニタイズするフック
 */
export const sanitizeOutboundMessage = (message: string): { isSafe: boolean; sanitizedMessage: string } => {
    let sanitized = message;
    let isSafe = true;

    // 基本的な日本のクレカ番号パターンの検知 (例: 1234-5678-9012-3456)
    const creditCardRegex = /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})\b/g;

    // マイナンバーパターンの検知 (12桁)
    const myNumberRegex = /\b\d{12}\b/g;

    // もしクレジットカードらしきものがあればマスクする
    if (creditCardRegex.test(sanitized)) {
        sanitized = sanitized.replace(creditCardRegex, '****-****-****-****');
        isSafe = false;
        logAudit('SECURITY_ALERT', 'Potential Credit Card number detected and masked in outbound message.');
    }

    // もしマイナンバーらしきものがあればマスクする
    if (myNumberRegex.test(sanitized)) {
        sanitized = sanitized.replace(myNumberRegex, '****-****-****');
        isSafe = false;
        logAudit('SECURITY_ALERT', 'Potential MyNumber detected and masked in outbound message.');
    }

    return {
        isSafe,
        sanitizedMessage: sanitized
    };
};
