"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_CANDIDATES, type CandidateProfile } from "@/app/lib/mock-candidates";

export default function HiringLandingClient() {
    const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);

    const gradients = [
        "linear-gradient(135deg, #6366f1, #a78bfa)",
        "linear-gradient(135deg, #10b981, #34d399)",
        "linear-gradient(135deg, #f59e0b, #fbbf24)",
    ];

    const statusColors: Record<string, string> = {
        "Interview Complete": "#10b981",
        Shortlisted: "#6366f1",
    };

    function handleStartPipeline(c: CandidateProfile) {
        // Pre-load the candidate data into localStorage so feedback page picks it up
        localStorage.setItem("hiring-selected-candidate", JSON.stringify(c));
        // Clear any previous pipeline data
        localStorage.removeItem("hiring-feedback-data");
        localStorage.removeItem("hiring-compensation-data");
        localStorage.removeItem("hiring-approval-status");
        window.location.href = "/hiring/feedback";
    }

    return (
        <>
            <div className="hi-header">
                <div className="hi-breadcrumb">
                    <Link href="/dashboard">Dashboard</Link>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                    <span>Hiring Intelligence</span>
                </div>
                <h1 className="pg-title">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: -5, marginRight: 8 }}>
                        <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
                    </svg>
                    Hiring Intelligence
                </h1>
                <p className="pg-subtitle">AI-powered end-to-end hiring pipeline — select a shortlisted candidate to begin</p>
            </div>

            {/* Pipeline Overview */}
            <div className="hi-pipeline-overview">
                <div className="hi-pipeline-stat">
                    <span className="hi-pipeline-num">{MOCK_CANDIDATES.length}</span>
                    <span className="hi-pipeline-label">Shortlisted</span>
                </div>
                <div className="hi-pipeline-divider" />
                <div className="hi-pipeline-stat">
                    <span className="hi-pipeline-num">4</span>
                    <span className="hi-pipeline-label">AI Steps</span>
                </div>
                <div className="hi-pipeline-divider" />
                <div className="hi-pipeline-stat">
                    <span className="hi-pipeline-num" style={{ fontSize: 18 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                    </span>
                    <span className="hi-pipeline-label">Powered by Llama</span>
                </div>
            </div>

            {/* Candidate Cards Grid */}
            <div className="hi-landing-grid">
                {MOCK_CANDIDATES.map((c, i) => (
                    <div
                        key={c.id}
                        className={`hi-landing-card${selectedCandidate?.id === c.id ? " expanded" : ""}`}
                        onClick={() => setSelectedCandidate(selectedCandidate?.id === c.id ? null : c)}
                    >
                        {/* Card Header */}
                        <div className="hi-landing-card-header">
                            <div className="hi-candidate-avatar" style={{ background: gradients[i], width: 56, height: 56, fontSize: 18 }}>
                                {c.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div className="hi-landing-card-title">
                                <h3>{c.name}</h3>
                                <span className="hi-landing-role">{c.role}</span>
                            </div>
                            <span
                                className="hi-landing-status"
                                style={{ background: `${statusColors[c.status] || "#6366f1"}18`, color: statusColors[c.status] || "#6366f1" }}
                            >
                                {c.status}
                            </span>
                        </div>

                        {/* Quick Stats Row */}
                        <div className="hi-landing-stats">
                            <div className="hi-landing-stat-item">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 3h-8v4h8V3z" /></svg>
                                {c.experience} years
                            </div>
                            <div className="hi-landing-stat-item">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                {c.location}
                            </div>
                            <div className="hi-landing-stat-item">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                                {c.department}
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {selectedCandidate?.id === c.id && (
                            <div className="hi-landing-expanded">
                                <div className="hi-landing-detail-section">
                                    <h4>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                        Resume Review
                                    </h4>
                                    <p>{c.resumeReview.slice(0, 200)}...</p>
                                </div>
                                <div className="hi-landing-detail-section">
                                    <h4>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.908.339 1.85.574 2.81.7A2 2 0 0122 16.92z" /></svg>
                                        Telephonic Interview
                                    </h4>
                                    <p>{c.telephonicInterview.slice(0, 200)}...</p>
                                </div>
                                <div className="hi-landing-detail-section">
                                    <h4>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
                                        Cultural Fit
                                    </h4>
                                    <p>{c.culturalFit.slice(0, 200)}...</p>
                                </div>
                                <div className="hi-landing-detail-section">
                                    <h4>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                                        Reference Check
                                    </h4>
                                    <p>{c.referenceCheck.slice(0, 200)}...</p>
                                </div>

                                <button className="hi-btn-primary hi-start-pipeline-btn" onClick={(e) => { e.stopPropagation(); handleStartPipeline(c); }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                                    Start AI Hiring Pipeline
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Info Cards */}
            <div className="hi-info-row">
                <div className="hi-info-card">
                    <div className="hi-info-icon" style={{ background: "rgba(99,102,241,0.12)" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /></svg>
                    </div>
                    <h4>Step 1 — Candidate Review</h4>
                    <p>AI analyzes interview feedback across all rounds and generates a bias-checked scorecard</p>
                </div>
                <div className="hi-info-card">
                    <div className="hi-info-icon" style={{ background: "rgba(16,185,129,0.12)" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                    </div>
                    <h4>Step 2 — Compensation</h4>
                    <p>Market-benchmarked salary proposals with 3 scenarios and acceptance probability</p>
                </div>
                <div className="hi-info-card">
                    <div className="hi-info-icon" style={{ background: "rgba(245,158,11,0.12)" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    </div>
                    <h4>Step 3 — CEO Approval</h4>
                    <p>Auto-generated executive brief with risk assessment and hiring recommendation</p>
                </div>
                <div className="hi-info-card">
                    <div className="hi-info-icon" style={{ background: "rgba(239,68,68,0.12)" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                    </div>
                    <h4>Step 4 — Offer Letter</h4>
                    <p>AI-crafted personalized offer letter with .docx export and PDF download</p>
                </div>
            </div>
        </>
    );
}
