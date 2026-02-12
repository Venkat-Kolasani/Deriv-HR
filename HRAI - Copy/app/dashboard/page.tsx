"use client";

import { useEffect, useState } from "react";
import { fbGet } from "@/app/lib/firebase";
import type { Alert, MorningBriefing, ActivityLogEntry } from "@/app/lib/firebase";
import DashboardClient from "./DashboardClient";

export default function DashboardPage() {
  const [data, setData] = useState<{
    alerts: Alert[];
    briefing: MorningBriefing | null;
    kpis: Record<string, any> | null;
    activityLog: ActivityLogEntry[];
    company: any;
  } | null>(null);

  useEffect(() => {
    Promise.all([
      fbGet<Alert[]>("alerts"),
      fbGet<MorningBriefing>("morningBriefing"),
      fbGet<Record<string, any>>("dashboardKPIs"),
      fbGet<ActivityLogEntry[]>("activityLog"),
      fbGet<any>("company"),
    ]).then(([alerts, briefing, kpis, activityLog, company]) => {
      setData({
        alerts: alerts || [],
        briefing,
        kpis,
        activityLog: activityLog || [],
        company,
      });
    });
  }, []);

  if (!data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-muted)" }}>
        <div style={{ textAlign: "center" }}>
          <div className="loader-bar" style={{ width: 120, height: 3, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden", margin: "0 auto 12px" }}>
            <div style={{ width: "40%", height: "100%", background: "var(--accent)", borderRadius: 4, animation: "shimmer 1.2s ease infinite" }} />
          </div>
          <span style={{ fontSize: 13 }}>Loading dashboard…</span>
        </div>
      </div>
    );
  }

  return (
    <DashboardClient
      alerts={data.alerts}
      briefing={data.briefing!}
      kpis={data.kpis!}
      activityLog={data.activityLog}
      company={data.company}
    />
  );
}
