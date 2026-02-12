"use client";

import { useState, useEffect } from "react";

/* ── Data ── */
const hbars = [
  { label: "Engineering", w: "82%", hc: "#a78bfa", val: "82" },
  { label: "Product", w: "45%", hc: "#06b6d4", val: "45" },
  { label: "Operations", w: "38%", hc: "#f59e0b", val: "38" },
  { label: "Design", w: "32%", hc: "#ec4899", val: "32" },
  { label: "HR & Legal", w: "28%", hc: "#10b981", val: "28" },
  { label: "Finance", w: "22%", hc: "#64748b", val: "22" },
];

const vbars = [
  { label: "Mar", h: "35%" }, { label: "Apr", h: "52%" }, { label: "May", h: "40%" },
  { label: "Jun", h: "28%" }, { label: "Jul", h: "60%" }, { label: "Aug", h: "75%" },
  { label: "Sep", h: "50%" }, { label: "Oct", h: "45%" }, { label: "Nov", h: "68%" },
  { label: "Dec", h: "55%" }, { label: "Jan", h: "82%" }, { label: "Feb", h: "90%" },
];

const geos = [
  { flag: "\u{1F30F}", name: "APAC", countries: "MY, SG, VN, TW, IN", w: "37%", gc: "#a78bfa", pct: "37%", count: "92" },
  { flag: "\u{1F30D}", name: "Europe", countries: "UK, DE, PT, IE, FR, NL", w: "32%", gc: "#06b6d4", pct: "32%", count: "78" },
  { flag: "\u{1F30E}", name: "Americas", countries: "US, CA, BR", w: "22%", gc: "#f59e0b", pct: "22%", count: "55" },
  { flag: "\u{1F30D}", name: "Middle East", countries: "AE, SA", w: "9%", gc: "#10b981", pct: "9%", count: "22" },
];

const performers = [
  { rank: 1, initials: "AC", bg: "linear-gradient(135deg,#6366f1,#a78bfa)", name: "Alex Chen", dept: "Engineering", w: "98%", pc: "#a78bfa", score: "98%" },
  { rank: 2, initials: "SK", bg: "linear-gradient(135deg,#ec4899,#f472b6)", name: "Sarah Kim", dept: "Design", w: "96%", pc: "#ec4899", score: "96%" },
  { rank: 3, initials: "RH", bg: "linear-gradient(135deg,#f97316,#fb923c)", name: "Rachel Huang", dept: "Operations", w: "94%", pc: "#f97316", score: "94%" },
  { rank: 4, initials: "AP", bg: "linear-gradient(135deg,#8b5cf6,#c4b5fd)", name: "Aisha Patel", dept: "HR & Legal", w: "91%", pc: "#8b5cf6", score: "91%" },
  { rank: 5, initials: "MS", bg: "linear-gradient(135deg,#10b981,#34d399)", name: "Maria Santos", dept: "HR & Legal", w: "89%", pc: "#10b981", score: "89%" },
];

const funnel = [
  { num: 342, label: "Applications", fw: "100%", fc: "#a78bfa" },
  { num: 198, label: "Screened", fw: "58%", fc: "#06b6d4" },
  { num: 89, label: "Interviewed", fw: "26%", fc: "#f59e0b" },
  { num: 41, label: "Final Round", fw: "12%", fc: "#ec4899" },
  { num: 18, label: "Offers Sent", fw: "5%", fc: "#10b981" },
  { num: 12, label: "Accepted", fw: "3.5%", fc: "var(--success)" },
];

