"use client";

import { useState, useEffect, useRef } from "react";

/* ── Calendar grid data ── */
interface CalCell {
  day: number;
  dim?: boolean;
  weekend?: boolean;
  today?: boolean;
  events?: { label: string; color: string }[];
}

const rows: CalCell[][] = [
  [
    { day: 26, dim: true }, { day: 27, dim: true }, { day: 28, dim: true },
    { day: 29, dim: true }, { day: 30, dim: true }, { day: 31, dim: true },
    { day: 1 },
  ],
  [
    { day: 2 }, { day: 3 }, { day: 4 },
    { day: 5, events: [{ label: "Onboarding", color: "purple" }] },
    { day: 6 },
    { day: 7, weekend: true }, { day: 8, weekend: true },
  ],
  [
    { day: 9, today: true, events: [{ label: "Standup", color: "cyan" }, { label: "Review", color: "amber" }] },
    { day: 10, events: [{ label: "Training", color: "green" }] },
    { day: 11, events: [{ label: "Onboarding", color: "purple" }] },
    { day: 12 },
    { day: 13, events: [{ label: "Deadline", color: "red" }] },
    { day: 14, weekend: true }, { day: 15, weekend: true },
  ],
  [
    { day: 16 },
    { day: 17, events: [{ label: "Visa Expiry", color: "red" }] },
    { day: 18 }, { day: 19 },
    { day: 20, events: [{ label: "Reviews Open", color: "green" }] },
    { day: 21, weekend: true }, { day: 22, weekend: true },
  ],
  [
    { day: 23 },
    { day: 24, events: [{ label: "Town Hall", color: "cyan" }] },
    { day: 25 }, { day: 26 },
    { day: 27, events: [{ label: "Audit Prep", color: "amber" }] },
    { day: 28, weekend: true },
    { day: 1, dim: true },
  ],
];

const allCells = rows.flat();

const timeline = [
  { time: "09:00", title: "Team Standup", dur: "30 min", meta: "Engineering · Google Meet", color: "var(--info)", attendees: [{ initials: "AC", bg: "linear-gradient(135deg,#6366f1,#a78bfa)" }, { initials: "TW", bg: "linear-gradient(135deg,#64748b,#94a3b8)" }, { initials: "LN", bg: "linear-gradient(135deg,#06b6d4,#67e8f9)" }], more: "+4" },
  { time: "11:00", title: "Candidate Interview", dur: "1 hr", meta: "Product Designer · Room 3B", color: "var(--accent)", attendees: [{ initials: "SK", bg: "linear-gradient(135deg,#ec4899,#f472b6)" }, { initials: "MS", bg: "linear-gradient(135deg,#10b981,#34d399)" }] },
  { time: "14:30", title: "Compliance Review", dur: "45 min", meta: "APAC Region · Zoom", color: "var(--warning)", attendees: [{ initials: "AP", bg: "linear-gradient(135deg,#8b5cf6,#c4b5fd)" }], more: "+2" },
  { time: "16:00", title: "1:1 with Sarah K.", dur: "30 min", meta: "Performance Review · Office", color: "var(--success)", attendees: [] },
];

const upcoming = [
  { day: "11", month: "Feb", title: "Onboarding — Priya S.", sub: "10:00 AM · Product Design", color: "purple" },
  { day: "13", month: "Feb", title: "Safety Training Deadline", sub: "All Day · EU Team", color: "red" },
  { day: "17", month: "Feb", title: "Visa Expiry — Sarah K.", sub: "Action Required · Singapore", color: "red" },
  { day: "20", month: "Feb", title: "Q1 Performance Reviews", sub: "Opens for All Managers", color: "green" },
  { day: "24", month: "Feb", title: "Company Town Hall", sub: "3:00 PM · All Hands", color: "cyan" },
];

const legend = [
  { color: "purple", label: "Onboarding" },
  { color: "cyan", label: "Meetings" },
  { color: "amber", label: "Reviews" },
  { color: "green", label: "Training" },
  { color: "red", label: "Deadlines" },
];

