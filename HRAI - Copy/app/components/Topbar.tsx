"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

export default function Topbar() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unread, setUnread] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const closeAll = useCallback(() => {
    setNotifOpen(false);
    setProfileOpen(false);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // ⌘K / Ctrl+K search shortcut + Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        searchRef.current?.blur();
        closeAll();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [closeAll]);

  // Mobile sidebar toggle
  const toggleMobileSidebar = () => {
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".sidebar-overlay");
    sidebar?.classList.toggle("open");
    overlay?.classList.toggle("visible");
  };

  const markAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUnread(false);
    document.querySelectorAll(".dd-item.unread").forEach((el) => el.classList.remove("unread"));
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-toggle" onClick={toggleMobileSidebar}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div className="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="text" placeholder="Search anything..." ref={searchRef} />
          <kbd>⌘K</kbd>
        </div>
      </div>
      <div className="topbar-right">
        {/* ── Notification Dropdown ── */}
        <div className="topbar-dropdown-wrap" ref={notifRef}>
          <button
            className="topbar-icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              setProfileOpen(false);
              setNotifOpen((prev) => !prev);
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
            {unread && <span className="notif-dot"></span>}
          </button>
          <div className={`topbar-dropdown notif-dropdown${notifOpen ? " open" : ""}`} onClick={(e) => e.stopPropagation()}>
            <div className="dd-header">
              <strong>Notifications</strong>
              <button className="dd-mark-read" onClick={markAllRead}>Mark all read</button>
            </div>
            <div className="dd-list">
              <Link className={`dd-item${unread ? " unread" : ""}`} href="/compliance">
                <div className="dd-dot critical"></div>
                <div className="dd-body">
                  <strong>Visa Expiring — Sarah Kim</strong>
                  <span>Work permit expires in 14 days</span>
                  <span className="dd-time">2 hours ago</span>
                </div>
              </Link>
              <Link className={`dd-item${unread ? " unread" : ""}`} href="/contracts">
                <div className="dd-dot warning"></div>
                <div className="dd-body">
                  <strong>Contract Clause Error</strong>
                  <span>Alex Chen — outdated EPF rates</span>
                  <span className="dd-time">5 hours ago</span>
                </div>
              </Link>
              <Link className={`dd-item${unread ? " unread" : ""}`} href="/compliance">
                <div className="dd-dot warning"></div>
                <div className="dd-body">
                  <strong>Training Overdue — EU Team</strong>
                  <span>3 employees pending safety training</span>
                  <span className="dd-time">1 day ago</span>
                </div>
              </Link>
              <Link className="dd-item" href="/people">
                <div className="dd-dot info"></div>
                <div className="dd-body">
                  <strong>New Hire Onboarded</strong>
                  <span>Priya Sharma joined Product</span>
                  <span className="dd-time">2 days ago</span>
                </div>
              </Link>
            </div>
            <Link className="dd-footer" href="/dashboard">View all notifications</Link>
          </div>
        </div>

        <div className="topbar-divider"></div>

        {/* ── Profile Dropdown ── */}
        <div className="topbar-dropdown-wrap" ref={profileRef}>
          <div
            className="topbar-profile"
            onClick={(e) => {
              e.stopPropagation();
              setNotifOpen(false);
              setProfileOpen((prev) => !prev);
            }}
          >
            <div className="topbar-avatar">AR</div>
            <span className="topbar-name">Ahmad R.</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          <div className={`topbar-dropdown profile-dropdown${profileOpen ? " open" : ""}`} onClick={(e) => e.stopPropagation()}>
            <div className="dd-profile-card">
              <div className="dd-profile-avatar">AR</div>
              <div>
                <strong>Ahmad Ramly</strong>
                <span>HR Manager</span>
              </div>
            </div>
            <div className="dd-divider"></div>
            <Link className="dd-menu-item" href="/settings">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              My Profile
            </Link>
            <Link className="dd-menu-item" href="/settings">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
              Settings
            </Link>
            <Link className="dd-menu-item" href="/analytics">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Analytics
            </Link>
            <div className="dd-divider"></div>
            <Link className="dd-menu-item dd-logout" href="/landing">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Log Out
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
