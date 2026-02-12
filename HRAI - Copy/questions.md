# **deriv** **Self-Service HR Operations Platform**

## **The Challenge**

How might we build an Al-powered self-service platform where contracts generate themselves, queries answer themselves, and HR operations become invisible?

---

## **The Problem**

HR teams drown in repetitive operational tasks that consume the majority of their time:

* "Every hire needs an offer letter, employment contract, NDA, equity docs - each customised manually. It takes hours per person."

* "Employees ask the same questions repeatedly: leave policy, benefits, expense limits. Every question interrupts someone's work."

* "We track compliance in spreadsheets: work permits, visa renewals, training certifications, equipment sign-offs. It's error-prone and tedious."

* "Simple requests like updating an address or changing bank details require an HR ticket and back-and-forth emails."

The current reality: HR spends most of their time on transactional work instead of strategic initiatives. Every new hire generates significant paperwork. Every policy question interrupts someone's day.

---

## **Why This Matters Now**

HR operations face a fundamental scaling problem:

* **Contract generation**: Each hire requires multiple customised legal documents

* **Policy questions**: The same questions get asked repeatedly across the organisation

* **Compliance tracking**: Manual tracking of expirations, certifications, and requirements

* **Workflow bottlenecks**: Routine requests require human processing when they shouldn't

* **Multi-jurisdiction complexity**: Different countries have different labour laws and requirements

Al can transform HR from a bottleneck into a self-service function - handling routine operations automatically so HR can focus on people, not paperwork.

---

## **The Opportunity**

Build an Al-powered self-service platform that makes HR operations invisible:

---

## **Phase 1: Intelligent Document Generation**

* **Contract Assembly**: Takes structured data (role, salary, start date, location) → generates complete employment contract in correct legal format

* **Equity Documentation**: Auto-generates option grant letters, vesting schedules, exercise agreements

* **Localisation**: Adapts templates for multiple countries with different labour laws

* **Version Control**: Tracks contract changes, manages amendments, handles renewals

---

## **Phase 2: Conversational HR Assistant**

* **Policy Questions**: Slack/Teams bot answers questions instantly

  * "How many days of annual leave do I have?" → pulls from HRIS, shows balance
  * "Can I expense coworking space?" → surfaces expense policy with relevant clause
  * "When am I eligible for promotion?" → explains criteria, shows progress

* **Request Processing**: Handles routine changes without HR involvement

  * "Update my address" validates format, updates systems, confirms
  * "Add my spouse as a dependent" → collects required info, routes to benefits provider

* **Workflow Routing**: For complex requests, identifies right approver and routes automatically

---

## **Phase 3: Proactive Compliance Intelligence**

* **Expiration Tracking**: Monitors work permits, visas, certifications, equipment loans

  * Well before visa expires → notifies employee and HR with renewal checklist
  * Training certification about to lapse → triggers re-certification workflow

* **Mandatory Training**: Tracks completion, sends reminders, escalates non-compliance

* **Audit Readiness**: Maintains compliance evidence for labour audits, tax inspections

The system should dramatically reduce time spent on HR operations while improving employee experience.

---

## **Constraints**

| Constraint        | Rationale                                                                       |
| ----------------- | ------------------------------------------------------------------------------- |
| Must demo live    | Show actual contract generation, chatbot interaction, or compliance tracking.   |
| Al must add value | This is an Al hackathon. GenAl must be core to your solution.                   |
| Legal accuracy    | Generated contracts must match approved legal templates for each jurisdiction.  |
| Human oversight   | Al generates and assists; humans approve legal documents and sensitive changes. |
| Privacy compliant | Handle employee data responsibly and securely.                                  |

---

## **Evaluation Criteria**

| Criterion  | Weight | What We're Looking For                                                                      |
| ---------- | ------ | ------------------------------------------------------------------------------------------- |
| Insight    | 30%    | Do Al-generated contracts match legal requirements? Does the chatbot understand HR context? |
| Usefulness | 25%    | Can the chatbot resolve most HR queries without escalation? Does it save real time?         |
| Craft      | 20%    | Is the employee experience smooth? Would people prefer self-service over waiting for HR?    |
| Ambition   | 15%    | Creative approaches to contract generation, compliance tracking, or workflow automation?    |
| Demo       | 10%    | Can you tell the story of what you built and why it matters?                                |

---

## **Questions Worth Considering**

* How do you ensure Al-generated contracts are legally accurate for each jurisdiction?
* What's the right balance between self-service and human involvement for sensitive HR matters?
* How do you handle ambiguous policy questions where the answer isn't clear-cut?
* Can the system learn from HR responses to improve over time?
* How do you maintain confidentiality when answering employee-specific questions?
* What happens when the bot doesn't know the answer - how does it escalate gracefully?

---

## **What Would Blow Our Minds**

* **Predictive compliance alerts**: "Based on hiring plans, you'll need additional visa slots - start applications now"

* **Policy gap detection**: Al reads employment contracts across multiple countries, identifies inconsistencies, recommends standardisation

* **Smart contract negotiation**: When candidate requests changes, Al pulls market data and generates counter-offer options

* **Invisible onboarding**: New hire accepts offer Al automatically generates all contracts, provisions system access, schedules onboarding - zero manual work

* **Proactive HR**: Bot notices employee hasn't taken leave in months and proactively reminds them of their balance

* **Cross-system intelligence**: Answers questions by pulling from multiple HR systems and synthesising a coherent response