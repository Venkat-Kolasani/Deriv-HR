"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";

/* ── Static data ── */
interface Contract {
  id: string;
  initials: string;
  gradient: string;
  name: string;
  role: string;
  type: string;
  typeCls: string;
  dept: string;
  status: string;
  statusLabel: string;
  date: string;
  value: string;
}

const contracts: Contract[] = [
  { id: "1", initials: "AC", gradient: "linear-gradient(135deg,#6366f1,#a78bfa)", name: "Alex Chen", role: "Senior Software Engineer", type: "Employment", typeCls: "employment", dept: "Engineering", status: "pending", statusLabel: "Pending Signature", date: "Feb 7, 2026", value: "$128,000" },
  { id: "2", initials: "MS", gradient: "linear-gradient(135deg,#10b981,#34d399)", name: "Maria Santos", role: "HR Manager", type: "NDA", typeCls: "nda", dept: "HR & Legal", status: "signed", statusLabel: "Signed", date: "Feb 5, 2026", value: "—" },
  { id: "3", initials: "JO", gradient: "linear-gradient(135deg,#f59e0b,#fbbf24)", name: "James O'Brien", role: "Finance Lead", type: "Equity Grant", typeCls: "equity", dept: "Operations", status: "signed", statusLabel: "Signed", date: "Feb 3, 2026", value: "$45,000" },
  { id: "4", initials: "AP", gradient: "linear-gradient(135deg,#8b5cf6,#c4b5fd)", name: "Aisha Patel", role: "Legal Counsel", type: "Amendment", typeCls: "amendment", dept: "HR & Legal", status: "review", statusLabel: "In Review", date: "Feb 1, 2026", value: "$115,000" },
  { id: "5", initials: "LN", gradient: "linear-gradient(135deg,#06b6d4,#67e8f9)", name: "Liam Nguyen", role: "DevOps Engineer", type: "Employment", typeCls: "employment", dept: "Engineering", status: "expired", statusLabel: "Expired", date: "Jan 28, 2026", value: "$98,000" },
  { id: "6", initials: "PS", gradient: "linear-gradient(135deg,#ef4444,#f87171)", name: "Priya Sharma", role: "Product Manager", type: "Employment", typeCls: "employment", dept: "Product", status: "pending", statusLabel: "Pending Signature", date: "Feb 8, 2026", value: "$112,000" },
  { id: "7", initials: "RH", gradient: "linear-gradient(135deg,#f97316,#fb923c)", name: "Rachel Huang", role: "Operations Manager", type: "Employment", typeCls: "employment", dept: "Operations", status: "signed", statusLabel: "Signed", date: "Jan 15, 2026", value: "$105,000" },
];

const filters = [
  { key: "all", label: "All", count: 191 },
  { key: "pending", label: "Pending", count: 8 },
  { key: "signed", label: "Signed", count: 156 },
  { key: "review", label: "In Review", count: 24 },
  { key: "expired", label: "Expired", count: 3 },
];

/* ── Inline SVG icons ── */
const ViewIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const DownloadIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
const MoreIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg>;

