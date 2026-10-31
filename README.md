# pawmates-web

Web app for **Pawmates**, a pets-only social platform: where pets make friends, and so do their humans.

Next.js (App Router) + TypeScript + Tailwind CSS, talking directly to Supabase for data, auth, storage and real-time chat. The backend (migrations, RLS policies, functions) lives in [pawmates-backend](https://github.com/dharma-byte/pawmates-backend).

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the Supabase URL and publishable key
npm run dev                  # http://localhost:3000
```

For local development, run the backend's Supabase stack first (`npm start` in `pawmates-backend`), then `npm run seed:local` there for test accounts (password `Woof1234`, e.g. `you@pawmates.test`).

## Environments

| Environment | Git branch | Supabase project | Where |
|---|---|---|---|
| Local | any | local Docker stack | http://localhost:3000 |
| Preview | `dev` (and other branches) | `pawmates-dev` | Vercel preview URLs |
| Production | `main` | `pawmates-prod` | https://pawmates-web-phi.vercel.app |

Vercel holds the `NEXT_PUBLIC_*` variables per environment (type Config, not Secret). After a backend migration, run `npm run gen:types` against the local stack.

## Branches and releases

- `dev` is for testing; feature branches merge into `dev` first
- `main` deploys to production on Vercel
- Release the backend before the frontend, so the database has new migrations before the app uses them
