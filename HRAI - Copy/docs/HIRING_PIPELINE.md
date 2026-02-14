# Hiring Intelligence Pipeline — Comprehensive Technical Documentation

> **Purpose**: This document provides a complete technical walkthrough of the AI-powered Hiring Intelligence pipeline in the derivHR application. It covers every file, every core function, how data flows between steps, how AI is integrated, and **why** specific technical decisions were made.

---

## Table of Contents

- [1. Technical Architecture Overview](#1-technical-architecture-overview)
- [2. Technology Stack & Design Decisions](#2-technology-stack--design-decisions)
- [3. File Structure](#3-file-structure)
- [4. Shared Utilities (Backend)](#4-shared-utilities-backend)
- [5. Pipeline Landing Page](#5-pipeline-landing-page)
- [6. Step 1 — AI Candidate Review](#6-step-1--ai-candidate-review)
- [7. Step 2 — Compensation Intelligence](#7-step-2--compensation-intelligence)
- [8. Step 3 — CEO Approval Brief](#8-step-3--ceo-approval-brief)
- [9. Step 4 — AI Document Suite](#9-step-4--ai-document-suite)
- [10. Backend API — DOCX Generation](#10-backend-api--docx-generation)
- [11. Data Flow Between Steps](#11-data-flow-between-steps)
- [12. AI Integration Architecture](#12-ai-integration-architecture)
- [13. PDF & DOCX Export Mechanics](#13-pdf--docx-export-mechanics)
- [14. Styling Architecture](#14-styling-architecture)
- [15. Environment Configuration](#15-environment-configuration)

---

## 1. Technical Architecture Overview

The Hiring Intelligence pipeline is a 4-step AI-powered recruitment automation system built as a module within the derivHR Next.js application. It covers the full post-interview hiring lifecycle:

```
Landing Page → Step 1: Candidate Review → Step 2: Compensation → Step 3: CEO Approval → Step 4: Document Suite
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (Next.js 14)                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐         │
│  │ HiringLanding  │  │ FeedbackClient │  │ CompensationCl │         │
│  │   Client.tsx   │→ │     .tsx       │→ │   ient.tsx     │         │
│  └────────────────┘  └───────┬────────┘  └───────┬────────┘         │
│                              │                    │                  │
│                     localStorage          localStorage               │
│                    (hiring-feedback       (hiring-compensation       │
│                       -data)                -data)                   │
│                              │                    │                  │
│  ┌────────────────┐  ┌──────▼─────────┐  ┌──────▼─────────┐        │
│  │ OfferLetter    │← │ ApprovalClient │← │                │        │
│  │  Client.tsx    │  │     .tsx       │  │                │        │
│  └───────┬────────┘  └────────────────┘  └────────────────┘        │
│          │                                                          │
│          │  fetch('/api/generate-docx')                              │
│          ▼                                                          │
│  ┌────────────────┐                                                 │
│  │ route.ts       │  ← Server-side DOCX generation                 │
│  │ (docx library) │                                                 │
│  └────────────────┘                                                 │
└─────────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴────────────────┐
              ▼                                ▼
   ┌──────────────────┐             ┌──────────────────┐
   │   Flowise API    │             │   Gemini API     │
   │  (localhost:3000) │             │  (Google Cloud)  │
   │   Llama 3.3 LLM  │             │  gemini-2.0-flash│
   └──────────────────┘             └──────────────────┘
```

### Key Design Principle: Client-Side Orchestration

The pipeline is fully orchestrated on the client side. Each step is a `"use client"` React component that:
1. Reads data from `localStorage` (set by the previous step)
2. Calls the AI API (Flowise or Gemini)
3. Renders the result
4. Saves output to `localStorage` for the next step

**Why client-side instead of a backend API?**
- **Simplicity**: No need for a database, user sessions, or backend state management. Perfect for a hackathon prototype.
- **Offline resilience**: Once loaded, the app works even if the backend goes down (via fallback templates).
- **Speed**: Eliminates round-trips for state persistence. localStorage is synchronous and instant.
- **Trade-off**: Data is not persistent across browsers or devices. This is acceptable for a demo/hackathon but would need a backend database (e.g., Supabase/Firebase) in production.

---

## 2. Technology Stack & Design Decisions

| Layer | Technology | Why This Over Alternatives |
|-------|-----------|---------------------------|
| **Framework** | Next.js 14 (App Router) | Built-in file-based routing, server components for layouts, API routes for DOCX generation. Chosen over Vite because we need server-side API routes. |
| **AI (Primary)** | Flowise + Ollama (Llama 3.3) | Self-hosted, no API costs, full control over prompts. Flowise provides a visual chatflow builder. Chosen over raw Ollama API for its orchestration layer and prompt management UI. |
| **AI (Secondary)** | Google Gemini 2.0 Flash | Used by the broader derivHR app (ChatWidget, Dashboard AI, Compliance). Kept as a separate integration in `gemini.ts`. |
| **State Management** | `localStorage` | No external database needed. Steps pass data via named keys. Alternatives: React Context (lost on page reload), URL params (too large for scorecard data), Zustand/Redux (overkill for linear pipeline). |
| **DOCX Generation** | `docx` npm library (server-side) | Generates real `.docx` files with proper formatting. Runs on the server via Next.js API route because it uses Node.js `Buffer`. Chosen over client-side alternatives like `html-docx-js` (poor formatting) or `docxtemplater` (requires pre-built templates). |
| **PDF Export** | `window.print()` (browser-native) | WYSIWYG — what you see in the preview is exactly what the PDF contains. Chosen over `jsPDF` (hard to replicate CSS), `html2pdf.js` (dependency weight), or `puppeteer` (server-side complexity). |
| **Styling** | Vanilla CSS (`hiring.css`) | Single CSS file with `hi-` prefixed classes to avoid global conflicts. Chosen over Tailwind for fine-grained control over component styling and easier customization. |
| **Routing** | Next.js App Router | Each step is a route (`/hiring/feedback`, `/hiring/compensation`, `/hiring/approval`, `/hiring/contract`). The `layout.tsx` wraps all 4 steps with the same sidebar, topbar, and chat widget. |

---

## 3. File Structure

```
app/
├── hiring/
│   ├── layout.tsx                  ← Shared layout (sidebar + topbar)
│   ├── page.tsx                    ← Landing page (server component wrapper)
│   ├── HiringLandingClient.tsx     ← Landing page (client component)
│   ├── feedback/
│   │   ├── page.tsx                ← Step 1 server wrapper
│   │   └── FeedbackClient.tsx      ← Step 1 client component (449 lines)
│   ├── compensation/
│   │   ├── page.tsx                ← Step 2 server wrapper
│   │   └── CompensationClient.tsx  ← Step 2 client component (311 lines)
│   ├── approval/
│   │   ├── page.tsx                ← Step 3 server wrapper
│   │   └── ApprovalClient.tsx      ← Step 3 client component (282 lines)
│   └── contract/
│       ├── page.tsx                ← Step 4 server wrapper
│       └── OfferLetterClient.tsx   ← Step 4 client component (909 lines)
├── api/
│   └── generate-docx/
│       └── route.ts                ← DOCX generation API (167 lines)
├── lib/
│   ├── flowise.ts                  ← Flowise API helper (150 lines)
│   ├── mock-candidates.ts          ← Mock data + company policies (141 lines)
│   ├── gemini.ts                   ← Gemini AI integration (595 lines)
│   └── firebase.ts                 ← Firebase data helper
└── styles/
    └── hiring.css                  ← All hiring pipeline CSS
```

### Why Server Component + Client Component Pattern?

Each step uses a thin **server component** wrapper (`page.tsx`) that imports a **client component** (`*Client.tsx`).

```typescript
// feedback/page.tsx (Server Component — 10 lines)
import FeedbackClient from "./FeedbackClient";
export const metadata = { title: "derivHR — Candidate Review" };
export default function FeedbackPage() {
    return <FeedbackClient />;
}
```

**Why?**
- The `page.tsx` server component sets the HTML `<title>` via `metadata` — this only works in server components.
- The `*Client.tsx` has the `"use client"` directive because it uses React hooks (`useState`, `useEffect`), browser APIs (`localStorage`, `fetch`), and event handlers.
- This is the standard Next.js 14 App Router pattern. You cannot use `useState` in a server component, and you cannot export `metadata` from a client component.

---

## 4. Shared Utilities (Backend)

### 4.1 `app/lib/flowise.ts` — AI Communication Layer

**File**: `app/lib/flowise.ts` (150 lines)

This is the primary AI communication layer for the Hiring Pipeline. It wraps the Flowise Prediction API.

#### Core Function: `askFlowise()`

```typescript
export async function askFlowise(
    chatflowId: string,
    question: string
): Promise<FlowiseResponse> {
    const res = await fetch(`${FLOWISE_BASE}/api/v1/prediction/${chatflowId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(apiKey ? { "Authorization": `Bearer ${apiKey}` } : {}) },
        body: JSON.stringify({ question }),
    });
    return res.json();
}
```

**How it works:**
1. Takes a `chatflowId` (UUID of a Flowise chatflow) and a `question` (the prompt text).
2. Makes a POST request to `http://localhost:3000/api/v1/prediction/{chatflowId}`.
3. Returns the response containing a `.text` field with the LLM's answer.

**Why Flowise instead of direct Ollama API?**
- Flowise provides a visual UI for building prompt chains (chatflows).
- It handles prompt templates, memory management, and output parsing via its built-in nodes.
- It can be swapped to any LLM backend (OpenAI, Claude, Gemini) without changing the application code — you just reconfigure the chatflow.

#### `CHATFLOW_IDS` — Chatflow Registry

```typescript
export const CHATFLOW_IDS = {
    FEEDBACK:       process.env.NEXT_PUBLIC_FLOWISE_FEEDBACK_ID       || "YOUR_FEEDBACK_CHATFLOW_ID",
    COMPENSATION:   process.env.NEXT_PUBLIC_FLOWISE_COMPENSATION_ID   || "YOUR_COMPENSATION_CHATFLOW_ID",
    EXECUTIVE_BRIEF: process.env.NEXT_PUBLIC_FLOWISE_BRIEF_ID         || "YOUR_BRIEF_CHATFLOW_ID",
    OFFER_LETTER:   process.env.NEXT_PUBLIC_FLOWISE_OFFER_ID          || "YOUR_OFFER_CHATFLOW_ID",
};
```

Each hiring step maps to a dedicated Flowise chatflow. The IDs are configured via environment variables. If not set, they fall back to placeholder strings (which will cause the API call to fail, triggering the fallback template).

**Note**: Step 1 (`FeedbackClient.tsx`) currently uses a **hardcoded chatflow ID** (`0458e1da-1714-45fd-81a3-577d5d7f61c3`) instead of `CHATFLOW_IDS.FEEDBACK`. This is because Step 1 was implemented first with a direct API call before the helper was refactored.

#### JSON Parsing Utilities

```typescript
export function parseJsonFromLLM<T = any>(text: string): T
```

**Why this exists:** LLMs often wrap JSON in markdown code blocks (e.g., `` ```json ... ``` ``) or return malformed JSON. This function:
1. First tries to extract JSON from a markdown code block.
2. If that fails, looks for the first `{...}` or `[...]` pattern in the text.
3. This multi-layer parsing ensures we can handle any LLM output format.

```typescript
export function parseFlowiseStructuredOutput<T>(response: FlowiseResponse | any): T
```

**Why this exists:** Flowise can return responses in multiple formats:
- Simple `{ text: "..." }` — direct LLM output.
- Complex `{ agentFlowExecutedData: [...] }` — when using agent chatflows with multiple nodes.

This function abstracts away the response format differences so calling code doesn't need to know which type of chatflow was used.

#### `CompatibilityScore` Interface

```typescript
export interface CompatibilityScore {
    score: number;
    "Key Strength": string[];
    "Concerns": string[];
    "Technical Skills": number;
    "Communication": number;
    "Leadership": number;
    "Culture Fit": number;
    "Bias Detection": string[];
}
```

This is the **contract between the AI and the frontend**. The Flowise chatflow for Step 1 is configured with a prompt that instructs the LLM to return a JSON object matching this exact structure. The frontend then maps these fields to the scorecard UI.

---

### 4.2 `app/lib/mock-candidates.ts` — Mock Data & Company Policies

**File**: `app/lib/mock-candidates.ts` (141 lines)

This file serves three purposes:

#### 1. `MOCK_CANDIDATES` — Three Realistic Candidate Profiles

```typescript
export interface CandidateProfile {
    id: string;           // Unique identifier (e.g., "cand-001")
    name: string;         // Full name
    role: string;         // Applied role (e.g., "Senior Software Engineer")
    department: string;   // Target department
    experience: number;   // Years of experience
    location: string;     // Candidate's location
    status: string;       // Pipeline status (e.g., "Interview Complete")
    skills: string[];     // Key skill tags
    resumeReview: string;       // ~200-word resume assessment
    telephonicInterview: string; // ~200-word phone screen notes
    culturalFit: string;         // ~200-word panel interview notes
    referenceCheck: string;      // ~200-word reference check notes
}
```

**Why mock data instead of user input?**
- For a hackathon demo, pre-populated data lets us demonstrate the AI analysis immediately without requiring the judge to type hundreds of words of interview feedback.
- The textareas are editable — judges can modify the feedback if they want.
- The profiles are realistic and diverse: Sarah Chen (Engineer, Malaysia), Marcus Thompson (PM, UK), Aisha Rahman (Data Scientist, Singapore).

**Why are the interview notes so detailed?**
- The AI needs substantial context to generate meaningful analysis. Short notes like "good candidate" would produce generic scorecards. The detailed 200-word notes per round give the LLM enough signal to identify specific strengths, concerns, and bias indicators.

#### 2. `SALARY_BENCHMARKS` — Market Salary Data

```typescript
export const SALARY_BENCHMARKS: Record<string, Record<string, { p25: number; p50: number; p75: number; p90: number }>> = {
    "Senior Software Engineer": {
        Malaysia: { p25: 85000, p50: 100000, p75: 118000, p90: 140000 },
        ...
    },
    ...
};
```

A nested lookup table: `SALARY_BENCHMARKS[role][location]` → percentile breakdown. Used by Step 2 to generate compensation scenarios relative to market rates.

**Why hardcoded instead of an API?**
- For a hackathon, this avoids dependency on an external salary data provider (like Mercer or Glassdoor API, which require paid subscriptions).
- The data structure supports easy extension to new roles and locations.

#### 3. `COMPANY_POLICIES` — Deriv Group Employment Policies

```typescript
export const COMPANY_POLICIES = {
    name: "Deriv Group",
    probationPeriod: "3 months",
    noticePeriod: { duringProbation: "1 week", ... },
    benefits: { annualLeave: 18, sickLeave: 14, ... },
    equity: { vestingSchedule: "4-year vesting with 1-year cliff", ... },
};
```

Used by Step 4's fallback templates to fill in company-specific employment terms. This ensures all generated documents have consistent, accurate company policy data.

---

### 4.3 `app/lib/gemini.ts` — Gemini AI Integration (Broader App)

**File**: `app/lib/gemini.ts` (595 lines)

This file powers the **broader derivHR application** (ChatWidget, Dashboard, Compliance page), NOT the Hiring Pipeline directly. However, it's important to understand because:

1. It defines the Gemini API integration pattern used across the app.
2. It contains`generateContract()` which is an **alternative** contract generation function that uses Gemini + Firebase clause templates. The Hiring Pipeline uses Flowise instead.
3. It contains `generateMorningBriefing()` and `analyzeComplianceRisks()` — AI-powered features for the Dashboard and Compliance pages.

**Key functions:**
- `agentChat()` — Multi-turn agentic chat with Gemini function calling. The ChatWidget uses this.
- `executeTool()` — Executes tool calls from Gemini (e.g., `get_all_employees`, `get_compliance_data`). These fetch data from Firebase.
- `generateContract()` — Alternative contract generator using Gemini + Firebase clause templates. Jurisdiction-aware.
- `generateMorningBriefing()` — Dashboard AI briefing.
- `analyzeComplianceRisks()` — Compliance page AI analysis.

**Why does the Hiring Pipeline use Flowise instead of `gemini.ts`?**
- The Hiring Pipeline was designed to work with self-hosted Llama 3.3 via Flowise/Ollama for privacy (no data sent to Google).
- `gemini.ts` sends data to Google's API servers. For sensitive HR data (candidate evaluations, salary decisions), self-hosted inference is preferred.
- Flowise provides a low-code chatflow builder, making it easier to iterate on prompts without code changes.

---

### 4.4 `app/hiring/layout.tsx` — Shared Layout

```typescript
export default function HiringLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="deriv-app">
            <Sidebar />
            <div className="sidebar-overlay"></div>
            <main className="main">
                <Topbar />
                <div className="page-content">{children}</div>
            </main>
            <ChatWidget />
        </div>
    );
}
```

**Why a shared layout?**
- All 4 steps share the same chrome: Sidebar navigation, Topbar with user info, and the Gemini ChatWidget.
- Next.js App Router layouts persist across navigations, so the sidebar doesn't re-render when moving between steps.
- CSS imports (`deriv.css`, `hiring.css`) are loaded once here rather than in each step.

---

## 5. Pipeline Landing Page

**File**: `app/hiring/HiringLandingClient.tsx` (186 lines)  
**Route**: `/hiring`

### What It Does
Displays the 3 mock candidates as interactive cards. Clicking a card expands it to show a preview of their interview feedback. Clicking "Start AI Hiring Pipeline" begins the 4-step process for that candidate.

### Core Function: `handleStartPipeline()`

```typescript
function handleStartPipeline(c: CandidateProfile) {
    localStorage.setItem("hiring-selected-candidate", JSON.stringify(c));
    localStorage.removeItem("hiring-feedback-data");
    localStorage.removeItem("hiring-compensation-data");
    localStorage.removeItem("hiring-approval-status");
    window.location.href = "/hiring/feedback";
}
```

**What it does:**
1. Saves the selected candidate object to `localStorage` under the key `"hiring-selected-candidate"`.
2. **Clears all previous pipeline data** — this ensures a fresh start. Without this, stale data from a previous candidate's pipeline run would contaminate the new run.
3. Navigates to Step 1 via `window.location.href` (full page navigation, not React Router).

**Why `window.location.href` instead of Next.js `router.push()`?**
- Forces a full page reload, which ensures the Step 1 component's `useEffect` runs fresh and picks up the newly stored `localStorage` data. With `router.push()`, the component might not re-mount if it was previously rendered.

### UI Components
- **Pipeline Overview bar**: Shows "3 Shortlisted", "4 AI Steps", "Powered by Llama".
- **Candidate cards**: Expandable cards with avatar initials, role, experience, location, and status badge.
- **Expanded view**: Truncated previews (200 chars) of Resume Review, Telephonic Interview, Cultural Fit, and Reference Check.
- **Info Cards**: Four cards at the bottom describing each pipeline step.

---

## 6. Step 1 — AI Candidate Review

**File**: `app/hiring/feedback/FeedbackClient.tsx` (449 lines)  
**Route**: `/hiring/feedback`

### Purpose
Takes multi-round interview feedback (4 text areas) and sends it to AI for synthesis into a structured scorecard with bias detection.

### Component Structure

#### Sub-component: `HiringSteps`

```typescript
function HiringSteps({ active }: { active: number }) {
    const steps = [
        { num: 1, label: "Candidate Review", href: "/hiring/feedback" },
        { num: 2, label: "Compensation", href: "/hiring/compensation" },
        { num: 3, label: "CEO Approval", href: "/hiring/approval" },
        { num: 4, label: "Offer Letter", href: "/hiring/contract" },
    ];
    ...
}
```

This is the horizontal step indicator bar at the top of every pipeline page. It shows which step is active, which are completed (✓), and which are upcoming. **Note**: This component is duplicated in each step file rather than shared. This is a trade-off for development speed (hackathon) vs. DRY principles.

#### Sub-component: `ScoreRing`

```typescript
function ScoreRing({ score }: { score: number }) {
    const pct = (score / 10) * 100;
    const r = 42;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    ...
}
```

A pure SVG circular progress indicator. Uses `strokeDasharray` and `strokeDashoffset` to animate the ring fill. Color-coded:
- Green (≥7.5): Strong candidate
- Amber (≥5.0): Moderate candidate
- Red (<5.0): Weak candidate

**Why SVG instead of a CSS-based ring?** SVG gives exact control over stroke rendering, smooth animation via CSS transition, and looks crisp at any size. CSS-only solutions (`conic-gradient`) have inconsistent browser support for animation.

### State Management

```typescript
const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile>(MOCK_CANDIDATES[0]);
const [resumeReview, setResumeReview] = useState(MOCK_CANDIDATES[0].resumeReview);
const [telephonic, setTelephonic] = useState(MOCK_CANDIDATES[0].telephonicInterview);
const [culturalFit, setCulturalFit] = useState(MOCK_CANDIDATES[0].culturalFit);
const [referenceCheck, setReferenceCheck] = useState(MOCK_CANDIDATES[0].referenceCheck);
const [analyzing, setAnalyzing] = useState(false);
const [scorecard, setScorecard] = useState<ScorecardData | null>(null);
const [loadingStep, setLoadingStep] = useState("");
```

**Why separate state for each feedback field instead of a single object?**
- Each textarea needs its own controlled state for React's onChange handler.
- A single object state would require spread syntax on every change, which is verbose and error-prone.

### Core Function: `handleAnalyze()`

This is the central AI function of Step 1. Here's what happens line by line:

```typescript
async function handleAnalyze() {
    setAnalyzing(true);
    setScorecard(null);
```

**1. Loading animation**: Shows a 4-step progress indicator ("Analyzing interview feedback... → Mapping competencies... → Detecting sentiment & bias... → Generating scorecard..."). This cycles every 1.5 seconds via `setInterval`. This is purely UX — the AI call is a single request, not 4 separate steps. The animation gives the user feedback during the ~5-10 second wait.

```typescript
    const candidateData = {
        id: selectedCandidate.id,
        name: selectedCandidate.name,
        role: selectedCandidate.role,
        ...
        resumeReview: resumeReview,
        telephonicInterview: telephonic,
        culturalFit: culturalFit,
        referenceCheck: referenceCheck
    };
    const prompt = JSON.stringify(candidateData) + JSON.stringify(JOB_DESCRIPTION);
```

**2. Prompt construction**: Concatenates the candidate profile (including all 4 editable feedback fields) with the `JOB_DESCRIPTION` constant. Both are serialized as JSON strings. The Flowise chatflow is configured with a system prompt that tells the LLM how to interpret this input and what JSON structure to return.

**Why JSON concatenation instead of a natural-language prompt?**
- The Flowise chatflow for Step 1 has a pre-configured prompt template. The "question" field is treated as raw data input. The chatflow's system prompt handles the instruction part. This separation allows prompt iteration in Flowise UI without code changes.

```typescript
    const response = await fetch('http://localhost:3000/api/v1/prediction/0458e1da-1714-45fd-81a3-577d5d7f61c3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt }),
    });
```

**3. API call**: Direct `fetch` to Flowise prediction endpoint with a hardcoded chatflow ID. This is a direct API call (not using the `askFlowise` helper) because it was implemented before the helper was created.

```typescript
    const result = await response.json();
    const compatibilityData = parseFlowiseStructuredOutput<CompatibilityScore>(result);
```

**4. Response parsing**: Uses `parseFlowiseStructuredOutput` to handle different Flowise response formats and extract the `CompatibilityScore` JSON.

```typescript
    const transformedScorecard: ScorecardData = {
        overall_score: compatibilityData.score / 10,
        competencies: {
            "Technical Skills": compatibilityData["Technical Skills"] / 10,
            ...
        },
        strengths: compatibilityData["Key Strength"] || [],
        concerns: compatibilityData["Concerns"] || [],
        red_flags: [],
        bias_flags: [],
        summary: `Overall compatibility score of ${compatibilityData.score}/10. ...`
    };
```

**5. Data transformation**: The AI returns scores on a 0-100 scale. The UI expects 0-10. Division by 10 normalizes the data. The `ScorecardData` interface adds fields that the UI needs but the AI doesn't provide (like `red_flags` and `bias_flags`, which are populated from the mock fallback when the AI doesn't include them).

**6. Fallback mechanism** (catch block):
```typescript
    } catch (err) {
        console.error("Flowise call failed, using mock data:", err);
        setScorecard({
            overall_score: 8.2,
            competencies: { ... },
            strengths: [ ... ],
            concerns: [ ... ],
            ...
        });
    }
```

If the Flowise API call fails (network error, chatflow not configured, LLM timeout), the system gracefully degrades to a hardcoded mock scorecard. This ensures the demo always works even without AI infrastructure.

### Core Function: `handleProceed()`

```typescript
function handleProceed() {
    if (!scorecard) return;
    const data = { candidate: selectedCandidate, scorecard };
    localStorage.setItem("hiring-feedback-data", JSON.stringify(data));
    window.location.href = "/hiring/compensation";
}
```

Saves the candidate profile AND the generated scorecard to `localStorage` under `"hiring-feedback-data"`. This data is consumed by:
- **Step 2**: Reads `scorecard.overall_score` to inform compensation scenarios.
- **Step 4**: Reads `scorecard.strengths` and `scorecard.summary` to personalize document generation.

### `JOB_DESCRIPTION` Constant

A hardcoded JSON object describing the target role (Digital Marketing Specialist at GreenTech Inc.). This provides the "job requirements" context that the AI uses to evaluate the candidate against. In production, this would come from a job requisition database.

### UI Structure
1. **Breadcrumb** navigation (Dashboard → Hiring Intelligence → Candidate Name)
2. **HiringSteps** — Step 1 active
3. **Candidate Banner** — Avatar with initials, name, role, experience, location
4. **Feedback Grid** — 4 textareas (Resume Review, Telephonic, Cultural Fit, Reference Check) with round badges
5. **Analyze Button** — Triggers AI analysis
6. **Loading State** — Spinner with cycling status messages
7. **Scorecard** — Score ring, competency bars, strengths, concerns, red flags, bias flags
8. **Proceed Button** → Navigate to Step 2

---

## 7. Step 2 — Compensation Intelligence

**File**: `app/hiring/compensation/CompensationClient.tsx` (311 lines)  
**Route**: `/hiring/compensation`

### Purpose
Generates 3 AI-powered offer scenarios (Conservative, Competitive, Aggressive) with market-benchmarked salaries and acceptance probability predictions.

### Data Loading (from Step 1)

```typescript
useEffect(() => {
    const saved = localStorage.getItem("hiring-feedback-data");
    if (saved) {
        const parsed = JSON.parse(saved);
        setCandidate(parsed.candidate);
        setFeedbackScore(parsed.scorecard?.overall_score || 0);
    }
}, []);
```

Reads the candidate profile and AI score from Step 1. The feedback score influences the compensation recommendation — a higher-scoring candidate justifies a more aggressive offer.

### Core Function: `handleAnalyze()`

```typescript
async function handleAnalyze() {
    const benchmarks = SALARY_BENCHMARKS[candidate.role]?.[candidate.location]
                    || SALARY_BENCHMARKS[candidate.role]?.["Malaysia"];
```

**Benchmark lookup**: Tries to find salary data for the candidate's specific role + location. Falls back to Malaysia if the location isn't in the dataset.

```typescript
    const prompt = `You are an expert compensation analyst at a global fintech company...
    CANDIDATE: ${candidate.name}
    ROLE: ${candidate.role}
    ...
    MARKET BENCHMARKS:
    - P25: $${benchmarks?.p25?.toLocaleString()}
    ...
    Respond ONLY with a JSON object: { "scenarios": [...], "rationale": "...", "negotiation_playbook": "..." }`;
```

**Prompt design**: Unlike Step 1 (which sends raw JSON data to a pre-configured chatflow), Step 2 sends a fully self-contained prompt with:
- Candidate context (name, role, experience, AI score)
- Market salary data (P25/P50/P75/P90 percentiles)
- Explicit output format instruction (JSON schema)

```typescript
    const result = await askFlowise(CHATFLOW_IDS.COMPENSATION, prompt);
    const parsed = parseJsonFromLLM<CompAnalysis>(result.text || JSON.stringify(result));
```

**Why this uses `askFlowise` while Step 1 uses a direct `fetch`?**
- Step 2 was built after the `askFlowise` helper was created. Step 1 was built before.
- Both do the same thing under the hood — POST to `localhost:3000/api/v1/prediction/{id}`.

**Auto-analysis**: Step 2 auto-triggers the AI call when candidate data loads:

```typescript
useEffect(() => {
    if (candidate && !analysis && !analyzing) {
        handleAnalyze();
    }
}, [candidate]);
```

This means the user doesn't need to click an "Analyze" button — the compensation scenarios appear automatically when they arrive at Step 2. This is a UX decision to make the pipeline feel seamless.

### Fallback Mechanism

The mock fallback generates scenarios mathematically from the market median:
- Conservative: `base * 0.92` (8% below median), $5K bonus, 55% acceptance
- Competitive: `base * 1.00` (at median), $10K bonus, 78% acceptance
- Aggressive: `base * 1.12` (12% above median), $20K bonus, 92% acceptance

### Core Function: `handleProceed()`

```typescript
function handleProceed() {
    const data = {
        candidate,
        feedbackScore,
        selectedScenario: analysis.scenarios[selectedScenario],
    };
    localStorage.setItem("hiring-compensation-data", JSON.stringify(data));
    window.location.href = "/hiring/approval";
}
```

Saves the candidate, their AI score, and the **selected** scenario (not all 3) to `localStorage`. Step 3 uses this to generate the executive brief with the specific offer numbers.

### UI Structure
1. **Candidate summary banner** — Name, role, location, experience, AI score
2. **3 Offer Cards** — Selectable, with the middle one marked "Recommended"
   - Each shows: Base salary, signing bonus, equity, total comp, acceptance probability bar, AI justification
3. **AI Compensation Rationale** — Free-text strategic recommendation
4. **Negotiation Playbook** — Tactics for the recruiter

---

## 8. Step 3 — CEO Approval Brief

**File**: `app/hiring/approval/ApprovalClient.tsx` (282 lines)  
**Route**: `/hiring/approval`

### Purpose
Auto-generates a CEO-ready executive brief summarizing the candidate assessment and compensation recommendation. Provides Approve/Discuss/Decline actions.

### Data Loading (from Steps 1 & 2)

```typescript
useEffect(() => {
    const compData = localStorage.getItem("hiring-compensation-data");
    if (compData) {
        setCandidate(parsed.candidate);
        setFeedbackScore(parsed.feedbackScore);
        setSelectedOffer(parsed.selectedScenario);
    }
    const fbData = localStorage.getItem("hiring-feedback-data");
    if (fbData && !compData) {
        setCandidate(parsed.candidate);
        setFeedbackScore(parsed.scorecard?.overall_score || 0);
    }
}, []);
```

**Why does it check both `hiring-compensation-data` and `hiring-feedback-data`?**
- Primary: It reads from `hiring-compensation-data` (set by Step 2).
- Fallback: If someone navigates directly to Step 3 without going through Step 2, it tries `hiring-feedback-data` (set by Step 1) to at least have the candidate data.

### Core Function: `generateBrief()`

```typescript
const prompt = `You are an executive communications specialist. Write a concise CEO approval brief...
CANDIDATE: ${candidate.name}
...
PROPOSED OFFER:
- Base Salary: ${fmt(selectedOffer.baseSalary)}
...
Write the brief in clear markdown with these exact sections:
## Candidate Highlight
## Interview Assessment
## Compensation Recommendation
## Strategic Value
## Risk Assessment
## Recommendation`;
```

**Why markdown output instead of JSON?**
- Unlike Steps 1 and 2 (which need structured data for UI rendering), Step 3 needs **free-text narrative** for an executive brief. Markdown is the natural format for this.
- The section headers are explicitly requested so the output has consistent structure regardless of which LLM generates it.

### Markdown Renderer

```typescript
function renderMarkdown(md: string) {
    return md.split("\n").map((line) => {
        if (line.startsWith("## ")) return `<h3>${line.slice(3)}</h3>`;
        line = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        if (line.startsWith("- ")) return `<p style="margin:4px 0 4px 16px">• ${line.slice(2)}</p>`;
        if (line.trim() === "") return "<br />";
        return `<p>${line}</p>`;
    }).join("");
}
```

A lightweight custom markdown-to-HTML converter. Only handles `## headings`, `**bold**`, `- bullet points`, and blank lines.

**Why custom instead of `react-markdown` or `marked`?**
- Avoids adding a dependency. The CEO brief only uses simple formatting.
- The output is rendered via `dangerouslySetInnerHTML` — this is safe here because the content comes from our own AI, not user input.

### Decision Handling

```typescript
function handleDecision(d: "approved" | "rejected" | "discuss") {
    setDecision(d);
    if (d === "approved") {
        localStorage.setItem("hiring-approval-status", JSON.stringify({
            candidate,
            selectedOffer,
            decision: "approved",
            approvedAt: new Date().toISOString(),
        }));
    }
}
```

Only the "approved" decision saves data to `localStorage`. This is by design — Step 4 (Document Suite) requires approval to proceed. Declining or requesting discussion ends the pipeline.

### UI Structure
1. **Executive Brief** — Formatted markdown with candidate highlight, assessment, compensation, value, risk, recommendation
2. **Decision buttons** — Approve (green ✓), Request Discussion (amber 💬), Decline (red ✗)
3. **Success/Rejection/Discussion confirmation page** — Different states based on decision

---

## 9. Step 4 — AI Document Suite

**File**: `app/hiring/contract/OfferLetterClient.tsx` (909 lines)  
**Route**: `/hiring/contract`

This is the largest and most complex step. It generates 5 legal documents simultaneously.

### Document Types

```typescript
type DocType = "offer_letter" | "employment_contract" | "equity_grant" | "nda" | "ip_assignment";
```

Each document has metadata defined in `DOCUMENT_DEFS`:

| Document | Description | Role-Specific? |
|----------|-------------|----------------|
| Offer Letter | Formal offer with compensation | All |
| Employment Contract | Full legal terms | All |
| Equity Grant Agreement | RSU vesting details | All |
| Non-Disclosure Agreement | Confidentiality terms | All |
| IP Assignment | Intellectual property rights | Engineering only |

**Why is IP Assignment role-specific?**
The `roleSpecific: "Engineering"` flag means this document is only generated for candidates in the Engineering department. Non-engineering roles (Product, Marketing) don't create IP that needs assignment.

### Data Loading (from Steps 1, 2, 3)

```typescript
useEffect(() => {
    // Load from approval (Step 3)
    const approvalData = localStorage.getItem("hiring-approval-status");
    if (approvalData) {
        setCandidate(parsed.candidate);
        setOffer(parsed.selectedOffer);
        setApproved(parsed.decision === "approved");
    }
    // Fallback: load from compensation (Step 2)
    if (!approvalData) {
        const compData = localStorage.getItem("hiring-compensation-data");
        ...
    }
    // Load feedback for personalization (Step 1)
    const feedbackData = localStorage.getItem("hiring-feedback-data");
    if (feedbackData) {
        setScorecard(parsed.scorecard);
    }
}, []);
```

**Step 4 reads from 3 different localStorage keys:**
1. `hiring-approval-status` — Candidate + offer data + approval status
2. `hiring-compensation-data` — Fallback if approval wasn't done
3. `hiring-feedback-data` — Scorecard (strengths, summary) for document personalization

### Core Function: `generateDocument()`

```typescript
async function generateDocument(docType: DocType) {
    setGenerating(prev => ({ ...prev, [docType]: true }));

    const personalNote = scorecard ? `
    Personalization Context:
    - Candidate Strengths: ${scorecard.strengths?.join(", ")}
    - Assessment Summary: ${scorecard.summary}
    Instructions: Use these strengths to write a warm, personalized welcome message...` : "";

    const prompts: Record<DocType, string> = {
        offer_letter: `You are an HR professional... ${personalNote} Generate a professional offer letter for ${candidate.name}...`,
        employment_contract: `You are a corporate legal specialist... ${personalNote} Generate a formal employment contract...`,
        ...
    };

    const result = await askFlowise(CHATFLOW_IDS.OFFER_LETTER, prompts[docType]);
    setDocuments(prev => ({ ...prev, [docType]: result.text || "" }));
}
```

**Key design decisions:**
1. **Personalization injection**: The `personalNote` variable inserts Step 1 feedback into the AI prompt. This makes each document reference the candidate's specific strengths (e.g., "We were impressed by your expertise in distributed systems...").
2. **Single chatflow for all documents**: All 5 document types use the same Flowise chatflow (`CHATFLOW_IDS.OFFER_LETTER`). The prompt itself differentiates what to generate. This simplifies management — one chatflow, many use cases.
3. **Per-document generation state**: `generating` is a `Record<DocType, boolean>`, allowing the UI to show individual loading states per document.

### Auto-generation on Load

```typescript
useEffect(() => {
    if (candidate && offer && approved) {
        const applicableDocs = DOCUMENT_DEFS.filter(
            d => !d.roleSpecific || d.roleSpecific === candidate.department
        );
        applicableDocs.forEach(d => {
            if (!documents[d.id] && !generating[d.id]) {
                generateDocument(d.id);
            }
        });
    }
}, [candidate, offer, approved]);
```

**All applicable documents generate simultaneously** when the page loads. This fires up 4-5 parallel AI calls. The progress bar at the top shows `N/M complete`.

### Fallback Templates

```typescript
function getFallbackTemplate(docType: DocType): string {
    switch (docType) {
        case "offer_letter":
            return `${COMPANY_POLICIES.name}\n...\nDear ${c.name},\n...\nBase Salary: ${fmt(o.baseSalary)}...`;
        case "employment_contract":
            return `EMPLOYMENT CONTRACT\n...\nARTICLE 1 — APPOINTMENT...`;
        ...
    }
}
```

Each document type has a detailed fallback template (50-100 lines) that uses `COMPANY_POLICIES` and the candidate's data. These templates are legally structured with proper articles, sections, and signature blocks. They ensure the demo always has output even without AI.

**Personalization in fallback**: The offer letter fallback now includes:
```typescript
${scorecard ? `Based on our interview sessions, we were particularly impressed by your:
${scorecard.strengths?.map((s: string) => `• ${s}`).join("\n")}

${scorecard.summary}
` : ""}
```

### Document Signatory

All documents are signed by **"Rammya Nair, VP HR, Deriv"**. This is hardcoded in both the AI prompts and the fallback templates.

---

## 10. Backend API — DOCX Generation

**File**: `app/api/generate-docx/route.ts` (167 lines)  
**Route**: `POST /api/generate-docx`

### Why a Server-Side API Route?

The `docx` npm library uses Node.js `Buffer` to create binary `.docx` files. Buffers are a Node.js API — they don't exist in the browser. Therefore, DOCX generation **must** run on the server.

### How It Works

```typescript
export async function POST(req: NextRequest) {
    const { candidateName, role, content, documentType } = await req.json();
```

The frontend sends:
- `candidateName`: Used in the filename
- `role`: Currently unused (could be used for role-specific formatting)
- `content`: The full document text (AI-generated or fallback template)
- `documentType`: Used in the filename (e.g., "Offer_Letter")

### Text-to-DOCX Conversion Logic

The route parses the plain text content line-by-line and converts it to `docx` library objects:

| Pattern | Detection | DOCX Element |
|---------|-----------|--------------|
| ALL CAPS line >5 chars | `trimmed === trimmed.toUpperCase()` | `HeadingLevel.HEADING_2`, bold, 24pt |
| Line starting with `•` or `-` | `trimmed.startsWith("•")` | Indented paragraph with bullet |
| Line matching `N. text` | Regex `/^(\d+)\.\s(.+)/` | Indented numbered paragraph |
| Line with `Key: Value` | Regex `/^([A-Za-z\s]+):\s(.+)/` | Bold key + normal value |
| Empty line | `!trimmed` | Empty paragraph (spacing) |
| Everything else | Default | Normal paragraph, Calibri 11pt |

```typescript
const doc = new Document({
    sections: [{
        properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
        children,
    }],
});
const buffer = await Packer.toBuffer(doc);
```

**Margins**: 1440 TWIPs = 1 inch on all sides. TWIPs (twentieth of a point) are the native unit in the OOXML spec.

```typescript
return new NextResponse(new Uint8Array(buffer), {
    headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${docLabel}_${candidateName}.docx"`,
    },
});
```

The response is a binary file download with the proper MIME type.

---

## 11. Data Flow Between Steps

```
                    localStorage Keys
                    ─────────────────────────────────────────

Landing Page
    │  Sets: "hiring-selected-candidate" (CandidateProfile)
    │  Clears: "hiring-feedback-data", "hiring-compensation-data", "hiring-approval-status"
    ▼
Step 1 (Candidate Review)
    │  Reads: "hiring-selected-candidate"
    │  Sets:  "hiring-feedback-data" = { candidate, scorecard }
    │                                    ├── overall_score
    │                                    ├── competencies
    │                                    ├── strengths[]
    │                                    ├── concerns[]
    │                                    └── summary
    ▼
Step 2 (Compensation)
    │  Reads: "hiring-feedback-data" → candidate, scorecard.overall_score
    │  Sets:  "hiring-compensation-data" = { candidate, feedbackScore, selectedScenario }
    │                                                                    ├── label
    │                                                                    ├── baseSalary
    │                                                                    ├── signingBonus
    │                                                                    ├── equity
    │                                                                    ├── totalComp
    │                                                                    └── acceptanceProbability
    ▼
Step 3 (CEO Approval)
    │  Reads: "hiring-compensation-data" → candidate, feedbackScore, selectedScenario
    │  Reads: "hiring-feedback-data" (fallback if compensation data missing)
    │  Sets:  "hiring-approval-status" = { candidate, selectedOffer, decision, approvedAt }
    ▼
Step 4 (Document Suite)
       Reads: "hiring-approval-status" → candidate, selectedOffer, decision
       Reads: "hiring-compensation-data" (fallback if approval data missing)
       Reads: "hiring-feedback-data" → scorecard.strengths, scorecard.summary (for personalization)
```

---

## 12. AI Integration Architecture

### Two AI Systems in derivHR

| System | Used By | Model | Hosting |
|--------|---------|-------|---------|
| **Flowise + Ollama** | Hiring Pipeline (Steps 1-4) | Llama 3.3 | Self-hosted (localhost:3000) |
| **Gemini API** | ChatWidget, Dashboard, Compliance, Contract Generator | Gemini 2.0 Flash | Google Cloud |

### Flowise Architecture

```
┌──────────────────────────────────────────────┐
│              FLOWISE (localhost:3000)          │
│  ┌─────────────────────────────────────────┐  │
│  │  Chatflow: Feedback Analysis            │  │
│  │  ID: 0458e1da-1714-45fd-81a3-577d5d...  │  │
│  │  [Input] → [Prompt Template] → [LLM] → [Output] │
│  └─────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────┐  │
│  │  Chatflow: Compensation Analysis        │  │
│  │  ID: from env var                       │  │
│  └─────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────┐  │
│  │  Chatflow: Executive Brief              │  │
│  │  ID: from env var                       │  │
│  └─────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────┐  │
│  │  Chatflow: Document Generation          │  │
│  │  ID: from env var                       │  │
│  └─────────────────────────────────────────┘  │
│                     │                         │
│                     ▼                         │
│            ┌──────────────┐                   │
│            │   Ollama     │                   │
│            │  Llama 3.3   │                   │
│            └──────────────┘                   │
└──────────────────────────────────────────────┘
```

### Error Handling Strategy

Every AI call follows the same pattern:

```typescript
try {
    const result = await askFlowise(chatflowId, prompt);
    // Parse and use AI output
} catch (err) {
    console.error("Flowise call failed, using mock data:", err);
    // Use hardcoded fallback data
}
```

**Why this pattern?**
- AI calls can fail for many reasons: Ollama not running, out of memory, LLM hallucinating unparseable output, network timeout.
- The fallback ensures the demo **always works**. A judge can see the full pipeline even without AI infrastructure.
- The fallbacks are realistic enough to demonstrate the concept.

---

## 13. PDF & DOCX Export Mechanics

### PDF: Browser-Native `window.print()`

```typescript
function handleSavePDF() {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
        <html>
        <head>
            <style>
                @import url('fonts.googleapis.com/css2?family=Merriweather...');
                body { font-family: 'Merriweather', Georgia, serif; ... }
                .letterhead { ... border-bottom: 3px solid #ff444f; ... }
                .doc-body pre { white-space: pre-wrap; ... }
                .footer { ... @media print { position: fixed; bottom: 0; } }
            </style>
        </head>
        <body>
            <div class="letterhead">
                <img src="/deriv-logo.png" alt="Deriv" />
                <div class="letterhead-info">Deriv Group...</div>
            </div>
            <div class="doc-body"><pre>${content}</pre></div>
            <div class="footer">CONFIDENTIAL — ...</div>
            <script>window.onload = function() { window.print(); }</script>
        </body>
        </html>
    `);
}
```

**How it works:**
1. Opens a new browser window.
2. Writes a complete HTML document with professional letterhead styling.
3. The `<script>` auto-triggers `window.print()` when loaded.
4. The user's OS print dialog appears, where they can "Save as PDF".

**Why this over `jsPDF` or `html2pdf`?**
- **WYSIWYG**: The browser's print engine renders CSS exactly, including Google Fonts and the Deriv logo.
- **Zero dependencies**: No npm packages to install.
- **Professional output**: Letterhead, footer, red accent line — all rendered perfectly.

### DOCX: Server-Side `docx` Library

See [Section 10](#10-backend-api--docx-generation) above.

**Why offer both PDF and DOCX?**
- **PDF** is for final sharing — locked, non-editable, professional.
- **DOCX** is for editing — HR teams often need to make manual adjustments before sending the final document.

---

## 14. Styling Architecture

**File**: `app/styles/hiring.css`

All hiring-specific CSS lives in a single file imported by `layout.tsx`. Classes use the `hi-` prefix to avoid conflicts with the broader derivHR app.

### Key CSS Classes

| Class | Usage |
|-------|-------|
| `hi-steps` | Horizontal step indicator bar |
| `hi-step.active` / `hi-step.done` | Active and completed step styling |
| `hi-feedback-grid` | 2x2 grid of feedback textareas |
| `hi-scorecard` | Score ring + competency bars container |
| `hi-score-ring` | SVG circular progress indicator |
| `hi-competency-bar` / `hi-competency-fill` | Animated horizontal skill bar |
| `hi-comp-grid` | 3-column offer scenario cards |
| `hi-comp-card.recommended` | Highlighted "recommended" offer card |
| `hi-acceptance-bar` | Offer acceptance probability bar |
| `hi-brief-card` | Executive brief display card |
| `hi-contract-preview` | Document preview with letterhead, scrollable |
| `hi-doc-suite-grid` | 5-document card grid |
| `hi-doc-card.active` | Currently selected document card |
| `hi-loading-spinner` | CSS-only spinning animation |

### Design System Integration

The hiring pages use CSS custom properties from `deriv.css`:
- `--bg-card`, `--border`, `--accent`, `--text`, `--text-muted` — Theme-aware colors
- `--gradient` — Deriv brand gradient (used on progress bars)
- `--radius` — Consistent border radius
- `--surface-2` — Background for secondary surfaces

---

## 15. Environment Configuration

**File**: `.env.local`

```bash
# Currently set:
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy...   # Gemini API key (for ChatWidget, Dashboard)
NEXT_PUBLIC_GEMINI_MODEL=gemini-2.0-flash

# Flowise Configuration (set via CHATFLOW_IDS in flowise.ts):
NEXT_PUBLIC_FLOWISE_URL=http://localhost:3000
NEXT_PUBLIC_FLOWISE_FEEDBACK_ID=<chatflow-uuid>
NEXT_PUBLIC_FLOWISE_COMPENSATION_ID=<chatflow-uuid>
NEXT_PUBLIC_FLOWISE_BRIEF_ID=<chatflow-uuid>
NEXT_PUBLIC_FLOWISE_OFFER_ID=<chatflow-uuid>
NEXT_PUBLIC_FLOWISE_API_KEY=<optional-api-key>
```

**Why `NEXT_PUBLIC_` prefix?**
- Next.js requires this prefix for environment variables that should be available in client-side code (browser). Without the prefix, the variable is only available on the server. Since our AI calls happen client-side (in `"use client"` components), the Flowise URL and chatflow IDs need the prefix.

---

## Quick Reference: How to Explain Key Functions

| If asked about... | Point to... | Key concept |
|---|---|---|
| "How does AI feedback analysis work?" | `FeedbackClient.tsx` → `handleAnalyze()` (line 158) | Concatenates candidate JSON + JD JSON, sends to Flowise, parses `CompatibilityScore`, transforms to `ScorecardData` |
| "How do compensation scenarios work?" | `CompensationClient.tsx` → `handleAnalyze()` (line 73) | Natural-language prompt with market benchmarks, asks for 3 JSON scenarios, auto-triggers on load |
| "How does the CEO brief generate?" | `ApprovalClient.tsx` → `generateBrief()` (line 66) | Markdown prompt with section headers, custom `renderMarkdown()` converts to HTML |
| "How do documents get personalized?" | `OfferLetterClient.tsx` → `generateDocument()` (line 538) | `personalNote` variable injects Step 1 strengths/summary into each AI prompt |
| "How does DOCX download work?" | `OfferLetterClient.tsx` → `handleDownloadDocx()` (line 589) + `route.ts` | Frontend sends text via fetch, server builds Binary DOCX with `docx` library |
| "How does PDF export work?" | `OfferLetterClient.tsx` → `handleSavePDF()` (line 642) | Opens new window, writes HTML with letterhead, auto-calls `window.print()` |
| "How do steps share data?" | All `useEffect` hooks in each step | `localStorage` with keys: `hiring-selected-candidate`, `hiring-feedback-data`, `hiring-compensation-data`, `hiring-approval-status` |
| "What happens if AI fails?" | Every `catch` block | Falls back to hardcoded mock scorecard (Step 1), mathematical scenarios (Step 2), template brief (Step 3), template documents (Step 4) |
| "Why Flowise over direct API?" | `flowise.ts` vs `gemini.ts` | Flowise = self-hosted Llama via Ollama (privacy). Gemini = Google cloud (used for other app features). Flowise has visual chatflow builder. |
| "Why localStorage over database?" | Architecture decision | Hackathon: no backend state needed. Trade-off: not persistent across devices. |
