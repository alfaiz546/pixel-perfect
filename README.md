# Digital Skill Passport

**Tagline:** Other job apps list what workers claim. We show what clients confirmed.

A mobile-first web application that helps skilled workers (carpenters, electricians, painters, plumbers, tailors, and other local service professionals) create a portable professional identity, record completed jobs, collect client confirmations, and share a trustworthy work history.

## Features

- **Voice-based profile creation** — one question at a time with Web Speech API; manual typing fallback
- **Worker dashboard** — profile, proof-of-work strip, explainable trust score, recent jobs
- **Add job** — records work as *pending* until client confirms
- **Client confirmation page** — no app install; confirm/reject, rate 1–5, optional note
- **Public passport** — QR code, shareable link, verified job history only
- **Job certificates** — based on backend verification data
- **Worker discovery** — search/filter by trade, area, trust score
- **Mock data mode** for local development; switch to real backend via env vars

## Tech stack

- React 19 + Vite + TypeScript
- Tailwind CSS v4
- React Router
- Web Speech API (recognition + synthesis)
- qrcode.react
- Lucide icons
- Fetch API

## Folder structure

```
src/
  components/     # Layout, ProofOfWorkStrip, TrustScoreCard, UI primitives
  pages/          # Landing, Create, Dashboard, AddJob, Confirm, Passport, Certificate, Find
  services/       # api.ts — centralized API + mock mode
  hooks/          # useSpeech (recognition + synthesis)
  data/           # mockData.ts — sample workers & jobs
  types/          # TypeScript interfaces
  App.tsx
  main.tsx
  index.css
```

## Quick start

```bash
cd digital-skill-passport
npm install
npm run dev
```

Open http://localhost:5173

## Environment

Copy `.env.example` to `.env`:

```
VITE_API_BASE_URL=http://localhost:3001
VITE_USE_MOCK=true
```

- `VITE_USE_MOCK=true` (default) — uses in-memory mock data. Never presents mock confirmations as genuine.
- Set `VITE_USE_MOCK=false` and point `VITE_API_BASE_URL` at your backend to use the real API.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing — explain product, language select, CTAs |
| `/create` | Voice/manual profile creation (one question at a time) |
| `/dashboard/:id` | Worker dashboard with stats & jobs |
| `/add-job/:workerId` | Add completed job (status: pending) |
| `/confirm/:jobId` | Client confirmation (mobile-friendly, no login) |
| `/passport/:publicId` | Public passport + QR |
| `/certificate/:jobId` | Verified job certificate |
| `/find` | Worker discovery / search |

## Trust score (prototype)

Displayed from backend (or mock calculation for demo). Weights:

| Factor | Weight |
|--------|--------|
| Average rating | 35% |
| Repeat-customer rate | 25% |
| On-time completion | 20% |
| Verified job volume | 10% |
| Account age & consistency | 10% |

Only verified jobs contribute. UI labels it as a prototype metric, not an independently validated quality measure. Frontend does not calculate a competing score when using the real backend.

## Backend API contract

Expected endpoints (adapt `src/services/api.ts` to final contract):

### POST /api/workers
Create worker profile.  
Body: `{ name, phone?, trade, experienceYears, skills[], serviceArea, city, isPublic, language }`  
Response: `Worker`

### GET /api/workers/:id
Response: `Worker`

### PATCH /api/workers/:id
Body: partial `Worker`  
Response: `Worker`

### POST /api/jobs
Create job (always starts as pending).  
Body: `{ workerId, title, workType, area, completionDate, description? }`  
Response: `Job` with `status: "pending"`

### GET /api/workers/:id/jobs
Response: `Job[]`

### GET /api/public/passport/:publicId
Response: `{ worker, stats, verifiedJobs }`

### POST /api/jobs/:id/confirmation
Body: `{ confirmed: boolean, rating?: 1-5, note?: string }`  
Response: updated `Job`

### GET /api/jobs/:id/certificate
Response: verified `Job` (or 404 if not verified)

### GET /api/workers/search
Query: `trade, city, area, minTrustScore, query`  
Response: `(Worker & { stats })[]`

### GET /api/workers/:id/trust-score
Response: `TrustScore`

### GET /api/jobs/:id
Response: `Job` (used by confirmation page)

## Security & accessibility notes

- No backend secrets or API keys in frontend code
- Phone numbers and exact addresses not published without consent
- Large touch targets, high-contrast text, accessible labels
- Microphone permission denied and unsupported browsers handled with type fallback
- Transcript editable before accepting speech input
- Never claims verification unless backend confirms

## Demo data

Five sample workers (carpenter, electrician, painter, plumber, tailor) with verified and pending jobs. Use `/find` or open e.g. `/passport/rajesh-carpenter-mumbai`.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run preview` — preview production build
