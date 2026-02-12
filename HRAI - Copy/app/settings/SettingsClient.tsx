"use client";

import { useState, useRef } from "react";

/* ── Nav sections ── */
const navSections = [
  {
    label: "Account",
    items: [
      { tab: "profile", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>, text: "Profile" },
      { tab: "security", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>, text: "Security" },
      { tab: "notifications", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>, text: "Notifications" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { tab: "organization", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>, text: "Organization" },
      { tab: "integrations", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>, text: "Integrations" },
      { tab: "billing", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>, text: "Billing" },
    ],
  },
  {
    label: "System",
    items: [
      { tab: "appearance", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>, text: "Appearance" },
    ],
  },
];

const integrations = [
  { letter: "G", bg: "linear-gradient(135deg,#4285f4,#34a853)", name: "Google Workspace", desc: "Calendar sync, SSO, directory", connected: true },
  { letter: "S", bg: "linear-gradient(135deg,#611f69,#e01e5a)", name: "Slack", desc: "Notifications, bot, channels", connected: true },
  { letter: "J", bg: "linear-gradient(135deg,#0052cc,#2684ff)", name: "Jira", desc: "Project tracking, issue sync", connected: false },
  { letter: "Z", bg: "linear-gradient(135deg,#7b68ee,#5b4ee8)", name: "Zoom", desc: "Video meetings, scheduling", connected: false },
  { letter: "M", bg: "linear-gradient(135deg,#00a4ef,#7fba00)", name: "Microsoft 365", desc: "Email, OneDrive, Teams", connected: true },
  { letter: "H", bg: "linear-gradient(135deg,#ff6c37,#ff4f00)", name: "HubSpot", desc: "CRM, recruiting pipeline", connected: false },
];

const invoices = [
  { month: "February 2026", billed: "Billed Feb 1, 2026", amount: "$12,103.00" },
  { month: "January 2026", billed: "Billed Jan 1, 2026", amount: "$11,515.00" },
  { month: "December 2025", billed: "Billed Dec 1, 2025", amount: "$11,270.00" },
];

const locations = [
  { flag: "\u{1F1F2}\u{1F1FE}", name: "Kuala Lumpur", sub: "HQ · 68 employees", badge: "Primary" },
  { flag: "\u{1F1F8}\u{1F1EC}", name: "Singapore", sub: "24 employees" },
  { flag: "\u{1F1EC}\u{1F1E7}", name: "London", sub: "42 employees" },
  { flag: "\u{1F1E9}\u{1F1EA}", name: "Berlin", sub: "36 employees" },
];

const accentColors = [
  { sc: "#a78bfa", title: "Violet" },
  { sc: "#06b6d4", title: "Cyan" },
  { sc: "#10b981", title: "Emerald" },
  { sc: "#f59e0b", title: "Amber" },
  { sc: "#ec4899", title: "Pink" },
  { sc: "#ef4444", title: "Red" },
  { sc: "#3b82f6", title: "Blue" },
];

const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
);

