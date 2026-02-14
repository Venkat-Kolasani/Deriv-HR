"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { COMPANY_POLICIES, type CandidateProfile } from "@/app/lib/mock-candidates";

/* ── Document type definitions ── */
type DocType = "offer_letter" | "employment_contract" | "equity_grant" | "nda" | "ip_assignment";

interface DocumentDef {
    id: DocType;
    title: string;
    shortTitle: string;
    description: string;
    icon: React.ReactNode;
    gradient: string;
    roleSpecific?: string; // only show for this department
}

const DOCUMENT_DEFS: DocumentDef[] = [
    {
        id: "offer_letter",
        title: "Offer Letter",
        shortTitle: "Offer",
        description: "Formal offer of employment with compensation details",
        icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
        gradient: "linear-gradient(135deg, #6366f1, #a78bfa)",
    },
    {
        id: "employment_contract",
        title: "Employment Contract",
        shortTitle: "Contract",
        description: "Full terms of employment, probation & notice periods",
        icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M12 18v-6" /><path d="M9 15l3 3 3-3" /></svg>,
        gradient: "linear-gradient(135deg, #10b981, #34d399)",
    },
    {
        id: "equity_grant",
        title: "Equity Grant Agreement",
        shortTitle: "Equity",
        description: "Stock option vesting schedule, cliff & grant terms",
        icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
        gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)",
    },
    {
        id: "nda",
        title: "Non-Disclosure Agreement",
        shortTitle: "NDA",
        description: "Confidentiality obligations, scope & duration",
        icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>,
        gradient: "linear-gradient(135deg, #ef4444, #f87171)",
    },
    {
        id: "ip_assignment",
        title: "IP Assignment Agreement",
        shortTitle: "IP Rights",
        description: "Intellectual property & invention assignment",
        icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>,
        gradient: "linear-gradient(135deg, #8b5cf6, #c084fc)",
        roleSpecific: "Engineering",
    },
];

