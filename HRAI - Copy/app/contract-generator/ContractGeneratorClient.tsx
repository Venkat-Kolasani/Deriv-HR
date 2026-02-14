"use client";

import { useState, useRef } from "react";
import Link from "next/link";

const hintMap: Record<string, string> = {
  Malaysia: "Clauses auto-adapt to Malaysian Employment Act 1955",
  "United Kingdom": "Clauses auto-adapt to UK Employment Rights Act 1996",
  Singapore: "Clauses auto-adapt to Singapore Employment Act (Cap. 91)",
  Germany: "Clauses auto-adapt to German Bürgerliches Gesetzbuch (BGB)",
};

const clauseData: Record<string, Record<string, string>> = {
  Malaysia: {
    workHours: "Standard working hours shall not exceed 8 hours per day or 48 hours per week, in accordance with the Malaysian Employment Act 1955. Overtime compensation shall be paid at 1.5× the hourly rate.",
    probation: "The Employee shall serve a probationary period of 3 months. During this period, either party may terminate the agreement with 2 weeks' written notice.",
    leave: "The Employee is entitled to a minimum of 8 days paid annual leave (increasing with tenure), 14 days paid sick leave, 60 days hospitalisation leave, and 98 days maternity leave as per EA 1955.",
    retirement: "The mandatory retirement age is 60 years as stipulated by the Minimum Retirement Age Act 2012. Employer shall contribute to the Employees Provident Fund (EPF).",
    social: "Employer shall make mandatory contributions to the Employees Provident Fund (EPF) at 12-13% and SOCSO (Social Security Organisation) as required by Malaysian law.",
    notice: "After the probationary period, termination requires 1 month written notice or payment in lieu of notice. Termination must comply with the Industrial Relations Act 1967.",
    governing: "This Agreement shall be governed by and construed in accordance with the laws of Malaysia, including the Employment Act 1955 and the Industrial Relations Act 1967.",
  },
  "United Kingdom": {
    workHours: "Standard working hours shall not exceed 48 hours per week in accordance with the Working Time Regulations 1998, unless the Employee opts out in writing. Rest breaks of 20 minutes are mandatory for shifts exceeding 6 hours.",
    probation: "The Employee shall serve a probationary period of 6 months. During this period, either party may terminate the agreement with 1 week's written notice.",
    leave: "The Employee is entitled to 28 days paid annual leave (including public holidays) as per the Working Time Regulations 1998. Statutory Sick Pay (SSP) applies after 3 consecutive days of illness.",
    retirement: "There is no default retirement age in the UK. Employer shall auto-enroll the Employee in a workplace pension scheme as required by the Pensions Act 2008, with minimum contributions of 8% (5% employee, 3% employer).",
    social: "Employer shall make National Insurance Contributions (NICs) as required by HMRC. The Employee will be auto-enrolled in the company pension scheme under the Pensions Act 2008.",
    notice: "After the probationary period, the statutory minimum notice is 1 week per year of service (up to 12 weeks). The contractual notice period is 1 month for either party.",
    governing: "This Agreement shall be governed by and construed in accordance with the laws of England and Wales, including the Employment Rights Act 1996 and the Equality Act 2010.",
  },
  Singapore: {
    workHours: "Standard working hours shall not exceed 8 hours per day or 44 hours per week in accordance with the Employment Act (Cap. 91). Overtime is capped at 72 hours per month.",
    probation: "The Employee shall serve a probationary period of 3 months. During this period, either party may terminate with 1 week's written notice.",
    leave: "The Employee is entitled to 7 days paid annual leave in the first year (increasing to 14 days by the 8th year), 14 days paid outpatient sick leave, and 60 days hospitalisation leave.",
    retirement: "The re-employment age is 68 years under the Retirement and Re-employment Act. Employer shall contribute to the Central Provident Fund (CPF) at prevailing rates.",
    social: "Employer shall make mandatory contributions to the Central Provident Fund (CPF) at 17% (for employees aged ≤55), with employee contribution at 20%.",
    notice: "After the probationary period, termination requires 1 month written notice or salary in lieu. Termination must comply with the Employment Act (Cap. 91).",
    governing: "This Agreement shall be governed by and construed in accordance with the laws of the Republic of Singapore, including the Employment Act (Cap. 91).",
  },
  Germany: {
    workHours: "Standard working hours shall not exceed 8 hours per day (extendable to 10 hours if averaged over 6 months) in accordance with the Arbeitszeitgesetz (Working Time Act). Minimum rest period is 11 hours between shifts.",
    probation: "The Employee shall serve a probationary period of 6 months (Probezeit). During this period, either party may terminate with 2 weeks' notice as per §622 BGB.",
    leave: "The Employee is entitled to a minimum of 20 days paid annual leave (based on 5-day week) under the Bundesurlaubsgesetz. Continued pay during illness (Entgeltfortzahlung) is guaranteed for up to 6 weeks.",
    retirement: "Employer and Employee shall contribute to the statutory pension insurance (Deutsche Rentenversicherung) at equal rates totaling 18.6% of gross salary.",
    social: "Employer shall make contributions to statutory health insurance, pension insurance, unemployment insurance, nursing care insurance, and accident insurance as mandated by German social security law.",
    notice: "After the probationary period, the minimum notice period is 4 weeks to the 15th or end of a calendar month, increasing with tenure per §622 BGB.",
    governing: "This Agreement shall be governed by and construed in accordance with the laws of the Federal Republic of Germany, including the Bürgerliches Gesetzbuch (BGB) and applicable collective agreements.",
  },
};

