"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SALARY_BENCHMARKS, type CandidateProfile } from "@/app/lib/mock-candidates";
import { askFlowise, CHATFLOW_IDS, parseJsonFromLLM } from "@/app/lib/flowise";

/* ── Types ── */
interface OfferScenario {
    label: string;
    baseSalary: number;
    signingBonus: number;
    equity: string;
    totalComp: number;
    acceptanceProbability: number;
    justification: string;
    pros: string[];
}

interface CompAnalysis {
    scenarios: OfferScenario[];
    rationale: string;
    negotiation_playbook: string;
}

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

export default function CompensationClient() {
    const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
    const [feedbackScore, setFeedbackScore] = useState<number>(0);
    const [analysis, setAnalysis] = useState<CompAnalysis | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [selectedScenario, setSelectedScenario] = useState<number>(1); // default to recommended

    // Load candidate data from previous step
    useEffect(() => {
        const saved = localStorage.getItem("hiring-feedback-data");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setCandidate(parsed.candidate);
                setFeedbackScore(parsed.scorecard?.overall_score || 0);
            } catch { }
        }
    }, []);

    async function handleAnalyze() {
        if (!candidate) return;
        setAnalyzing(true);

        const benchmarks = SALARY_BENCHMARKS[candidate.role]?.[candidate.location] || SALARY_BENCHMARKS[candidate.role]?.["Malaysia"];

        try {
            const prompt = `You are an expert compensation analyst at a global fintech company. Given the following candidate and market data, generate 3 offer scenarios.

CANDIDATE: ${candidate.name}
ROLE: ${candidate.role}
LOCATION: ${candidate.location}
EXPERIENCE: ${candidate.experience} years
AI REVIEW SCORE: ${feedbackScore}/10

MARKET BENCHMARKS (USD annual):
- P25: $${benchmarks?.p25?.toLocaleString() || "N/A"}
- P50 (median): $${benchmarks?.p50?.toLocaleString() || "N/A"}
- P75: $${benchmarks?.p75?.toLocaleString() || "N/A"}
- P90: $${benchmarks?.p90?.toLocaleString() || "N/A"}

Respond ONLY with a JSON object:
{
  "scenarios": [
    {
      "label": "Conservative",
      "baseSalary": <number>,
      "signingBonus": <number>,
      "equity": "<equity description>",
      "totalComp": <number>,
      "acceptanceProbability": <number 0-100>,
      "justification": "<concise sentence explaining why this probability was chosen>",
      "pros": ["<pro 1>", "<pro 2>"]
    },
    { ...Competitive scenario (recommended)... },
    { ...Aggressive scenario... }
  ],
  "rationale": "<2-3 sentences explaining the compensation strategy>",
  "negotiation_playbook": "<3-4 sentences of negotiation guidance>"
}`;

            const result = await askFlowise(CHATFLOW_IDS.COMPENSATION, prompt);
            const parsed = parseJsonFromLLM<CompAnalysis>(result.text || JSON.stringify(result));
            setAnalysis(parsed);
        } catch (err) {
            console.error("Flowise call failed, using mock data:", err);
            const base = benchmarks?.p50 || 100000;
            setAnalysis({
                scenarios: [
                    {
                        label: "Conservative",
                        baseSalary: Math.round(base * 0.92),
                        signingBonus: 5000,
                        equity: "Standard RSU grant — 4yr vesting, 1yr cliff",
                        totalComp: Math.round(base * 0.92) + 5000,
                        acceptanceProbability: 55,
                        justification: "Base salary is below market median; candidate may feel undervalued without a stronger incentive.",
                        pros: ["Lower budget impact", "Room for performance-based increases"],
                    },
                    {
                        label: "Competitive",
                        baseSalary: base,
                        signingBonus: 10000,
                        equity: "Enhanced RSU grant — 15% above standard",
                        totalComp: base + 10000,
                        acceptanceProbability: 78,
                        justification: "Aligned with market targets and provides a balanced mix of cash and long-term equity.",
                        pros: ["Aligns with market median", "Balance of cash and equity incentives"],
                    },
                    {
                        label: "Aggressive",
                        baseSalary: Math.round(base * 1.12),
                        signingBonus: 20000,
                        equity: "Premium RSU grant — top-tier allocation",
                        totalComp: Math.round(base * 1.12) + 20000,
                        acceptanceProbability: 92,
                        justification: "Top-of-market offer with significant signing bonus virtually eliminates competitive risk.",
                        pros: ["Strong retention signal", "Eliminates counter-offer risk"],
                    },
                ],
                rationale: `Based on ${candidate.name}'s strong interview performance (${feedbackScore}/10) and ${candidate.experience} years of experience, we recommend a competitive offer at market median. The candidate's current expected salary range suggests they would accept an offer at this level, with the signing bonus providing additional incentive for a quick decision.`,
                negotiation_playbook: `Lead with the total compensation package value, not just base salary. Emphasize the equity upside and Deriv's growth trajectory. If the candidate counters above the competitive scenario, consider increasing the signing bonus rather than base (one-time cost vs. recurring). Keep the aggressive scenario in reserve as a final best-and-final offer only if there's a competing offer.`,
            });
        } finally {
            setAnalyzing(false);
        }
    }

    // Auto-analyze when candidate loads
    useEffect(() => {
        if (candidate && !analysis && !analyzing) {
            handleAnalyze();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [candidate]);

    function handleProceed() {
        if (!analysis || !candidate) return;
        const data = {
            candidate,
            feedbackScore,
            selectedScenario: analysis.scenarios[selectedScenario],
        };
        localStorage.setItem("hiring-compensation-data", JSON.stringify(data));
        window.location.href = "/hiring/approval";
    }

    const fmt = (n: number) => "$" + n.toLocaleString();
    const accColor = (pct: number) =>
        pct >= 75 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";

    return (
        <>
            <div className="hi-header">
                <div className="hi-breadcrumb">
                    <Link href="/dashboard">Dashboard</Link>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                    <span>Hiring Intelligence</span>
                </div>
                <h1 className="pg-title">Compensation Intelligence</h1>
                <p className="pg-subtitle">AI-generated offer scenarios with market benchmarks and acceptance prediction</p>
            </div>

            <HiringSteps active={2} />

            {/* Candidate summary */}
            {candidate && (
                <div className="hi-score-header" style={{ marginBottom: 24 }}>
                    <div className="hi-candidate-avatar" style={{ background: "linear-gradient(135deg, #6366f1, #a78bfa)", width: 50, height: 50, fontSize: 16 }}>
                        {candidate.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="hi-score-meta">
                        <h3>{candidate.name}</h3>
                        <p>{candidate.role} · {candidate.location} · {candidate.experience}y experience · AI Score: <strong>{feedbackScore}/10</strong></p>
                    </div>
                </div>
            )}

            {!candidate && (
                <div className="hi-loading">
                    <p>No candidate data found. <Link href="/hiring/feedback" style={{ color: "var(--accent)" }}>Start from Candidate Review →</Link></p>
                </div>
            )}

            {analyzing && (
                <div className="hi-loading">
                    <div className="hi-loading-spinner" />
                    <h3>Generating compensation scenarios...</h3>
                    <p>Analyzing market benchmarks and candidate profile</p>
                </div>
            )}

            {/* Offer Scenarios */}
            {analysis && !analyzing && (
                <>
                    <div className="hi-comp-grid">
                        {analysis.scenarios.map((s, i) => (
                            <div
                                key={i}
                                className={`hi-comp-card${i === 1 ? " recommended" : ""}${selectedScenario === i ? " selected" : ""}`}
                                onClick={() => setSelectedScenario(i)}
                                style={{ cursor: "pointer", borderColor: selectedScenario === i ? "var(--accent)" : undefined }}
                            >
                                {i === 1 && <div className="hi-comp-badge">Recommended</div>}
                                <div className="hi-comp-header">
                                    <h3>{s.label}</h3>
                                    <p>{s.pros.join(" · ")}</p>
                                </div>
                                <div className="hi-comp-total">
                                    {fmt(s.totalComp)} <span>/year total</span>
                                </div>
                                <div className="hi-comp-details">
                                    <div className="hi-comp-row">
                                        <span>Base Salary</span>
                                        <span>{fmt(s.baseSalary)}</span>
                                    </div>
                                    <div className="hi-comp-row">
                                        <span>Signing Bonus</span>
                                        <span>{fmt(s.signingBonus)}</span>
                                    </div>
                                    <div className="hi-comp-row">
                                        <span>Equity</span>
                                        <span>{s.equity}</span>
                                    </div>
                                </div>
                                <div className="hi-acceptance">
                                    <div className="hi-acceptance-label">Offer Acceptance Probability</div>
                                    <div className="hi-acceptance-bar">
                                        <div
                                            className="hi-acceptance-fill"
                                            style={{
                                                width: `${s.acceptanceProbability}%`,
                                                background: accColor(s.acceptanceProbability),
                                            }}
                                        />
                                    </div>
                                    <div className="hi-acceptance-pct" style={{ color: accColor(s.acceptanceProbability) }}>
                                        {s.acceptanceProbability}%
                                    </div>
                                    <p className="hi-acceptance-justification" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic', lineHeight: 1.3 }}>
                                        <strong>AI Justification:</strong> {s.justification}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* AI Rationale */}
                    <div className="hi-rationale">
                        <h4>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                            AI Compensation Rationale
                        </h4>
                        <p>{analysis.rationale}</p>
                    </div>

                    <div className="hi-rationale">
                        <h4>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                            Negotiation Playbook
                        </h4>
                        <p>{analysis.negotiation_playbook}</p>
                    </div>

                    <div className="hi-actions">
                        <button className="hi-btn-secondary" onClick={() => window.history.back()}>
                            ← Back
                        </button>
                        <button className="hi-btn-primary" onClick={handleProceed}>
                            Generate CEO Brief
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                        </button>
                    </div>
                </>
            )}
        </>
    );
}
