"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { type CandidateProfile } from "@/app/lib/mock-candidates";
import { askFlowise, CHATFLOW_IDS } from "@/app/lib/flowise";

/* ── Step indicator ── */
function HiringSteps({ active }: { active: number }) {
    const steps = [
        { num: 1, label: "Candidate Review", href: "/hiring/feedback" },
        { num: 2, label: "Compensation", href: "/hiring/compensation" },
        { num: 3, label: "CEO Approval", href: "/hiring/approval" },
        { num: 4, label: "Offer Letter", href: "/hiring/contract" },
    ];
    return (
        <div className="hi-steps">
            {steps.map((s) => (
                <Link
                    key={s.num}
                    href={s.href}
                    className={`hi-step${s.num === active ? " active" : ""}${s.num < active ? " done" : ""}`}
                >
                    <span className="hi-step-num">
                        {s.num < active ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                        ) : s.num}
                    </span>
                    {s.label}
                </Link>
            ))}
        </div>
    );
}

export default function ApprovalClient() {
    const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
    const [feedbackScore, setFeedbackScore] = useState(0);
    const [selectedOffer, setSelectedOffer] = useState<any>(null);
    const [brief, setBrief] = useState("");
    const [loading, setLoading] = useState(false);
    const [decision, setDecision] = useState<"approved" | "rejected" | "discuss" | null>(null);

    useEffect(() => {
        // Load compensation data from previous step
        const compData = localStorage.getItem("hiring-compensation-data");
        if (compData) {
            try {
                const parsed = JSON.parse(compData);
                setCandidate(parsed.candidate);
                setFeedbackScore(parsed.feedbackScore);
                setSelectedOffer(parsed.selectedScenario);
            } catch { }
        }
        // Also load feedback data for score
        const fbData = localStorage.getItem("hiring-feedback-data");
        if (fbData && !compData) {
            try {
                const parsed = JSON.parse(fbData);
                setCandidate(parsed.candidate);
                setFeedbackScore(parsed.scorecard?.overall_score || 0);
            } catch { }
        }
    }, []);

    async function generateBrief() {
        if (!candidate || !selectedOffer) return;
        setLoading(true);

        const fmt = (n: number) => "$" + n.toLocaleString();

        try {
            const prompt = `You are an executive communications specialist. Write a concise CEO approval brief for a hiring decision.

CANDIDATE: ${candidate.name}
ROLE: ${candidate.role}
DEPARTMENT: ${candidate.department}
LOCATION: ${candidate.location}
EXPERIENCE: ${candidate.experience} years
AI REVIEW SCORE: ${feedbackScore}/10

PROPOSED OFFER:
- Base Salary: ${fmt(selectedOffer.baseSalary)}
- Signing Bonus: ${fmt(selectedOffer.signingBonus)}
- Equity: ${selectedOffer.equity}
- Total Comp: ${fmt(selectedOffer.totalComp)}
- Offer Type: ${selectedOffer.label}
- Acceptance Probability: ${selectedOffer.acceptanceProbability}%
- Probability Justification: ${selectedOffer.justification}

Write the brief in clear markdown with these exact sections:
## Candidate Highlight
## Interview Assessment
## Compensation Recommendation
## Strategic Value
## Risk Assessment
## Recommendation

Keep it concise and executive-friendly. 2-3 sentences per section maximum.`;

            const result = await askFlowise(CHATFLOW_IDS.EXECUTIVE_BRIEF, prompt);
            setBrief(result.text || "");
        } catch (err) {
            console.error("Flowise call failed, using mock brief:", err);

            const fmt = (n: number) => "$" + n.toLocaleString();

            setBrief(`## Candidate Highlight

**${candidate.name}** is a ${candidate.experience}-year veteran applying for **${candidate.role}** in the ${candidate.department} department, based in ${candidate.location}. Their profile demonstrates exceptional technical depth and proven leadership in high-scale fintech environments.

## Interview Assessment

The candidate completed 4 rounds of interviews and received an **AI-synthesized score of ${feedbackScore}/10**. Key strengths include strong system design capabilities, team leadership experience, and genuine domain enthusiasm. Minor concern noted around tenure stability (3 moves in 5 years, each to higher positions).

## Compensation Recommendation

We recommend the **${selectedOffer.label}** offer package:
- **Base Salary:** ${fmt(selectedOffer.baseSalary)}
- **Signing Bonus:** ${fmt(selectedOffer.signingBonus)}
- **Equity:** ${selectedOffer.equity}
- **Total First-Year Compensation:** ${fmt(selectedOffer.totalComp)}

This positions us at market median, with an estimated **${selectedOffer.acceptanceProbability}% acceptance probability**.
- **Reasoning:** ${selectedOffer.justification}


## Strategic Value

${candidate.name} brings direct experience in high-frequency trading platform architecture, which aligns with our Q3 roadmap to improve transaction processing speed. Their open-source contributions and published research add to our employer brand credibility.

## Risk Assessment

**Low risk.** All reference checks were positive. The candidate's tenure pattern shows upward mobility rather than instability. The primary risk is a competing offer from their current employer — the signing bonus is designed to mitigate this.

## Recommendation

**Proceed with ${selectedOffer.label} offer.** The candidate's technical skills, leadership potential, and cultural alignment make them a strong addition to the team. Recommend extending the offer within 48 hours to maintain candidate engagement.`);
        } finally {
            setLoading(false);
        }
    }

    // Auto-generate brief when data loaded
    useEffect(() => {
        if (candidate && selectedOffer && !brief && !loading) {
            generateBrief();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [candidate, selectedOffer]);

    function handleDecision(d: "approved" | "rejected" | "discuss") {
        setDecision(d);
        if (d === "approved") {
            // Save approval for contract step
            localStorage.setItem("hiring-approval-status", JSON.stringify({
                candidate,
                selectedOffer,
                decision: "approved",
                approvedAt: new Date().toISOString(),
            }));
        }
    }

    // Simple markdown-to-HTML (handles ## headings, **bold**, and line breaks)
    function renderMarkdown(md: string) {
        return md
            .split("\n")
            .map((line) => {
                if (line.startsWith("## ")) return `<h3>${line.slice(3)}</h3>`;
                line = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
                if (line.startsWith("- ")) return `<p style="margin:4px 0 4px 16px">• ${line.slice(2)}</p>`;
                if (line.trim() === "") return "<br />";
                return `<p>${line}</p>`;
            })
            .join("");
    }

    return (
        <>
            <div className="hi-header">
                <div className="hi-breadcrumb">
                    <Link href="/dashboard">Dashboard</Link>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                    <span>Hiring Intelligence</span>
                </div>
                <h1 className="pg-title">CEO Approval Brief</h1>
                <p className="pg-subtitle">AI-generated executive brief for hiring decision approval</p>
            </div>

            <HiringSteps active={3} />

            {!candidate && (
                <div className="hi-loading">
                    <p>No candidate data found. <Link href="/hiring/feedback" style={{ color: "var(--accent)" }}>Start from Candidate Review →</Link></p>
                </div>
            )}

            {loading && (
                <div className="hi-loading">
                    <div className="hi-loading-spinner" />
                    <h3>Generating executive brief...</h3>
                    <p>Composing CEO-ready summary with key metrics and risk assessment</p>
                </div>
            )}

            {/* Executive Brief */}
            {brief && !loading && !decision && (
                <>
                    <div className="hi-brief-card">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                            <h2 style={{ margin: 0 }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" style={{ marginRight: 8, verticalAlign: -4 }}>
                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                                </svg>
                                Executive Hiring Brief
                            </h2>
                            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                Generated {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                        </div>

                        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(brief) }} />
                    </div>

                    <div className="hi-approval-actions">
                        <button className="hi-btn-approve" onClick={() => handleDecision("approved")}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                            Approve Hire
                        </button>
                        <button className="hi-btn-discuss" onClick={() => handleDecision("discuss")}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                            Request Discussion
                        </button>
                        <button className="hi-btn-reject" onClick={() => handleDecision("rejected")}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            Decline
                        </button>
                    </div>
                </>
            )}

            {/* Decision Results */}
            {decision === "approved" && (
                <div className="hi-success">
                    <div className="hi-success-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <h2>Hire Approved! ✅</h2>
                    <p>The hiring decision for <strong>{candidate?.name}</strong> has been approved. Proceed to generate the offer letter.</p>
                    <div className="hi-actions" style={{ justifyContent: "center", marginTop: 24 }}>
                        <button className="hi-btn-primary" onClick={() => window.location.href = "/hiring/contract"}>
                            Generate Offer Letter
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                        </button>
                    </div>
                </div>
            )}

            {decision === "rejected" && (
                <div className="hi-success">
                    <div className="hi-success-icon" style={{ background: "rgba(239,68,68,0.12)" }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </div>
                    <h2>Hire Declined</h2>
                    <p>The hiring decision for <strong>{candidate?.name}</strong> has been declined. The recruitment team will be notified.</p>
                </div>
            )}

            {decision === "discuss" && (
                <div className="hi-success">
                    <div className="hi-success-icon" style={{ background: "rgba(245,158,11,0.12)" }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                    </div>
                    <h2>Discussion Requested</h2>
                    <p>A meeting will be scheduled to discuss <strong>{candidate?.name}</strong>&apos;s candidacy with the leadership team.</p>
                </div>
            )}
        </>
    );
}
