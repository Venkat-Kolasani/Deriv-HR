"use client";

import { useEffect, useRef, useState } from "react";
import type { Alert, MorningBriefing, ActivityLogEntry } from "@/app/lib/firebase";

interface Props {
  alerts: Alert[];
  briefing: MorningBriefing;
  kpis: Record<string, any>;
  activityLog: ActivityLogEntry[];
  company: any;
}

/* ── Animated Counter Hook ── */
function useCountUp(ref: React.RefObject<HTMLSpanElement | null>, target: number, duration = 1200) {
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const start = performance.now();
    function update(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }, [ref, target, duration]);
}

function KPICard({
  icon,
  value,
  label,
  trend,
  trendClass,
  color,
  sparkline,
  isPercent,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  trend: string;
  trendClass: string;
  color: string;
  sparkline: string;
  isPercent?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useCountUp(ref, value);

  return (
    <div className="kpi-card">
      <div className="kpi-icon" style={{ "--kpi-color": color } as React.CSSProperties}>
        {icon}
      </div>
      <div className="kpi-data">
        <span className={`kpi-value${isPercent ? " kpi-percent" : ""}`} ref={ref}>
          0
        </span>
        <span className="kpi-label">{label}</span>
      </div>
      <div className={`kpi-trend ${trendClass}`}>
        {trendClass.includes("up") ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15" /></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
        )}
        {trend}
      </div>
      <div className="kpi-sparkline">
        <svg viewBox="0 0 80 24">
          <polyline points={sparkline} fill="none" stroke="var(--kpi-color)" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}

const activityColors: Record<string, string> = {
  "contract-generator": "var(--accent)",
  contracts: "var(--accent)",
  compliance: "#10b981",
  people: "#ec4899",
};

function timeAgo(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardClient({ alerts, briefing, kpis, activityLog, company }: Props) {
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const departments = company?.departments || [];

  const [activeBar, setActiveBar] = useState<string>("Jun");
  const [activeDeadline, setActiveDeadline] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Bar chart entrance animation
  useEffect(() => {
    if (!chartRef.current) return;
    const bars = chartRef.current.querySelectorAll<HTMLElement>(".cbar");
    bars.forEach((bar, i) => {
      const h = bar.style.getPropertyValue("--h");
      bar.style.height = "0%";
      setTimeout(() => { bar.style.height = h; }, 100 + i * 60);
    });
  }, []);

  return (
    <>
      {/* ═══ Welcome Banner ═══ */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <div className="welcome-text">
            <h1>
              <span className="welcome-wave">👋</span> {greeting},{" "}
              <strong>Ahmad</strong>
            </h1>
            <p className="ai-briefing">
              <span className="ai-tag">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                AI Briefing
              </span>
              {briefing?.summary ||
                "You have 1 visa expiry approaching, 1 contract clause error, and 3 EU employees overdue on safety training."}
            </p>
          </div>
          <div className="welcome-pills">
            <div className="w-pill danger-pulse">
              <span className="w-pill-icon">🛂</span>
              <div>
                <strong>{briefing?.stats?.expiringVisas ?? 1}</strong>
                <span>Visa Alert</span>
              </div>
            </div>
            <div className="w-pill">
              <span className="w-pill-icon">📄</span>
              <div>
                <strong>{briefing?.stats?.pendingContracts ?? 2}</strong>
                <span>Contract Error</span>
              </div>
            </div>
            <div className="w-pill">
              <span className="w-pill-icon">⚠️</span>
              <div>
                <strong>{briefing?.stats?.complianceAlerts ?? 2}</strong>
                <span>Training Due</span>
              </div>
            </div>
          </div>
        </div>
        <div className="welcome-mesh"></div>
      </div>

      {/* ═══ Urgent Actions ═══ */}
      <div className="urgent-actions">
        <div className="urgent-header">
          <h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
            Requires Your Attention
          </h3>
          <span className="urgent-count">{alerts.length} items</span>
        </div>
        <div className="urgent-list">
          {alerts.map((a) => (
            <div key={a.id} className={`urgent-item ${a.type}`} style={{ cursor: "pointer" }}>
              <div className="urgent-indicator"></div>
              <span className="urgent-icon">{a.icon}</span>
              <div className="urgent-body">
                <strong>{a.title}</strong>
                <span>{a.summary}</span>
              </div>
              <div className="urgent-meta">
                <span className={`urgent-badge ${a.type}`}>
                  {a.type === "critical" ? "Critical" : "Warning"}
                </span>
                <span className="urgent-days">{a.daysLeft} days left</span>
              </div>
              <svg className="urgent-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ KPI Grid ═══ */}
      <div className="kpi-grid">
        <KPICard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>}
          value={kpis?.totalEmployees?.value ?? 247}
          label="Total Employees"
          trend={`+${kpis?.totalEmployees?.change ?? 12}`}
          trendClass="up"
          color="#a78bfa"
          sparkline="0,20 12,16 24,18 36,12 48,14 60,8 72,10 80,4"
        />
        <KPICard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>}
          value={kpis?.openPositions?.value ?? 12}
          label="Open Positions"
          trend={`${kpis?.openPositions?.change ?? -3}`}
          trendClass="down"
          color="#06b6d4"
          sparkline="0,8 12,12 24,10 36,16 48,14 60,18 72,16 80,20"
        />
        <KPICard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
          value={kpis?.activeContracts?.value ?? 8}
          label="Pending Contracts"
          trend="+2"
          trendClass="up warn"
          color="#f59e0b"
          sparkline="0,18 12,14 24,16 36,10 48,12 60,8 72,6 80,4"
        />
        <KPICard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
          value={kpis?.complianceScore?.value ?? 94}
          label="Compliance Score"
          trend={`${kpis?.complianceScore?.change ?? "+2"}%`}
          trendClass="up"
          color="#10b981"
          sparkline="0,16 12,14 24,12 36,10 48,8 60,6 72,5 80,4"
          isPercent
        />
      </div>

      {/* ═══ Dashboard Grid ═══ */}
      <div className="dash-grid">
        {/* Activity Feed */}
        <div className="card card-activity">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <button className="card-action">View All</button>
          </div>
          <div className="activity-list">
            {activityLog.map((entry) => (
              <div key={entry.id} className="activity-item">
                <div
                  className="activity-dot"
                  style={{ background: activityColors[entry.page] || "var(--accent)" }}
                ></div>
                <div className="activity-content">
                  <p>
                    <strong>{entry.action}</strong> — {entry.description}
                  </p>
                  <span>
                    {entry.user} · {timeAgo(entry.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="dash-right-col">
          {/* Donut */}
          <div className="card card-donut">
            <div className="card-header">
              <h3>Team by Department</h3>
            </div>
            <div className="donut-wrapper">
              <div className="donut-chart">
                <div className="donut-ring"></div>
                <div className="donut-center">
                  <span className="donut-total">{company?.totalEmployees ?? 247}</span>
                  <span className="donut-sub">Total</span>
                </div>
              </div>
              <div className="donut-legend">
                {[
                  { name: "Engineering", color: "#a78bfa", count: 82 },
                  { name: "Product", color: "#06b6d4", count: 45 },
                  { name: "Operations", color: "#f59e0b", count: 38 },
                  { name: "Design", color: "#ec4899", count: 32 },
                  { name: "HR & Legal", color: "#10b981", count: 28 },
                  { name: "Other", color: "#64748b", count: 22 },
                ].map((d) => (
                  <div className="legend-item" key={d.name}>
                    <span className="legend-dot" style={{ background: d.color }}></span>
                    {d.name}
                    <strong>{d.count}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card card-actions">
            <div className="card-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="quick-actions">
              {[
                { label: "New Hire", color: "#a78bfa", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> },
                { label: "Contract", color: "#06b6d4", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> },
                { label: "Schedule", color: "#f59e0b", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg> },
                { label: "Audit", color: "#10b981", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
              ].map((qa) => (
                <button key={qa.label} className="qa-btn">
                  <div className="qa-icon" style={{ "--qa": qa.color } as React.CSSProperties}>
                    {qa.icon}
                  </div>
                  <span>{qa.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Bottom Grid ═══ */}
      <div className="dash-bottom-grid">
        {/* Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h3>HR Operations — This Quarter</h3>
            <span className="card-sub">Automated resolution rate</span>
          </div>
          <div className="chart-bars" ref={chartRef}>
            {[
              { label: "Jan", h: "65%" },
              { label: "Feb", h: "78%" },
              { label: "Mar", h: "55%" },
              { label: "Apr", h: "85%" },
              { label: "May", h: "92%" },
              { label: "Jun", h: "88%" },
            ].map((bar) => (
              <div
                key={bar.label}
                className={`cbar${activeBar === bar.label ? " active" : ""}`}
                style={{ "--h": bar.h } as React.CSSProperties}
                onClick={() => setActiveBar(bar.label)}
              >
                <span>{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Deadlines */}
        <div className="card">
          <div className="card-header">
            <h3>Upcoming Deadlines</h3>
            <button className="card-action">See All</button>
          </div>
          <div className="deadline-list">
            {[
              { day: "14", month: "Feb", title: "Visa Expiry — Sarah Kim", sub: "Work permit renewal · Singapore", badge: "Critical", dateClass: "danger", badgeClass: "danger" },
              { day: "20", month: "Feb", title: "Safety Training Deadline", sub: "EU Team · 3 of 12 pending", badge: "Warning", dateClass: "warn", badgeClass: "warn" },
              { day: "28", month: "Feb", title: "Q1 Performance Reviews", sub: "All managers · 247 employees", badge: "Upcoming", dateClass: "", badgeClass: "info" },
              { day: "01", month: "Mar", title: "Compliance Audit — APAC", sub: "Annual certification review", badge: "On Track", dateClass: "ok", badgeClass: "ok" },
            ].map((dl) => (
              <div
                key={dl.title}
                className={`deadline-item${activeDeadline === dl.title ? " active" : ""}`}
                onClick={() => setActiveDeadline(activeDeadline === dl.title ? null : dl.title)}
              >
                <div className={`dl-date ${dl.dateClass}`}>
                  <span>{dl.day}</span>
                  {dl.month}
                </div>
                <div className="dl-info">
                  <strong>{dl.title}</strong>
                  <span>{dl.sub}</span>
                </div>
                <span className={`dl-badge ${dl.badgeClass}`}>{dl.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
