# Eunice Beauty Salon

Vite + React marketing site with optional Express API for Square deposits (run the API separately in production).

## Local development

```bash
npm install
npm run dev
```

- Site: http://localhost:5173  
- API: http://localhost:3001 (proxied as `/api` in dev)

Copy `.env.example` to `.env` and fill in values for booking tests.

## Deploy frontend on Vercel

1. Push this repo to GitHub.
2. In [Vercel](https://vercel.com) → **Add New Project** → import the repo.
3. Vercel should pick up `vercel.json` (build: `npm run build:client`, output: `dist`).
4. Add **Environment Variable**: `VITE_API_BASE` = your deployed API origin, e.g. `https://api.yourdomain.com` (no trailing slash).
5. Redeploy after adding env vars.

Client-side routes (`/book`, `/book/success`) are handled via SPA rewrites in `vercel.json`.

## Booking API (not on Vercel serverless by default)

The API uses **Express** and **SQLite**. Host it on a small Node host (Railway, Render, Fly.io, VPS), then:

- Set `CORS_ORIGIN` to your Vercel URL (and `http://localhost:5173` for local dev).
- Set Square and `DATABASE_PATH` (or use the default `data/` path on the host).

## License

Private / all rights reserved unless otherwise stated by the owner.
