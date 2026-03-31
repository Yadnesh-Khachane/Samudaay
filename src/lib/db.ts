// ─── Samudaay Central Database v2 ────────────────────────────────────────────
// Persistent localStorage-backed store. Soft deletes. Full investment flow.

import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DocFile = {
  id: string; name: string; type: string; size: number;
  uploadedAt: string; base64?: string;
};

export type Vendor = {
  id: number; name: string; owner: string; email: string; phone: string;
  category: string; location: string; status: string;
  goal: number; raised: number; returns: string; tenure: string;
  investors: number; description: string; gstNumber: string;
  bankAccount: string; joinedDate: string; documents: DocFile[];
  is_active: boolean; deleted_at?: string;
  minInvest: number; maxInvest: number; rating: number;
  walletBalance: number;
  updates: { id: string; title: string; content: string; date: string }[];
  milestones: { id: string; title: string; status: "Completed" | "In-Progress" | "Upcoming" }[];
  team: { id: string; name: string; role: string; avatar?: string }[];
};

export type Investor = {
  id: number; name: string; email: string; phone: string; location: string;
  totalInvested: number; totalReturns: number; portfolio: number;
  status: string; joined: string; plan: string; panNumber: string;
  bankAccount: string; kycStatus: string; documents: DocFile[];
  is_active: boolean; deleted_at?: string;
};

export type Investment = {
  id: string; investorId: number; vendorId: number;
  amount: number; txnId: string; paymentMethod: string;
  date: string; status: string; returnsEarned: number;
  nextPayout: string; tenureMonths: number; completedMonths: number;
};

export type Transaction = {
  id: string; investorId: number; vendorId: number; vendorName: string;
  type: "Investment" | "Return" | "Refund";
  amount: number; date: string; status: string; txnId: string;
  paymentMethod?: string;
};

export type JobSeeker = {
  id: number; name: string; email: string; phone: string; location: string;
  skills: string; experience: string; status: string;
  appliedJobs: number; joinedDate: string; currentRole: string;
  education: string; documents: DocFile[];
  is_active: boolean; deleted_at?: string;
};

export type JobApplication = {
  id: string; jobSeekerId: number; jobId: number;
  jobTitle: string; businessName: string;
  appliedDate: string; status: string; interviewDate?: string;
  coverLetter?: string;
};

export type Job = {
  id: number; title: string; business: string; vendorId?: number;
  type: string; salary: string; location: string; posted: string;
  apps: number; status: string; desc: string; requirements: string;
  deadline?: string; is_active: boolean; deleted_at?: string;
};

export type SupportTicket = {
  id: string; user: string; role: string; issue: string; priority: string;
  status: string; date: string;
  replies: { text: string; author: string; time: string }[];
  assignedTo: string; is_active: boolean; deleted_at?: string;
};

export type TeamMember = {
  id: number; name: string; role: string; email: string; phone: string;
  dept: string; status: string; joined: string; permissions: string[];
  is_active: boolean; deleted_at?: string;
};

export type SubscriptionPlan = {
  id: number; name: string; price: string; billingCycle: string;
  features: string[]; active: boolean; subscriberCount: number;
};

export type Notification = {
  id: string; userId: number; userType: string;
  title: string; message: string; type: string;
  read: boolean; date: string;
};

export type DB = {
  vendors: Vendor[]; investors: Investor[]; investments: Investment[];
  transactions: Transaction[]; jobSeekers: JobSeeker[];
  jobApplications: JobApplication[]; jobs: Job[];
  tickets: SupportTicket[]; team: TeamMember[];
  plans: SubscriptionPlan[]; notifications: Notification[];
  lastUpdated: string;
};

// ─── Seed Data Generator ──────────────────────────────────────────────────────

