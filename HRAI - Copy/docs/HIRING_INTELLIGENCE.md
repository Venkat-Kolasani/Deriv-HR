# AI-Powered Hiring Intelligence System

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Code Walkthrough](#code-walkthrough)
5. [Setup — Gemini API Key](#setup--gemini-api-key)
6. [Environment Variables](#environment-variables)
7. [Demo Flow](#demo-flow)

---

## Overview

The Hiring Intelligence System is an **end-to-end AI-powered hiring pipeline** integrated directly into the existing derivHR Next.js application. It starts at a **central landing page** (`/hiring`) where the HR manager can browse shortlisted candidates, view their profiles, and launch the 4-step AI pipeline:

| Step | Page | What it Does |
|------|------|-------------|
| **Landing** | `/hiring` | Browse shortlisted candidates, view interview summaries, select a candidate to start the pipeline |
| **1. Candidate Review** | `/hiring/feedback` | AI analyzes 4 rounds of interview feedback → generates bias-checked scorecard |
| **2. Compensation Intelligence** | `/hiring/compensation` | AI generates 3 salary scenarios (Conservative / Competitive / Aggressive) with acceptance probability |
| **3. CEO Approval** | `/hiring/approval` | AI generates executive brief for CEO. Includes Approve / Reject / Discuss buttons |
| **4. Offer Letter** | `/hiring/contract` | AI generates personalized offer letter. Download as `.docx` or PDF |

**Key Design Decisions:**
- **Google Gemini Flash API** — All AI calls go directly to Gemini 2.0 Flash via REST API. No local LLM setup needed.
- **Graceful fallback** — Every AI call has mock data fallback, so the demo works even without a valid API key
- **State passing** — Candidate data flows between pages via `localStorage`, making the pipeline stateful without a database
- **Landing page entry** — A single "Hiring Intelligence" sidebar item under the "AI Tools" group leads to the landing page with all shortlisted candidates

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Next.js Frontend                   │
│                                                       │
│  /hiring (Landing) → Select candidate                 │
│         ↓                                             │
│  /hiring/feedback  →  /hiring/compensation             │
│         ↓                    ↓                        │
│  /hiring/approval  →  /hiring/contract                │
│                                                       │
│  State passed via localStorage between pages          │
└──────────────┬──────────────────┬─────────────────────┘
               │                  │
               ▼                  ▼
  ┌──────────────────────┐  ┌───────────────────┐
  │  Google Gemini API    │  │ Next.js API Route │
  │  (gemini-2.0-flash)   │  │ /api/generate-docx│
  │                       │  │ (docx npm package)│
  │  REST API call with   │  └───────────────────┘
  │  JSON response mode   │
  └──────────────────────┘
```

**Data flow:**
1. User navigates to `/hiring` → sees all shortlisted candidates as expandable cards
2. User clicks a candidate card → views interview summaries (resume, telephonic, cultural fit, reference)
3. User clicks **"Start AI Hiring Pipeline"** → candidate data stored in `localStorage`, redirected to `/hiring/feedback`
4. Step 1: Feedback text sent to Gemini API → JSON scorecard returned (with `responseMimeType: "application/json"`)
5. Steps 2-4: Data saved to `localStorage` between steps
6. Final step: Offer letter text sent to `/api/generate-docx` → `.docx` generated and streamed back

---

## File Structure

```
app/
├── hiring/                          # All hiring pages
│   ├── layout.tsx                   # Shared layout (sidebar, topbar, chat)
│   ├── page.tsx                     # ★ Landing page server wrapper
│   ├── HiringLandingClient.tsx      # ★ Landing page — candidate cards,
│   │                                #   pipeline overview, step info
│   ├── feedback/
│   │   ├── page.tsx                 # Server component wrapper
│   │   └── FeedbackClient.tsx       # ★ Step 1 — candidate selector,
│   │                                #   feedback inputs, AI analysis, scorecard
│   ├── compensation/
│   │   ├── page.tsx
│   │   └── CompensationClient.tsx   # ★ Step 2 — 3 offer scenario cards,
│   │                                #   acceptance predictor, AI rationale
│   ├── approval/
│   │   ├── page.tsx
│   │   └── ApprovalClient.tsx       # ★ Step 3 — executive brief,
│   │                                #   approve/reject/discuss
│   └── contract/
│       ├── page.tsx
│       └── OfferLetterClient.tsx    # ★ Step 4 — offer letter preview,
│                                    #   .docx + PDF download
├── api/
│   └── generate-docx/
│       └── route.ts                 # ★ Server-side .docx generation
├── lib/
│   ├── flowise.ts                   # ★ Flowise API helper + JSON parser
│   └── mock-candidates.ts           # ★ 3 candidate profiles + status field,
│                                    #   salary benchmarks, company policies
├── components/
│   └── Sidebar.tsx                  # Modified — "Hiring Intelligence" under
│                                    #   "AI Tools" group with sparkle icon
└── styles/
    └── hiring.css                   # ★ All styles (landing + pipeline pages)
```

Files marked with ★ are newly created for this feature.

---

## Code Walkthrough

### 0. `HiringLandingClient.tsx` — Landing Page (Entry Point)

This is the first page users see when clicking "Hiring Intelligence" in the sidebar.

**Component Structure:**
```typescript
// State management
const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);

// Pre-loads candidate data & clears previous pipeline state
function handleStartPipeline(c: CandidateProfile) {
  localStorage.setItem("hiring-selected-candidate", JSON.stringify(c));
  localStorage.removeItem("hiring-feedback-data");    // Clear Step 1
  localStorage.removeItem("hiring-compensation-data"); // Clear Step 2
  localStorage.removeItem("hiring-approval-status");   // Clear Step 3
  window.location.href = "/hiring/feedback";
}
```

**UI Sections:**
1. **Pipeline Overview Bar** — Shows "3 Shortlisted", "4 AI Steps", "Powered by Gemini" stats
2. **Candidate Cards Grid** — One card per shortlisted candidate with:
   - Avatar (initials on gradient background)
   - Name, role, status badge ("Interview Complete" or "Shortlisted")
   - Quick stats: experience, location, department
3. **Expanded View** (click a candidate card) — Shows truncated previews of:
   - Resume Review, Telephonic Interview, Cultural Fit, Reference Check
   - **"Start AI Hiring Pipeline"** button at the bottom
4. **Step Info Cards** — 4 cards explaining each pipeline step

**Data Flow to Step 1:**
- `handleStartPipeline()` saves the full `CandidateProfile` to `localStorage` under `"hiring-selected-candidate"`
- `FeedbackClient.tsx` has a `useEffect` that reads this key on mount and auto-populates the feedback fields
- Previous pipeline data is cleared so each run starts fresh

### 1. `lib/flowise.ts` — Gemini API Helper

This is the bridge between the frontend and Google Gemini.

```typescript
// Core function — sends a prompt to Gemini Flash
async function askGemini(question: string): Promise<FlowiseResponse> {
  const wantsJson = question.toLowerCase().includes("json");
  const res = await fetch(
    `${GEMINI_BASE}/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: question }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
          ...(wantsJson ? { responseMimeType: "application/json" } : {}),
        },
      }),
    }
  );
  const data = await res.json();
  return { text: data?.candidates?.[0]?.content?.parts?.[0]?.text || "" };
}
```

**Key details:**
- Uses `gemini-2.0-flash` by default — fast, high-quality responses
- Automatically enables **JSON response mode** (`responseMimeType: "application/json"`) when the prompt contains "JSON"
- `parseJsonFromLLM()` handles edge cases — strips markdown code blocks, trailing commas, and control characters
- Only requires one env var: `NEXT_PUBLIC_GEMINI_API_KEY`

### 2. `lib/mock-candidates.ts` — Mock Data

Contains **3 complete candidate profiles** with realistic interview feedback:

| Candidate | Role | Location | Experience |
|-----------|------|----------|------------|
| Sarah Chen | Senior Software Engineer | Malaysia | 7 years |
| Marcus Thompson | Product Manager | UK | 5 years |
| Aisha Rahman | Data Scientist | Singapore | 4 years |

Each candidate has 4 rounds of feedback:
- `resumeReview` — detailed assessment of their CV
- `telephonicInterview` — phone screen notes
- `culturalFit` — panel interview feedback
- `referenceCheck` — 2-3 reference quotes

Also includes:
- **`SALARY_BENCHMARKS`** — P25/P50/P75/P90 salary data for 6 roles × 4 locations
- **`COMPANY_POLICIES`** — Deriv's probation, notice period, benefits, equity details (used in offer letter generation)

### 3. `FeedbackClient.tsx` — Candidate Review (Step 1)

**Initialization — Loading Pre-Selected Candidate:**
```typescript
// On mount, load candidate selected from landing page
useEffect(() => {
  const saved = localStorage.getItem("hiring-selected-candidate");
  if (saved) {
    const parsed = JSON.parse(saved) as CandidateProfile;
    const match = MOCK_CANDIDATES.find((c) => c.id === parsed.id) || parsed;
    setSelectedCandidate(match);
    setResumeReview(match.resumeReview);
    // ... sets all 4 feedback fields
  }
}, []);
```

**Flow:**
1. **Candidate auto-loaded** from landing page (or manually selectable via 3 clickable cards)
2. **Feedback input** — 4 text areas (Resume, Telephonic, Cultural Fit, Reference) pre-filled with candidate data
3. **"Analyze Candidate" button** → Sends all 4 feedback texts to Flowise with structured JSON prompt
4. **AI Scorecard** displayed after analysis:
   - **Score ring** — SVG circle with animated stroke showing overall score (1-10)
   - **Competency bars** — Technical Skills, Communication, Leadership, Culture Fit
   - **Strengths** — green cards with ✓ markers
   - **Concerns** — yellow cards with ⚠ markers
   - **Red Flags** — red cards with 🚩 markers (if any)
   - **Bias Detection** — orange cards flagging potentially biased language
5. **"Proceed to Compensation"** → Saves candidate + scorecard to `localStorage`

**Fallback behavior:** If Flowise is unreachable, falls back to a hardcoded mock scorecard so the demo still works.

**AI Prompt structure:**
```
You are an expert HR analyst. Analyze the following interview feedback...
Respond ONLY with a JSON object:
{
  "overall_score": <1-10>,
  "competencies": { "Technical Skills": <1-10>, ... },
  "strengths": [...],
  "concerns": [...],
  "red_flags": [...],
  "bias_flags": [...],
  "summary": "..."
}
```

### 4. `CompensationClient.tsx` — Compensation Intelligence (Step 2)

1. **Loads candidate data** from `localStorage` (saved in Step 1)
2. **Auto-triggers AI analysis** on page load
3. **3 Offer Scenario Cards:**
   - **Conservative** — below market median, lower acceptance probability
   - **Competitive** (recommended) — at market median, highlighted with accent border
   - **Aggressive** — above market, highest acceptance probability
4. Each card shows: base salary, signing bonus, equity, total comp, **acceptance probability bar** (color-coded green/yellow/red)
5. **AI Rationale** — explains the compensation strategy
6. **Negotiation Playbook** — tactical advice for the offer conversation
7. User clicks a scenario to select it → "Generate CEO Brief" proceeds

### 5. `ApprovalClient.tsx` — CEO Approval (Step 3)

1. **Loads candidate + selected offer** from `localStorage`
2. **AI generates executive brief** — structured markdown with sections:
   - Candidate Highlight
   - Interview Assessment
   - Compensation Recommendation
   - Strategic Value
   - Risk Assessment
   - Recommendation
3. **Simple markdown renderer** converts the AI output to HTML (handles `##` headings, `**bold**`, bullet points)
4. **3 decision buttons:**
   - **Approve Hire** (green) → saves approval to `localStorage`, shows success animation
   - **Request Discussion** (neutral) → shows "meeting scheduled" message
   - **Decline** (red) → shows declined message
5. On approval → user can proceed to generate offer letter

### 6. `OfferLetterClient.tsx` — Offer Letter (Step 4)

1. **Loads approval data** from `localStorage`
2. **AI generates personalized offer letter** containing:
   - Full company details and date
   - Position details, compensation breakdown
   - Benefits summary from `COMPANY_POLICIES`
   - Terms of employment, acceptance deadline
3. **Preview panel** — shows the letter in a serif font (Georgia) mimicking a formal document
4. **Download buttons:**
   - **Download .docx** → calls `/api/generate-docx` API route
   - **Save PDF** → opens a print-friendly window with the letter content
5. **Completion celebration** after download — "Hiring Pipeline Complete! 🎉"

### 7. `api/generate-docx/route.ts` — Word Document Generator

Server-side Next.js API route using the `docx` npm package:

- Receives letter text via POST request
- Parses the text into paragraphs, detecting:
  - **ALL CAPS lines** → Heading 2
  - **Lines starting with • or -** → Bullet points with bold keys
  - **Numbered lines** → Numbered list items
  - **Key: Value lines** → Bold key formatting
- Generates a properly formatted `.docx` with 1-inch margins
- Streams the file back as a download

### 8. `styles/hiring.css` — Styling

All styles are scoped under `.deriv-app` to avoid conflicts. Key UI elements styled:
- **Step indicator** — horizontal tab bar showing the 4 steps with active/done/pending states
- **Candidate cards** — selectable cards with avatar initials and hover/selected states
- **Feedback cards** — labeled text areas with round badges
- **Score ring** — CSS + SVG for the animated circular score
- **Competency bars** — gradient fill bars with animated width
- **Compensation cards** — 3-column grid with recommended badge and acceptance bars
- **Executive brief card** — document-style with serif-inspired typography
- **Loading/Success states** — spinner animation and checkmark celebration

### 9. `Sidebar.tsx` — Navigation Updates

Added a new **"AI Tools"** nav group after Insights with a single entry:
- **Hiring Intelligence** (`/hiring`) — sparkle icon 🔹 with an "AI" accent badge

The sparkle icon is a custom star SVG. Clicking it navigates to the landing page where users select a candidate to begin the pipeline.

```typescript
{
  group: "AI Tools",
  items: [
    { label: "Hiring Intelligence", href: "/hiring", icon: "sparkle", badge: "AI", badgeClass: "accent" },
  ],
}
```

### 10. `styles/hiring.css` — Landing Page Styles

New CSS classes added for the landing page (prefixed `hi-landing-*` and `hi-info-*`):
- **`.hi-pipeline-overview`** — horizontal stats bar (Shortlisted count, AI Steps, Powered by Gemini)
- **`.hi-landing-card`** — expandable candidate cards with hover/expand transitions
- **`.hi-landing-expanded`** — animated detail sections showing interview previews
- **`.hi-start-pipeline-btn`** — full-width CTA button inheriting `.hi-btn-primary`
- **`.hi-info-row` / `.hi-info-card`** — 4-column grid of step explanation cards
- All landing styles are responsive (single-column on mobile)

---

## Setup — Gemini API Key

The only setup required is a **Google Gemini API key**. No local LLM, no Flowise, no Ollama.

### Step 1: Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Click **"Create API Key"**
3. Copy the key

### Step 2: Configure `.env.local`

Create a `.env.local` file in the `HRAI - Copy/` project root:

```env
# Gemini AI Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your-api-key-here
NEXT_PUBLIC_GEMINI_MODEL=gemini-2.0-flash
```

### Step 3: Restart the dev server

```bash
npm run dev
```

That's it! The AI pipeline is now fully powered by Gemini Flash.

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | **Yes** | — | Your Google Gemini API key from [AI Studio](https://aistudio.google.com/apikey) |
| `NEXT_PUBLIC_GEMINI_MODEL` | No | `gemini-2.0-flash` | Gemini model to use |

> **Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. This is fine for hackathon/demo use. For production, proxy through a server-side API route.

---

## Demo Flow

### Quick Demo (without API key — uses mock fallback data)

1. Start the Next.js app: `npm run dev`
2. Click **"Hiring Intelligence"** in the sidebar (under AI Tools)
3. See all 3 shortlisted candidates → click one to expand their profile
4. Review interview summaries → click **"Start AI Hiring Pipeline"**
5. Feedback page opens with the candidate pre-loaded → click **"Analyze Candidate"**
6. Review the AI scorecard → click **"Proceed to Compensation Analysis"**
7. 3 offer cards appear → select one → click **"Generate CEO Brief"**
8. Read the executive brief → click **"Approve Hire"**
9. Offer letter is generated → click **"Download .docx"** or **"Save PDF"**

### Full AI Demo (with Gemini API key)

1. Set your Gemini API key in `.env.local` (see setup above)
2. Start Next.js: `npm run dev`
3. Click **"Hiring Intelligence"** in the sidebar → select a candidate → follow the flow
4. All AI responses are now generated by **Gemini 2.0 Flash** — real analysis, not mock data

---

## Summary of What Needs Manual Setup

| Item | Status | What to Do |
|------|--------|-----------|
| Next.js code | ✅ Done | All pages, components, styles, API routes are built |
| Landing page | ✅ Done | `/hiring` with candidate cards and pipeline overview |
| `docx` npm package | ✅ Installed | Already added via `npm install docx` |
| Sidebar navigation | ✅ Done | "Hiring Intelligence" under AI Tools group |
| Gemini API Key | ❓ Manual | Get from [Google AI Studio](https://aistudio.google.com/apikey) |
| `.env.local` | ❓ Manual | Set `NEXT_PUBLIC_GEMINI_API_KEY` |
| Mock data fallback | ✅ Built-in | Demo works without API key |
