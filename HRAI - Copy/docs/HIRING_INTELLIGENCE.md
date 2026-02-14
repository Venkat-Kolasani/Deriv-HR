# AI-Powered Hiring Intelligence System

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Code Walkthrough](#code-walkthrough)
5. [Manual Setup Required](#manual-setup-required)
6. [How to Create Flowise Chatflows](#how-to-create-flowise-chatflows)
7. [Environment Variables](#environment-variables)
8. [Demo Flow](#demo-flow)

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
- **No Python backend** — Flowise handles all AI/LLM calls, Next.js API routes handle `.docx` generation
- **Graceful fallback** — Every AI call has mock data fallback, so the demo works even without Flowise/Ollama running
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
     ┌─────────────────┐  ┌───────────────────┐
     │  Flowise :3000   │  │ Next.js API Route │
     │  (AI/LLM calls)  │  │ /api/generate-docx│
     │                   │  │ (docx npm package)│
     │  ChatOllama node  │  └───────────────────┘
     │       ↓           │
     │  Ollama :11434    │
     │  (Local Llama)    │
     └───────────────────┘
```

**Data flow:**
1. User navigates to `/hiring` → sees all shortlisted candidates as expandable cards
2. User clicks a candidate card → views interview summaries (resume, telephonic, cultural fit, reference)
3. User clicks **"Start AI Hiring Pipeline"** → candidate data stored in `localStorage`, redirected to `/hiring/feedback`
4. Step 1: Feedback text sent to Flowise → ChatOllama → Ollama (Llama) → JSON scorecard returned
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
1. **Pipeline Overview Bar** — Shows "3 Shortlisted", "4 AI Steps", "Powered by Llama" stats
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

### 1. `lib/flowise.ts` — Flowise API Helper

This is the bridge between the frontend and Flowise (which wraps Ollama/Llama).

```typescript
// Core function — sends a question to a Flowise chatflow
export async function askFlowise(chatflowId: string, question: string) {
  const res = await fetch(`${FLOWISE_BASE}/api/v1/prediction/${chatflowId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  return res.json();
}
```

**Key details:**
- `CHATFLOW_IDS` object stores the 4 chatflow IDs (one per module). These need to be updated after you create the chatflows in Flowise.
- `parseJsonFromLLM()` handles the fact that LLMs sometimes wrap JSON in markdown code blocks (` ```json ... ``` `). It strips the wrapper and extracts valid JSON.
- Supports optional API key authentication via `NEXT_PUBLIC_FLOWISE_API_KEY`.

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
- **`.hi-pipeline-overview`** — horizontal stats bar (Shortlisted count, AI Steps, Powered by Llama)
- **`.hi-landing-card`** — expandable candidate cards with hover/expand transitions
- **`.hi-landing-expanded`** — animated detail sections showing interview previews
- **`.hi-start-pipeline-btn`** — full-width CTA button inheriting `.hi-btn-primary`
- **`.hi-info-row` / `.hi-info-card`** — 4-column grid of step explanation cards
- All landing styles are responsive (single-column on mobile)

---

## Manual Setup Required

### 1. Ollama — Local LLM Server

Ollama must be installed and running with a Llama model.

```bash
# Install Ollama (if not already installed)
curl -fsSL https://ollama.com/install.sh | sh

# Pull a Llama model (choose one)
ollama pull llama3.1:8b       # Recommended — good balance of speed/quality
# OR
ollama pull llama3.2:3b       # Faster, lighter
# OR
ollama pull llama3.1:70b      # Best quality, needs GPU with 48GB+ VRAM

# Start Ollama (if not auto-started)
ollama serve
```

Ollama runs on `http://localhost:11434` by default.

### 2. Flowise — AI Flow Builder

Flowise should already be running (`npx flowise start`). Open the UI at `http://localhost:3000`.

You need to create **4 chatflows** in Flowise. See the detailed guide below.

### 3. Chatflow IDs → Code Configuration

After creating the 4 chatflows, copy their IDs into the code.

**Option A: Environment variables** (recommended)

Create or update `.env.local` in the project root:

```env
NEXT_PUBLIC_FLOWISE_URL=http://localhost:3000
NEXT_PUBLIC_FLOWISE_FEEDBACK_ID=your-feedback-chatflow-id-here
NEXT_PUBLIC_FLOWISE_COMPENSATION_ID=your-compensation-chatflow-id-here
NEXT_PUBLIC_FLOWISE_BRIEF_ID=your-brief-chatflow-id-here
NEXT_PUBLIC_FLOWISE_OFFER_ID=your-offer-chatflow-id-here

# Only needed if you set an API key in Flowise
# NEXT_PUBLIC_FLOWISE_API_KEY=your-flowise-api-key
```

**Option B: Edit the code directly**

Open `app/lib/flowise.ts` and replace the placeholder IDs:

```typescript
export const CHATFLOW_IDS = {
  FEEDBACK: "paste-your-feedback-chatflow-id",
  COMPENSATION: "paste-your-compensation-chatflow-id",
  EXECUTIVE_BRIEF: "paste-your-brief-chatflow-id",
  OFFER_LETTER: "paste-your-offer-chatflow-id",
};
```

### 4. Install the `docx` npm package

This should already be installed. If not:

```bash
npm install docx
```

---

## How to Create Flowise Chatflows

### Step-by-Step (for all 4 chatflows)

1. Open Flowise at `http://localhost:3000`
2. Click **"+ Add New"** (or "Chatflows" → "Add New")
3. Drag these nodes onto the canvas:

   **Required nodes:**
   - **ChatOllama** (under "Chat Models")
   - **Prompt Template** (under "Prompts") — optional but recommended

4. **Configure the ChatOllama node:**
   - **Base URL**: `http://localhost:11434`
   - **Model Name**: `llama3.1:8b` (or whichever model you pulled)
   - **Temperature**: `0.3` (we want structured, consistent output)

5. **Connect the nodes:**
   - If using Prompt Template: connect Prompt Template → ChatOllama
   - The chat input automatically connects to the chain

6. **Save the chatflow** with a descriptive name
7. **Copy the chatflow ID** — visible in the URL bar or the chatflow settings

### Chatflow Names & System Prompts

Create 4 chatflows with these names and purposes:

#### Chatflow 1: `feedback-synthesis`
**Purpose:** Analyzes interview feedback and returns a structured JSON scorecard.

**System Prompt (paste into the ChatOllama system message or Prompt Template):**
```
You are an expert HR analyst specializing in hiring decisions. When given interview feedback for a candidate, you analyze it thoroughly and return a structured JSON assessment.

You must ALWAYS respond with ONLY a valid JSON object (no markdown, no explanation, no extra text). The JSON must have this exact structure:
{
  "overall_score": <number 1-10>,
  "competencies": {
    "Technical Skills": <number 1-10>,
    "Communication": <number 1-10>,
    "Leadership": <number 1-10>,
    "Culture Fit": <number 1-10>
  },
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "concerns": ["<concern 1>", "<concern 2>"],
  "red_flags": ["<red flag if any, otherwise empty array>"],
  "bias_flags": ["<any potentially biased language detected in the feedback>"],
  "summary": "<2-3 sentence summary of the candidate>"
}
```

#### Chatflow 2: `compensation-analysis`
**Purpose:** Generates 3 salary offer scenarios with rationale.

**System Prompt:**
```
You are an expert compensation analyst at a global fintech company. When given candidate details and market benchmarks, you generate exactly 3 offer scenarios.

You must ALWAYS respond with ONLY a valid JSON object:
{
  "scenarios": [
    {
      "label": "Conservative",
      "baseSalary": <number>,
      "signingBonus": <number>,
      "equity": "<description>",
      "totalComp": <number>,
      "acceptanceProbability": <number 0-100>,
      "pros": ["<pro 1>", "<pro 2>"]
    },
    { ...Competitive scenario... },
    { ...Aggressive scenario... }
  ],
  "rationale": "<2-3 sentences>",
  "negotiation_playbook": "<3-4 sentences>"
}
```

#### Chatflow 3: `executive-brief`
**Purpose:** Generates a CEO-ready hiring brief in markdown.

**System Prompt:**
```
You are an executive communications specialist. Write concise, data-driven CEO approval briefs for hiring decisions.

Structure your response in markdown with these sections:
## Candidate Highlight
## Interview Assessment
## Compensation Recommendation
## Strategic Value
## Risk Assessment
## Recommendation

Keep each section to 2-3 sentences. Be direct, quantitative, and executive-friendly.
```

#### Chatflow 4: `offer-letter`
**Purpose:** Generates a personalized offer letter.

**System Prompt:**
```
You are an HR professional writing offer letters. Generate professional, warm, and comprehensive offer letters.

Include these sections:
- Greeting
- Position details (role, department, location, start date)
- Compensation breakdown (base salary, signing bonus, equity)
- Benefits summary
- Terms of employment (probation, notice period)
- Acceptance deadline (2 weeks from letter date)
- Closing

Do NOT use markdown formatting. Write in plain text suitable for a formal document.
```

### Getting the Chatflow IDs

After saving each chatflow:
1. Open the chatflow
2. Look at the **URL** — it will be like `http://localhost:3000/chatflows/abc123-def456-...`
3. The part after `/chatflows/` is the chatflow ID
4. **OR** click the code/embed icon (< >) in the chatflow toolbar — it shows the API call with the chatflow ID

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Flowise Configuration
NEXT_PUBLIC_FLOWISE_URL=http://localhost:3000
NEXT_PUBLIC_FLOWISE_FEEDBACK_ID=<paste chatflow 1 ID>
NEXT_PUBLIC_FLOWISE_COMPENSATION_ID=<paste chatflow 2 ID>
NEXT_PUBLIC_FLOWISE_BRIEF_ID=<paste chatflow 3 ID>
NEXT_PUBLIC_FLOWISE_OFFER_ID=<paste chatflow 4 ID>

# Optional — only if Flowise has API key auth enabled
# NEXT_PUBLIC_FLOWISE_API_KEY=<your key>
```

> **Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. This is fine for localhost development. For production, you'd proxy through a server-side API route.

---

## Demo Flow

### Quick Demo (without Flowise/Ollama — uses mock fallback data)

1. Start the Next.js app: `npm run dev`
2. Click **"Hiring Intelligence"** in the sidebar (under AI Tools)
3. See all 3 shortlisted candidates → click one to expand their profile
4. Review interview summaries → click **"Start AI Hiring Pipeline"**
5. Feedback page opens with the candidate pre-loaded → click **"Analyze Candidate"**
6. Review the AI scorecard → click **"Proceed to Compensation Analysis"**
7. 3 offer cards appear → select one → click **"Generate CEO Brief"**
8. Read the executive brief → click **"Approve Hire"**
9. Offer letter is generated → click **"Download .docx"** or **"Save PDF"**

### Full Demo (with Flowise + Ollama)

1. Ensure Ollama is running: `ollama serve`
2. Ensure a model is loaded: `ollama pull llama3.1:8b`
3. Ensure Flowise is running: `npx flowise start`
4. Create the 4 chatflows (see above)
5. Set the chatflow IDs in `.env.local`
6. Start Next.js: `npm run dev`
7. Click **"Hiring Intelligence"** in the sidebar → select a candidate → follow the flow

The AI responses will now be generated by Llama instead of mock data.

---

## Summary of What Needs Manual Setup

| Item | Status | What to Do |
|------|--------|-----------|
| Next.js code | ✅ Done | All pages, components, styles, API routes are built |
| Landing page | ✅ Done | `/hiring` with candidate cards and pipeline overview |
| `docx` npm package | ✅ Installed | Already added via `npm install docx` |
| Sidebar navigation | ✅ Done | "Hiring Intelligence" under AI Tools group |
| Ollama | ❓ Manual | Install and pull a Llama model |
| Flowise | ❓ Manual | Create 4 chatflows with system prompts |
| `.env.local` | ❓ Manual | Set the 4 chatflow IDs after creating them |
| Mock data fallback | ✅ Built-in | Demo works without Flowise running |
