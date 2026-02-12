import Link from "next/link";

export default function NotFound() {
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
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
          <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2.5" />
          <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2.5" />
        </svg>
      </div>
      <h1
        style={{
          fontFamily: "'Sora', 'Inter', sans-serif",
          fontSize: 72,
          fontWeight: 800,
          letterSpacing: -3,
          margin: 0,
          background: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1,
        }}
      >
        404
      </h1>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 600,
          margin: "12px 0 8px",
          color: "#f0f0f5",
        }}
      >
        Page not found
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "#a0a0b8",
          maxWidth: 400,
          lineHeight: 1.6,
          margin: "0 0 32px",
        }}
      >
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Let&apos;s get you back on track.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <Link
          href="/dashboard"
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
            textDecoration: "none",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
          Go to Dashboard
        </Link>
        <Link
          href="/landing"
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
            transition: "border-color 0.2s",
          }}
        >
          Home
        </Link>
      </div>
    </div>
  );
}
