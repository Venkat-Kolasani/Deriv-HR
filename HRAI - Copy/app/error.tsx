"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#08080c",
        color: "#f0f0f5",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        textAlign: "center",
        padding: "24px",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      <h1
        style={{
          fontFamily: "'Sora', 'Inter', sans-serif",
          fontSize: 48,
          fontWeight: 800,
          letterSpacing: -2,
          margin: 0,
          color: "#ef4444",
          lineHeight: 1,
        }}
      >
        Something went wrong
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "#a0a0b8",
          maxWidth: 400,
          lineHeight: 1.6,
          margin: "16px 0 32px",
        }}
      >
        An unexpected error occurred. Please try again or return to the dashboard.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={reset}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            background: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
            color: "#fff",
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 14,
            border: "none",
            cursor: "pointer",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Try Again
        </button>
        <a
          href="/dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#f0f0f5",
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Dashboard
        </a>
      </div>
    </div>
  );
}
