import { supabaseClient } from '../mcp/supabase';

export async function logInteraction(data: {
    user_id: string;
    platform: 'line' | 'telegram';
    user_query: string;
    ai_response: string;
    confidence: number;
    is_escalated: boolean;
    metadata?: any;
}) {
    // Supabaseが未設定の場合は何もしない（メイン処理に影響させない）
    if (!supabaseClient) {
        console.warn('[Logger] Supabase is not configured. Skipping interaction log.');
        return;
    }

    try {
        console.log(`[Logger] Recording interaction for user ${data.user_id} on ${data.platform}`);
        const { error } = await supabaseClient
            .from('interaction_logs')
            .insert([data]);

        if (error) {
            console.error('[Logger] Failed to save interaction log:', error);
        } else {
            console.log('[Logger] Interaction log saved successfully.');
        }
    } catch (e) {
        console.error('[Logger] Critical error in logging:', e);
    }
}

