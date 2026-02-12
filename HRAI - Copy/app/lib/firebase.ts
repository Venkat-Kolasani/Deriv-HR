const FIREBASE_URL =
  "https://hrai-bd891-default-rtdb.asia-southeast1.firebasedatabase.app";

export async function fbGet<T = any>(path: string): Promise<T> {
  const res = await fetch(`${FIREBASE_URL}/${path}.json`);
  if (!res.ok) throw new Error(`Firebase GET /${path} failed: ${res.status}`);
  return res.json();
}

export async function fbSet(path: string, data: any) {
  const res = await fetch(`${FIREBASE_URL}/${path}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Firebase PUT /${path} failed: ${res.status}`);
  return res.json();
}

/* ── Type helpers ── */

export interface Employee {
  id: string;
  initials: string;
  name: string;
  email: string;
  role: string;
  dept: string;
  location: string;
  office: string;
  joined: string;
  status: string;
  avatar: string;
  salary: number;
  currency: string;
  contractType: string;
  probationEnd?: string;
  manager?: string | null;
  phone: string;
  nationality: string;
  workPermit?: {
    type: string;
    number: string;
    issueDate: string;
    expiryDate: string;
    status: string;
    renewalApplicationDate: string | null;
    renewalStatus: string | null;
    sponsorEntity: string;
  };
  leaveBalance: { annual: number; sick: number; used: number };
}

export interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  category: string;
  icon: string;
  title: string;
  summary: string;
  employee: string;
  employeeId: string | null;
  role: string;
  department: string;
  location: string;
  deadline: string;
  daysLeft: number;
  deepLink: string;
  action: string;
  dismissed: boolean;
  createdAt: string;
}

export interface MorningBriefing {
  date: string;
  greeting: string;
  summary: string;
  stats: {
    pendingContracts: number;
    expiringVisas: number;
    complianceAlerts: number;
    newHiresThisWeek: number;
    leaveRequestsPending: number;
  };
  aiInsight: string;
  generatedAt: string;
}

export interface DashboardKPI {
  value: number;
  change: number;
  period: string;
  unit?: string;
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  description: string;
  user: string;
  timestamp: string;
  page: string;
}

export interface FirebaseData {
  appConfig: any;
  currentUser: any;
  company: any;
  employees: Record<string, Employee>;
  contracts: Record<string, any>;
  alerts: Alert[];
  morningBriefing: MorningBriefing;
  dashboardKPIs: Record<string, DashboardKPI>;
  compliance: any;
  contractGenerator: any;
  chatAssistant: any;
  notifications: any[];
  calendarEvents: any[];
  activityLog: ActivityLogEntry[];
}

export async function getFullData(): Promise<FirebaseData> {
  return fbGet<FirebaseData>("");
}
