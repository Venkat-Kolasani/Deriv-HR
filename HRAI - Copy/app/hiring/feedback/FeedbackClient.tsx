"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MOCK_CANDIDATES, type CandidateProfile } from "@/app/lib/mock-candidates";
import { askFlowise, CHATFLOW_IDS, parseJsonFromLLM, parseFlowiseStructuredOutput, type CompatibilityScore } from "@/app/lib/flowise";

/* ── Job Description Constant ── */
const JOB_DESCRIPTION = {
    jobTitle: "Digital Marketing Specialist",
    company: "GreenTech Inc.",
    location: "San Francisco, CA",
    type: "Full-time",
    aboutUs: "A leading provider of sustainable energy solutions and innovative technologies. We're committed to reducing our carbon footprint and promoting environmentally-friendly practices throughout our operations.",
    jobSummary: "We are seeking an experienced and creative Digital Marketing Specialist to join our team. The ideal candidate will have a strong background in digital marketing, excellent writing and design skills, and the ability to work independently and collaboratively as part of a fast-paced team.",
    responsibilities: [
        {
            description: "Develop and execute comprehensive digital marketing strategies that align with company goals",
            keySkills: ["strategic planning", "content creation"]
        },
        {
            description: "Conduct market research to stay up-to-date on industry trends and competitor activity",
            keySkills: ["market analysis", "research skills"]
        }
    ],
    requirements: [
        {
            fieldOfStudy: "Marketing, Communications, or related field",
            degreeLevel: "Bachelor's degree",
            yearsOfExperience: 3,
            previousExperience: "3+ years of experience in digital marketing"
        },
        {
            keySkills: ["writing", "design", "analytical skills"],
            softwareProficiency: ["Adobe Creative Cloud (Photoshop, InDesign, Illustrator)"]
        }
    ],
    niceToHave: [
        {
            fieldOfStudy: "Clean energy or sustainability industry",
            previousExperience: "Experience working in the clean energy or sustainability industry"
        },
        {
            softwareProficiency: ["Google Analytics", "web analytics tools"]
        }
    ],
    benefits: [
        "Competitive salary range ($70,000-$90,000 per year)",
        "Comprehensive benefits package",
        "Opportunities for professional growth and development"
    ],
    howToApply: {
        contactInfo: "Resume and cover letter to [insert contact email or link]"
    }
};

/* ── Types ── */
interface ScorecardData {
    overall_score: number;
    competencies: Record<string, number>;
    strengths: string[];
    concerns: string[];
    red_flags: string[];
    bias_flags: string[];
    summary: string;
}

/* ── Step indicator for all hiring pages ── */
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

/* ── Score Ring SVG ── */
function ScoreRing({ score }: { score: number }) {
    const pct = (score / 10) * 100;
    const r = 42;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    const color = score >= 7.5 ? "#10b981" : score >= 5 ? "#f59e0b" : "#ef4444";

    return (
        <div className="hi-score-ring">
            <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="6" />
                <circle
                    cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="6"
                    strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset 1s ease" }}
                />
            </svg>
            <span className="score-value">{score.toFixed(1)}</span>
            <span className="score-label">/ 10</span>
        </div>
    );
}

