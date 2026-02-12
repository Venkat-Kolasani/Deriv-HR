"use client";

import { useEffect, useState } from "react";
import { fbGet } from "@/app/lib/firebase";
import type { Employee } from "@/app/lib/firebase";
import PeopleClient from "./PeopleClient";

export default function PeoplePage() {
  const [data, setData] = useState<{
    employees: Employee[];
    company: any;
  } | null>(null);

  useEffect(() => {
    Promise.all([
      fbGet<Record<string, Employee>>("employees"),
      fbGet<any>("company"),
    ]).then(([employees, company]) => {
      setData({
        employees: employees ? Object.values(employees) : [],
        company,
      });
    });
  }, []);

  if (!data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-muted)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 120, height: 3, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden", margin: "0 auto 12px" }}>
            <div style={{ width: "40%", height: "100%", background: "var(--accent)", borderRadius: 4, animation: "shimmer 1.2s ease infinite" }} />
          </div>
          <span style={{ fontSize: 13 }}>Loading people…</span>
        </div>
      </div>
    );
  }

  return (
    <PeopleClient
      employees={data.employees}
      company={data.company}
    />
  );
}
