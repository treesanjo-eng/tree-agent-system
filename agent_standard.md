# エージェント標準テンプレート指針 (Next-Gen AI Agent Template)

## 1. 原則（The Principles）

1. **Self-Contained (自己完結性)**
   - 1つのエージェントは1つのディレクトリに収まり、単独でデプロイ可能であること。
   
2. **Standardized Directory Structure (標準化された構造)**
   - 共通のディレクトリ構造（Core, Interfaces, Config）に従うことで、生成エージェントが「どこに何を書くべきか」を事前学習あるいはプロンプトで容易に理解できる。
   
3. **Environment Isolation (環境の分離)**
   - 全ての設定を `.env` と `config/` で行い、実行コード内にハードコードを行わない。

## 2. ディレクトリ構造テンプレート

```text
/
├── .env.example        # 必要な環境変数の宣言
├── tsconfig.json       # ビルド定義 (src/ -> dist/)
├── architecture_logic.md # 設計思想
├── agent_standard.md   # 生成エージェント向け規約
└── src/
    ├── config/         # 環境設定・共通定数
    ├── core/           # 主要ロジック
    ├── interfaces/     # Slack Boltなどの通信口
    └── index.ts        # エントリポイント
```

## 3. 実装規約（Coding Conventions）

- **TypeScriptの厳格運用**: 生成コードのバグを最小限にするため、Anyの使用を禁止。
- **Modular Dependency**: CoreはInterfaceを知らず、InterfaceのみがCoreを利用する依存関係に保つ。
- **READMEの自動生成**: 生成されたエージェントは、必ず「自分は何者か」を記したドキュメントを伴うこと。
