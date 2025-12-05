# Project Name
Summarite

## Goal
GitHub と Jira のデータを統合し、開発チームの成果を週次・月次で可視化。
AI による要約付きダッシュボードを提供する。

## Target Users
- チームで活動量を把握したい開発者 / PM
- スプリント振り返りを効率化したいスクラムチーム

## Core Features (MVP)
1. GitHub OAuth連携 → PR / Issueの取得
2. Jira OAuth連携 → Issue状態の取得（Done / Created / Stalled）
3. Weekly / Monthly metrics集計API
4. AI要約生成（OpenAI or Claude）

## Tech Stack
- Next.js (App Router, API Routes)
- DB: Supabase
- Deploy: Vercel

## API Endpoints (initial)
GET  /api/summary/weekly   → GitHub+Jira集計+AI要約
GET  /api/summary/monthly  → 同上（月次）
POST /api/connect/github   → OAuth callback
POST /api/connect/jira     → OAuth callback

## Metrics to collect
GitHub: prs_opened, prs_merged, reviews, issues_opened, issues_closed  
Jira: created, done, in_progress, stalled

## Output Format Example
{
  "github": { ...metrics },
  "jira": { ...metrics },
  "summary": "AI generated text"
}

## Ask Claude
- このspecを元に詳細設計を補完し、改善提案を行ってください
- ER図 + Prisma Schema生成
- API Routesの実装スケルトン作成
- OAuthフロー設計補完
- /api/summary/weekly のコード雛形を提示
