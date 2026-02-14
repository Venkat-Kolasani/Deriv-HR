"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SALARY_BENCHMARKS, INHOUSE_SALARY_RANGES, type CandidateProfile } from "@/app/lib/mock-candidates";
import { parseFlowiseStructuredOutput } from "@/app/lib/flowise";
import { getMockCompensationData } from "@/app/lib/mock-flowise-response";
import { ScorecardData } from "../feedback/FeedbackClient";

/* ── Types ── */
interface CompAnalysis {
    label: string;
    baseSalary: number;
    signingBonus: number;
    equity: string;
    totalComp: number;
    acceptanceProbability: number;
    justification: string;
    pros: string[];
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
    const [scorecard, setScorecard] = useState<ScorecardData | null>(null);
    const [analysis, setAnalysis] = useState<CompAnalysis | null>(null);
    const [analyzing, setAnalyzing] = useState(false);

    // Load candidate data from previous step
    useEffect(() => {
        const saved = localStorage.getItem("hiring-feedback-data");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setCandidate(parsed.candidate);
                setFeedbackScore(parsed.scorecard?.overall_score || 0);
                setScorecard(parsed.scorecard);
            } catch { }
        }
    }, []);

    async function handleAnalyze() {
        if (!candidate) return;
        setAnalyzing(true);

        const benchmarks = SALARY_BENCHMARKS[candidate.role]?.[candidate.location] || SALARY_BENCHMARKS[candidate.role]?.["Malaysia"];
        const inHouseRanges = INHOUSE_SALARY_RANGES[candidate.role]?.[candidate.location] || INHOUSE_SALARY_RANGES[candidate.role]?.["Malaysia"];

        try {
            // Format candidate and compensation data for analysis
            const compensationData = {
                candidate: {
                    name: candidate.name,
                    role: candidate.role,
                    location: candidate.location,
                    experience: candidate.experience,
                    aiReviewScorePercentage: feedbackScore,
                    strengths: scorecard?.strengths || [],
                    weaknesses: scorecard?.concerns || [],
                    previousSalary: candidate.previousSalary || null,
                    expectedSalaryRange: candidate.expectedSalaryRange || null,
                },
                marketBenchmarks: {
                    p25: benchmarks?.p25 || 0,
                    p50: benchmarks?.p50 || 0,
                    p75: benchmarks?.p75 || 0,
                    p90: benchmarks?.p90 || 0,
                    currency: "USD"
                },
                inHouseSalaryRange: {
                    min: inHouseRanges?.min || 0,
                    median: inHouseRanges?.median || 0,
                    max: inHouseRanges?.max || 0,
                    sampleSize: inHouseRanges?.sampleSize || 0,
                    description: `Internal salary band for ${candidate.role} in ${candidate.location} (based on ${inHouseRanges?.sampleSize || 0} current employees)`,
                    currency: "USD"
                }
            };

            const prompt = JSON.stringify(compensationData);

            //Call Flowise prediction API
            const response = await fetch('http://localhost:3000/api/v1/prediction/d4bfa403-8021-423b-9232-6d75e8a38eb3', {
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
            const parsed = parseFlowiseStructuredOutput<CompAnalysis>(result);
            // const parsed = getMockCompensationData();
            
            // Validate that required fields exist
            if (parsed && parsed.baseSalary && parsed.totalComp) {
                setAnalysis(parsed);
            } else {
                throw new Error("Invalid response structure from API");
            }
        } catch (err) {
            console.error("Flowise call failed, using mock data:", err);
            setAnalysis(getMockCompensationData());
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
        const benchmarks = SALARY_BENCHMARKS[candidate.role]?.[candidate.location] || SALARY_BENCHMARKS[candidate.role]?.["Malaysia"];
        const inHouseRanges = INHOUSE_SALARY_RANGES[candidate.role]?.[candidate.location] || INHOUSE_SALARY_RANGES[candidate.role]?.["Malaysia"];
        
        const data = {
            candidate,
            feedbackScore,
            scorecard,
            selectedScenario: {
                label: analysis.label,
                baseSalary: analysis.baseSalary,
                signingBonus: analysis.signingBonus,
                equity: analysis.equity,
                totalComp: analysis.totalComp,
                acceptanceProbability: analysis.acceptanceProbability,
                justification: analysis.justification,
                pros: analysis.pros,
            },
            salaryComparison: {
                candidateExpectedRange: candidate.expectedSalaryRange,
                marketBenchmarks: {
                    p25: benchmarks?.p25 || 0,
                    p50: benchmarks?.p50 || 0,
                    p75: benchmarks?.p75 || 0,
                    p90: benchmarks?.p90 || 0,
                },
                inHouseSalaryRange: {
                    min: inHouseRanges?.min || 0,
                    median: inHouseRanges?.median || 0,
                    max: inHouseRanges?.max || 0,
                    sampleSize: inHouseRanges?.sampleSize || 0,
                }
            }
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
                        {candidate.name?.split(" ").map(n => n[0]).join("") || "??"}
                    </div>
                    <div className="hi-score-meta">
                        <h3>{candidate.name || "Unknown Candidate"}</h3>
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

            {/* Offer Scenario */}
            {analysis && !analyzing && (
                <>
                    <div className="hi-comp-single">
                        <div className="hi-comp-card recommended" style={{ maxWidth: 700, margin: '0 auto' }}>
                            <div className="hi-comp-badge">AI Recommended Offer</div>
                            <div className="hi-comp-header">
                                <h3>{analysis.label}</h3>
                                <p>{analysis.pros.join(" · ")}</p>
                            </div>
                            <div className="hi-comp-total">
                                {fmt(analysis.totalComp)} <span>/year total</span>
                            </div>
                            <div className="hi-comp-details">
                                <div className="hi-comp-row">
                                    <span>Base Salary</span>
                                    <span>{fmt(analysis.baseSalary)}</span>
                                </div>
                                <div className="hi-comp-row">
                                    <span>Signing Bonus</span>
                                    <span>{fmt(analysis.signingBonus)}</span>
                                </div>
                                <div className="hi-comp-row">
                                    <span>Equity</span>
                                    <span>{analysis.equity}</span>
                                </div>
                            </div>
                            <div className="hi-acceptance">
                                <div className="hi-acceptance-label">Offer Acceptance Probability</div>
                                <div className="hi-acceptance-bar">
                                    <div
                                        className="hi-acceptance-fill"
                                        style={{
                                            width: `${analysis.acceptanceProbability}%`,
                                            background: accColor(analysis.acceptanceProbability),
                                        }}
                                    />
                                </div>
                                <div className="hi-acceptance-pct" style={{ color: accColor(analysis.acceptanceProbability) }}>
                                    {analysis.acceptanceProbability}%
                                </div>
                                <p className="hi-acceptance-justification" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic', lineHeight: 1.3 }}>
                                    <strong>AI Justification:</strong> {analysis.justification}
                                </p>
                            </div>
                        </div>
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
