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
              <button className="cg-print-btn" disabled={!printEnabled} onClick={() => window.print()}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                Print / Save PDF
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
              <div className="cg-paper visible">
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
