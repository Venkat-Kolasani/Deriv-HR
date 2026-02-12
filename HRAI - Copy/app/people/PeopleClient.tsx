"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { Employee } from "@/app/lib/firebase";

interface Props {
  employees: Employee[];
  company: any;
}

/* ── Avatar gradient map ── */
const avatarGradients: Record<string, string> = {
  Engineering: "linear-gradient(135deg, #6366f1, #a78bfa)",
  Design: "linear-gradient(135deg, #ec4899, #f472b6)",
  "HR & Legal": "linear-gradient(135deg, #10b981, #34d399)",
  Operations: "linear-gradient(135deg, #f59e0b, #fbbf24)",
  Product: "linear-gradient(135deg, #ef4444, #f87171)",
  Finance: "linear-gradient(135deg, #f97316, #fb923c)",
};

function fallbackGradient(name: string) {
  const colors = ["#6366f1", "#06b6d4", "#8b5cf6", "#64748b", "#ec4899"];
  const idx = name.charCodeAt(0) % colors.length;
  return `linear-gradient(135deg, ${colors[idx]}, ${colors[(idx + 1) % colors.length]})`;
}

/* ── Stat Counter ── */
function StatCounter({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const duration = 1200;
    const start = performance.now();
    function update(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }, [target]);
  return <span className="ps-num" ref={ref}>0</span>;
}

/* ── Department filter chips ── */
const DEPT_FILTERS = [
  { key: "all", label: "All" },
  { key: "engineering", label: "Engineering" },
  { key: "product", label: "Product" },
  { key: "design", label: "Design" },
  { key: "operations", label: "Operations" },
  { key: "hr", label: "HR & Legal" },
];

/* ── Status mapping ── */
function getStatusInfo(emp: Employee): { label: string; cls: string } {
  if (emp.status === "new-hire" || emp.status === "new") return { label: "New Hire", cls: "new" };
  if (emp.status === "on-leave" || emp.status === "leave") return { label: "On Leave", cls: "leave" };
  if (emp.status === "offboarding") return { label: "Offboarding", cls: "offboarding" };
  return { label: "Active", cls: "active" };
}

function deptKey(dept: string): string {
  if (dept.toLowerCase().includes("hr") || dept.toLowerCase().includes("legal")) return "hr";
  return dept.toLowerCase();
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

/* ── SVG Icons (inline to match original) ── */
const LocationIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
);
const DeptIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
);
const CalendarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
);
const MessageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
);

export default function PeopleClient({ employees, company }: Props) {
  const [search, setSearch] = useState("");
  const [activeDept, setActiveDept] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const totalEmployees = company?.totalEmployees ?? employees.length;
  const activeCount = employees.filter((e) => e.status === "active").length;
  const onLeaveCount = employees.filter((e) => e.status === "on-leave" || e.status === "leave").length;
  const newThisMonth = company?.newThisMonth ?? employees.filter((e) => e.status === "new-hire" || e.status === "new").length;

  const filtered = useMemo(() => {
    let list = employees;
    if (activeDept !== "all") {
      list = list.filter((e) => deptKey(e.dept) === activeDept);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.dept.toLowerCase().includes(q)
      );
    }
    return list;
  }, [employees, activeDept, search]);

  return (
    <>
      {/* Page Header */}
      <div className="people-header">
        <div className="people-header-left">
          <h1 className="pg-title">People</h1>
          <p className="pg-subtitle">{totalEmployees} employees across 8 countries</p>
        </div>
        <div className="people-header-right">
          <button className="btn-outline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
          <button className="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Employee
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="people-stats">
        <div className="ps-card">
          <div className="ps-icon" style={{ "--ps-c": "var(--accent)" } as React.CSSProperties}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          </div>
          <div className="ps-data">
            <StatCounter target={totalEmployees} />
            <span className="ps-label">Total Employees</span>
          </div>
        </div>
        <div className="ps-card">
          <div className="ps-icon" style={{ "--ps-c": "var(--success)" } as React.CSSProperties}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div className="ps-data">
            <StatCounter target={activeCount || 232} />
            <span className="ps-label">Active</span>
          </div>
        </div>
        <div className="ps-card">
          <div className="ps-icon" style={{ "--ps-c": "var(--warning)" } as React.CSSProperties}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div className="ps-data">
            <StatCounter target={onLeaveCount || 5} />
            <span className="ps-label">On Leave</span>
          </div>
        </div>
        <div className="ps-card">
          <div className="ps-icon" style={{ "--ps-c": "var(--info)" } as React.CSSProperties}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <div className="ps-data">
            <StatCounter target={newThisMonth || 10} />
            <span className="ps-label">New This Month</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="people-toolbar">
        <div className="toolbar-left">
          <div className="people-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Search by name, role, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="dept-filters">
            {DEPT_FILTERS.map((f) => (
              <span
                key={f.key}
                className={`dept-chip${activeDept === f.key ? " active" : ""}`}
                onClick={() => setActiveDept(f.key)}
              >
                {f.label}
              </span>
            ))}
          </div>
        </div>
        <div className="toolbar-right">
          <div className="view-toggle">
            <button
              className={`vt-btn${viewMode === "grid" ? " active" : ""}`}
              title="Grid View"
              onClick={() => setViewMode("grid")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            </button>
            <button
              className={`vt-btn${viewMode === "list" ? " active" : ""}`}
              title="List View"
              onClick={() => setViewMode("list")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* People Grid */}
      <div className={`people-grid${viewMode === "list" ? " list-view" : ""}`}>
        {filtered.map((emp) => {
          const status = getStatusInfo(emp);
          const gradient = avatarGradients[emp.dept] || fallbackGradient(emp.name);
          return (
            <div
              key={emp.id}
              className={`person-card${selectedCard === emp.id ? " selected" : ""}`}
              data-dept={deptKey(emp.dept)}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest(".pc-action") || (e.target as HTMLElement).closest(".pc-icon-btn")) return;
                setSelectedCard(selectedCard === emp.id ? null : emp.id);
              }}
            >
              <div className="pc-top">
                <div className="pc-avatar" style={{ background: gradient }}>
                  {emp.initials}
                </div>
                <span className={`pc-status ${status.cls}`}>{status.label}</span>
              </div>
              <div className="pc-body">
                <strong>{emp.name}</strong>
                <span className="pc-role">{emp.role}</span>
              </div>
              <div className="pc-details">
                <div className="pc-detail-row">
                  <LocationIcon />
                  {emp.location}
                </div>
                <div className="pc-detail-row">
                  <DeptIcon />
                  {emp.dept}
                </div>
                <div className="pc-detail-row">
                  <CalendarIcon />
                  Joined {formatDate(emp.joined)}
                </div>
              </div>
              <div className="pc-footer">
                <button className="pc-action">View Profile</button>
                <button className="pc-icon-btn" title="Message">
                  <MessageIcon />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="people-empty visible">
          <div className="people-empty-icon">🔍</div>
          <h3>No employees found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Results count */}
      <div className="people-results">
        <span>
          Showing <strong>{filtered.length}</strong> of <strong>{totalEmployees}</strong> employees
        </span>
      </div>
    </>
  );
}
