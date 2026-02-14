"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    group: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "grid", badge: null, badgeClass: "" },
      //{ label: "People", href: "/people", icon: "users", badge: "247", badgeClass: "" },
      //{ label: "Calendar", href: "/calendar", icon: "calendar", badge: null, badgeClass: "" },
      { label: "Contracts", href: "/contracts", icon: "file", badge: "8", badgeClass: "accent" },
    ],
  },
  {
    group: "Insights",
    items: [
      { label: "Compliance", href: "/compliance", icon: "shield", badge: null, badgeClass: "" },
      //{ label: "Analytics", href: "/analytics", icon: "chart", badge: null, badgeClass: "" },
    ],
  },
  {
    group: "AI Tools",
    items: [
      { label: "Hiring Intelligence", href: "/hiring", icon: "sparkle", badge: "AI", badgeClass: "accent" },
    ],
  },
];

function NavIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    grid: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
    ),
    file: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
    ),
    clipboard: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /></svg>
    ),
    dollar: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
    ),
    "check-circle": (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
    ),
    send: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
    ),
    shield: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
    ),
    sparkle: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" /></svg>
    ),
    settings: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
    ),
  };
  return icons[name] || null;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);

  // Read localStorage synchronously before paint to avoid flash
  useLayoutEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
    // Enable transitions only after initial state is applied
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setReady(true));
    });
  }, []);

  const toggle = () => {
    // On mobile, close sidebar instead of collapsing
    if (typeof window !== "undefined" && window.innerWidth <= 1024) {
      const sidebar = document.querySelector(".sidebar");
      const overlay = document.querySelector(".sidebar-overlay");
      sidebar?.classList.remove("open");
      overlay?.classList.remove("visible");
      return;
    }
    setCollapsed((prev) => {
      localStorage.setItem("sidebar-collapsed", String(!prev));
      return !prev;
    });
  };

  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}${!ready ? " no-transition" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          deriv<span>HR</span>
        </div>
        <button className="sidebar-collapse" onClick={toggle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((group) => (
          <div className="nav-group" key={group.group}>
            <span className="nav-group-label">{group.group}</span>
            {group.items.map((item) => {
              const normalizedPath = pathname.replace(/\/+$/, "");
              const isActive = normalizedPath === item.href || (item.href !== "/dashboard" && normalizedPath.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item${isActive ? " active" : ""}`}
                >
                  <NavIcon name={item.icon} />
                  <span className="nav-text">{item.label}</span>
                  {item.badge && (
                    <span className={`nav-badge${item.badgeClass ? " " + item.badgeClass : ""}`}>{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Link
          href="/settings"
          className={`nav-item${pathname.replace(/\/+$/, "") === "/settings" ? " active" : ""}`}
        >
          <NavIcon name="settings" />
          <span className="nav-text">Settings</span>
        </Link>
        <div className="sidebar-user">
          <div className="sidebar-avatar">AR</div>
          <div className="sidebar-user-info">
            <strong>Ahmad R.</strong>
            <span>HR Manager</span>
          </div>
          <button className="sidebar-logout" title="Log out" onClick={() => window.location.href = "/landing"}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