export default function CalendarClient() {
  const [activeView, setActiveView] = useState("month");
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [activeTl, setActiveTl] = useState<string | null>(null);
  const [activeUp, setActiveUp] = useState<string | null>(null);
  const tlRef = useRef<HTMLDivElement>(null);
  const nowRef = useRef<HTMLDivElement>(null);

  // Position "Now" indicator
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!tlRef.current || !nowRef.current) return;
      const hour = new Date().getHours();
      const minutes = new Date().getMinutes();
      const currentTime = hour + minutes / 60;
      const items = tlRef.current.querySelectorAll<HTMLElement>(".tl-item");
      const times: { el: HTMLElement; time: number }[] = [];
      items.forEach((item) => {
        const [h, m] = (item.dataset.time || "0:0").split(":").map(Number);
        times.push({ el: item, time: h + m / 60 });
      });
      if (times.length === 0) return;
      let posTop = 0;
      let found = false;
      for (let i = 0; i < times.length; i++) {
        if (currentTime < times[i].time) { posTop = times[i].el.offsetTop - 4; found = true; break; }
        else if (i === times.length - 1) { posTop = times[i].el.offsetTop + times[i].el.offsetHeight; found = true; }
      }
      if (found && currentTime >= times[0].time - 1 && currentTime <= times[times.length - 1].time + 2) {
        nowRef.current.style.top = posTop + "px";
        nowRef.current.classList.add("visible");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const cellKey = (c: CalCell, ri: number) => `${ri}-${c.day}`;

  const handleTodayBtn = () => {
    setSelectedCell(null);
    const todayEl = document.getElementById("cal-today");
    todayEl?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <>
      {/* Page Header */}
      <div className="cal-page-header">
        <div className="cal-title-area">
          <h1 className="pg-title">Calendar</h1>
          <p className="pg-subtitle">February 2026</p>
        </div>
        <div className="cal-header-actions">
          <div className="cal-view-tabs">
            {["Month", "Week", "Day"].map((v) => (
              <button
                key={v}
                className={`cvt${activeView === v.toLowerCase() ? " active" : ""}`}
                onClick={() => setActiveView(v.toLowerCase())}
              >
                {v}
              </button>
            ))}
          </div>
          <button className="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New Event
          </button>
        </div>
      </div>

      {/* Calendar Layout */}
      <div className="cal-layout">
        {/* Main Calendar */}
        <div className="cal-main-panel">
          {/* Month Nav */}
          <div className="cal-month-bar">
            <button className="cal-arrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <div className="cal-month-display">
              <h2>February</h2>
              <span>2026</span>
            </div>
            <button className="cal-arrow">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
            <button className="cal-today-btn" onClick={handleTodayBtn}>Today</button>
          </div>

          {/* Weekday Headers */}
          <div className="cal-weekdays">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="cal-grid">
            {rows.map((row, ri) =>
              row.map((cell) => {
                const key = cellKey(cell, ri);
                const cls = [
                  "cal-cell",
                  cell.dim && "dim",
                  cell.weekend && "weekend",
                  cell.today && "today",
                  !cell.dim && selectedCell === key && "selected",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <div
                    key={key}
                    id={cell.today ? "cal-today" : undefined}
                    className={cls}
                    onClick={() => {
                      if (!cell.dim) setSelectedCell(key);
                    }}
                  >
                    <span className="cal-num">{cell.day}</span>
                    {cell.events?.map((ev) => (
                      <div key={ev.label} className={`cal-event-strip ${ev.color}`}>{ev.label}</div>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="cal-side-panel">
          {/* Today's Agenda */}
          <div className="card cal-agenda-card">
            <div className="card-header">
              <h3>Today&apos;s Agenda</h3>
              <span className="cal-date-badge">Feb 9</span>
            </div>
            <div className="cal-timeline" ref={tlRef}>
              <div className="tl-now-label" ref={nowRef}>Now</div>
              {timeline.map((item) => (
                <div key={item.time} className="tl-item" data-time={item.time}>
                  <div className="tl-time">{item.time}</div>
                  <div
                    className={`tl-block${activeTl === item.time ? " active" : ""}`}
                    style={{ "--tl-c": item.color } as React.CSSProperties}
                    onClick={() => setActiveTl(activeTl === item.time ? null : item.time)}
                  >
                    <div className="tl-block-header">
                      <strong>{item.title}</strong>
                      <span className="tl-dur">{item.dur}</span>
                    </div>
                    <span className="tl-meta">{item.meta}</span>
                    {item.attendees.length > 0 && (
                      <div className="tl-attendees">
                        {item.attendees.map((a) => (
                          <div key={a.initials} className="tl-av" style={{ background: a.bg }}>{a.initials}</div>
                        ))}
                        {item.more && <span className="tl-more">{item.more}</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="card">
            <div className="card-header">
              <h3>Upcoming</h3>
              <button className="card-action">View All</button>
            </div>
            <div className="upcoming-list">
              {upcoming.map((u) => (
                <div
                  key={u.title}
                  className={`up-item${activeUp === u.title ? " active" : ""}`}
                  onClick={() => setActiveUp(activeUp === u.title ? null : u.title)}
                >
                  <div className={`up-date ${u.color}`}>
                    <span>{u.day}</span>{u.month}
                  </div>
                  <div className="up-body">
                    <strong>{u.title}</strong>
                    <span>{u.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Legend */}
          <div className="card cal-legend-card">
            <div className="card-header"><h3>Categories</h3></div>
            <div className="cal-legend">
              {legend.map((l) => (
                <div key={l.label} className="cal-leg-item">
                  <span className={`cal-leg-dot ${l.color}`}></span>{l.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
