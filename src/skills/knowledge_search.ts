import { supabaseClient } from '../mcp/supabase';

/**
 * ナレッジ検索（テキスト検索版）
 * ベクトル検索の代わりにPostgreSQLのテキスト検索を使用。
 * Railwayのメモリ制限(1GB)では埋め込みモデルが動作しないため、
 * シンプルかつ確実なILIKE検索に切り替えました。
 */
export const searchKnowledge = async (query: string): Promise<string> => {
    if (!supabaseClient) {
        console.warn('[RAG] Supabase is not configured. Skipping knowledge search.');
        return '';
    }

    try {
        console.log(`[RAG] Searching knowledge for: "${query}"...`);

        // 日本語の質問から重要なキーワードを抽出する
        const keywords = extractJapaneseKeywords(query);

        console.log(`[RAG] Extracted keywords: ${JSON.stringify(keywords)}`);

        if (keywords.length === 0) {
            console.log('[RAG] No keywords extracted. Using full query.');
            keywords.push(query.substring(0, 10));
        }

        // 各キーワードで個別にILIKE検索し、結果をマージ
        const allResults: { text_content: string; match_count: number }[] = [];
        const seenTexts = new Set<string>();

        for (const keyword of keywords) {
            if (keyword.length < 1) continue;

            const { data, error } = await supabaseClient
                .from('company_knowledge')
                .select('text_content')
                .ilike('text_content', `%${keyword}%`)
                .limit(10);

            if (error) {
                console.error(`[RAG] Search error for keyword "${keyword}":`, error);
                continue;
            }

            console.log(`[RAG] Keyword "${keyword}" matched ${data?.length || 0} records.`);

            if (data) {
                for (const row of data) {
                    if (!seenTexts.has(row.text_content)) {
                        seenTexts.add(row.text_content);
                        allResults.push({ text_content: row.text_content, match_count: 1 });
                    } else {
                        const existing = allResults.find(r => r.text_content === row.text_content);
                        if (existing) existing.match_count++;
                    }
                }
            }
        }

        // マッチ数が多い順にソート
        allResults.sort((a, b) => b.match_count - a.match_count);

        // 上位8件を取得（複数セクションにまたがるマニュアルに対応）
        const topResults = allResults.slice(0, 8);

        console.log(`[RAG] Total unique results: ${topResults.length}`);

        if (topResults.length === 0) {
            return '';
        }

        let combinedKnowledge = '';
        for (const result of topResults) {
            combinedKnowledge += `\n--- [ナレッジソース] ---\n${result.text_content}\n`;
        }

        return combinedKnowledge;

    } catch (e) {
        console.error('[Knowledge Search Error]', e);
        return '';
    }
};

/**
 * 日本語テキストからキーワードを抽出する。
 * 形態素解析ライブラリを使わず、パターンベースで分割する。
 */
function extractJapaneseKeywords(query: string): string[] {
    // Step 1: 記号を除去
    let cleaned = query.replace(/[？?！!。、,.・「」『』（）\(\)\s～〜]+/g, '');

    // Step 2: 一般的な助詞・助動詞・疑問詞パターンで分割
    const splitPatterns = [
        'について', 'ください', 'してほしい', 'を教えて', 'を教え',
        'って何', 'とは何', 'はいつ', 'はどこ', 'はなに', 'はどう',
        'したい', 'すべき', 'ですか', 'ますか', '教えて', 'ほしい',
        'だワン', 'ワン', 'けばいいの', 'ればいいの', 'たらいいの',
        'ってどう', 'やるの', 'って',
    ];
    for (const pattern of splitPatterns) {
        cleaned = cleaned.split(pattern).join('|');
    }

    // Step 3: 助詞・疑問詞・語尾で分割
    cleaned = cleaned.replace(/(の|は|が|を|に|で|と|も|へ|か|や|な|だ|よ|ね|さ|ぞ|何|どの|どんな)/g, '|');

    // Step 4: 分割して空文字を除外（漢字1文字でも有効なキーワードとして扱う）
    const keywords = cleaned
        .split('|')
        .map(w => w.trim())
        .filter(w => w.length >= 2 || (w.length === 1 && /[\u4E00-\u9FFF]/.test(w)));

    return [...new Set(keywords)]; // 重複を除去
}