/* ── Main Component ── */
export default function FeedbackClient() {
    const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile>(MOCK_CANDIDATES[0]);
    const [resumeReview, setResumeReview] = useState(MOCK_CANDIDATES[0].resumeReview);
    const [telephonic, setTelephonic] = useState(MOCK_CANDIDATES[0].telephonicInterview);
    const [culturalFit, setCulturalFit] = useState(MOCK_CANDIDATES[0].culturalFit);
    const [referenceCheck, setReferenceCheck] = useState(MOCK_CANDIDATES[0].referenceCheck);

    const [analyzing, setAnalyzing] = useState(false);
    const [scorecard, setScorecard] = useState<ScorecardData | null>(null);
    const [loadingStep, setLoadingStep] = useState("");

    // Load pre-selected candidate from landing page
    useEffect(() => {
        const saved = localStorage.getItem("hiring-selected-candidate");
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as CandidateProfile;
                // Find matching mock candidate to ensure full data
                const match = MOCK_CANDIDATES.find((c) => c.id === parsed.id) || parsed;
                setSelectedCandidate(match);
                setResumeReview(match.resumeReview);
                setTelephonic(match.telephonicInterview);
                setCulturalFit(match.culturalFit);
                setReferenceCheck(match.referenceCheck);
            } catch { }
        }
    }, []);

    function selectCandidate(c: CandidateProfile) {
        setSelectedCandidate(c);
        setResumeReview(c.resumeReview);
        setTelephonic(c.telephonicInterview);
        setCulturalFit(c.culturalFit);
        setReferenceCheck(c.referenceCheck);
        setScorecard(null);
    }

    async function handleAnalyze() {
        setAnalyzing(true);
        setScorecard(null);

        const loadingSteps = [
            "Analyzing interview feedback...",
            "Mapping competencies...",
            "Detecting sentiment & bias...",
            "Generating scorecard...",
        ];
        let stepIdx = 0;
        setLoadingStep(loadingSteps[0]);
        const interval = setInterval(() => {
            stepIdx++;
            if (stepIdx < loadingSteps.length) setLoadingStep(loadingSteps[stepIdx]);
        }, 1500);

        try {
            // Format candidate data
            const candidateData = {
                id: selectedCandidate.id,
                name: selectedCandidate.name,
                role: selectedCandidate.role,
                department: selectedCandidate.department,
                experience: selectedCandidate.experience,
                location: selectedCandidate.location,
                status: selectedCandidate.status,
                skills: selectedCandidate.skills,
                resumeReview: resumeReview,
                telephonicInterview: telephonic,
                culturalFit: culturalFit,
                referenceCheck: referenceCheck
            };
            
            // Combine candidate data and job description into the prompt
            const prompt = JSON.stringify(candidateData) + JSON.stringify(JOB_DESCRIPTION);

            // Call Flowise prediction API
            const response = await fetch('http://localhost:3000/api/v1/prediction/0458e1da-1714-45fd-81a3-577d5d7f61c3', {
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
            
            // Parse the new Flowise response format
            const compatibilityData = parseFlowiseStructuredOutput<CompatibilityScore>(result);
            
            // Transform CompatibilityScore into ScorecardData
            const transformedScorecard: ScorecardData = {
                overall_score: compatibilityData.score /10,
                competencies: {
                    "Technical Skills": compatibilityData["Technical Skills"]/10,
                    "Communication": compatibilityData["Communication"]/10,
                    "Leadership": compatibilityData["Leadership"]/10,
                    "Culture Fit": compatibilityData["Culture Fit"]/10,
                },
                strengths: compatibilityData["Key Strength"] || [],
                concerns: compatibilityData["Concerns"] || [],
                red_flags: [],
                bias_flags: [],
                summary: `Overall compatibility score of ${compatibilityData.score}/10. ${compatibilityData["Key Strength"]?.[0] || ""} However, ${compatibilityData["Concerns"]?.[0] || "some concerns were noted."}`
            };
            
            setScorecard(transformedScorecard);
        } catch (err) {
            // Fallback: generate mock scorecard for demo
            console.error("Flowise call failed, using mock data:", err);
            setScorecard({
                overall_score: 8.2,
                competencies: {
                    "Technical Skills": 9,
                    "Communication": 7.5,
                    "Leadership": 8,
                    "Culture Fit": 8,
                },
                strengths: [
                    "Exceptional technical depth with proven experience in high-scale systems",
                    "Strong leadership skills demonstrated through team mentoring and project ownership",
                    "Genuine enthusiasm for the fintech domain with relevant industry knowledge",
                ],
                concerns: [
                    "3 role changes in 5 years may indicate a pattern of short tenures",
                    "Slight hesitation observed in conflict resolution scenarios during telephonic interview",
                ],
                red_flags: [],
                bias_flags: [
                    'Reference described feedback style as "quite direct" — may contain cultural bias in communication assessment',
                ],
                summary: `${selectedCandidate.name} is a strong candidate with exceptional technical skills and proven leadership abilities. Their experience in high-scale fintech systems aligns well with the role requirements. Minor concerns around tenure stability should be addressed during the offer stage with appropriate retention incentives.`,
            });
        } finally {
            clearInterval(interval);
            setAnalyzing(false);
        }
    }

    // Save to localStorage for next pages
    function handleProceed() {
        if (!scorecard) return;
        const data = {
            candidate: selectedCandidate,
            scorecard,
        };
        localStorage.setItem("hiring-feedback-data", JSON.stringify(data));
        window.location.href = "/hiring/compensation";
    }

    const candidateGradient = (() => {
        const idx = MOCK_CANDIDATES.findIndex((c) => c.id === selectedCandidate.id);
        const gradients = [
            "linear-gradient(135deg, #6366f1, #a78bfa)",
            "linear-gradient(135deg, #10b981, #34d399)",
            "linear-gradient(135deg, #f59e0b, #fbbf24)",
        ];
        return gradients[idx] || gradients[0];
    })();

    return (
        <>
            <div className="hi-header">
                <div className="hi-breadcrumb">
                    <Link href="/dashboard">Dashboard</Link>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                    <Link href="/hiring">Hiring Intelligence</Link>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                    <span>{selectedCandidate.name}</span>
                </div>
                <h1 className="pg-title">AI Candidate Review</h1>
                <p className="pg-subtitle">Synthesize multi-round interview feedback into actionable insights</p>
            </div>

            <HiringSteps active={1} />

            {/* Selected Candidate Banner */}
            <div className="hi-candidate-selector">
                <div className="hi-candidate-card selected" style={{ flex: 'none', width: '100%' }}>
                    <div className="hi-candidate-avatar" style={{ background: candidateGradient }}>
                        {selectedCandidate.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="hi-candidate-info">
                        <strong>{selectedCandidate.name}</strong>
                        <span>{selectedCandidate.role} · {selectedCandidate.experience}y exp · {selectedCandidate.location}</span>
                    </div>
                </div>
            </div>

            {/* Feedback Input */}
            <div className="hi-feedback-grid">
                {[
                    { label: "Resume Review", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>, value: resumeReview, setter: setResumeReview, badge: "Round 1" },
                    { label: "Telephonic Interview", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" /></svg>, value: telephonic, setter: setTelephonic, badge: "Round 2" },
                    { label: "Cultural Fit Interview", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>, value: culturalFit, setter: setCulturalFit, badge: "Round 3" },
                    { label: "Reference Check", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>, value: referenceCheck, setter: setReferenceCheck, badge: "Round 4" },
                ].map((f) => (
                    <div key={f.label} className="hi-feedback-card">
                        <label>
                            {f.icon}
                            {f.label}
                            <span className="hi-badge">{f.badge}</span>
                        </label>
                        <textarea
                            className="hi-textarea"
                            value={f.value}
                            onChange={(e) => f.setter(e.target.value)}
                            placeholder={`Paste ${f.label.toLowerCase()} notes here...`}
                        />
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="hi-actions">
                <button className="hi-btn-primary" onClick={handleAnalyze} disabled={analyzing}>
                    {analyzing ? (
                        <><span className="hi-loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Analyzing...</>
                    ) : (
                        <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> Analyze Candidate</>
                    )}
                </button>
            </div>

            {/* Loading State */}
            {analyzing && (
                <div className="hi-loading">
                    <div className="hi-loading-spinner" />
                    <h3>AI is analyzing feedback...</h3>
                    <p>{loadingStep}</p>
                </div>
            )}

            {/* Scorecard */}
            {scorecard && !analyzing && (
                <div className="hi-scorecard">
                    {/* Score Header */}
                    <div className="hi-score-header">
                        <ScoreRing score={scorecard.overall_score} />
                        <div className="hi-score-meta">
                            <h3>{selectedCandidate.name} — AI Scorecard</h3>
                            <p>{scorecard.summary}</p>
                        </div>
                    </div>

                    {/* Competency Bars */}
                    <div className="hi-competencies">
                        {Object.entries(scorecard.competencies).map(([key, val]) => (
                            <div key={key} className="hi-competency">
                                <div className="hi-competency-top">
                                    <span>{key}</span>
                                    <strong>{typeof val === 'number' ? val.toFixed(1) : val}/10</strong>
                                </div>
                                <div className="hi-competency-bar">
                                    <div className="hi-competency-fill" style={{ width: `${(Number(val) / 10) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Strengths, Concerns, Red Flags, Bias */}
                    <div className="hi-lists">
                        <div className="hi-list-card strengths">
                            <h4>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                                Key Strengths
                            </h4>
                            {scorecard.strengths.map((s, i) => (
                                <div key={i} className="hi-list-item">✓ {s}</div>
                            ))}
                        </div>

                        <div className="hi-list-card concerns">
                            <h4>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                Concerns
                            </h4>
                            {scorecard.concerns.map((c, i) => (
                                <div key={i} className="hi-list-item">⚠ {c}</div>
                            ))}
                        </div>

                        {scorecard.red_flags.length > 0 && (
                            <div className="hi-list-card redflags">
                                <h4>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                                    Red Flags
                                </h4>
                                {scorecard.red_flags.map((r, i) => (
                                    <div key={i} className="hi-list-item">🚩 {r}</div>
                                ))}
                            </div>
                        )}

                        {scorecard.bias_flags.length > 0 && (
                            <div className="hi-list-card bias">
                                <h4>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                                    Bias Detection
                                </h4>
                                {scorecard.bias_flags.map((b, i) => (
                                    <div key={i} className="hi-list-item">⚡ {b}</div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Proceed to next step */}
                    <div className="hi-actions">
                        <button className="hi-btn-primary" onClick={handleProceed}>
                            Proceed to Compensation Analysis
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
