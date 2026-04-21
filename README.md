# My AI Stack

My AI Stack is a portfolio dashboard to compare personal API-access models and the best free chatbots anyone can use right now. It includes three sections: My API Stack (cards), Top Free Chatbots (ranked leaderboard), and Suggest (Gemini-powered top-2 recommendation). This MVP uses Next.js, Supabase, and Vercel with a fallback mode so the app still works without live keys.

## MVP Features

- Section 1 card grid for your accessible models (badges, speed dots, context, tags, source).
- Section 1 filter and sort controls (task, source, speed/context/name).
- Section 2 ranked #1-#10 chatbot leaderboard with links and free-tier metadata.
- Section 2 use-case filter (coding, research, long-context, no-signup).
- Section 3 suggest box calling `/api/suggest` to return top 2 picks with reasons.
- Recommendation highlights on matching cards across sections.
- Supabase schema migration + seed SQL for providers/models/chatbots.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase Postgres
- Google Gemini API (`gemini-3-flash` by default)
- Vercel deployment target

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment template:

```bash
copy .env.example .env.local
```

3. Fill `.env.local` values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (recommended for server-side reads)
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (optional, default `gemini-3-flash`)

4. Run development server:

```bash
npm run dev
```

## Supabase Setup

Run the migration SQL in `supabase/migrations/001_init_schema.sql`, then run seeds in order:

1. `supabase/seed/001_providers.sql`
2. `supabase/seed/002_models.sql`
3. `supabase/seed/003_chatbots.sql`

If Supabase is not configured, the app uses built-in seed data so UI still works.

## Verify

```bash
npm run lint
npm run build
```

## Deploy (Vercel)

1. Import repository in Vercel.
2. Add environment variables from `.env.local` to Vercel project settings.
3. Deploy and test `/` plus `/api/suggest`.
