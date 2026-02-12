# derivHR AI Implementation Plan

## Gap Analysis: Questions vs Current System

| Question Requirement | Current State | Action Needed |
|---|---|---|
| **Phase 1: Intelligent Document Generation** | Contract generator uses hardcoded clause templates per jurisdiction | Replace with Gemini AI generation — AI writes legally-accurate clauses dynamically based on role, jurisdiction, salary |
| **Phase 2: Conversational HR Assistant** | Chat widget uses rule-based keyword matching (if/else) | Replace with Gemini AI agent — function-calling (MCP-like) to query Firebase data, answer any HR question, process requests |
| **Phase 3: Proactive Compliance Intelligence** | Static compliance dashboard with hardcoded alerts | Add AI-powered risk analysis, predictive alerts, proactive recommendations via Gemini |
| **AI Morning Briefing** | Static text from Firebase `morningBriefing` | Gemini generates briefing from real-time data (alerts, KPIs, employees) |
| **Predictive compliance alerts** | Not implemented | Gemini analyzes hiring pipeline vs visa quota, predicts shortfalls |
| **Policy gap detection** | Not implemented | Gemini reviews contracts across jurisdictions, identifies inconsistencies |
| **Proactive HR** | Not implemented | AI agent detects leave balance issues, reminds employees |
| **Cross-system intelligence** | Not implemented | AI agent pulls from employees, contracts, compliance, calendar — synthesizes answers |
| **Graceful escalation** | Not implemented | AI agent recognizes uncertainty, recommends human HR contact |
| **Request processing** | Not implemented | AI agent handles "update my address", "request leave" via tool calls |

---

## Architecture

All AI features are **frontend-only**, calling the Gemini REST API directly from the browser.

```
User Query → ChatWidget (React)
                ↓
         app/lib/gemini.ts → Gemini API (gemini-2.0-flash)
                ↓                    ↓
         System Prompt          Function Calling (MCP-like)
         (HR context,           (tools to fetch Firebase data,
          page context,          navigate, create actions)
          policies)                  ↓
                              Firebase RTDB (data source)
                ↓
         AI Response → Rendered in Chat / Contract / Dashboard
```

### API Key Management
- Primary: `NEXT_PUBLIC_GEMINI_API_KEY` env var
- Fallback: localStorage (`derivhr_gemini_key`) — user can input via chat prompt

---

## Implementation Steps

### Step 1: Gemini API Layer (`app/lib/gemini.ts`)
- REST client for Gemini 2.0 Flash API
- Function/tool declarations for MCP-like agent behavior
- Agentic loop: call → function call → execute → call again → final response
- Tools: `get_employees`, `get_employee_details`, `get_contracts`, `get_compliance`, `get_alerts`, `get_company_info`, `get_calendar`, `get_hr_policy`, `get_hiring_pipeline`, `navigate_to_page`, `create_action_item`

### Step 2: AI Chat Widget (`app/components/ChatWidget.tsx`)
- Replace entire rule-based `getResponse()` with Gemini agent
- System prompt includes: company context, current page, user role, available tools
- Maintains conversation history for multi-turn dialogue
- Handles: policy questions, employee lookups, compliance queries, request processing, proactive suggestions
- Fallback: if no API key or API error, gracefully degrades to rule-based responses

### Step 3: AI Contract Generator (`app/contract-generator/ContractGeneratorClient.tsx`)
- Replace hardcoded `clauseData` with Gemini-generated clauses
- AI receives: employee details, jurisdiction, contract type, clause templates from Firebase
- Generates complete, legally-accurate contract with jurisdiction-specific clauses
- AI also reviews generated contract for compliance issues (policy gap detection)

### Step 4: AI Dashboard Briefing (`app/dashboard/DashboardClient.tsx`)
- Replace static `briefing.summary` with Gemini-generated morning briefing
- AI receives: all alerts, KPIs, employee statuses, calendar events
- Generates: personalized briefing with predictive insights, proactive recommendations
- Includes: leave balance warnings, hiring pipeline analysis, upcoming deadlines

### Step 5: AI Compliance Risk Analysis (`app/compliance/ComplianceClient.tsx`)
- Add AI-powered analysis panel
- Gemini analyzes: visa expirations, training gaps, hiring pipeline vs quota
- Generates: predictive alerts, risk scores, recommended actions
- Policy gap detection across jurisdictions

---

## Key AI Features Mapping to Evaluation Criteria

| Criterion | Feature | Weight |
|---|---|---|
| **Insight (30%)** | AI contract generation with legal accuracy; AI compliance risk analysis | ✅ |
| **Usefulness (25%)** | AI chatbot resolves queries without escalation; request processing | ✅ |
| **Craft (20%)** | Seamless AI integration into existing UI; smooth self-service experience | ✅ |
| **Ambition (15%)** | MCP-like agent with function calling; predictive compliance; cross-system intelligence | ✅ |
| **Demo (10%)** | Live contract generation, chatbot interaction, compliance predictions | ✅ |

---

## "Blow Their Minds" Features

1. **MCP-like Agent**: Chat widget uses Gemini function calling to autonomously decide which data sources to query
2. **Predictive Compliance**: AI analyzes hiring velocity vs visa quota and predicts shortfalls
3. **Cross-System Intelligence**: Single query pulls from employees + contracts + compliance + calendar
4. **Proactive HR**: AI detects employees who haven't taken leave and generates reminders
5. **Smart Contract Generation**: AI generates jurisdiction-specific legal clauses, not just template filling
6. **Policy Gap Detection**: AI reviews contracts across jurisdictions and flags inconsistencies
7. **Graceful Escalation**: AI knows when it's uncertain and recommends human HR involvement
