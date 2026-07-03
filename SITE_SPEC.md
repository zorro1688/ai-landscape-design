# SITE_SPEC.md — ChineseName.club Product Logic

> Generated from codebase analysis. Reflects **current implementation**, including known gaps.

## 1. Product Overview

**ChineseName.club** is a freemium SaaS that generates personalized Chinese names using AI. Built on the Raphael Starter Kit stack:

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 App Router, React 19, Tailwind, shadcn/ui |
| Auth & DB | Supabase (Auth + Postgres + RLS) |
| Payments | Creem.io (checkout, subscriptions, webhooks) |
| AI | OpenRouter → `google/gemini-2.5-flash` |
| TTS | Doubao (ByteDance) |
| PDF | Puppeteer certificate export |

**Core value proposition:** Users enter their English name, gender, and optional preferences; the AI returns culturally meaningful Chinese names with pinyin, character breakdowns, and cultural notes.

---

## 2. User Roles & Access Model

### 2.1 Anonymous (not signed in)

| Capability | Allowed |
|------------|---------|
| Browse marketing pages | Yes |
| Generate names (free tier) | Yes, with limits |
| Names per session | **3** |
| Personality traits / name preferences in AI prompt | No (UI fields are read-only) |
| Premium plan (`planType: '4'`) | No |
| Persist generation history to DB | No |
| TTS pronunciation | No |
| PDF certificate | No |
| Save names to account | No |

### 2.2 Authenticated (signed in)

| Capability | Allowed |
|------------|---------|
| Generate names | Yes, credit-gated |
| Names per session | **6** |
| Personality traits / preferences | Yes |
| Standard generation | 1 credit |
| Premium generation | 4 credits |
| Generation batch history | Yes (`generation_batches`, `generated_names`) |
| Saved names | Yes (API exists; partial UI wiring) |
| TTS | Yes (free, auth required) |
| PDF export | Yes (1 credit) |
| Dashboard / Profile | Yes |

### 2.3 Route Protection

| Layer | Behavior | File |
|-------|----------|------|
| Middleware | Refreshes Supabase session on all matched routes; redirects unauthenticated users from `/dashboard/*` → `/sign-in` | `middleware.ts`, `utils/supabase/middleware.ts` |
| Server guard | `/dashboard` checks `supabase.auth.getUser()` | `app/dashboard/page.tsx` |
| Client guard | `/profile`, `/profile/batch/[id]` redirect via `useUser()` | `app/profile/page.tsx` |
| API routes | Per-route 401/403 | `app/api/**` |

**Public routes:** `/`, `/results`, `/name-detail`, `/product/*`, `/about`, `/privacy`, `/terms`, auth pages.

---

## 3. Monetization Model

### 3.1 Credits (primary gate for generation)

Credits are stored on the `customers` table (`credits` column) with a ledger in `credits_history`.

| Event | Credits | Source |
|-------|---------|--------|
| New user registration | **+3** welcome bonus | DB trigger `handle_new_user()` + API fallback |
| Standard generation (`planType: '1'`) | **−1** | `POST /api/chinese-names/generate` |
| Premium generation (`planType: '4'`) | **−4** | Same |
| PDF certificate | **−1** | `POST /api/generate-pdf` |
| TTS playback | **0** | `POST /api/tts` |
| Credit pack purchase | **+N** | Creem webhook → `addCreditsToCustomer()` |

### 3.2 Pricing UI (homepage)

Displayed in `components/product/pricing/chinese-name-pricing.tsx`:

| Tier | Price | Credits | CTA |
|------|-------|---------|-----|
| Free Trial | $0 | 1 (marketing) | Scroll to form |
| Credit Pack | $5 | 1000 | Purchase (requires sign-in) |

### 3.3 Config tiers (not wired to homepage UI)

Defined in `config/subscriptions.ts` but **not used** by the Chinese-name product UI:

**Subscriptions:** Starter $11/mo, Business $29/mo, Enterprise $99/mo

**Credit packs:** Basic $9 (3 credits), Standard $13 (6 credits), Premium $29 (9 credits)

Checkout for config tiers uses `createCheckoutSession()` in `app/actions.ts`, not a dedicated API route.

### 3.4 Subscriptions (parallel starter-kit infra)

- Stored in `subscriptions` table, synced via Creem webhooks
- Displayed on dashboard (`subscription-status-card.tsx`)
- **Does not gate name generation** — only credits matter for AI generation today
- `useSubscription` hook reads status but is not used for generation gating

---

## 4. Free Trial Logic

Three enforcement layers (with messaging inconsistencies):

### Layer 1 — Client localStorage (strictest on device)