/* ── Step indicator ── */
function HiringSteps({ active }: { active: number }) {
    const steps = [
        { num: 1, label: "Candidate Review", href: "/hiring/feedback" },
        { num: 2, label: "Compensation", href: "/hiring/compensation" },
        { num: 3, label: "CEO Approval", href: "/hiring/approval" },
        { num: 4, label: "Document Suite", href: "/hiring/contract" },
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

/* ── Main Component ── */
export default function OfferLetterClient() {
    const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
    const [offer, setOffer] = useState<any>(null);
    const [approved, setApproved] = useState(false);
    const [activeDoc, setActiveDoc] = useState<DocType>("offer_letter");
    const [documents, setDocuments] = useState<Record<DocType, string>>({
        offer_letter: "",
        employment_contract: "",
        equity_grant: "",
        nda: "",
        ip_assignment: "",
    });
    const [generating, setGenerating] = useState<Record<DocType, boolean>>({
        offer_letter: false,
        employment_contract: false,
        equity_grant: false,
        nda: false,
        ip_assignment: false,
    });
    const [scorecard, setScorecard] = useState<any>(null);
    const [downloaded, setDownloaded] = useState(false);

    useEffect(() => {
        const approvalData = localStorage.getItem("hiring-approval-status");
        if (approvalData) {
            try {
                const parsed = JSON.parse(approvalData);
                setCandidate(parsed.candidate);
                setOffer(parsed.selectedOffer);
                setApproved(parsed.decision === "approved");
            } catch { }
        }
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

        // Pull feedback data for personalization
        const feedbackData = localStorage.getItem("hiring-feedback-data");
        if (feedbackData) {
            try {
                const parsed = JSON.parse(feedbackData);
                setScorecard(parsed.scorecard);
            } catch { }
        }
    }, []);

    const fmt = (n: number) => "$" + n?.toLocaleString();
    const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const startDate = new Date(Date.now() + 30 * 86400000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const acceptDeadline = new Date(Date.now() + 14 * 86400000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    /* ── Fallback templates ── */
    function getFallbackTemplate(docType: DocType): string {
        if (!candidate || !offer) return "";
        const c = candidate;
        const o = offer;

        switch (docType) {
            case "offer_letter":
                return `${COMPANY_POLICIES.name}
Cyberjaya, Malaysia

${today}

Dear ${c.name},

OFFER OF EMPLOYMENT — ${c.role.toUpperCase()}

We are delighted to extend this offer of employment with ${COMPANY_POLICIES.name}. Following our comprehensive interview process, we are confident that your skills, experience, and values are an excellent match for our team.

POSITION DETAILS

Role: ${c.role}
Department: ${c.department}
Location: ${c.location}
Reporting To: VP of ${c.department}
Start Date: ${startDate}
Employment Type: Full-time, Permanent

COMPENSATION PACKAGE

Your total compensation consists of the following components:

Base Salary: ${fmt(o.baseSalary)} per annum, paid monthly
Signing Bonus: ${fmt(o.signingBonus)}, paid within 30 days of start
Equity: ${o.equity}

Your total first-year compensation is ${fmt(o.totalComp)}.

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

To accept this offer, please sign and return this letter by ${acceptDeadline}.

We are excited about the prospect of you joining our team and look forward to your positive response.

Warm regards,

Rammya Nair
VP Human Resources
Deriv`;

            case "employment_contract":
                return `${COMPANY_POLICIES.name}
EMPLOYMENT CONTRACT

CONTRACT REFERENCE: DC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}

This Employment Contract ("Contract") is entered into on ${today} between:

EMPLOYER
Name: ${COMPANY_POLICIES.name}
Registered Address: Level 15, Deriv Tower, Cyberjaya, 63000, Selangor, Malaysia
Company Registration No: 200701035514

EMPLOYEE
Name: ${c.name}
Position: ${c.role}
Department: ${c.department}

ARTICLE 1 — APPOINTMENT AND DUTIES

1.1 The Employer hereby appoints the Employee to the position of ${c.role} within the ${c.department} department, effective ${startDate}.

1.2 The Employee shall report to the VP of ${c.department} or such other person as the Employer may designate from time to time.

1.3 The Employee's primary work location shall be ${c.location}, with hybrid work arrangements as per company policy.

1.4 The Employee shall devote their full working time, attention, and abilities to the performance of their duties.

ARTICLE 2 — PROBATION

2.1 The Employee shall serve a probationary period of ${COMPANY_POLICIES.probationPeriod} from the commencement date.

2.2 During the probationary period, either party may terminate this Contract by providing ${COMPANY_POLICIES.noticePeriod.duringProbation} written notice.

2.3 Upon successful completion of probation, the Employer shall confirm the Employee's permanent appointment in writing.

ARTICLE 3 — REMUNERATION

3.1 Base Salary: The Employee shall receive a gross annual salary of ${fmt(o.baseSalary)}, payable in monthly instalments on or before the last business day of each month.

3.2 Signing Bonus: A one-time signing bonus of ${fmt(o.signingBonus)} shall be paid within 30 days of the commencement date. Should the Employee resign within 12 months, the signing bonus shall be repaid in full on a pro-rata basis.

3.3 Equity Compensation: ${o.equity}. Full terms are detailed in the separate Equity Grant Agreement.

3.4 Salary reviews shall be conducted annually in accordance with the Employer's compensation review cycle.

ARTICLE 4 — WORKING HOURS AND LEAVE

4.1 Standard working hours are Monday to Friday, 9:00 AM to 6:00 PM, with a one-hour lunch break.

4.2 Annual Leave: ${COMPANY_POLICIES.benefits.annualLeave} days per calendar year, pro-rated for the first year of service.

4.3 Sick Leave: ${COMPANY_POLICIES.benefits.sickLeave} days per calendar year with valid medical certification.

4.4 Hospitalization Leave: ${COMPANY_POLICIES.benefits.hospitalizationLeave} days per calendar year.

4.5 Additional leave entitlements (parental, compassionate, study) shall be as per the Employee Handbook.

ARTICLE 5 — BENEFITS

5.1 Medical Insurance: ${COMPANY_POLICIES.benefits.medicalInsurance}
5.2 Dental & Optical: ${COMPANY_POLICIES.benefits.dentalOptical}
5.3 Professional Development: ${COMPANY_POLICIES.benefits.learningBudget}
5.4 Remote Work: ${COMPANY_POLICIES.benefits.remoteWorkDays} days per week work-from-home arrangement

ARTICLE 6 — TERMINATION

6.1 During Probation: ${COMPANY_POLICIES.noticePeriod.duringProbation} written notice by either party.
6.2 Less than 2 years of service: ${COMPANY_POLICIES.noticePeriod.lessThan2Years} written notice by either party.
6.3 2 to 5 years of service: ${COMPANY_POLICIES.noticePeriod.twoToFiveYears} written notice by either party.
6.4 More than 5 years of service: ${COMPANY_POLICIES.noticePeriod.moreThan5Years} written notice by either party.

6.5 The Employer may terminate this Contract immediately for cause, including but not limited to gross misconduct, breach of confidentiality, or criminal conviction.

ARTICLE 7 — GOVERNING LAW

7.1 This Contract shall be governed by and construed in accordance with the laws of Malaysia.

7.2 Any disputes arising out of this Contract shall be referred to arbitration in accordance with the Arbitration Act 2005 of Malaysia.

SIGNATURES

_________________________          _________________________
${c.name}                          Rammya Nair
Employee                           VP HR
                                   Deriv

Date: _______________              Date: _______________`;

            case "equity_grant":
                return `${COMPANY_POLICIES.name}
EQUITY GRANT AGREEMENT

GRANT REFERENCE: EQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}
GRANT DATE: ${startDate}

This Equity Grant Agreement ("Agreement") is entered into between ${COMPANY_POLICIES.name} ("Company") and ${c.name} ("Participant").

1. GRANT OF RESTRICTED STOCK UNITS (RSUs)

1.1 The Company hereby grants the Participant Restricted Stock Units ("RSUs") as part of the employee equity compensation plan, subject to the terms and conditions set forth in this Agreement.

1.2 Grant Details:
• Grant Type: ${o.equity}
• Participant: ${c.name}
• Position: ${c.role}
• Grant Date: ${startDate}

2. VESTING SCHEDULE

2.1 The RSUs shall vest according to the following schedule: ${COMPANY_POLICIES.equity.vestingSchedule}.

2.2 Vesting Timeline:
• Year 1 (Cliff): 25% of the total grant shall vest on the first anniversary of the Grant Date
• Year 2: An additional 25% shall vest, distributed quarterly (6.25% per quarter)
• Year 3: An additional 25% shall vest, distributed quarterly (6.25% per quarter)
• Year 4: The remaining 25% shall vest, distributed quarterly (6.25% per quarter)

2.3 Vesting is contingent upon the Participant's continued employment with the Company on each applicable vesting date.

3. TERMINATION PROVISIONS

3.1 Voluntary Resignation: All unvested RSUs shall be forfeited immediately upon the Participant's last day of employment.

3.2 Termination Without Cause: In the event of termination without cause, the Participant shall receive accelerated vesting of RSUs that would have vested within the following 6-month period.

3.3 Change of Control: In the event of a Change of Control (as defined in the Company's Equity Plan), 100% of unvested RSUs shall immediately vest.

4. SETTLEMENT

4.1 Vested RSUs shall be settled in shares of the Company's common stock within 30 days of each vesting date.

4.2 The Company shall withhold applicable taxes at the time of settlement.

5. RESTRICTIONS

5.1 RSUs are non-transferable and may not be sold, assigned, pledged, or otherwise disposed of prior to vesting.

5.2 The Participant agrees to comply with the Company's insider trading policy and applicable securities laws.

6. GOVERNING LAW

6.1 This Agreement shall be governed by the laws of Malaysia.

ACKNOWLEDGMENT

The Participant acknowledges receiving a copy of the Company's Equity Plan and agrees to be bound by its terms.

_________________________          _________________________
${c.name}                          Rammya Nair
Participant                        VP HR
                                   Deriv

Date: _______________              Date: _______________`;

            case "nda":
                return `${COMPANY_POLICIES.name}
NON-DISCLOSURE AGREEMENT

NDA REFERENCE: NDA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}

This Non-Disclosure Agreement ("Agreement") is entered into on ${today} between:

DISCLOSING PARTY: ${COMPANY_POLICIES.name}, a company incorporated in Malaysia ("Company")
RECEIVING PARTY: ${c.name}, employed as ${c.role} ("Employee")

1. PURPOSE

1.1 The Employee will have access to confidential and proprietary information of the Company in the course of their employment as ${c.role} in the ${c.department} department. This Agreement sets forth the terms under which such information shall be protected.

2. DEFINITION OF CONFIDENTIAL INFORMATION

2.1 "Confidential Information" means all non-public information disclosed by the Company, whether in written, oral, electronic, or visual form, including but not limited to:

a) Trade secrets, algorithms, source code, and technical specifications
b) Business strategies, financial data, and market analyses
c) Customer and partner lists, and related data
d) Product roadmaps, research, and development plans
e) Employee data and human resources information
f) Pricing models, trading strategies, and risk management frameworks
g) Any information marked or identified as "Confidential" or "Proprietary"

2.2 Confidential Information does not include information that:
a) Is or becomes publicly available through no fault of the Employee
b) Was known to the Employee prior to disclosure by the Company
c) Is independently developed by the Employee without use of Confidential Information
d) Is disclosed with the prior written consent of the Company

3. OBLIGATIONS OF THE EMPLOYEE

3.1 The Employee shall:
a) Hold all Confidential Information in strict confidence
b) Not disclose Confidential Information to any third party without prior written consent
c) Use Confidential Information solely for the purpose of performing employment duties
d) Take all reasonable measures to protect the confidentiality of the information
e) Immediately notify the Company of any unauthorized disclosure or breach

3.2 The Employee shall not copy, reproduce, or store Confidential Information on personal devices or third-party services unless explicitly authorized.

4. RETURN OF MATERIALS

4.1 Upon termination of employment or upon request by the Company, the Employee shall promptly return all documents, files, and materials containing Confidential Information and permanently delete all electronic copies.

5. DURATION

5.1 The obligations under this Agreement shall remain in effect during the Employee's employment and for a period of two (2) years following the termination of employment, regardless of the reason for termination.

5.2 Obligations relating to trade secrets shall continue indefinitely or for as long as such information qualifies as a trade secret under applicable law.

6. REMEDIES

6.1 The Employee acknowledges that any breach of this Agreement may cause irreparable harm to the Company and that monetary damages may be inadequate. The Company shall be entitled to seek injunctive relief in addition to any other remedies available at law.

7. GOVERNING LAW

7.1 This Agreement shall be governed by the laws of Malaysia.

SIGNATURES

_________________________          _________________________
${c.name}                          Rammya Nair
Employee                           VP HR
                                   Deriv

Date: _______________              Date: _______________`;

            case "ip_assignment":
                return `${COMPANY_POLICIES.name}
INTELLECTUAL PROPERTY ASSIGNMENT AGREEMENT

IP REFERENCE: IP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}

This Intellectual Property Assignment Agreement ("Agreement") is entered into on ${today} between:

ASSIGNEE: ${COMPANY_POLICIES.name}, a company incorporated in Malaysia ("Company")
ASSIGNOR: ${c.name}, employed as ${c.role} ("Employee")

1. SCOPE AND PURPOSE

1.1 This Agreement governs the ownership of intellectual property created by the Employee during their employment with the Company as ${c.role} in the ${c.department} department.

1.2 Given the Employee's role in ${c.department}, it is anticipated that the Employee will create, develop, or contribute to intellectual property that is integral to the Company's business operations and competitive advantage.

2. ASSIGNMENT OF INTELLECTUAL PROPERTY

2.1 The Employee hereby irrecoverably assigns, transfers, and conveys to the Company all right, title, and interest in and to any and all Intellectual Property ("IP") that:

a) Is created, conceived, developed, or reduced to practice by the Employee during the term of employment
b) Results from tasks assigned to the Employee by the Company
c) Is created using Company resources, data, equipment, or facilities
d) Relates to the Company's current or anticipated business, products, or research

2.2 "Intellectual Property" includes but is not limited to:
a) Software code, algorithms, APIs, and technical architectures
b) Inventions, whether or not patentable
c) Designs, prototypes, and technical drawings
d) Documentation, manuals, and technical specifications
e) Databases, data models, and analytical frameworks
f) Trade secrets and know-how
g) Copyrightable works of authorship

3. PRIOR INVENTIONS

3.1 The Employee shall disclose in Exhibit A any prior inventions, original works of authorship, or trade secrets that are owned by the Employee prior to the commencement of employment and which the Employee wishes to exclude from this Agreement.

3.2 If no Exhibit A is attached, the Employee represents that no such prior inventions exist.

4. MORAL RIGHTS

4.1 To the extent permitted by applicable law, the Employee waives all moral rights in any IP assigned under this Agreement.

5. COOPERATION

5.1 The Employee agrees to cooperate with the Company in obtaining and enforcing IP rights, including executing patent applications, copyright registrations, and other documents as reasonably requested.

5.2 This obligation survives termination of employment.

6. NO LICENSE

6.1 Nothing in this Agreement grants the Employee any license or right to use the Company's IP outside the scope of their employment duties.

7. THIRD-PARTY SOFTWARE

7.1 The Employee shall not incorporate any third-party or open-source software into Company projects without prior written approval from the VP of ${c.department}.

8. GOVERNING LAW

8.1 This Agreement shall be governed by the laws of Malaysia.

SIGNATURES

_________________________          _________________________
${c.name}                          Rammya Nair
Employee                           VP HR
                                   Deriv

Date: _______________              Date: _______________

EXHIBIT A — PRIOR INVENTIONS

List any prior inventions, works, or trade secrets to be excluded (if none, write "None"):

_________________________________________________________________

_________________________________________________________________`;

            default:
                return "";
        }
    }

    /* ── Generate a single document ── */
    async function generateDocument(docType: DocType) {
        if (!candidate || !offer) return;
        setGenerating(prev => ({ ...prev, [docType]: true }));

        // Generate document directly from template (no AI dependency)
        const content = getFallbackTemplate(docType);
        setDocuments(prev => ({ ...prev, [docType]: content }));
        setGenerating(prev => ({ ...prev, [docType]: false }));
    }

    /* ── Generate all documents on load ── */
    useEffect(() => {
        if (candidate && offer && approved) {
            const applicableDocs = DOCUMENT_DEFS.filter(
                d => !d.roleSpecific || d.roleSpecific === candidate.department
            );
            applicableDocs.forEach(d => {
                if (!documents[d.id] && !generating[d.id]) {
                    generateDocument(d.id);
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [candidate, offer, approved]);

    /* ── Download a single document as DOCX ── */
    async function handleDownloadDocx(docType: DocType) {
        const content = documents[docType];
        if (!content || !candidate) return;

        const docDef = DOCUMENT_DEFS.find(d => d.id === docType);
        const docTitle = docDef?.title || "Document";

        try {
            const res = await fetch("/api/generate-docx", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    candidateName: candidate.name,
                    role: candidate.role,
                    content,
                    documentType: docTitle,
                }),
            });
            if (!res.ok) throw new Error("Failed to generate DOCX");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${docTitle.replace(/\s+/g, "_")}_${candidate.name.replace(/\s+/g, "_")}.docx`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("DOCX generation failed, falling back to .txt:", err);
            const blob = new Blob([content], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${docTitle.replace(/\s+/g, "_")}_${candidate.name.replace(/\s+/g, "_")}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    /* ── Download all documents ── */
    async function handleDownloadAll() {
        const applicableDocs = DOCUMENT_DEFS.filter(
            d => !d.roleSpecific || (candidate && d.roleSpecific === candidate.department)
        );
        for (const doc of applicableDocs) {
            if (documents[doc.id]) {
                await handleDownloadDocx(doc.id);
                await new Promise(r => setTimeout(r, 500)); // small delay between downloads
            }
        }
        setDownloaded(true);
    }

    /* ── Print / Save PDF for active document ── */
    function handleSavePDF() {
        const content = documents[activeDoc];
        if (!content || !candidate) return;
        const docDef = DOCUMENT_DEFS.find(d => d.id === activeDoc);

        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        printWindow.document.write(`<!DOCTYPE html>
<html><head><title>${docDef?.title || "Document"} — ${candidate.name}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Inter:wght@400;600;700&display=swap');
body { font-family: 'Merriweather', Georgia, serif; margin: 0; padding: 0; color: #1a1a1a; line-height: 1.8; font-size: 12px; }
.letterhead { padding: 40px 60px 20px; border-bottom: 3px solid #ff444f; display: flex; align-items: center; justify-content: space-between; }
.letterhead img { height: 40px; }
.letterhead-info { text-align: right; font-family: 'Inter', sans-serif; font-size: 9px; color: #64748b; line-height: 1.5; }
.doc-body { padding: 30px 60px 40px; }
.doc-body pre { white-space: pre-wrap; font-family: 'Merriweather', Georgia, serif; font-size: 12px; line-height: 1.8; margin: 0; }
.footer { padding: 20px 60px; border-top: 1px solid #e2e8f0; font-family: 'Inter', sans-serif; font-size: 8px; color: #94a3b8; text-align: center; }
@media print { .footer { position: fixed; bottom: 0; width: 100%; } }
</style></head>
<body>
<div class="letterhead">
  <img src="/deriv-logo.png" alt="Deriv" />
  <div class="letterhead-info">Deriv Group<br/>Level 15, Deriv Tower, Cyberjaya<br/>63000 Selangor, Malaysia<br/>www.deriv.com</div>
</div>
<div class="doc-body"><pre>${content}</pre></div>
<div class="footer">CONFIDENTIAL — ${docDef?.title || "Document"} — ${candidate.name} — Page 1 of 1</div>
<script>window.onload = function() { window.print(); }<\/script>
</body></html>`);
        printWindow.document.close();
    }

    /* ── Is a doc applicable to this candidate? ── */
    function isApplicable(def: DocumentDef): boolean {
        if (!def.roleSpecific) return true;
        return candidate?.department === def.roleSpecific;
    }

    /* ── Get status of a document ── */
    function getDocStatus(docType: DocType): "generated" | "generating" | "not_applicable" | "pending" {
        const def = DOCUMENT_DEFS.find(d => d.id === docType);
        if (def && !isApplicable(def)) return "not_applicable";
        if (generating[docType]) return "generating";
        if (documents[docType]) return "generated";
        return "pending";
    }

    const generatedCount = DOCUMENT_DEFS.filter(d => isApplicable(d) && documents[d.id]).length;
    const totalApplicable = DOCUMENT_DEFS.filter(d => isApplicable(d)).length;

    return (
        <>
            <div className="hi-header">
                <div className="hi-breadcrumb">
                    <Link href="/dashboard">Dashboard</Link>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                    <Link href="/hiring">Hiring Intelligence</Link>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                    <span>Document Suite</span>
                </div>
                <h1 className="pg-title">AI Document Suite</h1>
                <p className="pg-subtitle">Generate, preview, and download all hiring documents in one place</p>
            </div>

            <HiringSteps active={4} />

            {!candidate && (
                <div className="hi-loading">
                    <p>No candidate data found. <Link href="/hiring/feedback" style={{ color: "var(--accent)" }}>Start from Candidate Review →</Link></p>
                </div>
            )}

            {candidate && offer && (
                <>
                    {/* Progress Bar */}
                    <div style={{
                        display: "flex", alignItems: "center", gap: 12, marginBottom: 24,
                        padding: "14px 20px", borderRadius: "var(--radius)", background: "var(--bg-card)",
                        border: "1px solid var(--border)"
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                                    Generating documents for {candidate.name}
                                </span>
                                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                    {generatedCount}/{totalApplicable} complete
                                </span>
                            </div>
                            <div style={{ height: 6, borderRadius: 3, background: "var(--surface-2)", overflow: "hidden" }}>
                                <div style={{
                                    height: "100%", borderRadius: 3, background: "var(--gradient)",
                                    width: `${(generatedCount / totalApplicable) * 100}%`,
                                    transition: "width 0.5s ease"
                                }} />
                            </div>
                        </div>
                    </div>

                    {/* Document Cards Grid */}
                    <div className="hi-doc-suite-grid">
                        {DOCUMENT_DEFS.map((def) => {
                            const status = getDocStatus(def.id);
                            const applicable = isApplicable(def);
                            return (
                                <div
                                    key={def.id}
                                    className={`hi-doc-card${activeDoc === def.id ? " active" : ""}${!applicable ? " not-applicable" : ""}`}
                                    onClick={() => applicable && setActiveDoc(def.id)}
                                    style={{ cursor: applicable ? "pointer" : "default", opacity: applicable ? 1 : 0.45 }}
                                >
                                    <div className="hi-doc-card-icon" style={{ background: def.gradient }}>
                                        {def.icon}
                                    </div>
                                    <div className="hi-doc-card-content">
                                        <h4>{def.shortTitle}</h4>
                                        <p>{def.description}</p>
                                    </div>
                                    <div className="hi-doc-card-status">
                                        {status === "generated" && (
                                            <span className="hi-doc-status generated">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                                                Ready
                                            </span>
                                        )}
                                        {status === "generating" && (
                                            <span className="hi-doc-status generating">
                                                <span className="hi-loading-spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                                                Generating
                                            </span>
                                        )}
                                        {status === "not_applicable" && (
                                            <span className="hi-doc-status na">N/A</span>
                                        )}
                                        {status === "pending" && (
                                            <span className="hi-doc-status pending">Pending</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Download Actions */}
                    <div className="hi-download-row">
                        <button className="hi-btn-primary" onClick={handleDownloadAll} disabled={generatedCount === 0}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                            Download All ({generatedCount} Documents)
                        </button>
                        {documents[activeDoc] && (
                            <>
                                <button className="hi-download-btn" onClick={() => handleDownloadDocx(activeDoc)}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                    Download .docx
                                </button>
                                <button className="hi-download-btn" onClick={handleSavePDF}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2h9l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" /><path d="M14 2v6h6" /><path d="M9 15h6" /><path d="M9 11h6" /></svg>
                                    Save PDF
                                </button>
                            </>
                        )}
                    </div>

                    {/* Document Preview */}
                    {generating[activeDoc] && (
                        <div className="hi-loading">
                            <div className="hi-loading-spinner" />
                            <h3>Generating {DOCUMENT_DEFS.find(d => d.id === activeDoc)?.title}...</h3>
                            <p>Creating personalized document with approved terms</p>
                        </div>
                    )}

                    {documents[activeDoc] && !generating[activeDoc] && (
                        <div className="hi-contract-preview" style={{ padding: 0 }}>
                            {/* Official Letterhead */}
                            <div style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "24px 32px 16px", borderBottom: "3px solid #ff444f",
                                background: "linear-gradient(180deg, #fff 0%, #fafbfc 100%)"
                            }}>
                                <img src="/deriv-logo.png" alt="Deriv" style={{ height: 36 }} />
                                <div style={{ textAlign: "right", fontFamily: "'Inter', sans-serif", fontSize: 9, color: "#64748b", lineHeight: 1.5 }}>
                                    <div style={{ fontWeight: 700, color: "#1e293b", fontSize: 10, marginBottom: 2 }}>Deriv Group</div>
                                    Level 15, Deriv Tower, Cyberjaya<br />
                                    63000 Selangor, Malaysia<br />
                                    <span style={{ color: "#ff444f" }}>www.deriv.com</span>
                                </div>
                            </div>

                            {/* Document Title Bar */}
                            <div style={{
                                padding: "12px 32px", background: "#f8fafc",
                                borderBottom: "1px solid #e2e8f0",
                                display: "flex", justifyContent: "space-between", alignItems: "center"
                            }}>
                                <div>
                                    <strong style={{ fontSize: 13, color: "#0f172a", letterSpacing: 0.5, textTransform: "uppercase" }}>
                                        {DOCUMENT_DEFS.find(d => d.id === activeDoc)?.title}
                                    </strong>
                                    <p style={{ fontSize: 10, color: "#94a3b8", margin: "2px 0 0" }}>
                                        Prepared for: {candidate.name} — {candidate.role}, {candidate.department}
                                    </p>
                                </div>
                                <span style={{ fontSize: 9, color: "#94a3b8", fontFamily: "monospace" }}>
                                    REF: DG-{new Date().getFullYear()}-{String(Math.floor(Math.random() * 9000) + 1000)}
                                </span>
                            </div>

                            {/* Document Body */}
                            <div style={{ padding: "24px 32px 32px" }}>
                                <pre style={{
                                    whiteSpace: "pre-wrap",
                                    fontFamily: "'Georgia', 'Merriweather', serif",
                                    fontSize: 12.5,
                                    lineHeight: 1.85,
                                    margin: 0,
                                    color: "#1e293b",
                                }}>
                                    {documents[activeDoc]}
                                </pre>
                            </div>

                            {/* Footer */}
                            <div style={{
                                padding: "10px 32px", borderTop: "1px solid #e2e8f0",
                                display: "flex", justifyContent: "space-between",
                                fontSize: 8, color: "#94a3b8", fontFamily: "'Inter', sans-serif"
                            }}>
                                <span>CONFIDENTIAL — For intended recipient only</span>
                                <span>Deriv Group — Human Resources Division</span>
                            </div>
                        </div>
                    )}

                    {!documents[activeDoc] && !generating[activeDoc] && isApplicable(DOCUMENT_DEFS.find(d => d.id === activeDoc)!) && (
                        <div className="hi-loading">
                            <p>Document is queued for generation.</p>
                            <button className="hi-btn-primary" onClick={() => generateDocument(activeDoc)}>
                                Generate Now
                            </button>
                        </div>
                    )}

                    {/* Pipeline Complete */}
                    {downloaded && (
                        <div className="hi-success">
                            <div className="hi-success-icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                            <h2>Hiring Pipeline Complete! 🎉</h2>
                            <p>All documents for <strong>{candidate.name}</strong> have been generated and downloaded. The hiring pipeline is complete.</p>
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
