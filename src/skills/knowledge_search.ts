import { supabaseClient } from '../mcp/supabase';
import { generateEmbedding } from '../utils/embeddings';

/**
 * 簡易版ナレッジ検索（ベクトルRAG版）
 * 質問文をベクトルに変換し、Supabaseの pgvector から上位3件の関連知識を取得します。
 */
export const searchKnowledge = async (query: string): Promise<string> => {
    if (!supabaseClient) {
        console.warn('[RAG] Supabase is not configured. Skipping knowledge search.');
        return '';
    }

    try {
        console.log(`[RAG] Generating embedding for query: "${query}"...`);
        const queryEmbedding = await generateEmbedding(`query: ${query}`);

        const { data: documents, error } = await supabaseClient
            .rpc('match_knowledge', {
                query_embedding: queryEmbedding,
                match_threshold: 0.75,
                match_count: 3
            });

        if (error) throw error;

        if (!documents || documents.length === 0) {
            return '';
        }

        let combinedKnowledge = '';
        for (const doc of documents) {
            combinedKnowledge += `\n--- [ナレッジソース (関連度: ${(doc.similarity * 100).toFixed(1)}%)] ---\n${doc.text_content}\n`;
        }

        return combinedKnowledge;

    } catch (e) {
        console.error('[Knowledge Search API/DB Error]', e);
        return '';
    }
};
