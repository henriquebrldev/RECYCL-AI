# RECYCLAI

**AI-powered waste identification and disposal decision-support system.** From image to action.

## Problem
Waste is not always easy to sort. Materials are hard to identify, disposal rules are complex, wrong items contaminate recycling streams, and uncertainty reduces participation.

## Solution
Upload or take a photo → a multimodal AI identifies the object and material → RECYCLAI returns a category, recyclability, confidence estimate, practical disposal steps and environmental impact.

## Features
- Upload / camera capture (JPG, JPEG, PNG, WEBP), preview, drag & drop
- Real AI vision analysis via Groq (`qwen/qwen3.8-27b`)
- Structured JSON validated with zod on the server
- Unknown / low-confidence handling (< 50% → Unknown)
- Hazardous waste warnings (batteries, electronics)
- Error states: invalid file, too large, timeout, API error, invalid AI response
- Responsive, mobile-first UI

## How it works / Architecture
```
Browser → Frontend (src/routes/index.tsx) → POST /api/analyze (src/routes/api/analyze.ts)
        → Groq Vision API → JSON → validated (src/lib/waste.ts) → Frontend result card
```

## Technology
TanStack Start (React + Vite), Tailwind CSS, zod, Groq API. Note: built with TanStack Start instead of plain HTML/JS because it gives a single project with frontend + server route, so the API key never reaches the browser.

## Responsible AI
RECYCLAI is designed to minimize data collection and focus only on the waste object. AI classifications are estimates and local disposal rules should always be verified. The prompt forbids identifying people or inferring personal info, and forbids inventing municipal rules.

## Privacy
No database, no accounts, no image storage. Images are resized in the browser, sent once for analysis, and discarded.

## Local development
```bash
bun install        # or npm install
cp .env.example .env   # add your GROQ_API_KEY
bun run dev
```

## Environment variables
```
GROQ_API_KEY=your_api_key_here
```
Get a key at https://console.groq.com/keys. Never commit `.env`.

## Deployment
- Lovable: click **Publish** (key is stored in project secrets).
- Vercel: import the GitHub repo, add `GROQ_API_KEY` in Project Settings → Environment Variables. Vercel supports TanStack Start. This repository was generated with the Lovable TanStack/Vite configuration, so validate the Vercel build/runtime during the first deployment before using the production URL. Add `GROQ_API_KEY` as a Vercel Environment Variable; never commit `.env`.

## Limitations
- Confidence is a model self-estimate, not a calibrated probability.
- No location-specific rules (intentionally).
- Groq free-tier rate limits may apply.

## Future roadmap
- Phase 1: AI waste identification and disposal guidance ✅
- Phase 2: Recycling locations
- Phase 3: School education mode
- Phase 4: Environmental dashboard
- Phase 5: Community-scale waste intelligence
