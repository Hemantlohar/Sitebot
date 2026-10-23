# Sitebot - AI Website Bot Builder

AI Chatbot SaaS built with Next.js 16, Google Gemini API, Supabase pgvector, and an embeddable widget script for real-time customer support. A production-ready platform that allows users to generate, customize, and embed AI chatbots trained on their website content.

---

## Tech Stack & Architecture

- **Frontend & App Framework**: [Next.js](https://nextjs.org) (App Router, v16.2.9) with TypeScript & Tailwind CSS v4.
- **Authentication**: [Supabase Auth](https://supabase.com/auth) via `@supabase/ssr`.
- **Database & Vector Search**: Supabase PostgreSQL with [pgvector](https://github.com/pgvector/pgvector) extension.
- **Edge Routing & Route Protection**: Next.js Proxy convention (`proxy.ts`).
- **AI & Embeddings**: Powered by official [Google Gemini API](https://aistudio.google.com/) (`@google/genai`), using `gemini-3.8-flash` for streaming chat and business analysis, and `gemini-embedding-2` scaled to 768 dimensions for vector retrieval.

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

## Gemini AI & RAG Architecture (Phase 2)

1. **Official Google GenAI SDK (`@google/genai`)**:
   - `gemini-3.8-flash` for streaming visitor chat and structured JSON website business analysis.
   - `gemini-embedding-2` scaled natively to 768 dimensions via MRL (`outputDimensionality: 768`).
2. **Server-Side Resilience**:
   - Centralized model configuration in `lib/ai/models.ts`.
   - Bounded exponential backoff retries with jitter for rate limits (HTTP 429) and transient network errors (503).
   - Strict vector dimensionality (768) and numeric integrity checks preventing corrupted vectors.
   - Server-side usage tracking buffer (`lib/ai/usage.ts`) capturing request latencies and token counts.
3. **Hardened RAG & Prompt-Injection Defense**:
   - Vector retrieval scoped strictly to bot ID via Supabase `match_chunks` RPC.
   - Cosine similarity thresholding (>= 0.35) filtering out irrelevant noise.
   - Strict separation between system instructions (`systemInstruction`) and untrusted retrieved evidence (`<retrieved_evidence>`).
   - Truthful fallback responses when knowledge is missing or confidence is low ("Sorry, I couldn't find that information on this website.").
   - Safe re-indexing path (`reindexWebsiteChunks`) to upgrade existing chunks from legacy vectors to Gemini Embedding 2.

---

## Roadmap

- **Phase 3**: Reliable multi-page crawling, background worker/queue ingestion, and sitemap processing.
- **Phase 4**: Shadow DOM encapsulation for widget CSS isolation, tenant custom domains, and production deployment.
