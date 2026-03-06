import { supabaseClient } from '../mcp/supabase';
import { generateEmbedding } from '../utils/embeddings';

/**
 * 代表からの /learn コマンドを受け取り、ベクトル化してSupabaseに保存します。
 */
export const upsertKnowledge = async (knowledgeText: string): Promise<void> => {
    if (!supabaseClient) {
        throw new Error('Supabase client is not configured.');
    }

    try {
        console.log(`[RAG] Embedding new knowledge...`);
        const embedding = await generateEmbedding(`passage: ${knowledgeText}`);

        const { error } = await supabaseClient
            .from('company_knowledge')
            .insert({
                text_content: knowledgeText,
                embedding: embedding
            });

        if (error) throw error;

        console.log(`[KNOWLEDGE] Successfully saved new vector rule to Supabase.`);

    } catch (e) {
        console.error('[Knowledge Upsert Error]', e);
        throw e;
    }
};
