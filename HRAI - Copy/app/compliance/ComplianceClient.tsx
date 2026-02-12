"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

/* ── Alert data ── */
interface Alert {
  id: string;
  severity: string;
  title: string;
  sub: string;
  tags: string[];
  badge: string;
  time: string;
}

const alerts: Alert[] = [
  { id: "1", severity: "critical", title: "Work Permit Expiry — Ahmad R.", sub: "Expires in 14 days · Malaysia", tags: ["Immigration", "APAC"], badge: "Critical", time: "2 hrs ago" },
  { id: "2", severity: "warning", title: "Safety Training Incomplete — EU Team", sub: "3 of 12 employees pending · Due Feb 20", tags: ["Training", "EU"], badge: "Warning", time: "1 day ago" },
  { id: "3", severity: "warning", title: "Anti-Bribery Policy — New Hires", sub: "2 employees awaiting acknowledgment", tags: ["Policy", "Global"], badge: "Warning", time: "2 days ago" },
  { id: "4", severity: "ok", title: "Data Privacy Certification — All Staff", sub: "100% complete · Valid until Dec 2026", tags: ["GDPR", "Global"], badge: "Compliant", time: "Verified" },
  { id: "5", severity: "ok", title: "Labour Law Updates — APAC Region", sub: "All contracts updated · Verified Jan 2026", tags: ["Labour Law", "APAC"], badge: "Compliant", time: "Verified" },
  { id: "6", severity: "ok", title: "Equal Opportunity Policy — Americas", sub: "Annual review complete · All jurisdictions", tags: ["EEO", "Americas"], badge: "Compliant", time: "Verified" },
];

const regions = [
  { emoji: "\u{1F30F}", name: "APAC", score: "96%", cls: "ok", w: "96%", rc: "var(--success)", detail: "92 employees · 4 jurisdictions" },
  { emoji: "\u{1F30D}", name: "Europe", score: "87%", cls: "warn", w: "87%", rc: "var(--warning)", detail: "78 employees · 6 jurisdictions" },
  { emoji: "\u{1F30E}", name: "Americas", score: "98%", cls: "ok", w: "98%", rc: "var(--success)", detail: "55 employees · 3 jurisdictions" },
  { emoji: "\u{1F30D}", name: "Middle East", score: "100%", cls: "ok", w: "100%", rc: "var(--success)", detail: "22 employees · 2 jurisdictions" },
];

const trainings = [
  { name: "Data Privacy 2026", pct: "99%", cls: "ok", w: "99%", tc: "var(--success)", meta: "148 of 150 employees completed" },
  { name: "Workplace Safety", pct: "75%", cls: "warn", w: "75%", tc: "var(--warning)", meta: "9 of 12 EU team completed" },
  { name: "Anti-Harassment", pct: "100%", cls: "ok", w: "100%", tc: "var(--success)", meta: "All 247 employees completed" },
  { name: "Security Awareness", pct: "92%", cls: "ok", w: "92%", tc: "var(--success)", meta: "227 of 247 employees completed" },
];

const audits = [
  { day: "20", month: "Feb", color: "purple", title: "Safety Compliance — EU", sub: "Annual workplace safety audit" },
  { day: "01", month: "Mar", color: "cyan", title: "PDPA Review — APAC", sub: "Data protection assessment" },
  { day: "15", month: "Mar", color: "amber", title: "SOX Compliance — Americas", sub: "Financial controls review" },
];

const visaMarkers = [
  { cls: "past", label: "Permit Issued", date: "Mar 15, 2024" },
  { cls: "past", label: "1-Year Review", date: "Mar 15, 2025" },
  { cls: "now", label: "Today", date: "Feb 9, 2026" },
  { cls: "deadline", label: "Permit Expires", date: "Feb 23, 2026" },
  { cls: "future", label: "Renewal Due", date: "Submit by Feb 13" },
];

