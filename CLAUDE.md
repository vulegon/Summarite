# CLAUDE.md

このファイルはClaude Codeがこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト概要

Summariteは、GitHubとJiraのデータを統合し、開発チームの成果を週次・月次で可視化するダッシュボードアプリケーションです。AIによる要約機能を提供します。

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **データベース**: PostgreSQL (Supabase)
- **ORM**: Prisma 7
- **認証**: NextAuth.js
- **AI**: OpenAI / Anthropic Claude
- **スタイリング**: Tailwind CSS

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 型チェック
npm run type-check

# Lint
npm run lint

# Prismaクライアント生成
npx prisma generate

# マイグレーション
npx prisma migrate dev
```

## プロジェクト構造

```
src/
├── app/                  # Next.js App Router
│   ├── api/              # APIルート
│   │   ├── auth/         # NextAuth認証
│   │   ├── connect/      # OAuth連携（Jira）
│   │   └── summary/      # メトリクス集計API
│   ├── auth/             # 認証ページ
│   └── dashboard/        # ダッシュボードページ
├── components/           # Reactコンポーネント
├── lib/                  # ユーティリティ・設定
│   ├── auth.ts           # NextAuth設定
│   ├── prisma.ts         # Prismaクライアント
│   └── period.ts         # 期間計算
├── services/             # ビジネスロジック
│   ├── ai.ts             # AI要約生成
│   ├── github.ts         # GitHub API
│   └── jira.ts           # Jira API
└── types/                # 型定義
```

## コーディング規約

- ESLint: `eslint-config-next/core-web-vitals` と `eslint-config-next/typescript` を使用
- コードを変更した後は `npm run type-check` と `npm run lint` でエラーがないことを確認
- Prismaスキーマを変更した場合は `npx prisma generate` を実行
- **index.tsによるbarrel exportは使用しない** - 各モジュールは直接インポートする
  - Good: `import { GoogleIcon } from "@/components/icons/GoogleIcon"`
  - Bad: `import { GoogleIcon } from "@/components/icons"`

## 環境変数

必要な環境変数は `.env.example` を参照してください。主な変数：

- `DATABASE_URL`: PostgreSQL接続文字列
- `NEXTAUTH_SECRET`: NextAuth用シークレット
- `GITHUB_CLIENT_ID/SECRET`: GitHub OAuth
- `JIRA_CLIENT_ID/SECRET`: Jira OAuth（任意）
- `ANTHROPIC_API_KEY` または `OPENAI_API_KEY`: AI API
- `AI_PROVIDER`: 使用するAIプロバイダー（"anthropic" または "openai"）

## API設計

### メトリクス取得
- `GET /api/summary/weekly?weeksAgo=0` - 週次メトリクス
- `GET /api/summary/monthly?monthsAgo=0` - 月次メトリクス

### レスポンス形式
```typescript
interface SummaryResponse {
  github: GithubMetrics;
  jira: JiraMetrics;
  summary: string;
  periodStart: string;
  periodEnd: string;
  periodType: "weekly" | "monthly";
}
```

## CI/CD

GitHub Actionsで以下のチェックが実行されます：
- `type-check.yml`: TypeScript型チェック
- `lint.yml`: ESLint
