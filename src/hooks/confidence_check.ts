import { escalateToCEO } from '../skills/telegram_feedback';

/**
 * Checks the confidence score of an AI-generated answer.
 * If below the threshold, automatically escalates to the Telegram CEO bound port.
 */
export const executeConfidenceHook = async (
    question: string,
    proposedAnswer: string,
    confidenceScore: number
): Promise<boolean> => {

    const THRESHOLD = 0.7; // 70% confidence required (以前は0.8でしたが、少し緩和します)

    if (confidenceScore < THRESHOLD) {
        console.warn(`Confidence too low (${(confidenceScore * 100).toFixed(1)}%). Escalating to CEO...`);
        await escalateToCEO(question, proposedAnswer);
        return false; // Indicates answer should NOT be sent to the user yet
    }

    return true; // Safe to send
};
