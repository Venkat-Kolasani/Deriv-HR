/* ═══════════════════════════════════════════
   DERIV HR — Gemini AI Integration Layer
   MCP-like agentic function calling
   ═══════════════════════════════════════════ */

import { fbGet } from "./firebase";

// ── Types ──────────────────────────────────

export interface GeminiMessage {
  role: "user" | "model";
  parts: GeminiPart[];
}

export type GeminiPart =
  | { text: string }
  | { functionCall: { name: string; args: Record<string, any> } }
  | { functionResponse: { name: string; response: { content: any } } };

interface GeminiRequest {
  system_instruction?: { parts: { text: string }[] };
  contents: GeminiMessage[];
  tools?: { functionDeclarations: FunctionDeclaration[] }[];
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
  };
}

interface FunctionDeclaration {
  name: string;
  description: string;
  parameters?: {
    type: string;
    properties?: Record<string, { type: string; description: string; enum?: string[] }>;
    required?: string[];
  };
}

interface GeminiCandidate {
  content: { parts: GeminiPart[] };
  finishReason: string;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  error?: { message: string };
}

// ── API Key Management ─────────────────────

const LS_KEY = "derivhr_gemini_key";

export function getApiKey(): string {
  if (typeof window !== "undefined") {
    const lsKey = localStorage.getItem(LS_KEY);
    if (lsKey) return lsKey;
  }
  return process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
}

export function setApiKey(key: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LS_KEY, key);
  }
}

export function hasApiKey(): boolean {
  return getApiKey().length > 0;
}

// ── Tool Definitions (MCP-like) ────────────

const toolDeclarations: FunctionDeclaration[] = [
  {
    name: "get_all_employees",
    description:
      "Fetch all employee records from the HR database. Returns array of employees with id, name, role, department, location, status, salary, leave balance, work permit info etc.",
    parameters: { type: "OBJECT", properties: {} },
  },
  {
    name: "get_employee_by_name",
    description:
      "Search for a specific employee by name (partial match). Returns full employee profile including salary, leave balance, contract type, work permit details.",
    parameters: {
      type: "OBJECT",
      properties: {
        name: { type: "STRING", description: "Employee name or partial name to search for" },
      },
      required: ["name"],
    },
  },
  {
    name: "get_active_alerts",
    description:
      "Get all active HR alerts and urgent items. Returns alerts with severity (critical/warning/info), titles, deadlines, days left, and recommended actions.",
    parameters: { type: "OBJECT", properties: {} },
  },
  {
    name: "get_compliance_status",
    description:
      "Get full compliance data: overall score, score breakdown by category, visa quota, visa timeline, training tracker with overdue employees, and hiring pipeline.",
    parameters: { type: "OBJECT", properties: {} },
  },
  {
    name: "get_contracts",
    description:
      "Get all employment contracts. Returns contract details: employee name, type (Employment/NDA/Equity/Amendment), status (pending/signed/review/expired), jurisdiction, value, notes.",
    parameters: { type: "OBJECT", properties: {} },
  },
  {
    name: "get_company_info",
    description:
      "Get company overview: total employees, departments with headcount, offices worldwide, attrition rate, new hires this month.",
    parameters: { type: "OBJECT", properties: {} },
  },
  {
    name: "get_calendar_events",
    description:
      "Get upcoming calendar events including meetings, onboarding sessions, deadlines, holidays, and leave returns.",
    parameters: { type: "OBJECT", properties: {} },
  },
  {
    name: "get_hr_policies",
    description:
      "Get comprehensive HR policy knowledge base including: leave policy (annual, sick, maternity, paternity), notice periods, probation rules, overtime rates, remote work policy, EPF/pension contributions, and FAQ answers.",
    parameters: { type: "OBJECT", properties: {} },
  },
  {
    name: "get_contract_templates",
    description:
      "Get contract clause templates for all jurisdictions (Malaysia, UK, Singapore, Germany). Includes clauses for: retirement, social security, notice period, leave, probation, work hours, governing law, overtime, termination.",
    parameters: { type: "OBJECT", properties: {} },
  },
  {
    name: "get_dashboard_kpis",
    description:
      "Get dashboard KPI metrics: total employees, active contracts, compliance score, time-to-hire, turnover rate, open positions — each with change percentages.",
    parameters: { type: "OBJECT", properties: {} },
  },
  {
    name: "navigate_to_page",
    description:
      "Suggest the user navigate to a specific page in the app for more details or to take action. Use this when an action requires visiting a different page.",
    parameters: {
      type: "OBJECT",
      properties: {
        page: {
          type: "STRING",
          description: "Page path to navigate to",
          enum: ["/dashboard", "/people", "/contracts", "/contract-generator", "/compliance", "/calendar", "/analytics", "/settings"],
        },
        reason: { type: "STRING", description: "Brief reason for the navigation suggestion" },
      },
      required: ["page", "reason"],
    },
  },
  {
    name: "create_action_item",
    description:
      "Create a recommended action item for the HR manager. Use this when the user's request requires follow-up work such as updating records, initiating processes, or scheduling tasks.",
    parameters: {
      type: "OBJECT",
      properties: {
        title: { type: "STRING", description: "Action item title" },
        priority: { type: "STRING", description: "Priority level", enum: ["critical", "high", "medium", "low"] },
        description: { type: "STRING", description: "Detailed description of what needs to be done" },
      },
      required: ["title", "priority", "description"],
    },
  },
];

