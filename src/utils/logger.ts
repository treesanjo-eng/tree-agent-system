import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function logInteraction(data: {
    user_id: string;
    platform: 'line' | 'telegram';
    user_query: string;
    ai_response: string;
    confidence: number;
    is_escalated: boolean;
    metadata?: any;
}) {
    try {
        console.log(`[Logger] Recording interaction for user ${data.user_id} on ${data.platform}`);
        const { error } = await supabase
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