- Key: `hasTriedFreeGeneration`
- Set after first successful anonymous generation
- Blocks further anonymous attempts until sign-in
- Cleared when user signs in
- File: `app/page.tsx`

### Layer 2 — Server IP rate limit

- RPC: `check_ip_rate_limit(p_client_ip)` on `ip_usage_logs`
- Limit: **1 generation session per IP per calendar day** (DB migration)
- Returns HTTP 429 with `rateLimited: true`
- File: `app/api/chinese-names/generate/route.ts`

### Layer 3 — Actual output

- Anonymous: **3 names** per allowed session
- Authenticated: **6 names** per credit spend

### Messaging inconsistencies (known gap)

| Source | Claims |
|--------|--------|
| Hero trust badge | "3 free names daily" |
| Pricing card | "1 free name generation" |
| API 429 error | "3 free names per day" |
| DB migration | 1 session per IP per day |
| Actual anonymous output | 3 names per session |

---

## 5. Name Generation Flow

### 5.1 Primary funnel

```
/ (home)
  → NameGeneratorForm
  → POST /api/chinese-names/generate
  → sessionStorage['nameGenerationResults']
  → /results
  → NameCard → /name-detail?data=...
```

### 5.2 Request payload

```typescript
{
  englishName: string;          // required, min 2 chars
  gender: 'male' | 'female' | 'other';  // required
  birthYear?: string;
  personalityTraits?: string;   // auth only, included in prompt
  namePreferences?: string;     // auth only, included in prompt
  planType: '1' | '4';         // Standard vs Premium
  continueBatch?: boolean;      // continue in same batch
  batchId?: string;
}
```

### 5.3 Server pipeline (`app/api/chinese-names/generate/route.ts`)

1. Validate required fields
2. If anonymous → IP rate limit check
3. If authenticated → verify credits, deduct before AI call
4. AI loop (3 or 6 iterations):
   - Model: `google/gemini-2.5-flash` via OpenRouter
   - Random surname from 30 common surnames
   - JSON-only prompt; duplicate detection with fallbacks
   - Premium: higher temperature, deeper personalization
5. If authenticated → persist to `generation_batches` + `generated_names` + `name_generation_logs`
6. Return `{ names, batchId, generationRound, batch, creditsUsed, message }`

### 5.4 Output shape (per name)

```typescript
{
  chinese: string;
  pinyin: string;
  characters: Array<{ character, pinyin, meaning, explanation }>;
  meaning: string;
  culturalNotes: string;
  personalityMatch: string;
  style: string;
}
```

### 5.5 Batch continuation (`/results`)

| Action | Behavior |
|--------|----------|
| Continue generation | Same `batchId`, `continueBatch: true`, increments `generation_round` |
| Regenerate | New batch (form params changed or forced) |
| Round navigation | `GET /api/generation-batches/[id]?round=N` |

Each round = one paid generation of up to 6 names.

### 5.6 Secondary generator

**Random Name Generator** (`/product/random-generator`):
- Client-side form: gender, style (7 options), count (6/9/10/12), optional surname initial
- Synthesizes traits, calls same generate API with `planType: '1'`
- Subject to same anonymous limits

---

## 6. Authentication

### 6.1 Methods

| Method | Action | Redirect |
|--------|--------|----------|
| Email/password sign-up | `signUpAction` | `/dashboard` |
| Email/password sign-in | `signInAction` | `/dashboard` |
| Google OAuth | `signInWithGoogle` | `/auth/callback` → `/dashboard` |
| Forgot password | `forgotPasswordAction` | Email link → `/dashboard/reset-password` |
| Reset password | `resetPasswordAction` | Stay on page |
| Sign out | `signOutAction` | `/sign-in` |

File: `app/actions.ts`, `app/auth/callback/route.ts`

### 6.2 OAuth callback

Exchanges Supabase auth code, honors optional `redirect_to` query param.

---

## 7. Payment & Webhooks (Creem)

### 7.1 Checkout creation

`createCheckoutSession(productId, email, userId, productType, credits_amount?, discountCode?)` in `app/actions.ts`:
- POST to `CREEM_API_URL/checkouts`
- Metadata: `{ user_id, product_type: "subscription" | "credits", credits }`
- Success URL from `CREEM_SUCCESS_URL`

### 7.2 Webhook handler (`app/api/webhooks/creem/route.ts`)

Signature verified via HMAC-SHA256 (`utils/creem/verify-signature.ts`).

| Event | Action |
|-------|--------|
| `checkout.completed` | Upsert customer; add credits if `product_type === "credits"`, else create subscription |
| `subscription.active` | Upsert customer + subscription |
| `subscription.paid` | Update period/status |
| `subscription.canceled` | Update status |
| `subscription.expired` | Update status |
| `subscription.trialing` | Update trial status |

