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
        // 空行（段落）ごとにテキストをチャンク分割する
        const chunks = knowledgeText.split(/\n\s*\n/).map(c => c.trim()).filter(c => c.length > 0);
        console.log(`[RAG] Split knowledge into ${chunks.length} chunks.`);

        for (const chunk of chunks) {
            const embedding = await generateEmbedding(`passage: ${chunk}`);

            const { error } = await supabaseClient
                .from('company_knowledge')
                .insert({
                    text_content: chunk,
                    embedding: embedding
                });

            if (error) throw error;
        }

        console.log(`[KNOWLEDGE] Successfully saved ${chunks.length} vector chunks to Supabase.`);

    } catch (e) {
        console.error('[Knowledge Upsert Error]', e);
        throw e;
    }
};
