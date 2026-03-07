import { supabaseClient } from '../mcp/supabase';

/**
 * 代表からの /learn コマンドを受け取り、チャンキングしてSupabaseに保存します。
 * ベクトル埋め込みは不要（テキスト検索に切り替え済み）。
 */
export const upsertKnowledge = async (knowledgeText: string): Promise<void> => {
    if (!supabaseClient) {
        throw new Error('Supabase client is not configured.');
    }

    try {
        console.log(`[RAG] Processing new knowledge...`);
        // 空行（段落）ごとにテキストをチャンク分割する
        const rawChunks = knowledgeText.split(/\n\s*\n/).map(c => c.trim()).filter(c => c.length > 0);

        let currentH1 = '';
        let currentH2 = '';
        const contextualChunks: string[] = [];

        for (const chunk of rawChunks) {
            // 見出しの追跡
            if (chunk.startsWith('# ')) {
                currentH1 = chunk.split('\n')[0].replace('# ', '').trim();
                currentH2 = ''; // H1が変わったらH2をリセット
            } else if (chunk.startsWith('## ')) {
                currentH2 = chunk.split('\n')[0].replace('## ', '').trim();
            }

            // コンテキスト文字列の生成
            const contextParts = [];
            if (currentH1) contextParts.push(currentH1);
            if (currentH2) contextParts.push(currentH2);

            const contextPrefix = contextParts.join(' > ');
            const enrichedChunk = contextPrefix ? `[コンテキスト: ${contextPrefix}]\n${chunk}` : chunk;

            contextualChunks.push(enrichedChunk);
        }

        console.log(`[RAG] Split knowledge into ${contextualChunks.length} contextual chunks.`);

        for (const chunk of contextualChunks) {
            // ベクトル埋め込みなしでテキストのみ保存
            // embedding カラムはNULLableにしておく（既存データとの互換性維持）
            const { error } = await supabaseClient
                .from('company_knowledge')
                .insert({
                    text_content: chunk,
                });

            if (error) throw error;
        }

        console.log(`[KNOWLEDGE] Successfully saved ${contextualChunks.length} chunks to Supabase.`);

    } catch (e) {
        console.error('[Knowledge Upsert Error]', e);
        throw e;
    }
};
