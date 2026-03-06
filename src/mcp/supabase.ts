import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index';

// Supabase Client instance
// Note: It is safe to build the client and only export it, provided the URL and Key exist.
// If they are missing, it might throw an error or warn. Railway will inject these.
export const supabaseClient = config.supabase.url && config.supabase.anonKey
    ? createClient(config.supabase.url, config.supabase.anonKey)
    : null;

/**
 * Example function showing how to log to Supabase if auditing is configured to use DB
 */
export const insertAuditLogToSupabase = async (action: string, details: string, actor: string) => {
    if (!supabaseClient) {
        console.warn('Supabase is not configured. Audit log falling back to local file.');
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('audit_logs')
            .insert([
                { action, details, actor, created_at: new Date().toISOString() }
            ]);

        if (error) {
            console.error('Failed to insert audit log to Supabase:', error);
        }
    } catch (err) {
        console.error('Supabase exception during insert:', err);
    }
};
