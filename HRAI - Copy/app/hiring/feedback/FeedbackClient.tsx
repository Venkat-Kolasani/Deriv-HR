"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MOCK_CANDIDATES, type CandidateProfile } from "@/app/lib/mock-candidates";
import { askFlowise, CHATFLOW_IDS, parseJsonFromLLM, parseFlowiseStructuredOutput, type CompatibilityScore } from "@/app/lib/flowise";
import { generateMockFlowiseResponse, getMockScorecardData } from "@/app/lib/mock-flowise-response";

/* ── Job Description Constant ── */
const JOB_DESCRIPTION = {
    jobTitle: "Senior Software Engineer",
    company: "Deriv Group",
    location: "Cyberjaya, Malaysia (Hybrid)",
    type: "Full-time",
    aboutUs: "Deriv is a leading online trading company with over 20 years of experience, serving millions of traders worldwide. We build high-performance trading platforms that process billions of dollars in trades annually. Our engineering team is at the heart of everything we do.",
    jobSummary: "We are looking for a Senior Software Engineer to join our Platform Engineering team. You will design, build, and maintain scalable backend services and APIs that power our real-time trading platforms. The ideal candidate has deep experience in distributed systems, strong coding fundamentals, and a passion for fintech.",
    responsibilities: [
        {
            description: "Design and implement scalable microservices and APIs for real-time trading systems",
            keySkills: ["system design", "API development", "microservices architecture"]
        },
        {
            description: "Write clean, well-tested, production-quality code in Python, Java, or TypeScript",
            keySkills: ["Python", "Java", "TypeScript", "unit testing"]
        },
        {
            description: "Collaborate with cross-functional teams to define technical requirements and deliver features",
            keySkills: ["cross-functional collaboration", "technical communication"]
        },
        {
            description: "Mentor junior engineers, conduct code reviews, and contribute to engineering best practices",
            keySkills: ["mentorship", "code review", "engineering leadership"]
        },
        {
            description: "Monitor, troubleshoot, and optimize system performance and reliability",
            keySkills: ["performance optimization", "monitoring", "incident response"]
        }
    ],
    requirements: [
        {
            fieldOfStudy: "Computer Science, Software Engineering, or related technical field",
            degreeLevel: "Bachelor's or Master's degree",
            yearsOfExperience: 5,
            previousExperience: "5+ years of professional software engineering experience"
        },
        {
            keySkills: ["data structures", "algorithms", "system design", "REST APIs", "SQL", "Git"],
            softwareProficiency: ["Python or Java or TypeScript", "PostgreSQL or MySQL", "Docker", "AWS or GCP"]
        }
    ],
    niceToHave: [
        {
            fieldOfStudy: "Financial technology or trading systems",
            previousExperience: "Experience building real-time trading or financial platforms"
        },
        {
            softwareProficiency: ["Kubernetes", "Kafka", "Redis", "React", "CI/CD pipelines"]
        }
    ],
    benefits: [
        "Competitive salary range (USD 100,000–140,000 per year)",
        "18 days annual leave + 14 days sick leave",
        "Full medical coverage for employee and dependents",
        "USD 2,000/year learning budget for courses and conferences",
        "Hybrid work arrangement (2 days remote per week)",
        "4-year equity vesting with 1-year cliff"
    ],
    howToApply: {
        contactInfo: "Apply via careers.deriv.com or email hiring@deriv.com"
    }
};