export default function AnalyticsClient() {
  const [activePeriod, setActivePeriod] = useState("quarter");
  const [activeVbar, setActiveVbar] = useState("Feb");
  const [activeGeo, setActiveGeo] = useState<string | null>(null);
  const [activePerf, setActivePerf] = useState<string | null>(null);

  // KPI counter (only headcount is animated)
  const [headcount, setHeadcount] = useState(0);

  // Gauge animation
  const [gaugeOffset, setGaugeOffset] = useState(251.33);
  const [gaugeVal, setGaugeVal] = useState("0");

  useEffect(() => {
    // Headcount counter
    const target = 247;
    const dur = 1200;
    const start = performance.now();
    let raf: number;
    const timer = setTimeout(() => {
      function tick(now: number) {
        const p = Math.min((now - start) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        setHeadcount(Math.round(target * e));
        if (p < 1) raf = requestAnimationFrame(tick);
      }
      raf = requestAnimationFrame(tick);
    }, 300);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, []);

  // Retention gauge animation
  useEffect(() => {
    const circumference = 251.33;
    const targetRetention = 95.2;
    const targetOffset = circumference * (1 - targetRetention / 100);
    const duration = 1800;
    const start = performance.now();
    let raf: number;
    const timer = setTimeout(() => {
      function update(now: number) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setGaugeOffset(circumference - (circumference - targetOffset) * eased);
        setGaugeVal((targetRetention * eased).toFixed(1));
        if (progress < 1) raf = requestAnimationFrame(update);
      }
      raf = requestAnimationFrame(update);
    }, 500);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      {/* Page Header */}
      <div className="an-page-header">
        <div>
          <h1 className="pg-title">Analytics</h1>
          <p className="pg-subtitle">Workforce insights and operational metrics</p>
        </div>
        <div className="an-header-actions">
          <div className="an-period-tabs">
            {["Month", "Quarter", "Year"].map((p) => (
              <button key={p} className={`apt${activePeriod === p.toLowerCase() ? " active" : ""}`} onClick={() => setActivePeriod(p.toLowerCase())}>{p}</button>
            ))}
          </div>
          <button className="btn-outline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Export
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="an-kpi-row">
        {[
          { label: "Total Headcount", badgeCls: "up", badge: "+12", val: <>{headcount}</>, spark: "sg1", sparkColor: "#a78bfa", sparkPath: "M0,28 Q10,26 20,22 T40,18 T60,12 T80,8 T100,4 V32 H0 Z", sparkLine: "0,28 20,22 40,18 60,12 80,8 100,4" },
          { label: "Avg. Tenure", badgeCls: "up", badge: "+0.3y", val: <>2.4<small>yrs</small></>, spark: "sg2", sparkColor: "#06b6d4", sparkPath: "M0,24 Q15,22 30,20 T50,16 T70,14 T100,10 V32 H0 Z", sparkLine: "0,24 30,20 50,16 70,14 100,10" },
          { label: "Attrition Rate", badgeCls: "down-good", badge: "-1.2%", val: <>4.8<small>%</small></>, spark: "sg3", sparkColor: "#10b981", sparkPath: "M0,8 Q15,12 30,14 T50,18 T70,22 T100,26 V32 H0 Z", sparkLine: "0,8 30,14 50,18 70,22 100,26" },
          { label: "Cost per Hire", badgeCls: "down-good", badge: "-$420", val: <>$3.2<small>k</small></>, spark: "sg4", sparkColor: "#f59e0b", sparkPath: "M0,10 Q20,14 35,12 T55,16 T75,20 T100,24 V32 H0 Z", sparkLine: "0,10 35,12 55,16 75,20 100,24" },
        ].map((kpi, idx) => (
          <div key={kpi.label} className="an-kpi">
            <div className="an-kpi-top">
              <span className="an-kpi-label">{kpi.label}</span>
              <div className={`an-kpi-badge ${kpi.badgeCls}`}>
                {kpi.badgeCls.startsWith("up")
                  ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="18 15 12 9 6 15" /></svg>
                  : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>}
                {kpi.badge}
              </div>
            </div>
            <div className="an-kpi-val">{kpi.val}</div>
            <div className="an-kpi-spark">
              <svg viewBox="0 0 100 32">
                <defs><linearGradient id={kpi.spark} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={kpi.sparkColor} stopOpacity="0.3" /><stop offset="100%" stopColor={kpi.sparkColor} stopOpacity="0" /></linearGradient></defs>
                <path d={kpi.sparkPath} fill={`url(#${kpi.spark})`} />
                <polyline points={kpi.sparkLine} fill="none" stroke={kpi.sparkColor} strokeWidth="2" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="an-charts-row">
        {/* Headcount Trend */}
        <div className="card an-chart-card">
          <div className="card-header">
            <h3>Headcount Trend</h3>
            <div className="an-legend">
              <span className="an-leg"><span className="an-leg-dot" style={{ background: "#a78bfa" }}></span>Hired</span>
              <span className="an-leg"><span className="an-leg-dot" style={{ background: "#ef4444" }}></span>Departed</span>
            </div>
          </div>
          <div className="an-area-chart">
            <svg viewBox="0 0 600 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="50" x2="600" y2="50" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="0" y1="100" x2="600" y2="100" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <line x1="0" y1="150" x2="600" y2="150" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              <path className="an-area-path" d="M0,160 C50,148 100,136 150,120 S250,96 300,88 S400,72 450,60 S550,44 600,36 V200 H0 Z" fill="url(#areaGrad)" />
              <path className="an-line-path" d="M0,160 C50,148 100,136 150,120 S250,96 300,88 S400,72 450,60 S550,44 600,36" fill="none" stroke="#a78bfa" strokeWidth="2.5" />
              <path className="an-line-path depart" d="M0,176 C50,172 100,174 150,170 S250,166 300,168 S400,164 450,162 S550,160 600,158" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
              {[{ cx: 0, cy: 160 }, { cx: 100, cy: 136 }, { cx: 200, cy: 108 }, { cx: 300, cy: 88 }, { cx: 400, cy: 72 }, { cx: 500, cy: 52 }].map((p) => (
                <circle key={p.cx} cx={p.cx} cy={p.cy} r="3" fill="#a78bfa" className="an-dot" />
              ))}
              <circle cx="600" cy="36" r="4" fill="#a78bfa" className="an-dot active" stroke="rgba(167,139,250,0.3)" strokeWidth="8" />
            </svg>
            <div className="an-area-labels">
              {["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"].map((m) => <span key={m}>{m}</span>)}
            </div>
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="card an-chart-card">
          <div className="card-header">
            <h3>Headcount by Department</h3>
            <button className="card-action">Details</button>
          </div>
          <div className="an-hbar-list">
            {hbars.map((b) => (
              <div key={b.label} className="an-hbar">
                <span className="an-hbar-label">{b.label}</span>
                <div className="an-hbar-track"><div className="an-hbar-fill" style={{ "--w": b.w, "--hc": b.hc } as React.CSSProperties}></div></div>
                <span className="an-hbar-val">{b.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="an-charts-row-3">
        {/* Monthly Hires */}
        <div className="card an-chart-card">
          <div className="card-header">
            <h3>Monthly Hires</h3>
            <span className="an-chart-sub">Last 12 months</span>
          </div>
          <div className="an-bar-chart">
            {vbars.map((b) => (
              <div
                key={b.label}
                className={`an-vbar${activeVbar === b.label ? " active" : ""}`}
                style={{ "--h": b.h } as React.CSSProperties}
                onClick={() => setActiveVbar(b.label)}
              >
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Retention Gauge */}
        <div className="card an-chart-card an-retention-card">
          <div className="card-header">
            <h3>Retention Rate</h3>
            <span className="an-chart-sub">12-month rolling</span>
          </div>
          <div className="an-gauge-wrap">
            <svg className="an-gauge" viewBox="0 0 200 120">
              <defs>
                <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="40%" stopColor="#f59e0b" />
                  <stop offset="70%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
              <path d="M20,110 A80,80 0 0,1 180,110" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="14" strokeLinecap="round" />
              <path d="M20,110 A80,80 0 0,1 180,110" fill="none" stroke="url(#gauge-grad)" strokeWidth="14" strokeLinecap="round" strokeDasharray="251.33" strokeDashoffset={gaugeOffset} />
            </svg>
            <div className="an-gauge-center">
              <span className="an-gauge-val">{gaugeVal}</span>
              <span className="an-gauge-unit">%</span>
              <span className="an-gauge-label">Retained</span>
            </div>
          </div>
          <div className="an-gauge-meta">
            <div className="an-gm"><span className="an-gm-dot" style={{ background: "var(--success)" }}></span>Top Quartile<strong>96.2%</strong></div>
            <div className="an-gm"><span className="an-gm-dot" style={{ background: "var(--warning)" }}></span>Industry Avg<strong>88.0%</strong></div>
          </div>
        </div>

        {/* Geography Breakdown */}
        <div className="card an-chart-card">
          <div className="card-header">
            <h3>Workforce by Region</h3>
            <button className="card-action">Map View</button>
          </div>
          <div className="an-geo-list">
            {geos.map((g) => (
              <div
                key={g.name}
                className={`an-geo${activeGeo === g.name ? " active" : ""}`}
                onClick={() => setActiveGeo(activeGeo === g.name ? null : g.name)}
              >
                <div className="an-geo-left">
                  <span className="an-geo-flag">{g.flag}</span>
                  <div><strong>{g.name}</strong><span>{g.countries}</span></div>
                </div>
                <div className="an-geo-right">
                  <div className="an-geo-bar-wrap"><div className="an-geo-bar" style={{ "--w": g.w, "--gc": g.gc } as React.CSSProperties}></div></div>
                  <span className="an-geo-pct">{g.pct}</span>
                  <span className="an-geo-count">{g.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="an-bottom-row">
        {/* Top Performers */}
        <div className="card an-chart-card">
          <div className="card-header">
            <h3>Top Performers — Q1</h3>
            <button className="card-action">Full Report</button>
          </div>
          <div className="an-perf-list">
            {performers.map((p) => (
              <div
                key={p.rank}
                className={`an-perf${activePerf === p.name ? " active" : ""}`}
                onClick={() => setActivePerf(activePerf === p.name ? null : p.name)}
              >
                <span className="an-perf-rank">{p.rank}</span>
                <div className="an-perf-av" style={{ background: p.bg }}>{p.initials}</div>
                <div className="an-perf-info"><strong>{p.name}</strong><span>{p.dept}</span></div>
                <div className="an-perf-score">
                  <div className="an-perf-bar"><div className="an-perf-fill" style={{ "--w": p.w, "--pc": p.pc } as React.CSSProperties}></div></div>
                  <span>{p.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hiring Funnel */}
        <div className="card an-chart-card">
          <div className="card-header">
            <h3>Hiring Funnel</h3>
            <span className="an-chart-sub">Feb 2026</span>
          </div>
          <div className="an-funnel">
            {funnel.map((f) => (
              <div key={f.label} className="an-funnel-step">
                <div className="an-funnel-bar" style={{ "--fw": f.fw, "--fc": f.fc } as React.CSSProperties}>
                  <span className="an-funnel-num">{f.num}</span>
                </div>
                <span className="an-funnel-label">{f.label}</span>
              </div>
            ))}
          </div>
          <div className="an-funnel-conv">
            <span>Conversion Rate</span>
            <strong>3.5%</strong>
          </div>
        </div>
      </div>
    </>
  );
}