const loadingSteps = [
  "Analyzing jurisdiction requirements",
  "Mapping local labour laws",
  "Generating contract clauses",
  "Applying compliance checks",
  "Formatting document",
];

type ViewState = "empty" | "loading" | "paper";

export default function ContractGeneratorClient() {
  const [name, setName] = useState("Sarah Kim");
  const [role, setRole] = useState("Lead Product Designer");
  const [dept, setDept] = useState("Design");
  const [salary, setSalary] = useState("115,000");
  const [startDate, setStartDate] = useState("2026-03-01");
  const [country, setCountry] = useState("Malaysia");
  const [contractType, setContractType] = useState("full-time");

  const [viewState, setViewState] = useState<ViewState>("empty");
  const [loadingStep, setLoadingStep] = useState(loadingSteps[0]);
  const [generating, setGenerating] = useState(false);
  const [printEnabled, setPrintEnabled] = useState(false);
  const [btnLabel, setBtnLabel] = useState("Generate Contract");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const paperRef = useRef<HTMLDivElement>(null);

  const hint = hintMap[country] || "";

  function handleGenerate() {
    setGenerating(true);
    setBtnLabel("Generating...");
    setViewState("loading");
    setLoadingStep(loadingSteps[0]);

    let stepIndex = 0;
    intervalRef.current = setInterval(() => {
      stepIndex++;
      if (stepIndex < loadingSteps.length) {
        setLoadingStep(loadingSteps[stepIndex]);
      } else {
        clearInterval(intervalRef.current!);
        setViewState("paper");
        setPrintEnabled(true);
        setGenerating(false);
        setBtnLabel("Regenerate Contract");
      }
    }, 500);
  }

  function handleCountryChange(val: string) {
    setCountry(val);
    if (viewState === "paper") {
      // re-generate after country change
      setTimeout(handleGenerate, 50);
    }
  }

  function handleSavePDF() {
    const paperEl = paperRef.current;
    if (!paperEl) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const currentClauses = clauseData[country] || clauseData["Malaysia"];
    const currentFormattedDate = startDate
      ? new Date(startDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
      : "";
    const currentTypeLabel = { "full-time": "Full-Time Employment", "part-time": "Part-Time Employment", contract: "Fixed-Term Contract" }[contractType] || "Full-Time Employment";
    const generatedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

    printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Employment Agreement — ${name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@700;800&display=swap" rel="stylesheet" />
  <style>
    @page { size: A4; margin: 20mm 18mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 11.5px;
      line-height: 1.7;
      color: #1a1a1a;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .contract {
      max-width: 700px;
      margin: 0 auto;
      padding: 48px 40px 40px;
    }
    .contract h1 {
      font-family: 'Sora', 'Inter', sans-serif;
      font-size: 22px;
      font-weight: 800;
      color: #111;
      text-align: center;
      margin-bottom: 4px;
      letter-spacing: -0.5px;
    }
    .subtitle {
      text-align: center;
      font-size: 11px;
      color: #888;
      margin-bottom: 28px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    .meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 24px;
      font-size: 12px;
      padding: 14px 16px;
      background: #f8f8fa;
      border-radius: 6px;
      margin-bottom: 28px;
    }
    .meta span { color: #666; }
    .meta strong { color: #111; }
    h2 {
      font-size: 13px;
      font-weight: 700;
      color: #333;
      margin: 24px 0 8px;
      padding-bottom: 4px;
      border-bottom: 1px solid #eee;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    p {
      margin-bottom: 8px;
      color: #444;
      font-size: 11.5px;
    }
    .clause {
      padding: 10px 14px;
      background: #f0eeff;
      border-left: 3px solid #a78bfa;
      border-radius: 0 6px 6px 0;
      margin: 12px 0;
      font-size: 11px;
      color: #333;
    }
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-top: 36px;
      padding-top: 24px;
      border-top: 1px solid #ddd;
    }
    .sig-block { font-size: 11px; color: #666; }
    .sig-line { border-bottom: 1px solid #bbb; height: 48px; margin-bottom: 4px; }
    .sig-block strong { display: block; color: #111; margin-top: 4px; }
    .footer {
      text-align: center;
      font-size: 10px;
      color: #bbb;
      margin-top: 28px;
      padding-top: 12px;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="contract">
    <h1>Employment Agreement</h1>
    <div class="subtitle">${currentTypeLabel} Contract</div>

    <div class="meta">
      <span>Employee</span><strong>${name}</strong>
      <span>Position</span><strong>${role}</strong>
      <span>Department</span><strong>${dept}</strong>
      <span>Compensation</span><strong>USD ${salary} per annum</strong>
      <span>Start Date</span><strong>${currentFormattedDate}</strong>
      <span>Jurisdiction</span><strong>${country}</strong>
    </div>

    <p>This Employment Agreement ("Agreement") is entered into between <strong>Deriv Group</strong> ("Employer") and <strong>${name}</strong> ("Employee"), effective as of <strong>${currentFormattedDate}</strong>.</p>

    <h2>1. Position &amp; Duties</h2>
    <p>The Employee is hired as <strong>${role}</strong> in the <strong>${dept}</strong> department. The Employee shall perform duties as reasonably assigned and report to the department head.</p>

    <h2>2. Compensation</h2>
    <p>The Employee shall receive an annual gross salary of <strong>USD ${salary}</strong>, payable in equal monthly installments. Salary reviews will be conducted annually.</p>

    <h2>3. Working Hours</h2>
    <div class="clause">${currentClauses.workHours}</div>

    <h2>4. Probationary Period</h2>
    <div class="clause">${currentClauses.probation}</div>

    <h2>5. Leave Entitlement</h2>
    <div class="clause">${currentClauses.leave}</div>

    <h2>6. Retirement &amp; Pension</h2>
    <div class="clause">${currentClauses.retirement}</div>

    <h2>7. Social Security</h2>
    <div class="clause">${currentClauses.social}</div>

    <h2>8. Termination &amp; Notice Period</h2>
    <div class="clause">${currentClauses.notice}</div>

    <h2>9. Governing Law</h2>
    <div class="clause">${currentClauses.governing}</div>

    <h2>10. Confidentiality</h2>
    <p>The Employee agrees to maintain confidentiality of all proprietary information during and after employment. Breach of this clause may result in immediate termination and legal action.</p>

    <div class="signatures">
      <div class="sig-block">
        <div class="sig-line"></div>
        <strong>Employer Representative</strong>
        <span>Deriv Group · HR Department</span>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <strong>${name}</strong>
        <span>Employee</span>
      </div>
    </div>

    <div class="footer">
      Generated by derivHR AI · ${generatedDate} · Confidential
    </div>
  </div>
  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`);
    printWindow.document.close();
  }

  const clauses = clauseData[country] || clauseData["Malaysia"];
  const formattedDate = startDate
    ? new Date(startDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "";
  const typeLabel = { "full-time": "Full-Time Employment", "part-time": "Part-Time Employment", contract: "Fixed-Term Contract" }[contractType] || "Full-Time Employment";

  return (
    <>
      {/* Header */}
      <div className="cg-header">
        <div>
          <div className="cg-breadcrumb">
            <Link href="/contracts">Contracts</Link>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            <span>Generate Contract</span>
          </div>
          <h1 className="pg-title">AI Contract Generator</h1>
          <p className="pg-subtitle">Generate jurisdiction-aware employment agreements in seconds</p>
        </div>
      </div>

      {/* Split Screen */}
      <div className="cg-split">
        {/* Left: Form */}
        <div className="cg-form-panel card">
          <div className="card-header">
            <h3>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              Contract Details
            </h3>
            <span className="cg-ai-badge">AI-Powered</span>
          </div>

          <div className="cg-form">
            <div className="cg-field">
              <label>Employee Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="st-input" placeholder="Full legal name" />
            </div>

            <div className="cg-row">
              <div className="cg-field">
                <label>Job Title / Role</label>
                <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className="st-input" placeholder="e.g. Senior Engineer" />
              </div>
              <div className="cg-field">
                <label>Department</label>
                <div className="st-select-wrap">
                  <select className="st-select" value={dept} onChange={(e) => setDept(e.target.value)}>
                    <option>Engineering</option><option>Product</option><option>Design</option><option>Operations</option><option>HR &amp; Legal</option><option>Finance</option>
                  </select>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
            </div>

            <div className="cg-row">
              <div className="cg-field">
                <label>Annual Salary (USD)</label>
                <input type="text" value={salary} onChange={(e) => setSalary(e.target.value)} className="st-input" placeholder="e.g. 120,000" />
              </div>
              <div className="cg-field">
                <label>Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="st-input" />
              </div>
            </div>

            <div className="cg-field">
              <label>Jurisdiction / Country</label>
              <div className="st-select-wrap">
                <select className="st-select" value={country} onChange={(e) => handleCountryChange(e.target.value)}>
                  <option value="Malaysia">{"\u{1F1F2}\u{1F1FE}"} Malaysia</option>
                  <option value="United Kingdom">{"\u{1F1EC}\u{1F1E7}"} United Kingdom</option>
                  <option value="Singapore">{"\u{1F1F8}\u{1F1EC}"} Singapore</option>
                  <option value="Germany">{"\u{1F1E9}\u{1F1EA}"} Germany</option>
                </select>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
              </div>
              <span className="cg-hint">{hint}</span>
            </div>

            <div className="cg-field">
              <label>Contract Type</label>
              <div className="cg-type-row">
                {[
                  { key: "full-time", label: "Full-Time" },
                  { key: "part-time", label: "Part-Time" },
                  { key: "contract", label: "Fixed-Term" },
                ].map((t) => (
                  <button key={t.key} className={`cg-type${contractType === t.key ? " active" : ""}`} onClick={() => setContractType(t.key)}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="cg-actions">
              <button className={`cg-generate-btn${generating ? " generating" : ""}`} onClick={handleGenerate} disabled={generating}>
                {generating ? (
                  <><span className="cg-loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span> Generating...</>
                ) : (
                  <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> {btnLabel}</>
                )}
              </button>
              <button className="cg-print-btn" disabled={!printEnabled} onClick={handleSavePDF}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                Save PDF
              </button>
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="cg-preview-panel">
          <div className="cg-preview-toolbar">
            <span className="cg-preview-label">Live Preview</span>
            <div className="cg-preview-dots"><span></span><span></span><span></span></div>
          </div>
          <div className="cg-paper-wrap">
            {/* Empty state */}
            {viewState === "empty" && (
              <div className="cg-empty">
                <div className="cg-empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                </div>
                <h3>No contract generated yet</h3>
                <p>Fill in the details and click &quot;Generate Contract&quot;</p>
              </div>
            )}

            {/* Loading state */}
            {viewState === "loading" && (
              <div className="cg-loading visible">
                <div className="cg-loading-spinner"></div>
                <h3>AI is generating your contract...</h3>
                <p>{loadingStep}</p>
              </div>
            )}

            {/* Paper document */}
            {viewState === "paper" && (
              <div className="cg-paper visible" ref={paperRef}>
                <div className="cg-paper-inner">
                  <h1>Employment Agreement</h1>
                  <div className="paper-subtitle">{typeLabel} Contract</div>

                  <div className="paper-meta">
                    <span>Employee</span><strong>{name}</strong>
                    <span>Position</span><strong>{role}</strong>
                    <span>Department</span><strong>{dept}</strong>
                    <span>Compensation</span><strong>USD {salary} per annum</strong>
                    <span>Start Date</span><strong>{formattedDate}</strong>
                    <span>Jurisdiction</span><strong>{country}</strong>
                  </div>

                  <p>This Employment Agreement (&quot;Agreement&quot;) is entered into between <strong>Deriv Group</strong> (&quot;Employer&quot;) and <strong>{name}</strong> (&quot;Employee&quot;), effective as of <strong>{formattedDate}</strong>.</p>

                  <h2>1. Position &amp; Duties</h2>
                  <p>The Employee is hired as <strong>{role}</strong> in the <strong>{dept}</strong> department. The Employee shall perform duties as reasonably assigned and report to the department head.</p>

                  <h2>2. Compensation</h2>
                  <p>The Employee shall receive an annual gross salary of <strong>USD {salary}</strong>, payable in equal monthly installments. Salary reviews will be conducted annually.</p>

                  <h2>3. Working Hours</h2>
                  <div className="paper-clause">{clauses.workHours}</div>

                  <h2>4. Probationary Period</h2>
                  <div className="paper-clause">{clauses.probation}</div>

                  <h2>5. Leave Entitlement</h2>
                  <div className="paper-clause">{clauses.leave}</div>

                  <h2>6. Retirement &amp; Pension</h2>
                  <div className="paper-clause">{clauses.retirement}</div>

                  <h2>7. Social Security</h2>
                  <div className="paper-clause">{clauses.social}</div>

                  <h2>8. Termination &amp; Notice Period</h2>
                  <div className="paper-clause">{clauses.notice}</div>

                  <h2>9. Governing Law</h2>
                  <div className="paper-clause">{clauses.governing}</div>

                  <h2>10. Confidentiality</h2>
                  <p>The Employee agrees to maintain confidentiality of all proprietary information during and after employment. Breach of this clause may result in immediate termination and legal action.</p>

                  <div className="paper-signature">
                    <div className="sig-block">
                      <div className="sig-line"></div>
                      <strong>Employer Representative</strong>
                      <span>Deriv Group · HR Department</span>
                    </div>
                    <div className="sig-block">
                      <div className="sig-line"></div>
                      <strong>{name}</strong>
                      <span>Employee</span>
                    </div>
                  </div>

                  <div className="paper-footer">
                    Generated by derivHR AI · {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} · Confidential
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