/* ── Types ── */
export interface ScorecardData {
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

/* ── Candidate-Specific Mock Scorecards ── */
function getCandidateSpecificScorecard(candidate: CandidateProfile): ScorecardData {
    const scorecards: Record<string, ScorecardData> = {
        "cand-001": { // Sarah Chen — Strong SWE match
            overall_score: 9.2,
            competencies: {
                "Technical Skills": 9.5,
                "Communication": 8.5,
                "Leadership": 9,
                "Culture Fit": 9,
            },
            strengths: [
                "Exceptional technical depth — built a real-time trading platform handling 50K transactions/sec, directly relevant to Deriv's infrastructure",
                "Strong proficiency in Python, React, TypeScript, and AWS — matches all JD requirements",
                "Proven leadership through mentoring 6 engineers and driving architecture decisions",
                "Published research in distributed systems demonstrates deep CS fundamentals",
                "Specific interest in fintech aligns perfectly with Deriv's domain",
            ],
            concerns: [
                "3 role changes in 5 years — may indicate tenure risk, though each move was a promotion",
                "Slight hesitation in conflict resolution scenarios during telephonic interview",
            ],
            red_flags: [],
            bias_flags: [
                'Reference described feedback style as "quite direct" — may reflect cultural bias in communication assessment rather than an actual concern',
            ],
            summary: "Sarah Chen is an exceptional match for the Senior Software Engineer role. Her 7 years of experience building high-scale fintech systems, strong coding fundamentals (Python, React, TypeScript, AWS), and proven leadership make her an ideal candidate. Her real-time trading platform experience is directly relevant to Deriv's core business. Minor concerns about tenure stability should be addressed with competitive retention incentives.",
        },
        "cand-002": { // Marcus Thompson — Marketing, no-match
            overall_score: 3.5,
            competencies: {
                "Technical Skills": 1,
                "Communication": 8.5,
                "Leadership": 6,
                "Culture Fit": 5,
            },
            strengths: [
                "Excellent verbal and written communication skills — articulate, structured presenter",
                "Strong project management and stakeholder coordination abilities",
                "Demonstrates genuine enthusiasm and willingness to learn",
            ],
            concerns: [
                "Zero software engineering experience — no programming languages, no CS degree, no technical projects",
                "Cannot answer basic questions about data structures, algorithms, or software development methodologies",
                "Technical exposure limited to marketing tools (HubSpot, Google Analytics, Canva) — not engineering tools",
                "Fundamental skills mismatch — would require 2-3 years of training to meet minimum SWE requirements",
                "Salary expectation ($85K-$100K) does not align with junior-level role he would need to start at",
            ],
            red_flags: [
                "Candidate does not understand why technical questions are being asked — suggests fundamental misunderstanding of the role",
                "References explicitly caution against placing him in an engineering position",
            ],
            bias_flags: [],
            summary: "Marcus Thompson is a talented marketing professional but is fundamentally unqualified for a Senior Software Engineer role. He has zero programming experience, no CS education, and cannot engage with basic technical concepts. His strengths lie entirely in brand strategy and content marketing. Recommendation: redirect application to a Marketing or Communications role where his skills would be highly valued.",
        },
        "cand-003": { // Aisha Rahman — Data Scientist, partial match
            overall_score: 6.5,
            competencies: {
                "Technical Skills": 7,
                "Communication": 5.5,
                "Leadership": 5,
                "Culture Fit": 6.5,
            },
            strengths: [
                "Strong Python programming skills with production-quality code on GitHub",
                "Deep ML/AI expertise — published at NeurIPS, built fraud detection saving $3.2M",
                "Understands data pipelines, SQL, and backend processing at scale",
                "Genuine passion for fintech and financial applications of technology",
            ],
            concerns: [
                "No experience with frontend frameworks (React) — unfamiliar with full-stack web development",
                "System design experience is limited to ML pipelines, not scalable microservices",
                "Communication style is introverted — interviewers had to draw out responses",
                "More researcher than production engineer — heavy on modeling, light on deployment",
                "Would need significant ramp-up time on web development, APIs, and distributed systems architecture",
            ],
            red_flags: [],
            bias_flags: [
                "Introversion may be unfairly penalized — long pauses before responding could reflect thoughtfulness rather than hesitation",
                "Cultural fit score (6.5/10) may undervalue candidates who prefer small-group collaboration over large meetings",
            ],
            summary: "Aisha Rahman is a technically talented Data Scientist with partial overlap for a Senior Software Engineer role. Her Python skills and data pipeline experience are relevant, but she lacks frontend development experience, microservices architecture knowledge, and full-stack capabilities. She would be an excellent candidate for a Data Science or ML Engineering role instead. If hired for SWE, expect a 6-month ramp-up period.",
        },
        "cand-004": { // Raj Patel — Strong backend SWE match
            overall_score: 8.5,
            competencies: {
                "Technical Skills": 9.5,
                "Communication": 8,
                "Leadership": 9,
                "Culture Fit": 8.5,
            },
            strengths: [
                "8 years of backend engineering with deep expertise in Java, Kubernetes, and microservices — directly relevant to Deriv's platform",
                "Architected a payment platform processing 2M transactions/day — proven at Deriv's scale",
                "Reduced payment latency from 800ms to 120ms — strong performance optimization skills",
                "Active Apache Kafka contributor and conference speaker — demonstrates community leadership",
                "Strong mentorship track record — mentored 4 junior engineers and established code review standards",
            ],
            concerns: [
                "Limited frontend experience — primarily backend-focused, basic React familiarity only",
                "Can be overly focused on perfection, which may slow initial delivery velocity",
                "Salary expectation ($125K-$145K) at the higher end of the JD's range",
            ],
            red_flags: [],
            bias_flags: [],
            summary: "Raj Patel is a strong match for the Senior Software Engineer role. His 8 years of backend engineering experience, distributed systems expertise, and fintech domain knowledge align excellently with Deriv's requirements. His microservices architecture at payment scale is directly transferable. Minor gap in frontend skills is manageable given the role's backend focus. Highly recommended for hire.",
        },
        "cand-005": { // Priya Menon — HR Recruiter, completely mismatched
            overall_score: 2.0,
            competencies: {
                "Technical Skills": 0.5,
                "Communication": 8,
                "Leadership": 4,
                "Culture Fit": 3,
            },
            strengths: [
                "Excellent interpersonal and organizational skills from HR background",
                "Deep understanding of the tech hiring market — successfully filled 40+ engineering roles",
                "Strong employer branding and candidate experience management",
            ],
            concerns: [
                "Zero software engineering skills — cannot explain what an API is, has never written code",
                "No CS degree — BA in Human Resource Management with no technical education",
                "Lists 'basic Excel' and 'PowerPoint' as technical skills — no programming languages whatsoever",
                "Could not participate in whiteboard design exercise during cultural fit interview",
                "Enrolled in beginner Python course but has not completed it — no concrete learning timeline",
                "References explicitly state she is not an engineer and should not be placed in an engineering role",
            ],
            red_flags: [
                "Complete skills mismatch — candidate recruits FOR engineering roles but has never held one",
                "Panel unanimously recommends redirecting to HR department instead",
                "Interview panel scored cultural fit 3/10 for engineering (but 8/10 for HR role)",
            ],
            bias_flags: [
                "Career transition aspirations should be acknowledged — however, the gap is too large for a senior role. Consider suggesting a junior apprenticeship program if available",
            ],
            summary: "Priya Menon is an outstanding HR professional but is completely unqualified for a Senior Software Engineer position. She has zero programming skills, no technical education, and cannot engage with any engineering concepts. Both references explicitly caution against an engineering placement. Strong recommendation: redirect her application to an HR leadership or Talent Acquisition Lead role where she would excel.",
        },
    };

    return scorecards[candidate.id] || {
        overall_score: 5.0,
        competencies: { "Technical Skills": 5, "Communication": 5, "Leadership": 5, "Culture Fit": 5 },
        strengths: ["Further evaluation needed"],
        concerns: ["Insufficient data for comprehensive assessment"],
        red_flags: [],
        bias_flags: [],
        summary: `${candidate.name} requires further evaluation for the Senior Software Engineer role.`,
    };
}

/* ── Main Component ── */
export default function FeedbackClient() {
    const router = useRouter();
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
            // const response = await fetch('http://localhost:3000/api/v1/prediction/0458e1da-1714-45fd-81a3-577d5d7f61c3', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({
            //         question: prompt,
            //     }),
            // });

            // if (!response.ok) {
            //     throw new Error(`HTTP error! status: ${response.status}`);
            // }

            // const result = await response.json();

            // Use candidate-specific mock scorecard for demo
            const mockScorecard = getCandidateSpecificScorecard(selectedCandidate);
            const transformedScorecard: ScorecardData = mockScorecard;

            setScorecard(transformedScorecard);
        } catch (err) {
            // Fallback: use candidate-specific mock scorecard
            console.error("Flowise call failed, using mock data:", err);
            setScorecard(getCandidateSpecificScorecard(selectedCandidate));
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
        // Use Next.js router for proper client-side navigation
        router.push("/hiring/compensation");
    }

