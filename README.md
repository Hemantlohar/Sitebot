# Sitebot - AI Website Bot Builder

AI Chatbot SaaS built with Next.js 16, Google Gemini API, Supabase pgvector, and an embeddable widget script for real-time customer support. A production-ready platform that allows users to generate, customize, and embed AI chatbots trained on their website content.

---

## Tech Stack & Architecture

- **Frontend & App Framework**: [Next.js](https://nextjs.org) (App Router, v16.2.9) with TypeScript & Tailwind CSS v4.
- **Authentication**: [Supabase Auth](https://supabase.com/auth) via `@supabase/ssr`.
- **Database & Vector Search**: Supabase PostgreSQL with [pgvector](https://github.com/pgvector/pgvector) extension.
- **Edge Routing & Route Protection**: Next.js Proxy convention (`proxy.ts`).
- **Rate Limiting & Cost Protection**: [Upstash Redis](https://upstash.com) with sliding window limits and in-memory fallback for local development.
- **AI & Embeddings**: Transitioning to official [Google Gemini API](https://aistudio.google.com/) (`@google/genai`) and `text-embedding-004` (768 dimensions).

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v20 or higher (v24 recommended).
- **Package Manager**: `npm` (v10+).
- **Supabase Project**: Active project with Auth and PostgreSQL enabled.
- **Upstash Redis**: (Optional for local dev, recommended for production) REST URL and Token.
- **Google Gemini API Key**: For Phase 2 production AI chat and vector generation.

### 2. Installation
Install project dependencies matching the lockfile:
```bash
npm ci
```

### 3. Environment Variables Setup
Copy the provided `.env.example` template to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your configuration:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
UPSTASH_REDIS_REST_URL=https://your-upstash.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
GEMINI_API_KEY=your-gemini-key
```

### 4. Database Setup & Migration Procedure
Version-controlled migrations are located in `supabase/migrations/`:
- `20261019000001_initial_schema.sql`: Core tables (`websites`, `website_chunks`, `chat_messages`), foreign keys, cascade deletes, and indexes.
- `20261019000002_vector_search_rpc.sql`: `match_chunks` PostgreSQL function for RAG cosine similarity search.
- `20261019000003_row_level_security.sql`: Row-Level Security (RLS) policies for multi-tenant isolation.
- `20261019000004_storage_setup.sql`: Storage bucket configuration and security policies for `logos`.

**To review or apply migrations locally using Supabase CLI:**
```bash
npx supabase db push
```
*Note: Do not run migrations against production databases without testing and explicit review.*

### 5. Running the Application
Run the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Running Tests & Quality Checks
Run security unit tests (SSRF, rate limiting, logo upload magic byte checks):
```bash
npm test
```

Run TypeScript compilation check:
```bash
npx tsc --noEmit
```

Build production bundle:
```bash
npm run build
```

---

## Security Mitigations Implemented (Phase 1)

1. **SSRF & DNS Rebinding Protection**:
   - Comprehensive IP range filtering in `lib/ssrfProtection.ts` covering IPv4 private, loopback, link-local, multicast, carrier-grade NAT, and cloud metadata (`169.254.169.254`, `metadata.google.internal`).
   - IPv4-mapped IPv6 normalization (e.g. `::ffff:127.0.0.1`).
   - Manual redirect loop in `lib/crawler.ts` validating each redirect hop against SSRF before connecting.
   - 10-second request timeout and 2MB response size limit to prevent memory exhaustion attacks.
2. **Authenticated Logo Uploads**:
   - Enforced Supabase authentication and bot ownership validation in `/api/upload-logo`.
   - Strict 2MB file size cap.
   - Allowed MIME types strictly limited to PNG, JPEG, and WebP (rejecting SVG and HTML stored XSS vectors).
   - Magic bytes / file header signature verification.
   - User-isolated storage paths (`{user_id}/{timestamp}-{uuid}.{ext}`).
3. **Rate Limiting & Cost Protection**:
   - Rate limiters enforced in `/api/analyze` (5/hour), `/api/knowledge/upload` (10/hour), and `/api/chat` (30/min).
   - Resilient in-memory fallback for offline/local development without Upstash credentials.
4. **Next.js 16 Proxy Session Protection**:
   - `proxy.ts` implements Next.js 16 conventions, safeguarding `/dashboard/:path*` and `/create` routes with automatic redirects to `/login`.

---

## Current Known Limitations & Phase 2 Roadmap

- **AI Pipeline**: Embeddings and chat currently use legacy Ollama/Groq providers; full migration to the official Google Gemini SDK (`@google/genai`) and `text-embedding-004` is scheduled for **Phase 2**.
- **Crawler**: Currently performs single-page deep text extraction. Multi-page recursive link crawling, sitemap processing, and queue orchestration are planned for **Phase 3**.
- **Widget CSS Isolation**: The embeddable widget injects DOM nodes into the host page; Shadow DOM encapsulation is scheduled for **Phase 4**.
>>>>>>> 37738c5 (Initial commit: Next.js foundation, Supabase schema, and security layer)
