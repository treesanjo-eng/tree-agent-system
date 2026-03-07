-- 会話ログを保存するテーブルを作成
CREATE TABLE IF NOT EXISTS interaction_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    user_id TEXT, -- LINEやTelegramのユーザーID
    platform TEXT, -- 'line' または 'telegram'
    user_query TEXT, -- ユーザーからの質問
    ai_response TEXT, -- AIの回答
    confidence FLOAT, -- AIの自信度
    is_escalated BOOLEAN DEFAULT false, -- エスカレーションされたかどうか
    metadata JSONB -- その他の予備情報
);

-- インデックス作成（検索を速くするため）
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON interaction_logs (created_at DESC);
