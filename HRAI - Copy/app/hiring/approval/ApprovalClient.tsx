"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { type CandidateProfile } from "@/app/lib/mock-candidates";
import { parseFlowiseStructuredOutput } from "@/app/lib/flowise";
import { getMockApprovalBrief, type ApprovalBrief } from "@/app/lib/mock-flowise-response";
import { ScorecardData } from "../feedback/FeedbackClient";

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
    const [scorecard, setScorecard] = useState<ScorecardData | null>(null);
    const [selectedOffer, setSelectedOffer] = useState<any>(null);
    const [salaryComparison, setSalaryComparison] = useState<any>(null);
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
                setScorecard(parsed.scorecard);
                setSelectedOffer(parsed.selectedScenario);
                setSalaryComparison(parsed.salaryComparison);
            } catch { }
        }
        // Also load feedback data for score
        const fbData = localStorage.getItem("hiring-feedback-data");
        if (fbData && !compData) {
            try {
                const parsed = JSON.parse(fbData);
                setCandidate(parsed.candidate);
                setFeedbackScore(parsed.scorecard?.overall_score || 0);
                setScorecard(parsed.scorecard);
            } catch { }
        }
    }, []);

    async function generateBrief() {
        if (!candidate || !selectedOffer) return;
        setLoading(true);

        const fmt = (n: number) => "$" + n.toLocaleString();

        try {
            // Format data as structured JSON for the Flowise endpoint
            const approvalData = {
                candidate: {
                    name: candidate.name,
                    role: candidate.role,
                    department: candidate.department,
                    location: candidate.location,
                    experience: candidate.experience,
                },
                reviewScore: scorecard || {
                    overall_scorePercentage: feedbackScore,
                    competenciesPercentage: {},
                    strengths: [],
                    concerns: [],
                    red_flags: [],
                    bias_flags: [],
                    summary: ""
                },
                proposedOffer: {
                    baseSalary: selectedOffer.baseSalary,
                    signingBonus: selectedOffer.signingBonus,
                    equity: selectedOffer.equity,
                    totalComp: selectedOffer.totalComp,
                    offerType: selectedOffer.label,
                },
                salaryComparison: salaryComparison || {
                    candidateExpectedRange: null,
                    marketBenchmarks: {},
                    inHouseSalaryRange: {}
                }
            };

            const prompt = JSON.stringify(approvalData);

            //Call Flowise prediction API
            const response = await fetch('http://localhost:3000/api/v1/prediction/f502f91d-ab6f-4254-83cc-1348d8b1f819', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: prompt,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            //Parse the Flowise structured output
            const parsed = parseFlowiseStructuredOutput<ApprovalBrief>(result);
            // const parsed = getMockApprovalBrief(
            //     candidate.name,
            //     candidate.role,
            //     candidate.experience,
            //     candidate.department,
            //     candidate.location,
            //     feedbackScore,
            //     selectedOffer.label,
            //     selectedOffer.baseSalary,
            //     selectedOffer.signingBonus,
            //     selectedOffer.equity,
            //     selectedOffer.totalComp,
            //     selectedOffer.acceptanceProbability,
            //     selectedOffer.justification
            // );
            
            // Validate that required fields exist
            if (parsed && parsed.candidateHighlight) {
                // Convert structured data to markdown format
                const briefMarkdown = `## Candidate Highlight

${parsed.candidateHighlight}

## Interview Assessment

${parsed.interviewAssessment}

## Compensation Recommendation

${parsed.compensationRecommendation}

## Strategic Value

${parsed.strategicValue}

## Risk Assessment

${parsed.riskAssessment}

## Recommendation

${parsed.recommendation}`;
                
                setBrief(briefMarkdown);
            } else {
                throw new Error("Invalid response structure from API");
            }
        } catch (err) {
            console.error("Flowise call failed, using mock brief:", err);
            
            const mockBrief = getMockApprovalBrief(
                candidate.name,
                candidate.role,
                candidate.experience,
                candidate.department,
                candidate.location,
                feedbackScore,
                selectedOffer.label,
                selectedOffer.baseSalary,
                selectedOffer.signingBonus,
                selectedOffer.equity,
                selectedOffer.totalComp,
                selectedOffer.acceptanceProbability,
                selectedOffer.justification
            );
            
            const briefMarkdown = `## Candidate Highlight

${mockBrief.candidateHighlight}

## Interview Assessment

${mockBrief.interviewAssessment}

## Compensation Recommendation

${mockBrief.compensationRecommendation}

## Strategic Value

${mockBrief.strategicValue}

## Risk Assessment

${mockBrief.riskAssessment}

## Recommendation

${mockBrief.recommendation}`;
            
            setBrief(briefMarkdown);
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