export default function ContractsClient() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [activeRow, setActiveRow] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [sortActive, setSortActive] = useState(false);
  const [activePage, setActivePage] = useState(1);

  // Counter animation
  const [counters, setCounters] = useState([0, 0, 0, 0]);
  const targets = [191, 156, 8, 3];
  useEffect(() => {
    const start = performance.now();
    const dur = 1000;
    function tick(now: number) {
      const p = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setCounters(targets.map((t) => Math.round(t * e)));
      if (p < 1) requestAnimationFrame(tick);
    }
    const timer = setTimeout(() => requestAnimationFrame(tick), 200);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    let list = contracts;
    if (activeFilter !== "all") list = list.filter((c) => c.status === activeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) => c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q) || c.dept.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeFilter, search]);

  const allChecked = filtered.length > 0 && filtered.every((c) => checked.has(c.id));

  const toggleCheckAll = () => {
    if (allChecked) setChecked(new Set());
    else setChecked(new Set(filtered.map((c) => c.id)));
  };

  const toggleCheck = (id: string) => {
    setChecked((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  };

  return (
    <>
      {/* Page Header */}
      <div className="ct-page-header">
        <div>
          <h1 className="pg-title">Contracts</h1>
          <p className="pg-subtitle">Manage employment agreements and legal documents</p>
        </div>
        <div className="ct-header-actions">
          <button className="btn-outline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            Export
          </button>
          <Link href="/contract-generator" className="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New Contract
          </Link>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="ct-stats">
        {[
          { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>, color: "var(--accent)", label: "Total Contracts", idx: 0, extra: <div className="cts-mini-chart"><svg viewBox="0 0 60 20"><polyline points="0,16 10,12 20,14 30,8 40,10 50,6 60,4" fill="none" stroke="var(--accent)" strokeWidth="1.5" opacity="0.5" /></svg></div> },
          { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="20 6 9 17 4 12" /></svg>, color: "var(--success)", label: "Signed & Active", idx: 1, extra: <div className="cts-progress"><div className="cts-fill" style={{ "--w": "82%", "--pc": "var(--success)" } as React.CSSProperties}></div></div> },
          { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>, color: "var(--warning)", label: "Awaiting Signature", idx: 2, extra: <div className="cts-pulse"></div> },
          { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>, color: "var(--danger)", label: "Expiring Soon", idx: 3 },
        ].map((s) => (
          <div key={s.label} className="cts-card">
            <div className="cts-icon-wrap" style={{ "--cts-c": s.color } as React.CSSProperties}>{s.icon}</div>
            <div>
              <span className="cts-val">{counters[s.idx]}</span>
              <span className="cts-label">{s.label}</span>
            </div>
            {s.extra}
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="card ct-table-card">
        {/* Toolbar */}
        <div className="ct-toolbar">
          <div className="ct-filters">
            {filters.map((f) => (
              <button
                key={f.key}
                className={`ctf${activeFilter === f.key ? " active" : ""}`}
                onClick={() => setActiveFilter(f.key)}
              >
                {f.label} <span className="ctf-count">{f.count}</span>
              </button>
            ))}
          </div>
          <div className="ct-toolbar-right">
            <div className="ct-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input type="text" placeholder="Search contracts..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button className={`ct-sort-btn${sortActive ? " active" : ""}`} title="Sort" onClick={() => setSortActive(!sortActive)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="6" x2="14" y2="6" /><line x1="4" y1="12" x2="11" y2="12" /><line x1="4" y1="18" x2="8" y2="18" /><polyline points="17 9 20 6 23 9" /><line x1="20" y1="6" x2="20" y2="18" /></svg>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="ct-table-wrap">
          <table className="ct-table">
            <thead>
              <tr>
                <th><input type="checkbox" className="ct-check" checked={allChecked} onChange={toggleCheckAll} /></th>
                <th>Employee</th>
                <th>Contract Type</th>
                <th>Department</th>
                <th>Status</th>
                <th>Effective Date</th>
                <th>Value</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className={`${activeRow === c.id ? "active" : ""}${checked.has(c.id) ? " checked" : ""}`}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest(".ct-act-btn") || (e.target as HTMLElement).classList.contains("ct-check")) return;
                    setActiveRow(activeRow === c.id ? null : c.id);
                  }}
                >
                  <td><input type="checkbox" className="ct-check" checked={checked.has(c.id)} onChange={() => toggleCheck(c.id)} /></td>
                  <td>
                    <div className="ct-user">
                      <div className="ct-av" style={{ background: c.gradient }}>{c.initials}</div>
                      <div><strong>{c.name}</strong><span>{c.role}</span></div>
                    </div>
                  </td>
                  <td><span className={`ct-type-badge ${c.typeCls}`}>{c.type}</span></td>
                  <td>{c.dept}</td>
                  <td><span className={`ct-status ${c.status}`}><span className="ct-status-dot"></span>{c.statusLabel}</span></td>
                  <td>{c.date}</td>
                  <td className="ct-value">{c.value}</td>
                  <td>
                    <div className="ct-actions">
                      <button className="ct-act-btn" title="View"><ViewIcon /></button>
                      <button className="ct-act-btn" title="Download"><DownloadIcon /></button>
                      <button className="ct-act-btn" title="More"><MoreIcon /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="ct-table-footer">
          <span className="ct-showing">Showing <strong>{filtered.length}</strong> of <strong>191</strong> contracts</span>
          <div className="ct-pagination">
            <button className="ct-page-btn disabled">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            {[1, 2, 3].map((n) => (
              <button key={n} className={`ct-page-num${activePage === n ? " active" : ""}`} onClick={() => setActivePage(n)}>{n}</button>
            ))}
            <span className="ct-page-dots">…</span>
            <button className={`ct-page-num${activePage === 28 ? " active" : ""}`} onClick={() => setActivePage(28)}>28</button>
            <button className="ct-page-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