### 7.3 Customer portal

`GET /api/creem/customer-portal` → Creem billing portal link for existing `creem_customer_id`.

---

## 8. API Reference

| Route | Methods | Auth | Purpose |
|-------|---------|------|---------|
| `/api/chinese-names/generate` | POST | Optional | Core AI generation |
| `/api/credits` | GET, POST | Required | Balance read / manual spend |
| `/api/generation-batches` | GET, DELETE | Required | List / delete batches |
| `/api/generation-batches/[id]` | GET | Required | Batch detail by round |
| `/api/generation-history` | GET | Required | Analytics logs |
| `/api/saved-names` | GET, POST | Required | Favorites CRUD |
| `/api/saved-names/[id]` | DELETE, PATCH | Required | Delete / update |
| `/api/saved-names/[id]/select` | POST | Required | Mark selected (exclusive) |
| `/api/generate-pdf` | POST | Required | PDF certificate (−1 credit) |
| `/api/tts` | POST | Required | Voice synthesis (free) |
| `/api/creem/customer-portal` | GET | Required | Billing portal |
| `/api/webhooks/creem` | POST | Signature | Payment events |

---

## 9. Database Schema (key tables)

| Table | Purpose |
|-------|---------|
| `customers` | User billing profile: `credits`, `creem_customer_id`, `email` |
| `credits_history` | Credit ledger: `amount`, `type`, `description`, `creem_order_id` |
| `subscriptions` | Creem subscription sync: `status`, `current_period_end`, etc. |
| `generation_batches` | Generation session metadata |
| `generated_names` | Individual names with `generation_round`, `position_in_batch` |
| `saved_names` | User favorites with `is_selected`, `is_favorite` |
| `name_generation_logs` | Analytics |
| `popular_names` | DB-backed popular names (UI uses static data instead) |
| `ip_usage_logs` | Anonymous rate limiting |

Migrations: `supabase/migrations/`

---

## 10. Client State & Storage

| Storage | Key | Purpose |
|---------|-----|---------|
| `sessionStorage` | `nameGenerationResults` | Pass generation results to `/results` |
| `localStorage` | `hasTriedFreeGeneration` | One-shot anonymous trial flag |
| `localStorage` | Form data via `utils/form-storage.ts` | Persist generator form between visits |

---

## 11. Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Webhooks, admin ops |
| `CREEM_API_URL`, `CREEM_API_KEY` | Creem payments |
| `CREEM_WEBHOOK_SECRET` | Webhook signature |
| `CREEM_SUCCESS_URL` | Post-checkout redirect |
| `NEXT_PUBLIC_SITE_URL` | Auth callbacks |
| `OPENROUTER_API_KEY` / `OPENAI_API_KEY` | AI generation |
| `OPENAI_BASE_URL` | OpenRouter endpoint |
| `DOUBAO_TTS_APPID`, `DOUBAO_TTS_ACCESS_TOKEN` | TTS |

---

## 12. Known Gaps & Inconsistencies

1. **Missing `/api/creem/create-checkout`** — `chinese-name-pricing.tsx` calls this route; checkout actually lives in `createCheckoutSession` server action.
2. **Save names UI incomplete** — `POST /api/saved-names` exists; results page "like" is client-only state.
3. **Subscription does not unlock generation** — credits-only gating.
4. **Free trial messaging mismatch** — see Section 4.
5. **Duplicate about pages** — `/about` vs `/product/about` (header links to `/product/about`).
6. **Missing `/contact` page** — referenced from legal pages.
7. **Profile vs Dashboard overlap** — both show history/saved names.
8. **Popular names** — UI uses static sample data, not `popular_names` table.
9. **IP RPC permissions** — `check_ip_rate_limit` granted to `service_role` only; generate route uses anon client.

---

## 13. Page Map (all routes)

| Route | Type | Auth |
|-------|------|------|
| `/` | Home + generator | Public |
| `/results` | Generation results | Public (sessionStorage) |
| `/name-detail` | Name detail view | Public (URL param) |
| `/product/random-generator` | Random generator | Public |
| `/product/popular-names` | Popular names browse | Public |
| `/product/about` | About (violet theme) | Public |
| `/about` | About (theme-aware) | Public |
| `/privacy` | Privacy policy | Public |
| `/terms` | Terms of service | Public |
| `/sign-in`, `/sign-up`, `/forgot-password` | Auth | Public |
| `/dashboard` | Account hub | Required |
| `/dashboard/reset-password` | Password reset | Required (via email) |
| `/profile` | History + saved names | Client guard |
| `/profile/batch/[id]` | Batch detail | Client guard |