export default function SettingsClient() {
  const [activeTab, setActiveTab] = useState("profile");
  const [activeTheme, setActiveTheme] = useState("dark");
  const [activeColor, setActiveColor] = useState("#a78bfa");
  const [activeDensity, setActiveDensity] = useState("default");

  // Save button feedback
  const handleSave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const btn = e.currentTarget;
    const original = btn.textContent;
    btn.textContent = "Saved!";
    btn.style.background = "var(--success)";
    btn.style.boxShadow = "0 4px 16px rgba(16,185,129,0.3)";
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = "";
      btn.style.boxShadow = "";
    }, 1500);
  };

  return (
    <div className="st-layout">
      {/* Settings Nav */}
      <div className="st-nav">
        {navSections.map((sec) => (
          <div key={sec.label} className="st-nav-section">
            <span className="st-nav-label">{sec.label}</span>
            {sec.items.map((item) => (
              <button
                key={item.tab}
                className={`st-nav-item${activeTab === item.tab ? " active" : ""}`}
                onClick={() => setActiveTab(item.tab)}
              >
                {item.icon}
                {item.text}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Panels */}
      <div className="st-panels">
        {/* PROFILE */}
        <div className={`st-panel${activeTab === "profile" ? " active" : ""}`}>
          <div className="st-panel-header">
            <h2>Profile</h2>
            <p>Manage your personal information and preferences</p>
          </div>

          <div className="st-section">
            <div className="st-avatar-row">
              <div className="st-avatar-preview">
                <div className="st-big-avatar">AR</div>
                <button className="st-avatar-edit" title="Change avatar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>
                </button>
              </div>
              <div className="st-avatar-info">
                <strong>Ahmad Ramly</strong>
                <span>HR Manager · Kuala Lumpur, MY</span>
                <span className="st-member-since">Member since March 2023</span>
              </div>
            </div>
          </div>

          <div className="st-section">
            <h3 className="st-section-title">Personal Information</h3>
            <div className="st-form-grid">
              <div className="st-field"><label>First Name</label><input type="text" defaultValue="Ahmad" className="st-input" /></div>
              <div className="st-field"><label>Last Name</label><input type="text" defaultValue="Ramly" className="st-input" /></div>
              <div className="st-field">
                <label>Email Address</label>
                <div className="st-input-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                  <input type="email" defaultValue="ahmad.r@derivhr.com" className="st-input" />
                  <span className="st-verified">Verified</span>
                </div>
              </div>
              <div className="st-field"><label>Phone Number</label><input type="tel" defaultValue="+60 12-345-6789" className="st-input" /></div>
              <div className="st-field"><label>Job Title</label><input type="text" defaultValue="HR Manager" className="st-input" /></div>
              <div className="st-field">
                <label>Department</label>
                <div className="st-select-wrap">
                  <select className="st-select" defaultValue="HR & Legal">
                    <option>HR &amp; Legal</option><option>Engineering</option><option>Product</option><option>Design</option><option>Operations</option><option>Finance</option>
                  </select>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
              <div className="st-field full">
                <label>Bio</label>
                <textarea className="st-textarea" rows={3} defaultValue="HR Manager with 8+ years of experience in talent acquisition, employee relations, and compliance across APAC markets." />
              </div>
            </div>
            <div className="st-form-actions">
              <button className="btn-ghost-sm">Cancel</button>
              <button className="btn-primary-sm" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>

        {/* SECURITY */}
        <div className={`st-panel${activeTab === "security" ? " active" : ""}`}>
          <div className="st-panel-header">
            <h2>Security</h2>
            <p>Manage your password, sessions and two-factor authentication</p>
          </div>

          <div className="st-section">
            <h3 className="st-section-title">Change Password</h3>
            <div className="st-form-stack">
              <div className="st-field"><label>Current Password</label><input type="password" defaultValue="••••••••••" className="st-input" /></div>
              <div className="st-field"><label>New Password</label><input type="password" placeholder="Enter new password" className="st-input" /></div>
              <div className="st-field"><label>Confirm New Password</label><input type="password" placeholder="Confirm new password" className="st-input" /></div>
            </div>
            <div className="st-form-actions">
              <button className="btn-primary-sm" onClick={handleSave}>Update Password</button>
            </div>
          </div>

          <div className="st-section">
            <h3 className="st-section-title">Two-Factor Authentication</h3>
            <div className="st-toggle-row">
              <div className="st-toggle-info"><strong>Authenticator App</strong><span>Use an authenticator app to generate one-time codes</span></div>
              <label className="st-toggle"><input type="checkbox" defaultChecked /><span className="st-toggle-slider"></span></label>
            </div>
            <div className="st-toggle-row">
              <div className="st-toggle-info"><strong>SMS Verification</strong><span>Receive verification codes via SMS</span></div>
              <label className="st-toggle"><input type="checkbox" /><span className="st-toggle-slider"></span></label>
            </div>
          </div>

          <div className="st-section">
            <h3 className="st-section-title">Active Sessions</h3>
            <div className="st-session-list">
              <div className="st-session current">
                <div className="st-session-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg></div>
                <div className="st-session-info"><strong>Windows · Chrome</strong><span>Kuala Lumpur, MY · Current session</span></div>
                <span className="st-session-badge current">This Device</span>
              </div>
              <div className="st-session">
                <div className="st-session-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg></div>
                <div className="st-session-info"><strong>iPhone 15 · Safari</strong><span>Kuala Lumpur, MY · 2 hours ago</span></div>
                <button className="st-session-revoke">Revoke</button>
              </div>
            </div>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        <div className={`st-panel${activeTab === "notifications" ? " active" : ""}`}>
          <div className="st-panel-header">
            <h2>Notifications</h2>
            <p>Choose what notifications you receive and how</p>
          </div>

          <div className="st-section">
            <h3 className="st-section-title">Email Notifications</h3>
            {[
              { title: "Contract Updates", desc: "When contracts are signed, pending, or expire", on: true },
              { title: "Compliance Alerts", desc: "Critical and warning compliance notifications", on: true },
              { title: "New Employee Onboarding", desc: "When new hires complete onboarding milestones", on: true },
              { title: "Weekly Digest", desc: "Summary of HR activity every Monday morning", on: false },
            ].map((n) => (
              <div key={n.title} className="st-toggle-row">
                <div className="st-toggle-info"><strong>{n.title}</strong><span>{n.desc}</span></div>
                <label className="st-toggle"><input type="checkbox" defaultChecked={n.on} /><span className="st-toggle-slider"></span></label>
              </div>
            ))}
          </div>

          <div className="st-section">
            <h3 className="st-section-title">Push Notifications</h3>
            {[
              { title: "Desktop Notifications", desc: "Show notifications in your system tray", on: true },
              { title: "Sound Alerts", desc: "Play a sound for incoming notifications", on: false },
            ].map((n) => (
              <div key={n.title} className="st-toggle-row">
                <div className="st-toggle-info"><strong>{n.title}</strong><span>{n.desc}</span></div>
                <label className="st-toggle"><input type="checkbox" defaultChecked={n.on} /><span className="st-toggle-slider"></span></label>
              </div>
            ))}
          </div>
        </div>

        {/* ORGANIZATION */}
        <div className={`st-panel${activeTab === "organization" ? " active" : ""}`}>
          <div className="st-panel-header">
            <h2>Organization</h2>
            <p>Manage your company settings and team structure</p>
          </div>

          <div className="st-section">
            <h3 className="st-section-title">Company Details</h3>
            <div className="st-form-grid">
              <div className="st-field"><label>Company Name</label><input type="text" defaultValue="Deriv Group" className="st-input" /></div>
              <div className="st-field">
                <label>Industry</label>
                <div className="st-select-wrap">
                  <select className="st-select" defaultValue="Financial Technology"><option>Financial Technology</option><option>Technology</option><option>Healthcare</option><option>Education</option></select>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
              <div className="st-field"><label>Headquarters</label><input type="text" defaultValue="Kuala Lumpur, Malaysia" className="st-input" /></div>
              <div className="st-field">
                <label>Company Size</label>
                <div className="st-select-wrap">
                  <select className="st-select" defaultValue="201–500"><option>1–50</option><option>51–200</option><option>201–500</option><option>501–1000</option><option>1000+</option></select>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                </div>
              </div>
            </div>
            <div className="st-form-actions">
              <button className="btn-ghost-sm">Cancel</button>
              <button className="btn-primary-sm" onClick={handleSave}>Save Changes</button>
            </div>
          </div>

          <div className="st-section">
            <h3 className="st-section-title">Office Locations</h3>
            <div className="st-location-list">
              {locations.map((loc) => (
                <div key={loc.name} className="st-location">
                  <span className="st-loc-flag">{loc.flag}</span>
                  <div className="st-loc-info"><strong>{loc.name}</strong><span>{loc.sub}</span></div>
                  {loc.badge && <span className="st-loc-badge primary">{loc.badge}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* INTEGRATIONS */}
        <div className={`st-panel${activeTab === "integrations" ? " active" : ""}`}>
          <div className="st-panel-header">
            <h2>Integrations</h2>
            <p>Connect third-party tools and services</p>
          </div>

          <div className="st-section">
            <div className="st-integrations-grid">
              {integrations.map((intg) => (
                <div key={intg.name} className={`st-intg${intg.connected ? " connected" : ""}`}>
                  <div className="st-intg-top">
                    <div className="st-intg-logo" style={{ background: intg.bg }}>{intg.letter}</div>
                    <span className={`st-intg-status${intg.connected ? " connected" : ""}`}>{intg.connected ? "Connected" : "Not Connected"}</span>
                  </div>
                  <strong>{intg.name}</strong>
                  <span>{intg.desc}</span>
                  <button className={`st-intg-btn${intg.connected ? " connected" : ""}`}>{intg.connected ? "Configure" : "Connect"}</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BILLING */}
        <div className={`st-panel${activeTab === "billing" ? " active" : ""}`}>
          <div className="st-panel-header">
            <h2>Billing</h2>
            <p>Manage your subscription plan and payment methods</p>
          </div>

          <div className="st-section">
            <div className="st-plan-card">
              <div className="st-plan-mesh"></div>
              <div className="st-plan-content">
                <div className="st-plan-info">
                  <span className="st-plan-badge">Current Plan</span>
                  <h3>Enterprise</h3>
                  <p>Unlimited employees · All features · Priority support</p>
                </div>
                <div className="st-plan-price">
                  <span className="st-plan-amount">$49</span>
                  <span className="st-plan-period">/ employee / month</span>
                </div>
              </div>
              <div className="st-plan-usage">
                <div className="st-plan-usage-item">
                  <span>Seats Used</span>
                  <div className="st-plan-bar"><div className="st-plan-fill" style={{ "--pw": "82%" } as React.CSSProperties}></div></div>
                  <strong>247 / 300</strong>
                </div>
                <div className="st-plan-usage-item">
                  <span>Storage</span>
                  <div className="st-plan-bar"><div className="st-plan-fill" style={{ "--pw": "45%" } as React.CSSProperties}></div></div>
                  <strong>4.5 / 10 GB</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="st-section">
            <h3 className="st-section-title">Payment Method</h3>
            <div className="st-payment-card">
              <div className="st-cc-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
              </div>
              <div className="st-cc-info"><strong>&bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 4289</strong><span>Visa · Expires 09/2027</span></div>
              <button className="st-cc-edit">Update</button>
            </div>
          </div>

          <div className="st-section">
            <h3 className="st-section-title">Recent Invoices</h3>
            <div className="st-invoice-list">
              {invoices.map((inv) => (
                <div key={inv.month} className="st-invoice">
                  <div className="st-inv-info"><strong>{inv.month}</strong><span>{inv.billed}</span></div>
                  <span className="st-inv-amount">{inv.amount}</span>
                  <span className="st-inv-status paid">Paid</span>
                  <button className="st-inv-dl" title="Download"><DownloadIcon /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* APPEARANCE */}
        <div className={`st-panel${activeTab === "appearance" ? " active" : ""}`}>
          <div className="st-panel-header">
            <h2>Appearance</h2>
            <p>Customize the look and feel of your workspace</p>
          </div>

          <div className="st-section">
            <h3 className="st-section-title">Theme</h3>
            <div className="st-theme-grid">
              {["dark", "light", "system"].map((t) => (
                <div key={t} className={`st-theme${activeTheme === t ? " active" : ""}`} onClick={() => setActiveTheme(t)}>
                  <div className={`st-theme-preview ${t}`}>
                    <div className="st-tp-sidebar"></div>
                    <div className="st-tp-content">
                      <div className="st-tp-bar"></div>
                      <div className="st-tp-blocks"><div></div><div></div><div></div></div>
                    </div>
                  </div>
                  <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="st-section">
            <h3 className="st-section-title">Accent Color</h3>
            <div className="st-color-row">
              {accentColors.map((c) => (
                <button
                  key={c.sc}
                  className={`st-color${activeColor === c.sc ? " active" : ""}`}
                  style={{ "--sc": c.sc } as React.CSSProperties}
                  title={c.title}
                  onClick={() => setActiveColor(c.sc)}
                />
              ))}
            </div>
          </div>

          <div className="st-section">
            <h3 className="st-section-title">Density</h3>
            <div className="st-density-row">
              {["compact", "default", "spacious"].map((d) => (
                <button key={d} className={`st-density-btn${activeDensity === d ? " active" : ""}`} onClick={() => setActiveDensity(d)}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