// ── Tool Execution (Firebase Data Fetchers) ──

async function executeTool(name: string, args: Record<string, any>): Promise<any> {
  switch (name) {
    case "get_all_employees": {
      const emps = await fbGet<Record<string, any>>("employees");
      return emps ? Object.values(emps) : [];
    }
    case "get_employee_by_name": {
      const emps = await fbGet<Record<string, any>>("employees");
      if (!emps) return { error: "No employees found" };
      const search = (args.name || "").toLowerCase();
      const matches = Object.values(emps).filter((e: any) =>
        e.name.toLowerCase().includes(search)
      );
      return matches.length > 0 ? matches : { message: `No employee found matching "${args.name}"` };
    }
    case "get_active_alerts": {
      return (await fbGet<any[]>("alerts")) || [];
    }
    case "get_compliance_status": {
      return (await fbGet<any>("compliance")) || {};
    }
    case "get_contracts": {
      const contracts = await fbGet<Record<string, any>>("contracts");
      return contracts ? Object.values(contracts) : [];
    }
    case "get_company_info": {
      return (await fbGet<any>("company")) || {};
    }
    case "get_calendar_events": {
      return (await fbGet<any[]>("calendarEvents")) || [];
    }
    case "get_hr_policies": {
      const chat = await fbGet<any>("chatAssistant");
      return chat?.knowledgeBase || {};
    }
    case "get_contract_templates": {
      const cg = await fbGet<any>("contractGenerator");
      return {
        jurisdictions: cg?.jurisdictions || [],
        clauseTemplates: cg?.clauseTemplates || {},
        roleTemplates: cg?.roleTemplates || [],
        signatureBlock: cg?.signatureBlock || {},
      };
    }
    case "get_dashboard_kpis": {
      return (await fbGet<any>("dashboardKPIs")) || {};
    }
    case "navigate_to_page": {
      return { action: "navigate", page: args.page, reason: args.reason };
    }
    case "create_action_item": {
      return {
        action: "action_item_created",
        title: args.title,
        priority: args.priority,
        description: args.description,
      };
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// ── Core Gemini API Call ───────────────────

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function callGeminiRaw(apiKey: string, request: GeminiRequest): Promise<GeminiResponse> {
  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${text}`);
  }
  return res.json();
}

function extractParts(response: GeminiResponse): GeminiPart[] {
  if (!response.candidates || response.candidates.length === 0) {
    if (response.error) throw new Error(response.error.message);
    throw new Error("No response from Gemini");
  }
  return response.candidates[0].content.parts;
}

// ── System Prompts ─────────────────────────

function buildChatSystemPrompt(pageContext: string): string {
  return `You are derivHR Assistant — an AI-powered HR operations agent for Deriv Group, a fintech company with 247 employees across 8 offices worldwide (KL, Singapore, London, Berlin, Dublin, Ho Chi Minh, Taipei, Bangalore).

CURRENT CONTEXT:
- Today's date: ${new Date().toISOString().split("T")[0]}
- User: Ahmad Ramly, HR Manager
- Current page: ${pageContext}
- Company: Deriv Group (Financial Technology)

YOUR CAPABILITIES (MCP-like Agent):
You have access to tools that let you query the HR database in real-time. You MUST use these tools to fetch actual data before answering questions about employees, contracts, compliance, or company details. Never make up data — always use tools to get facts.

TOOLS AVAILABLE:
- get_all_employees: Fetch all employee records
- get_employee_by_name: Search specific employee
- get_active_alerts: Get urgent HR alerts
- get_compliance_status: Compliance scores, visa status, training gaps
- get_contracts: Employment contracts data
- get_company_info: Company overview and stats
- get_calendar_events: Upcoming events/deadlines
- get_hr_policies: Leave policy, HR FAQs, employment law info
- get_contract_templates: Contract clause templates per jurisdiction
- get_dashboard_kpis: Dashboard metrics
- navigate_to_page: Suggest user navigate to a specific page
- create_action_item: Create a follow-up action item

BEHAVIOR RULES:
1. ALWAYS fetch data using tools before answering factual questions. Do NOT guess.
2. Be concise and professional. Use bullet points and bold for key info.
3. When answering about specific employees, fetch their actual data first.
4. For policy questions, use get_hr_policies to get accurate policy details.
5. If a question requires action (e.g., "update address"), use create_action_item.
6. If the user should visit a specific page, use navigate_to_page.
7. For compliance/visa questions, always fetch latest compliance data.
8. Provide predictive insights when data supports it (e.g., visa quota predictions).
9. If you're unsure about something, say so clearly and recommend contacting HR directly.
10. Format responses in HTML for display: use <strong>, <br>, bullet points.
11. When discussing legal matters, always cite the relevant law/act.
12. Be proactive: if you notice issues in the data (e.g., low leave balance, expiring permits), mention them.
13. Cross-reference data across systems: employees + contracts + compliance + calendar.

RESPONSE FORMAT:
- Use HTML formatting: <strong> for emphasis, <br> for line breaks
- Keep responses focused and actionable
- Include deep-links when suggesting navigation (e.g., /compliance, /contracts)
- For lists, use bullet character • with <br> between items`;
}

// ── Agentic Chat (with function calling loop) ──

export async function agentChat(
  conversationHistory: GeminiMessage[],
  userMessage: string,
  pageContext: string
): Promise<{ reply: string; actions: any[] }> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("NO_API_KEY");
  }

  const systemPrompt = buildChatSystemPrompt(pageContext);
  const actions: any[] = [];

  // Build messages: history + new user message
  const messages: GeminiMessage[] = [
    ...conversationHistory,
    { role: "user", parts: [{ text: userMessage }] },
  ];

  const request: GeminiRequest = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: messages,
    tools: [{ functionDeclarations: toolDeclarations }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };

  // Agentic loop: handle function calls (max 5 iterations)
  let iterations = 0;
  const MAX_ITERATIONS = 5;

  while (iterations < MAX_ITERATIONS) {
    iterations++;
    const response = await callGeminiRaw(apiKey, request);
    const parts = extractParts(response);

    // Check if there are function calls
    const functionCalls = parts.filter(
      (p): p is { functionCall: { name: string; args: Record<string, any> } } =>
        "functionCall" in p
    );
    const textParts = parts.filter((p): p is { text: string } => "text" in p);

    if (functionCalls.length === 0) {
      // No more function calls — return text response
      const reply = textParts.map((p) => p.text).join("") || "I couldn't generate a response. Please try again.";
      return { reply, actions };
    }

    // Execute all function calls
    const modelMessage: GeminiMessage = { role: "model", parts };
    request.contents.push(modelMessage);

    const functionResponses: GeminiPart[] = [];
    for (const fc of functionCalls) {
      const result = await executeTool(fc.functionCall.name, fc.functionCall.args);

      // Track navigation and action items
      if (fc.functionCall.name === "navigate_to_page" || fc.functionCall.name === "create_action_item") {
        actions.push(result);
      }

      functionResponses.push({
        functionResponse: {
          name: fc.functionCall.name,
          response: { content: result },
        },
      });
    }

    // Add function responses and continue loop
    request.contents.push({ role: "user", parts: functionResponses });
  }

  // If we exhausted iterations, return whatever text we have
  return {
    reply: "I gathered a lot of data but ran into complexity. Could you rephrase your question more specifically?",
    actions,
  };
}

// ── Contract Generation ────────────────────

export async function generateContract(params: {
  employeeName: string;
  role: string;
  department: string;
  salary: string;
  startDate: string;
  jurisdiction: string;
  contractType: string;
}): Promise<{ clauses: Record<string, string>; summary: string; warnings: string[] }> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("NO_API_KEY");

  // Fetch clause templates from Firebase for reference
  const cg = await fbGet<any>("contractGenerator");
  const templates = cg?.clauseTemplates?.[params.jurisdiction] || {};
  const roleTemplates = cg?.roleTemplates || [];

  const systemPrompt = `You are a legal AI assistant specializing in employment law for Deriv Group. 
You generate legally-accurate employment contract clauses based on jurisdiction-specific labour laws.

REFERENCE CLAUSE TEMPLATES for ${params.jurisdiction}:
${JSON.stringify(templates, null, 2)}

AVAILABLE ROLE SALARY BENCHMARKS:
${JSON.stringify(roleTemplates, null, 2)}

IMPORTANT:
- Generate clauses that are legally accurate for the specified jurisdiction
- Reference the correct labour law acts and sections
- Adapt probation, notice, leave, pension, and work hours to local law
- Include specific statutory rates and percentages
- Flag any compliance concerns as warnings`;

  const userPrompt = `Generate employment contract clauses for:
- Employee: ${params.employeeName}
- Role: ${params.role}
- Department: ${params.department}
- Salary: ${params.salary}
- Start Date: ${params.startDate}
- Jurisdiction: ${params.jurisdiction}
- Contract Type: ${params.contractType}

Return a JSON object with this exact structure:
{
  "clauses": {
    "workHours": "clause text",
    "probation": "clause text",
    "leave": "clause text",
    "retirement": "clause text",
    "social": "clause text",
    "notice": "clause text",
    "governing": "clause text",
    "overtime": "clause text",
    "termination": "clause text",
    "confidentiality": "clause text",
    "intellectualProperty": "clause text"
  },
  "summary": "Brief summary of key terms for this contract",
  "warnings": ["array of any compliance concerns or things to review"]
}

Return ONLY valid JSON, no markdown formatting.`;

  const request: GeminiRequest = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 4096,
    },
  };

  const response = await callGeminiRaw(apiKey, request);
  const parts = extractParts(response);
  const text = parts
    .filter((p): p is { text: string } => "text" in p)
    .map((p) => p.text)
    .join("");

  // Parse JSON from response (handle potential markdown wrapping)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse contract generation response");
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error("Invalid JSON in contract generation response");
  }
}

// ── Morning Briefing Generation ────────────

export async function generateMorningBriefing(): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("NO_API_KEY");

  // Fetch all relevant data
  const [alerts, kpis, employees, compliance, calendar, company] = await Promise.all([
    fbGet<any[]>("alerts"),
    fbGet<any>("dashboardKPIs"),
    fbGet<Record<string, any>>("employees"),
    fbGet<any>("compliance"),
    fbGet<any[]>("calendarEvents"),
    fbGet<any>("company"),
  ]);

  const empList = employees ? Object.values(employees) : [];
  const today = new Date().toISOString().split("T")[0];

  const systemPrompt = `You are an AI executive briefing assistant for Deriv Group HR.
Generate a concise, actionable morning briefing for the HR Manager (Ahmad Ramly).
Focus on: urgent items, deadlines this week, compliance risks, and proactive recommendations.
Be specific with names, dates, and numbers. Keep it under 200 words.
Format in HTML with <strong> for emphasis and <br> for line breaks.
Do NOT use markdown. Output plain HTML text only.`;

  const dataPrompt = `Today: ${today}

ACTIVE ALERTS: ${JSON.stringify(alerts || [])}
KPIs: ${JSON.stringify(kpis || {})}
EMPLOYEES: ${JSON.stringify(empList.map((e: any) => ({ name: e.name, status: e.status, dept: e.dept, location: e.location, leaveBalance: e.leaveBalance, workPermit: e.workPermit?.expiryDate })))}
COMPLIANCE: ${JSON.stringify({ score: compliance?.overallScore, visaQuota: compliance?.visaQuota, trainingTracker: compliance?.trainingTracker })}
UPCOMING EVENTS: ${JSON.stringify(calendar || [])}
COMPANY: ${JSON.stringify({ totalEmployees: company?.totalEmployees, newThisMonth: company?.newThisMonth, attritionRate: company?.attritionRate })}

Generate the morning briefing:`;

  const request: GeminiRequest = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts: [{ text: dataPrompt }] }],
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 1024,
    },
  };

  const response = await callGeminiRaw(apiKey, request);
  const parts = extractParts(response);
  return parts
    .filter((p): p is { text: string } => "text" in p)
    .map((p) => p.text)
    .join("");
}

// ── Compliance Risk Analysis ───────────────

export async function analyzeComplianceRisks(): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("NO_API_KEY");

  const [compliance, employees, contracts, alerts] = await Promise.all([
    fbGet<any>("compliance"),
    fbGet<Record<string, any>>("employees"),
    fbGet<Record<string, any>>("contracts"),
    fbGet<any[]>("alerts"),
  ]);

  const systemPrompt = `You are an AI compliance analyst for Deriv Group.
Analyze the HR compliance data and generate a risk assessment with:
1. Current risk summary (score breakdown)
2. Predictive alerts (what will happen if no action is taken)
3. Recommended actions prioritized by urgency
4. Policy gap detection across jurisdictions

Format in HTML. Use <strong> for emphasis, <br> for breaks.
Be specific with employee names, dates, and deadlines.
Focus on actionable intelligence, not generic advice.`;

  const dataPrompt = `COMPLIANCE DATA: ${JSON.stringify(compliance)}
EMPLOYEES: ${JSON.stringify(employees ? Object.values(employees).map((e: any) => ({ name: e.name, location: e.location, workPermit: e.workPermit, status: e.status })) : [])}
CONTRACTS: ${JSON.stringify(contracts ? Object.values(contracts) : [])}
ALERTS: ${JSON.stringify(alerts)}

Generate compliance risk analysis:`;

  const request: GeminiRequest = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts: [{ text: dataPrompt }] }],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 2048,
    },
  };

  const response = await callGeminiRaw(apiKey, request);
  const parts = extractParts(response);
  return parts
    .filter((p): p is { text: string } => "text" in p)
    .map((p) => p.text)
    .join("");
}