function generateSeedData(): DB {
  // Use a fixed seed-like approach but slightly varied
  const vendors: Vendor[] = [];
  const investors: Investor[] = [];
  const jobs: Job[] = [];
  const jobSeekers: JobSeeker[] = [];
  const jobApplications: JobApplication[] = [];
  const investments: Investment[] = [];
  const transactions: Transaction[] = [];
  const notifications: Notification[] = [];
  const team: TeamMember[] = [];
  const plans: SubscriptionPlan[] = [];

  const locations = ["Andheri West", "Bandra East", "Worli", "Juhu", "Dadar", "Powai", "Kurla", "Bandra West", "Colaba", "Malad"];
  const categories = ["Food", "Retail", "Services", "Beauty", "Manufacturing", "Tech"];
  const names = ["Amit", "Ravi", "Priya", "Sneha", "Rahul", "Anita", "Suresh", "Meena", "Vikram", "Sunita", "Arjun", "Kavya", "Deepak", "Ritu", "Sanjay", "Anjali"];

  // 1. Generate 100 Vendors
  for (let i = 1; i <= 100; i++) {
    const cat = categories[i % categories.length];
    const loc = locations[i % locations.length];
    const name = names[i % names.length] + " " + names[(i+2) % names.length];
    const bName = ["Urban", "Green", "Fresh", "Elite", "Smart", "Direct", "Royal", "Global", "Eco", "Pro"][i % 10] + " " + ["Foods", "Services", "Mart", "Labs", "Garage", "Studio", "Bakery", "Pharma", "Saloons", "Center"][i % 10];
    const goal = 300000 + (i * 15000);
    const raised = Math.floor(Math.random() * goal * 0.85);
    vendors.push({
      id: i, name: bName, owner: name, email: `${bName.toLowerCase().replace(" ","")}@local.com`,
      phone: `+91 98765 ${20000 + i}`, category: cat, location: loc, status: "Verified",
      goal, raised, returns: `${10+ (i % 6)}%`, tenure: `${12 + (i % 4) * 6} mo`,
      investors: Math.floor(i * 1.8), description: `Premium ${cat} services in ${loc}. Join our journey of growth.`,
      gstNumber: `27AAPCA${2000 + i}A1Z5`, bankAccount: `BANK-${10000000 + i}`,
      joinedDate: "Feb 2024", documents: [], is_active: true, minInvest: 5000, maxInvest: goal/3, 
      rating: parseFloat((3.8 + (i % 12)/10).toFixed(1)), walletBalance: 25000, updates: [], milestones: [], team: []
    });
  }

  // 2. Generate 150 Jobs
  for (let i = 1; i <= 150; i++) {
    const v = vendors[i % vendors.length];
    jobs.push({
      id: i, title: ["Store Manager", "Sales Associate", "Technician", "Graphic Designer", "Marketing Lead", "Accounts Clerk", "Chef", "Security Guard", "Driver", "Admin"][i % 10],
      business: v.name, vendorId: v.id, type: i % 3 === 0 ? "Part-time" : "Full-time",
      salary: `₹${15+ (i%15)},000–₹${30+(i%20)},000`, location: v.location, posted: "Mar " + ((i % 25) + 1),
      apps: Math.floor(Math.random() * 40 + 5), status: "Active", desc: `Exciting opening at ${v.name}. Looking for energetic candidates.`,
      requirements: "Minimum 1 year experience required. High school graduate or above.", is_active: true, deadline: "May 2026"
    });
  }

  // 3. Generate 100 Investors
  for (let i = 1; i <= 100; i++) {
    const n = names[i % names.length] + " " + names[(i+5) % names.length];
    investors.push({
      id: i, name: n, email: `${n.toLowerCase().replace(" ",".")}@wealth.com`,
      phone: `+91 91000 ${50000 + i}`, location: locations[i % locations.length],
      totalInvested: 0, totalReturns: 0, portfolio: 0, status: "Active", joined: "Nov 2024",
      plan: i % 4 === 0 ? "Premium" : "Basic", panNumber: `PAN${10000 + i}K`,
      bankAccount: `HDFC-${800000 + i}`, kycStatus: "Verified", documents: [], is_active: true
    });
  }

  // 4. Generate 200 Job Seekers
  for (let i = 1; i <= 200; i++) {
    const n = names[i % names.length] + " " + names[(i+3) % names.length];
    jobSeekers.push({
      id: i, name: n, email: `${n.toLowerCase().replace(" ",".")}@career.com`,
      phone: `+91 88000 ${60000 + i}`, location: locations[i % locations.length],
      skills: "Retail, Customer Service, Inventory Management, POS",
      experience: `${i % 5} years`, status: "Active",
      appliedJobs: 0, joinedDate: "Jan 2024",
      currentRole: i % 2 === 0 ? "Seeking Associate Role" : "Looking for Store Manager",
      education: i % 3 === 0 ? "Graduate" : "High School", documents: [], is_active: true
    });
  }

  // 5. Generate 300 Job Applications
  for (let i = 1; i <= 300; i++) {
    const j = jobs[i % jobs.length];
    const s = jobSeekers[i % jobSeekers.length];
    if (!j || !s) continue;
    jobApplications.push({
      id: `app_${i}`, jobSeekerId: s.id, jobId: j.id,
      jobTitle: j.title, businessName: j.business,
      appliedDate: "Mar " + ((i % 28) + 1),
      status: ["Under Review", "Interview Scheduled", "Shortlisted", "Rejected"][i % 4],
      interviewDate: i % 4 === 1 ? "Apr " + ((i % 10) + 1) + ", 2025" : undefined,
    });
    s.appliedJobs++;
    j.apps++;
  }

  // 6. Generate some fixed team members & plans
  team.push({ id: 1, name: "Aditya Kapoor", role: "CEO", email: "aditya@samudaay.com", phone: "+91 98765 90001", dept: "Leadership", status: "Active", joined: "Jan 2024", permissions: ["ALL"], is_active: true });
  plans.push({ id: 1, name: "Pro Plan", price: "499", billingCycle: "monthly", features: ["Priority Support", "Featured Listing"], active: true, subscriberCount: 420 });

  return {
    vendors, investors, investments: [], transactions: [],
    jobSeekers, jobApplications, jobs, tickets: [],
    team, plans, notifications: [], lastUpdated: new Date().toISOString()
  };
}