    const isLowScore = scorecard ? scorecard.overall_score < 5 : false;

    const candidateGradient = (() => {
        const idx = MOCK_CANDIDATES.findIndex((c) => c.id === selectedCandidate.id);
        const gradients = [
            "linear-gradient(135deg, #6366f1, #a78bfa)",
            "linear-gradient(135deg, #10b981, #34d399)",
            "linear-gradient(135deg, #f59e0b, #fbbf24)",
            "linear-gradient(135deg, #3b82f6, #60a5fa)",
            "linear-gradient(135deg, #ec4899, #f472b6)",
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
                        <div style={{ textAlign: "center" }}>
                            <ScoreRing score={scorecard.overall_score} />
                            <p style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "6px", maxWidth: 120, lineHeight: 1.3 }}>
                                AI holistic assessment - not an average of sub-scores
                            </p>
                        </div>
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

                    {/* Proceed to next step — blocked if score < 50% */}
                    <div className="hi-actions">
                        {isLowScore ? (
                            <div style={{
                                background: "rgba(239,68,68,0.08)",
                                border: "1px solid rgba(239,68,68,0.25)",
                                borderRadius: 12,
                                padding: "16px 24px",
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                color: "#ef4444",
                                fontSize: 14,
                                fontWeight: 500,
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="15" y1="9" x2="9" y2="15" />
                                    <line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                                <div>
                                    <div style={{ fontWeight: 600, marginBottom: 2 }}>Pipeline Blocked — Candidate Not Eligible</div>
                                    <div style={{ color: "var(--text-2)", fontSize: 13 }}>
                                        Score is below 50% threshold ({((scorecard?.overall_score ?? 0) * 10).toFixed(0)}%). This candidate does not meet the minimum requirements for the Senior Software Engineer role. Consider redirecting to a more suitable position.
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button className="hi-btn-primary" onClick={handleProceed}>
                                Proceed to Compensation Analysis
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
