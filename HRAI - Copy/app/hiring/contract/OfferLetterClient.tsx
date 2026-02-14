"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { COMPANY_POLICIES, type CandidateProfile } from "@/app/lib/mock-candidates";
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

export default function OfferLetterClient() {
    const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
    const [offer, setOffer] = useState<any>(null);
    const [approved, setApproved] = useState(false);
    const [letterContent, setLetterContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [downloaded, setDownloaded] = useState(false);

    useEffect(() => {
        // Load approval data
        const approvalData = localStorage.getItem("hiring-approval-status");
        if (approvalData) {
            try {
                const parsed = JSON.parse(approvalData);
                setCandidate(parsed.candidate);
                setOffer(parsed.selectedOffer);
                setApproved(parsed.decision === "approved");
            } catch { }
        }
        // Fallback: load from compensation data
        if (!approvalData) {
            const compData = localStorage.getItem("hiring-compensation-data");
            if (compData) {
                try {
                    const parsed = JSON.parse(compData);
                    setCandidate(parsed.candidate);
                    setOffer(parsed.selectedScenario);
                    setApproved(true);
                } catch { }
            }
        }
    }, []);

    const fmt = (n: number) => "$" + n?.toLocaleString();
    const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const startDate = new Date(Date.now() + 30 * 86400000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    async function generateLetter() {
        if (!candidate || !offer) return;
        setLoading(true);

        try {
            const prompt = `You are an HR professional at ${COMPANY_POLICIES.name}. Generate a professional offer letter for the following candidate. Write in a warm but professional tone.

CANDIDATE: ${candidate.name}
ROLE: ${candidate.role}
DEPARTMENT: ${candidate.department}
LOCATION: ${candidate.location}
START DATE: ${startDate}

COMPENSATION:
- Base Salary: ${fmt(offer.baseSalary)} per annum
- Signing Bonus: ${fmt(offer.signingBonus)}
- Equity: ${offer.equity}

BENEFITS:
- Annual Leave: ${COMPANY_POLICIES.benefits.annualLeave} days
- Sick Leave: ${COMPANY_POLICIES.benefits.sickLeave} days
- Medical Insurance: ${COMPANY_POLICIES.benefits.medicalInsurance}
- Learning Budget: ${COMPANY_POLICIES.benefits.learningBudget}
- Remote Work: ${COMPANY_POLICIES.benefits.remoteWorkDays} days/week WFH

PROBATION: ${COMPANY_POLICIES.probationPeriod}
NOTICE PERIOD: ${COMPANY_POLICIES.noticePeriod.lessThan2Years}

Write the complete offer letter text. Include all standard sections: greeting, role details, compensation breakdown, benefits summary, terms of employment, acceptance deadline (2 weeks from today), and closing. Do not use any markdown formatting.`;

            const result = await askFlowise(CHATFLOW_IDS.OFFER_LETTER, prompt);
            setLetterContent(result.text || "");
        } catch (err) {
            console.error("Flowise call failed, using mock letter:", err);
            setLetterContent(`${COMPANY_POLICIES.name}
Kuala Lumpur, Malaysia

${today}

Dear ${candidate.name},

OFFER OF EMPLOYMENT — ${candidate.role.toUpperCase()}

We are delighted to extend this offer of employment with ${COMPANY_POLICIES.name}. Following our comprehensive interview process, we are confident that your skills, experience, and values are an excellent match for our team.

POSITION DETAILS

Role: ${candidate.role}
Department: ${candidate.department}
Location: ${candidate.location}
Reporting To: VP of ${candidate.department}
Start Date: ${startDate}
Employment Type: Full-time, Permanent

COMPENSATION PACKAGE

Your total compensation consists of the following components:

Base Salary: ${fmt(offer.baseSalary)} per annum, paid monthly
Signing Bonus: ${fmt(offer.signingBonus)}, paid within 30 days of start
Equity: ${offer.equity}

Your total first-year compensation is ${fmt(offer.totalComp)}.

BENEFITS

As a ${COMPANY_POLICIES.name} employee, you are entitled to:

• ${COMPANY_POLICIES.benefits.annualLeave} days annual leave (pro-rated for the first year)
• ${COMPANY_POLICIES.benefits.sickLeave} days paid sick leave
• ${COMPANY_POLICIES.benefits.hospitalizationLeave} days hospitalization leave
• ${COMPANY_POLICIES.benefits.medicalInsurance}
• ${COMPANY_POLICIES.benefits.dentalOptical}
• ${COMPANY_POLICIES.benefits.learningBudget}
• Hybrid work arrangement: ${COMPANY_POLICIES.benefits.remoteWorkDays} days/week work from home

TERMS OF EMPLOYMENT

Probation Period: ${COMPANY_POLICIES.probationPeriod} from the start date
Notice Period: ${COMPANY_POLICIES.noticePeriod.duringProbation} during probation, ${COMPANY_POLICIES.noticePeriod.lessThan2Years} thereafter
Working Hours: Standard business hours (Monday to Friday)

This offer is contingent upon:
1. Successful completion of background verification
2. Providing valid work authorization documentation
3. Acceptance within 14 days of this letter

ACCEPTANCE

To accept this offer, please sign and return this letter by ${new Date(Date.now() + 14 * 86400000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.

We are excited about the prospect of you joining our team and look forward to your positive response.

Warm regards,

Ahmad Rashid
HR Manager
${COMPANY_POLICIES.name}`);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (candidate && offer && approved && !letterContent && !loading) {
            generateLetter();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [candidate, offer, approved]);

    async function handleDownloadDocx() {
        if (!letterContent || !candidate) return;

        try {
            const res = await fetch("/api/generate-docx", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    candidateName: candidate.name,
                    role: candidate.role,
                    content: letterContent,
                }),
            });

            if (!res.ok) throw new Error("Failed to generate DOCX");

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Offer_Letter_${candidate.name.replace(/\s+/g, "_")}.docx`;
            a.click();
            URL.revokeObjectURL(url);
            setDownloaded(true);
        } catch (err) {
            console.error("DOCX generation failed:", err);
            // Fallback: download as text file
            const blob = new Blob([letterContent], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Offer_Letter_${candidate.name.replace(/\s+/g, "_")}.txt`;
            a.click();
            URL.revokeObjectURL(url);
            setDownloaded(true);
        }
    }

    function handleSavePDF() {
        if (!letterContent || !candidate) return;

        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        printWindow.document.write(`<!DOCTYPE html>
<html><head><title>Offer Letter — ${candidate.name}</title>
<style>
body { font-family: 'Georgia', serif; margin: 40px 60px; color: #1a1a1a; line-height: 1.8; font-size: 13px; }
h1 { font-size: 16px; margin-bottom: 24px; }
</style></head>
<body><pre style="white-space: pre-wrap; font-family: Georgia, serif;">${letterContent}</pre>
<script>window.onload = function() { window.print(); }</script>
</body></html>`);
        printWindow.document.close();
    }

    return (
        <>
            <div className="hi-header">
                <div className="hi-breadcrumb">
                    <Link href="/dashboard">Dashboard</Link>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                    <span>Hiring Intelligence</span>
                </div>
                <h1 className="pg-title">AI Offer Letter Generator</h1>
                <p className="pg-subtitle">Generate, preview, and download personalized offer letters</p>
            </div>

            <HiringSteps active={4} />

            {!candidate && (
                <div className="hi-loading">
                    <p>No candidate data found. <Link href="/hiring/feedback" style={{ color: "var(--accent)" }}>Start from Candidate Review →</Link></p>
                </div>
            )}

            {loading && (
                <div className="hi-loading">
                    <div className="hi-loading-spinner" />
                    <h3>Generating offer letter...</h3>
                    <p>Creating personalized offer with approved compensation package</p>
                </div>
            )}

            {letterContent && !loading && (
                <>
                    {/* Download buttons */}
                    <div className="hi-download-row">
                        <button className="hi-download-btn" onClick={handleDownloadDocx}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                            </svg>
                            Download .docx
                        </button>
                        <button className="hi-download-btn" onClick={handleSavePDF}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 2h9l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" />
                                <path d="M14 2v6h6" /><path d="M9 15h6" /><path d="M9 11h6" />
                            </svg>
                            Save PDF
                        </button>
                    </div>

                    {/* Letter Preview */}
                    <div className="hi-contract-preview">
                        <pre style={{
                            whiteSpace: "pre-wrap",
                            fontFamily: "'Georgia', serif",
                            fontSize: 13,
                            lineHeight: 1.8,
                            margin: 0,
                        }}>
                            {letterContent}
                        </pre>
                    </div>

                    {downloaded && (
                        <div className="hi-success">
                            <div className="hi-success-icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                            <h2>Hiring Pipeline Complete! 🎉</h2>
                            <p>The offer letter for <strong>{candidate?.name}</strong> has been generated and downloaded. The hiring pipeline is complete.</p>
                            <div className="hi-actions" style={{ justifyContent: "center", marginTop: 24 }}>
                                <Link href="/hiring/feedback" className="hi-btn-secondary" style={{ textDecoration: "none" }}>
                                    ← Review Another Candidate
                                </Link>
                                <Link href="/dashboard" className="hi-btn-primary" style={{ textDecoration: "none" }}>
                                    Back to Dashboard
                                </Link>
                            </div>
                        </div>
                    )}
                </>
            )}
        </>
    );
}