const seedDB: DB = generateSeedData();

// ─── Storage ──────────────────────────────────────────────────────────────────

const DB_KEY = "samudaay_db_v2";

export function loadDB(): DB {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw || raw === "undefined" || raw === "null") return { ...seedDB, lastUpdated: new Date().toISOString() };
    
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...seedDB, lastUpdated: new Date().toISOString() };
    
    // Robust migration: Ensure all collections exist and are arrays where expected
    const ensureArr = (val: any, fallback: any[]) => Array.isArray(val) ? val : fallback;
    
    return {
      ...seedDB,
      ...parsed,
      investments: ensureArr(parsed.investments, seedDB.investments),
      transactions: ensureArr(parsed.transactions, seedDB.transactions),
      jobApplications: ensureArr(parsed.jobApplications, seedDB.jobApplications),
      notifications: ensureArr(parsed.notifications, seedDB.notifications),
      jobs: ensureArr(parsed.jobs, seedDB.jobs),
      jobSeekers: ensureArr(parsed.jobSeekers, seedDB.jobSeekers),
      vendors: ensureArr(parsed.vendors, seedDB.vendors),
      investors: ensureArr(parsed.investors, seedDB.investors),
      team: ensureArr(parsed.team, seedDB.team),
      tickets: ensureArr(parsed.tickets, seedDB.tickets),
      plans: ensureArr(parsed.plans, seedDB.plans),
      lastUpdated: parsed.lastUpdated || new Date().toISOString(),
    };
  } catch (e) {
    console.error("Failed to load DB", e);
    return { ...seedDB, lastUpdated: new Date().toISOString() };
  }
}

export function saveDB(db: DB): void {
  try {
    db.lastUpdated = new Date().toISOString();
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    window.dispatchEvent(new CustomEvent("samudaay_db_updated", { detail: db }));
  } catch (e) { console.error("DB save failed", e); }
}

export function resetDB(): DB {
  localStorage.removeItem(DB_KEY);
  const fresh = { ...seedDB, lastUpdated: new Date().toISOString() };
  localStorage.setItem(DB_KEY, JSON.stringify(fresh));
  return fresh;
}

export function useDB() {
  const [db, setDBState] = useState<DB>(() => loadDB());
  useEffect(() => {
    const handler = (e: Event) => setDBState((e as CustomEvent<DB>).detail);
    window.addEventListener("samudaay_db_updated", handler);
    return () => window.removeEventListener("samudaay_db_updated", handler);
  }, []);
  const setDB = useCallback((updater: DB | ((prev: DB) => DB)) => {
    setDBState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveDB(next);
      return next;
    });
  }, []);
  return [db, setDB] as const;
}

export function softDelete<T extends { is_active: boolean; deleted_at?: string }>(item: T): T {
  return { ...item, is_active: false, deleted_at: new Date().toISOString() };
}
export function genId(arr: { id: number }[]): number {
  return arr.length === 0 ? 1 : Math.max(...arr.map(x => x.id)) + 1;
}
export function genTicketId(arr: { id: string }[]): string {
  const nums = arr.map(t => parseInt(t.id.replace("#",""))).filter(n => !isNaN(n));
  return "#" + (Math.max(...nums, 1000) + 1);
}
export function formatINR(n: number): string {
  if (n >= 10000000) return `₹${(n/10000000).toFixed(2)}Cr`;
  if (n >= 100000)   return `₹${(n/100000).toFixed(1)}L`;
  const s = Math.round(n).toString();
  if (s.length <= 3) return `₹${s}`;
  if (s.length === 4) return `₹${s[0]},${s.slice(1)}`;
  if (s.length === 5) return `₹${s.slice(0,2)},${s.slice(2)}`;
  if (s.length === 6) return `₹${s.slice(0,3)},${s.slice(3)}`;
  return `₹${n}`;
}
export function addNotification(db: DB, notification: Omit<Notification,"id">): DB {
  return { ...db, notifications: [{ id:`notif_${Date.now()}`, ...notification }, ...db.notifications] };
}

export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(obj => Object.values(obj).map(val => 
    typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
  ).join(","));
  const csv = [headers, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  alert("Success: Your data has been exported to CSV. Please check your downloads folder.");
}
