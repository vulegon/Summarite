# Summarite

GitHub と Jira のデータを統合し、開発チームの成果を週次・月次で可視化。AI による要約付きダッシュボードを提供するアプリケーション。

## 概要

### 対象ユーザー
- チームで活動量を把握したい開発者 / PM
- スプリント振り返りを効率化したいスクラムチーム

### 主な機能
- GitHub OAuth連携 → PR / Issue / レビュー数の取得
- Jira OAuth連携 → Issue状態の取得（Done / Created / In Progress / Stalled）
- 週次・月次メトリクス集計API
- AI要約生成（OpenAI または Claude）

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **データベース**: PostgreSQL (Supabase)
- **ORM**: Prisma 7
- **認証**: NextAuth.js
- **AI**: OpenAI / Anthropic Claude
- **スタイリング**: Tailwind CSS
- **デプロイ**: Vercel

## セットアップ

### 必要条件
- Node.js 20+
- PostgreSQL（またはSupabase）

### インストール

```bash
# 依存関係のインストール
npm install

# Prismaクライアント生成
npx prisma generate
```

### 環境変数の設定

`.env.example` を `.env` にコピーして、必要な値を設定してください。

```bash
cp .env.example .env
```

```env
# Database (Supabase)
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Jira OAuth (optional)
JIRA_CLIENT_ID="your-jira-client-id"
JIRA_CLIENT_SECRET="your-jira-client-secret"

# AI Provider
ANTHROPIC_API_KEY="your-anthropic-api-key"
# or
OPENAI_API_KEY="your-openai-api-key"

AI_PROVIDER="anthropic"  # or "openai"
```

### データベースのセットアップ

```bash
# マイグレーション実行（ローカル）
npx prisma migrate dev --name init
```

### スキーマ変更時の手順

1. `prisma/schema.prisma` を編集

2. マイグレーションファイルを作成
   ```bash
   npx prisma migrate dev --name 変更内容
   ```

3. 作成されたマイグレーションファイルをコミット
   ```bash
   git add prisma/migrations
   git commit -m "Add migration: 変更内容"
   ```

4. mainブランチにpush → Vercelでビルド時に `prisma migrate deploy` が自動実行され、本番DBに適用

## 開発

### 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開いてください。

### コマンド一覧

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | プロダクションビルド |
| `npm run start` | プロダクションサーバーを起動 |
| `npm run lint` | ESLintでコードをチェック |
| `npm run type-check` | TypeScript型チェック |

## API エンドポイント

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | `/api/summary/weekly` | 週次メトリクス + AI要約 |
| GET | `/api/summary/monthly` | 月次メトリクス + AI要約 |
| GET | `/api/connect/jira` | Jira OAuth連携 |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth認証 |

### レスポンス例

```json
{
  "github": {
    "prsOpened": 5,
    "prsMerged": 3,
    "reviews": 8,
    "issuesOpened": 2,
    "issuesClosed": 4
  },
  "jira": {
    "created": 6,
    "done": 4,
    "inProgress": 3,
    "stalled": 1
  },
  "summary": "AI generated summary...",
  "periodStart": "2024-01-01T00:00:00.000Z",
  "periodEnd": "2024-01-07T23:59:59.999Z",
  "periodType": "weekly"
}
```

## CI/CD

GitHub Actionsで以下のチェックが自動実行されます：

- **Type Check** (`type-check.yml`): TypeScript型チェック
- **Lint** (`lint.yml`): ESLintによるコードチェック

## プロジェクト構成

```
summarite/
├── .github/workflows/     # GitHub Actions
├── prisma/
│   └── schema.prisma      # データベーススキーマ
├── src/
│   ├── app/
│   │   ├── api/           # APIルート
│   │   ├── auth/          # 認証ページ
│   │   └── dashboard/     # ダッシュボード
│   ├── components/        # Reactコンポーネント
│   ├── lib/               # ユーティリティ
│   ├── services/          # ビジネスロジック
│   └── types/             # 型定義
└── docs/
    └── spec.md            # 仕様書
```

## ライセンス

MIT
