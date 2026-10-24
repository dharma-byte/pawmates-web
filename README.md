# pawmates-web

Web app for **Pawmates**, a pets-only social platform: where pets make friends, and so do their humans.

Next.js (App Router) + TypeScript + Tailwind CSS, talking directly to Supabase for data, auth, storage and real-time chat. The backend (migrations, RLS policies, functions) lives in [pawmates-backend](https://github.com/dharma-byte/pawmates-backend).

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the Supabase URL and anon key
npm run dev                  # http://localhost:3000
```

For local development, run the backend's Supabase stack first (`npm start` in `pawmates-backend`).

## Branches

- `main` deploys to production on Vercel
- `dev` is for testing; feature branches merge into `dev` first
