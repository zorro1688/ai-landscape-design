# PAGE_HOME.md — Home Page Structure (`/`)

> Route: `app/page.tsx`  
> Type: Client component (`"use client"`)  
> Layout shell: `app/layout.tsx` (Header + Footer + ThemeProvider + Toaster)

---

## 1. Page Architecture

```
RootLayout (server)
├── Header (user from server-side Supabase)
├── <main>
│   └── Home (client) — app/page.tsx
│       ├── Section: Hero
│       ├── Section: Generator Form
│       ├── Section: Popular Names
│       ├── Section: Features
│       ├── Section: Pricing
│       └── Section: Final CTA
└── Footer
```

### Dependencies

| Import | Path | Role |
|--------|------|------|
| `NameGeneratorForm` | `components/product/generator/name-generator-form.tsx` | Main input form |
| `ChineseNamePricing` | `components/product/pricing/chinese-name-pricing.tsx` | Pricing cards |
| `PopularNames` | `components/product/popular/popular-names.tsx` | Static popular names showcase |
| `useUser` | `hooks/use-user.ts` | Auth state for CTAs |
| `useToast` | `hooks/use-toast.ts` | Success/error notifications |
| `saveFormData` / `loadFormData` | `utils/form-storage.ts` | localStorage form persistence |

### Page-level state

| State | Type | Purpose |
|-------|------|---------|
| `isGenerating` | `boolean` | Loading during API call |
| `hasTriedFree` | `boolean` | Anonymous trial used (from localStorage) |
| `savedFormData` | `FormData \| null` | Restored form from localStorage |

---

## 2. Section Breakdown (top to bottom)

### Section 1 — Hero

**Element:** `<section>` — gradient background, grid pattern overlay  
**ID:** none  
**Animation:** Framer Motion fade-in

| Element | Content / Behavior |
|---------|-------------------|
| Badge | 🇨🇳 `AI-Powered Chinese Name Generation` |
| H1 line 1 | `Discover Your Perfect` |
| H1 line 2 (accent) | `Chinese Name` |
| Subtitle | Cultural AI identity pitch |
| Primary CTA | Scroll to form — label varies by auth state (see below) |
| Secondary CTA | Navigate to `/product/random-generator` |
| Trust indicators | 3 pills: free daily / instant / cultural accuracy |

**Primary CTA labels (dynamic):**

| Condition | Label |
|-----------|-------|
| `loading` | `Loading...` |
| Anonymous, not tried free | `🎁 Generate Free Name` |
| Anonymous, tried free | `🔒 Sign In for More` |
| Authenticated | `🎯 Generate Name` |

**Trust pill (first):**

| Condition | Text |
|-----------|------|
| Anonymous | `3 free names daily` |
| Authenticated | `Unlimited generation` |

---

### Section 2 — Generator Form

**Element:** `<section>` — `py-16`  
**Anchor:** `id="name-generator-form"` + `data-name-generator-form`

| Element | Content |
|---------|---------|
| H2 | `Create Your Chinese Name` |
| Description | AI personality + cultural significance pitch |
| Component | `<NameGeneratorForm />` |
| Conditional link | `👤 Profile - View History & Saved Names` → `/profile` (authenticated only) |

#### NameGeneratorForm props

| Prop | Source | Purpose |
|------|--------|---------|
| `onGenerate` | `handleGenerate` | Triggers API call |
| `isGenerating` | page state | Disables submit |
| `hasTriedFree` | page state | Changes CTA for anonymous |
| `savedFormData` | localStorage | Pre-fills form |

#### NameGeneratorForm internal structure

```
Card: "Generate Your Chinese Name"
├── Your Name * (text input)
├── Gender * (select: Male / Female / Other)
├── Birth Year (optional)
├── Personality Traits [Premium badge] — read-only if anonymous
├── Name Preferences [Premium badge] — read-only if anonymous
├── Generation Type (auth only)
│   ├── Standard (1 Credit)
│   └── Premium (4 Credits)
├── Credit status line (auth only)
└── Submit button (dynamic label)
```

**Submit button states:**

| Condition | Label |
|-----------|-------|
| Generating | `Generating...` |
| Auth, enough credits | `Generate Name ({n} Credits)` |
| Auth, insufficient credits | `Insufficient Credits` |
| Anonymous, tried free | `Sign Up for More` |
| Anonymous, not tried | `🎁 Try Free Generation (No Login Required)` |

---

### Section 3 — Popular Names

**Element:** `<section>` — gradient background  
**Data attribute:** `data-popular-names`  
**Component:** `<PopularNames onScrollToGenerator={scrollToForm} />`

Internal structure:

```
Header: "Popular Names" + description
Grid of 6 static name cards
  ├── Chinese character
  ├── Pinyin
  ├── Meaning
  ├── Cultural significance
  └── Gender badge (male / female / unisex)
CTA: "Generate My Name" → scrolls to form
```

---

### Section 4 — Features

**Element:** `<section id="features">` — muted background  
**Layout:** 3-column grid (responsive)