export default function ComplianceClient() {
  const [alertFilter, setAlertFilter] = useState("all");
  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const [activeAudit, setActiveAudit] = useState<string | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [ringVal, setRingVal] = useState(0);
  const [ringOffset, setRingOffset] = useState(427.26);
  const [miniCounters, setMiniCounters] = useState([0, 0, 0]);
  const cvtFillRef = useRef<HTMLDivElement>(null);

  // Score ring animation
  useEffect(() => {
    const circumference = 427.26;
    const targetScore = 94;
    const targetOffset = circumference * (1 - targetScore / 100);
    const duration = 1800;
    const start = performance.now();
    let raf: number;

    const timer = setTimeout(() => {
      function update(now: number) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setRingOffset(circumference - (circumference - targetOffset) * eased);
        setRingVal(Math.round(targetScore * eased));
        if (progress < 1) raf = requestAnimationFrame(update);
      }
      raf = requestAnimationFrame(update);
    }, 300);

    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, []);

  // Mini stat counters
  useEffect(() => {
    const targets = [18, 3, 1];
    const duration = 1000;
    const start = performance.now();
    let raf: number;

    const timer = setTimeout(() => {
      function tick(now: number) {
        const p = Math.min((now - start) / duration, 1);
        const e = 1 - Math.pow(1 - p, 3);
        setMiniCounters(targets.map((t) => Math.round(t * e)));
        if (p < 1) raf = requestAnimationFrame(tick);
      }
      raf = requestAnimationFrame(tick);
    }, 400);

    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, []);

  // Visa timeline fill animation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (cvtFillRef.current) cvtFillRef.current.style.width = "75%";
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredAlerts = alertFilter === "all" ? alerts : alerts.filter((a) => a.severity === alertFilter);

  return (
    <>
      {/* Page Header */}
      <div className="cmp-page-header">
        <div>
          <h1 className="pg-title">Compliance</h1>
          <p className="pg-subtitle">Real-time monitoring across all jurisdictions</p>
        </div>
        <div className="cmp-header-actions">
          <button className="btn-outline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Export Report
          </button>
          <button className="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            Run Audit
          </button>
        </div>
      </div>

      {/* AI Predictive Alert Banner */}
      {!bannerDismissed && (
        <div className="cmp-predict-banner">
          <div className="cmp-predict-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
          </div>
          <div className="cmp-predict-body">
            <div className="cmp-predict-tag">AI Prediction</div>
            <strong>Based on Q3 hiring targets, you will run out of visa quota in 45 days.</strong>
            <p>Current quota: <strong>10 of 12 slots used</strong>. With 8 planned international hires, you need <strong>6 additional visa slots</strong>. Apply for 5 more slots now to avoid bottlenecks.</p>
          </div>
          <button className="cmp-predict-action">Apply Now</button>
          <button className="cmp-predict-close" title="Dismiss" onClick={() => setBannerDismissed(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      )}

      {/* Visa Expiry Timeline */}
      <div className="cmp-timeline-card card">
        <div className="card-header">
          <h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            Visa Expiry Timeline — Sarah Kim
          </h3>
          <span className="cmp-tl-badge critical">14 days left</span>
        </div>
        <div className="cmp-visa-timeline">
          <div className="cvt-track">
            <div className="cvt-fill" ref={cvtFillRef}></div>
          </div>
          <div className="cvt-markers">
            {visaMarkers.map((m) => (
              <div key={m.label} className={`cvt-marker ${m.cls}`}>
                <div className="cvt-dot"></div>
                <div className="cvt-label">
                  <strong>{m.label}</strong>
                  <span>{m.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="cvt-actions">
          <Link href="/contract-generator" className="btn-primary-sm">Generate Renewal Contract</Link>
          <button className="btn-ghost-sm">View Full History</button>
        </div>
      </div>

      {/* Score Overview Row */}
      <div className="cmp-overview">
        {/* Main Score Ring */}
        <div className="card cmp-score-card">
          <div className="cmp-ring-container">
            <svg className="cmp-ring" viewBox="0 0 160 160">
              <defs>
                <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <filter id="ring-glow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <circle cx="80" cy="80" r="68" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
              <circle cx="80" cy="80" r="68" fill="none" stroke="url(#ring-grad)" strokeWidth="10" strokeLinecap="round"
                strokeDasharray="427.26" strokeDashoffset={ringOffset} transform="rotate(-90 80 80)"
                filter="url(#ring-glow)" />
            </svg>
            <div className="cmp-ring-center">
              <span className="cmp-ring-val">{ringVal}</span>
              <span className="cmp-ring-unit">%</span>
              <span className="cmp-ring-label">Compliance Score</span>
            </div>
          </div>
          <div className="cmp-score-meta">
            <div className="csm-item up">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15" /></svg>
              +2% from last month
            </div>
            <div className="csm-divider"></div>
            <span className="csm-label">Last audited: Jan 28, 2026</span>
          </div>
        </div>

        {/* Mini Stat Cards */}
        <div className="cmp-mini-grid">
          <div className="cmp-mini ok">
            <div className="cmp-mini-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <div className="cmp-mini-data">
              <span className="cmp-mini-val">{miniCounters[0]}</span>
              <span className="cmp-mini-label">Policies Compliant</span>
            </div>
            <div className="cmp-mini-bar"><div className="cmp-mini-fill" style={{ "--w": "90%", "--mc": "var(--success)" } as React.CSSProperties}></div></div>
          </div>
          <div className="cmp-mini warn">
            <div className="cmp-mini-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            </div>
            <div className="cmp-mini-data">
              <span className="cmp-mini-val">{miniCounters[1]}</span>
              <span className="cmp-mini-label">Pending Review</span>
            </div>
            <div className="cmp-mini-bar"><div className="cmp-mini-fill" style={{ "--w": "15%", "--mc": "var(--warning)" } as React.CSSProperties}></div></div>
          </div>
          <div className="cmp-mini danger">
            <div className="cmp-mini-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            </div>
            <div className="cmp-mini-data">
              <span className="cmp-mini-val">{miniCounters[2]}</span>
              <span className="cmp-mini-label">Critical Alert</span>
            </div>
            <div className="cmp-mini-pulse"></div>
          </div>
          <div className="cmp-mini info">
            <div className="cmp-mini-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
            </div>
            <div className="cmp-mini-data">
              <span className="cmp-mini-val">Feb 20</span>
              <span className="cmp-mini-label">Next Audit Date</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column: Alerts + Region/Training/Audits */}
      <div className="cmp-body-grid">
        {/* Alerts Panel */}
        <div className="card">
          <div className="card-header">
            <h3>Compliance Alerts</h3>
            <div className="cmp-alert-tabs">
              {[
                { key: "all", label: "All" },
                { key: "critical", label: "Critical" },
                { key: "warning", label: "Warning" },
                { key: "ok", label: "Compliant" },
              ].map((t) => (
                <button key={t.key} className={`cat${alertFilter === t.key ? " active" : ""}`} onClick={() => setAlertFilter(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="cmp-alert-list">
            {filteredAlerts.map((a) => (
              <div
                key={a.id}
                className={`cmp-alert ${a.severity}${activeAlert === a.id ? " active" : ""}`}
                onClick={() => setActiveAlert(activeAlert === a.id ? null : a.id)}
              >
                <div className="cmp-alert-left">
                  <div className="cmp-alert-indicator"></div>
                  <div className="cmp-alert-body">
                    <strong>{a.title}</strong>
                    <span>{a.sub}</span>
                    <div className="cmp-alert-tags">
                      {a.tags.map((tag) => (
                        <span key={tag} className="ca-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="cmp-alert-right">
                  <span className={`cmp-alert-badge ${a.severity}`}>{a.badge}</span>
                  <span className="cmp-alert-time">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="cmp-right-col">
          {/* Regional Compliance */}
          <div className="card">
            <div className="card-header"><h3>Regional Compliance</h3></div>
            <div className="cmp-region-list">
              {regions.map((r) => (
                <div key={r.name} className="cmp-region">
                  <div className="cmp-reg-header">
                    <span className="cmp-reg-name">{r.emoji} {r.name}</span>
                    <span className={`cmp-reg-score ${r.cls}`}>{r.score}</span>
                  </div>
                  <div className="cmp-reg-bar"><div className="cmp-reg-fill" style={{ "--w": r.w, "--rc": r.rc } as React.CSSProperties}></div></div>
                  <span className="cmp-reg-detail">{r.detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Training Completion */}
          <div className="card">
            <div className="card-header"><h3>Training Completion</h3></div>
            <div className="cmp-training-list">
              {trainings.map((t) => (
                <div key={t.name} className="cmp-train">
                  <div className="cmp-train-header">
                    <strong>{t.name}</strong>
                    <span className={`cmp-train-pct ${t.cls}`}>{t.pct}</span>
                  </div>
                  <div className="cmp-train-bar"><div className="cmp-train-fill" style={{ "--w": t.w, "--tc": t.tc } as React.CSSProperties}></div></div>
                  <span className="cmp-train-meta">{t.meta}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Audits */}
          <div className="card">
            <div className="card-header"><h3>Upcoming Audits</h3></div>
            <div className="cmp-audit-list">
              {audits.map((a) => (
                <div
                  key={a.title}
                  className={`cmp-audit${activeAudit === a.title ? " active" : ""}`}
                  onClick={() => setActiveAudit(activeAudit === a.title ? null : a.title)}
                >
                  <div className={`cmp-audit-date ${a.color}`}><span>{a.day}</span>{a.month}</div>
                  <div className="cmp-audit-body">
                    <strong>{a.title}</strong>
                    <span>{a.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
