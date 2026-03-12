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

/**
 * ユーザーの直近の会話履歴を取得する
 * (聞き返し・深掘りの文脈をLLMに伝えるために使用)
 */
export async function getRecentInteractions(userId: string, limit: number = 3): Promise<any[]> {
    if (!supabaseClient) return [];
    
    try {
        const { data, error } = await supabaseClient
            .from('interaction_logs')
            .select('user_query, ai_response, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);
            
        if (error) {
            console.error('[Logger] Failed to fetch recent interactions:', error);
            return [];
        }
        
        // 過去のものから順に並び替え（APIに渡すため）
        return (data || []).reverse();
    } catch (e) {
        console.error('[Logger] Critical error fetching history:', e);
        return [];
    }
}