| Card | Icon | Title | Theme |
|------|------|-------|-------|
| 1 | 🤖 | AI-Powered Intelligence | Personality + cultural nuance |
| 2 | 🏮 | Cultural Authenticity | Traditions, character meanings |
| 3 | ⚡ | Instant Generation | Speed, pronunciation, context |

---

### Section 5 — Pricing

**Element:** `<div id="pricing">`  
**Component:** `<ChineseNamePricing onScrollToForm={scrollToForm} />`

Internal structure:

```
Section heading: "Choose Your Plan"
Subheading: free trial vs credit pack pitch

Card: Free Trial ($0)
  ├── Features list (5 items)
  └── Button: "Try Free" → scroll to form

Card: Credit Pack ($5) [Most Popular badge]
  ├── 1000 credits
  ├── Features list (7 items)
  ├── "Only $0.005 per credit • Amazing value!"
  └── Button: "Purchase Credits" → requires sign-in

FAQ: "Questions about pricing?"
Trust badges: Secure payments, Instant delivery, 24/7 support, Money-back guarantee
```

---

### Section 6 — Final CTA

**Element:** `<section>` — gradient background

| Element | Content |
|---------|---------|
| H2 | `Start Your Cultural Journey Today` |
| Description | Identity + community pitch |
| Primary CTA | Same dynamic labels as hero (slightly different copy) |
| Secondary link | `View Premium Features →` → `#chinese-name-pricing` |

**Final CTA primary labels:**

| Condition | Label |
|-----------|-------|
| Anonymous, not tried | `🎁 Get Your Free Chinese Name` |
| Anonymous, tried | `🔒 Sign In for Unlimited Names` |
| Authenticated | `🎯 Generate Chinese Name` |

---

## 3. User Flows

### Flow A — Anonymous first-time generation

```
1. Land on /
2. Scroll to form (or click hero CTA)
3. Fill: name, gender, (optional birth year)
4. Click "Try Free Generation"
5. handleGenerate() → POST /api/chinese-names/generate
6. On success:
   - Save to sessionStorage
   - Set localStorage hasTriedFreeGeneration = true
   - Save form to localStorage
   - Toast success
   - router.push('/results')
7. On 429: toast + redirect to /sign-in after 3s
```

### Flow B — Anonymous repeat attempt

```
1. hasTriedFree === true
2. Click generate → toast "Free trial used" → redirect /sign-in
3. Hero CTA shows "Sign In for More"
```

### Flow C — Authenticated generation

```
1. Form shows full fields + plan type selector
2. Credit check via useSubscription (display) + server-side deduct
3. On success → /results with batch persisted to DB
4. Profile button visible below form
```

### Flow D — Return visitor with saved form

```
1. loadFormData() on mount
2. NameGeneratorForm receives savedFormData
3. Toast: "Welcome back! Your previous form data has been restored."
```

### Flow E — Purchase credits

```
1. Scroll to pricing section
2. Click "Purchase Credits"
3. If not signed in → toast "Sign In Required" → /sign-in
4. If signed in → POST /api/creem/create-checkout (⚠️ route missing — known gap)
```

---

## 4. API Integration

### Generation endpoint

```
POST /api/chinese-names/generate
Content-Type: application/json

Body: FormData (see SITE_SPEC.md)
```

### Response handling (page-level)

| Status | Action |
|--------|--------|
| 200 | Save sessionStorage, toast, navigate to `/results` |
| 429 + `rateLimited` | Toast daily limit, redirect `/sign-in` after 3s |
| 403 | Toast insufficient credits |
| Other | Toast "Generation failed" with error message |

### sessionStorage payload

```typescript
{
  names: NameData[];
  formData: FormData;
  batch: any;
  generationRound: number;
  totalGenerationRounds: number;
  isHistoryMode: false;
}
```

Key: `nameGenerationResults`

---

## 5. Scroll Targets & Anchors

| Anchor | Target | Triggered by |
|--------|--------|--------------|
| `#name-generator-form` | Generator section | Hero CTA, Final CTA, PopularNames CTA, Pricing "Try Free" |
| `#features` | Features section | Footer link |
| `#pricing` | Pricing section | Footer link, Final CTA secondary |
| `#chinese-name-pricing` | Pricing component internal | Final CTA "View Premium Features" |

`scrollToForm()` uses `document.querySelector('[data-name-generator-form]')`.

---

## 6. Responsive Behavior

| Breakpoint | Layout changes |
|------------|----------------|
| Mobile | Single column; hero H1 scales down; CTAs stack vertically |
| `sm:` | CTAs side-by-side |
| `lg:` | Hero larger padding; features 3-column grid |

Header provides `MobileNav` for navigation on small screens.

---

## 7. Related Pages (linked from home)

| Link | Destination | Location |
|------|-------------|----------|
| Random Name Generator | `/product/random-generator` | Hero secondary CTA |
| Profile | `/profile` | Below form (auth only) |
| Sign in | `/sign-in` | Header, free-trial exhaustion |
| Popular Names (full) | `/product/popular-names` | Header nav |
| About | `/product/about` | Header nav |
