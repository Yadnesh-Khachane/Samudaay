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

// ─── Seed Data ────────────────────────────────────────────────────────────────

const seedDB: DB = {
  lastUpdated: new Date().toISOString(),
  vendors: [
    { id:1, name:"Fresh Farms Dairy", owner:"Amit Patel", email:"amit@freshfarms.com", phone:"+91 98765 11111", category:"Food", location:"Andheri West", status:"Verified", goal:1200000, raised:850000, returns:"10%", tenure:"12 mo", investors:42, description:"Premium dairy products supplier serving 200+ households in Andheri West. We source directly from farms in Nashik, ensuring freshness. Our unique subscription model gives investors steady monthly returns backed by a solid customer base.", gstNumber:"27AAPCA1234A1Z5", bankAccount:"HDFC-0012345678", joinedDate:"Oct 2024", documents:[], is_active:true, minInvest:5000, maxInvest:200000, rating:4.8, walletBalance: 125000, updates: [], milestones: [], team: [] },
    { id:2, name:"AutoCare Plus", owner:"Suresh Nair", email:"suresh@autocare.com", phone:"+91 98765 22222", category:"Services", location:"Bandra East", status:"Verified", goal:800000, raised:620000, returns:"12%", tenure:"24 mo", investors:38, description:"Multi-brand car service center with 15 years of experience. We handle 80+ vehicles daily with a loyal customer base of 2,000+ members in Bandra. Consistent returns backed by long-term service contracts.", gstNumber:"27BBNCA5678B2Z6", bankAccount:"SBI-0098765432", joinedDate:"Nov 2024", documents:[], is_active:true, minInvest:10000, maxInvest:300000, rating:4.6, walletBalance: 45000, updates: [], milestones: [], team: [] },
    { id:3, name:"Green Leaf Organics", owner:"Priya Sharma", email:"priya@greenleaf.com", phone:"+91 98765 33333", category:"Food", location:"Worli", status:"Verified", goal:700000, raised:490000, returns:"13%", tenure:"36 mo", investors:28, description:"Certified organic produce farm-to-table delivery service partnering with 15 organic farms across Maharashtra. Our 13% returns over 36 months are ideal for long-term investors.", gstNumber:"27CGNCA9012C3Z7", bankAccount:"KOTAK-0065432109", joinedDate:"Dec 2024", documents:[], is_active:true, minInvest:10000, maxInvest:500000, rating:4.5, walletBalance: 82000, updates: [], milestones: [], team: [] },
    { id:4, name:"Bloom Beauty Studio", owner:"Anita Roy", email:"anita@bloom.com", phone:"+91 98765 44444", category:"Beauty", location:"Juhu", status:"Pending", goal:300000, raised:0, returns:"8%", tenure:"6 mo", investors:0, description:"Full-service beauty salon specializing in bridal packages and skincare in premium Juhu area. Short 6-month tenure perfect for risk-averse investors seeking quick returns.", gstNumber:"", bankAccount:"", joinedDate:"Mar 2025", documents:[], is_active:true, minInvest:5000, maxInvest:100000, rating:4.9, walletBalance: 0, updates: [], milestones: [], team: [] },
    { id:5, name:"Silk & Thread", owner:"Meena Kumari", email:"meena@silkthread.com", phone:"+91 98765 55555", category:"Retail", location:"Dadar", status:"Verified", goal:600000, raised:540000, returns:"11%", tenure:"18 mo", investors:31, description:"Traditional silk saree boutique with pan-India delivery and 25 years of craftsmanship. Near-fully funded with only ₹60K remaining — act fast.", gstNumber:"27CCMKA9012C3Z7", bankAccount:"AXIS-0087654321", joinedDate:"Sep 2024", documents:[], is_active:true, minInvest:5000, maxInvest:150000, rating:4.7, walletBalance: 12000, updates: [], milestones: [], team: [] },
    { id:6, name:"TechFix Solutions", owner:"Rahul Mehta", email:"rahul@techfix.com", phone:"+91 98765 66666", category:"Services", location:"Powai", status:"Verified", goal:400000, raised:80000, returns:"9%", tenure:"12 mo", investors:8, description:"Same-day laptop and mobile repair with doorstep service. Serving Powai's large tech-worker population with 500+ monthly customers and growing.", gstNumber:"27DDRMA3456D4Z8", bankAccount:"ICICI-0076543210", joinedDate:"Jan 2025", documents:[], is_active:true, minInvest:5000, maxInvest:100000, rating:4.3, walletBalance: 5000, updates: [], milestones: [], team: [] },
    { id:7, name:"Digital Print Hub", owner:"Kavya Iyer", email:"kavya@dprint.com", phone:"+91 98765 77777", category:"Manufacturing", location:"Kurla", status:"Suspended", goal:500000, raised:120000, returns:"9%", tenure:"12 mo", investors:12, description:"Large-format printing and branding solutions for SMEs.", gstNumber:"27DDKIA3456D4Z8", bankAccount:"ICICI-0076543210", joinedDate:"Aug 2024", documents:[], is_active:true, minInvest:5000, maxInvest:100000, rating:3.8, walletBalance: 0, updates: [], milestones: [], team: [] },
  ],
  investors: [
    { id:1, name:"Ravi Kumar", email:"investor@samudaay.com", phone:"+91 98765 10001", location:"Mumbai", totalInvested:245000, totalReturns:18340, portfolio:3, status:"Active", joined:"Nov 2024", plan:"Premium", panNumber:"ABCPK1234K", bankAccount:"HDFC-001122334", kycStatus:"Verified", documents:[], is_active:true },
    { id:2, name:"Sunita Verma", email:"sunita@email.com", phone:"+91 98765 10002", location:"Pune", totalInvested:180000, totalReturns:14200, portfolio:3, status:"Active", joined:"Jan 2025", plan:"Basic", panNumber:"DEFPL5678L", bankAccount:"SBI-005566778", kycStatus:"Verified", documents:[], is_active:true },
    { id:3, name:"Arjun Singh", email:"arjun@email.com", phone:"+91 98765 10003", location:"Delhi", totalInvested:500000, totalReturns:42500, portfolio:7, status:"Active", joined:"Oct 2024", plan:"Premium", panNumber:"GHIPS9012M", bankAccount:"KOTAK-009988776", kycStatus:"Verified", documents:[], is_active:true },
    { id:4, name:"Meera Nair", email:"meera@email.com", phone:"+91 98765 10004", location:"Bangalore", totalInvested:75000, totalReturns:4800, portfolio:2, status:"Active", joined:"Feb 2025", plan:"Basic", panNumber:"JKLQN3456N", bankAccount:"YES-003344556", kycStatus:"Pending", documents:[], is_active:true },
    { id:5, name:"Vikram Shah", email:"vikram@email.com", phone:"+91 98765 10005", location:"Ahmedabad", totalInvested:320000, totalReturns:28000, portfolio:5, status:"Suspended", joined:"Sep 2024", plan:"Premium", panNumber:"MNOPR7890O", bankAccount:"AXIS-007788990", kycStatus:"Verified", documents:[], is_active:true },
  ],
  investments: [
    { id:"inv_001", investorId:1, vendorId:1, amount:50000, txnId:"TXN-10234567", paymentMethod:"UPI (ravi@hdfc)", date:"Jan 12, 2025", status:"Active", returnsEarned:4167, nextPayout:"Apr 1, 2026", tenureMonths:12, completedMonths:3 },
    { id:"inv_002", investorId:1, vendorId:2, amount:100000, txnId:"TXN-10234890", paymentMethod:"Card (****4321)", date:"Mar 3, 2025", status:"Active", returnsEarned:6000, nextPayout:"Apr 5, 2026", tenureMonths:24, completedMonths:1 },
    { id:"inv_003", investorId:1, vendorId:5, amount:95000, txnId:"TXN-10234912", paymentMethod:"UPI (ravi@hdfc)", date:"Feb 10, 2025", status:"Active", returnsEarned:8710, nextPayout:"Apr 10, 2026", tenureMonths:18, completedMonths:2 },
  ],
  transactions: [
    { id:"txn_001", investorId:1, vendorId:1, vendorName:"Fresh Farms Dairy", type:"Investment", amount:50000, date:"Jan 12, 2025", status:"Success", txnId:"TXN-10234567", paymentMethod:"UPI" },
    { id:"txn_002", investorId:1, vendorId:2, vendorName:"AutoCare Plus", type:"Investment", amount:100000, date:"Mar 3, 2025", status:"Success", txnId:"TXN-10234890", paymentMethod:"Card" },
    { id:"txn_003", investorId:1, vendorId:5, vendorName:"Silk & Thread", type:"Investment", amount:95000, date:"Feb 10, 2025", status:"Success", txnId:"TXN-10234912", paymentMethod:"UPI" },
    { id:"txn_004", investorId:1, vendorId:1, vendorName:"Fresh Farms Dairy", type:"Return", amount:4167, date:"Feb 1, 2025", status:"Success", txnId:"RET-10234001" },
    { id:"txn_005", investorId:1, vendorId:2, vendorName:"AutoCare Plus", type:"Return", amount:4000, date:"Mar 5, 2025", status:"Success", txnId:"RET-10234002" },
    { id:"txn_006", investorId:1, vendorId:5, vendorName:"Silk & Thread", type:"Return", amount:8710, date:"Mar 10, 2025", status:"Success", txnId:"RET-10234003" },
  ],
  jobSeekers: [
    { id:1, name:"Karan Mehta", email:"jobs@samudaay.com", phone:"+91 99001 10001", location:"Andheri", skills:"Customer Service, Cashiering, MS Excel, Team Management", experience:"3 years", status:"Active", appliedJobs:4, joinedDate:"Jan 2025", currentRole:"Looking for Store Manager roles", education:"B.Com, Mumbai University", documents:[], is_active:true },
    { id:2, name:"Rohit Sharma", email:"rohit.s@gmail.com", phone:"+91 99001 10002", location:"Bandra", skills:"Car Repair, Electrical Systems, Diagnostics, Welding", experience:"4 years", status:"Active", appliedJobs:3, joinedDate:"Feb 2025", currentRole:"Mechanic at AutoCare", education:"ITI Diploma, Automobile Engineering", documents:[], is_active:true },
    { id:3, name:"Anjali Mehta", email:"anjali.m@gmail.com", phone:"+91 99001 10003", location:"Juhu", skills:"Hair Styling, Makeup, Skincare, Customer Service", experience:"3 years", status:"Active", appliedJobs:7, joinedDate:"Jan 2025", currentRole:"Freelance Beauty Therapist", education:"VLCC Certificate", documents:[], is_active:true },
  ],
  jobApplications: [
    { id:"app_001", jobSeekerId:1, jobId:1, jobTitle:"Store Manager", businessName:"Fresh Farms Dairy", appliedDate:"Mar 14, 2025", status:"Interview Scheduled", interviewDate:"Mar 20, 10:00 AM", coverLetter:"I have 3 years of retail experience." },
    { id:"app_002", jobSeekerId:1, jobId:4, jobTitle:"IT Support Technician", businessName:"TechFix Solutions", appliedDate:"Mar 10, 2025", status:"Shortlisted" },
    { id:"app_003", jobSeekerId:1, jobId:2, jobTitle:"Delivery Executive", businessName:"Green Leaf Organics", appliedDate:"Mar 8, 2025", status:"Rejected" },
    { id:"app_004", jobSeekerId:1, jobId:5, jobTitle:"Master Tailor", businessName:"Silk & Thread", appliedDate:"Mar 5, 2025", status:"Under Review" },
  ],
  jobs: [
    { id:1, title:"Store Manager", business:"Fresh Farms Dairy", vendorId:1, type:"Full-time", salary:"₹25,000–₹35,000", location:"Andheri West", posted:"Mar 10", apps:24, status:"Active", desc:"Manage daily store operations and staff of 8. Oversee inventory and supplier relationships.", requirements:"3+ years retail management, leadership skills", deadline:"Apr 10, 2026", is_active:true },
    { id:2, title:"Delivery Executive", business:"Green Leaf Organics", vendorId:3, type:"Part-time", salary:"₹15,000–₹20,000", location:"Worli", posted:"Mar 8", apps:42, status:"Active", desc:"Local delivery within 5km. Two-wheeler required. Morning shift 8AM-1PM.", requirements:"Valid driving license, own two-wheeler", deadline:"Apr 8, 2026", is_active:true },
    { id:3, title:"Beauty Therapist", business:"Bloom Beauty Studio", vendorId:4, type:"Full-time", salary:"₹18,000–₹28,000", location:"Juhu", posted:"Mar 7", apps:18, status:"Active", desc:"Experienced in facials, hair care, and skincare for high-profile bridal clients.", requirements:"Min. 2 years experience, VLCC/CIDESCO cert preferred", deadline:"Apr 7, 2026", is_active:true },
    { id:4, title:"IT Support Technician", business:"TechFix Solutions", vendorId:6, type:"Contract", salary:"₹18,000–₹22,000", location:"Powai", posted:"Mar 6", apps:9, status:"Active", desc:"Hardware and software troubleshooting, laptop repairs, mobile screen replacements.", requirements:"B.Sc IT or equivalent, strong communication", deadline:"Apr 6, 2026", is_active:true },
    { id:5, title:"Master Tailor", business:"Silk & Thread", vendorId:5, type:"Full-time", salary:"₹20,000–₹25,000", location:"Dadar", posted:"Mar 5", apps:31, status:"Active", desc:"Skilled in blouse stitching, saree alterations, and custom garment creation.", requirements:"5+ years in silk garments, NIFT preferred", deadline:"Apr 5, 2026", is_active:true },
    { id:6, title:"Senior Mechanic", business:"AutoCare Plus", vendorId:2, type:"Full-time", salary:"₹22,000–₹30,000", location:"Bandra East", posted:"Mar 4", apps:14, status:"Active", desc:"Car servicing, oil changes, brake repairs, and electrical diagnostics.", requirements:"ITI Automobile, 2+ years multi-brand car experience", deadline:"Apr 4, 2026", is_active:true },
    { id:7, title:"Cashier (Part-Time)", business:"Fresh Farms Dairy", vendorId:1, type:"Part-time", salary:"₹10,000–₹14,000", location:"Andheri West", posted:"Mar 2", apps:37, status:"Expired", desc:"Handle billing, cash, and customer checkout.", requirements:"10th pass, basic computer skills", deadline:"Mar 25, 2026", is_active:true },
    { id:8, title:"Digital Marketing Executive", business:"Digital Print Hub", vendorId:7, type:"Full-time", salary:"₹20,000–₹28,000", location:"Kurla", posted:"Feb 28", apps:19, status:"Active", desc:"Manage social media, run performance ads, create content for SME clients.", requirements:"1+ years digital marketing, Meta Ads and Google Ads knowledge", deadline:"Apr 15, 2026", is_active:true },
  ],
  tickets: [
    { id:"#1042", user:"Ravi Kumar", role:"Investor", issue:"Return payment not received for Fresh Farms Dairy investment", priority:"High", status:"Open", date:"Mar 15", replies:[], assignedTo:"Unassigned", is_active:true },
    { id:"#1041", user:"Priya Sharma", role:"Vendor", issue:"Unable to upload GST documents to vendor profile", priority:"Medium", status:"In Progress", date:"Mar 14", replies:[{ text:"Looking into this. Please try clearing browser cache.", author:"Rohan Malhotra", time:"Mar 14, 2:30 PM" }], assignedTo:"Rohan Malhotra", is_active:true },
    { id:"#1040", user:"Arjun Singh", role:"Investor", issue:"Portfolio page shows incorrect returns calculation", priority:"Medium", status:"Open", date:"Mar 13", replies:[], assignedTo:"Unassigned", is_active:true },
    { id:"#1039", user:"Anita Roy", role:"Vendor", issue:"Job listing not showing in search results", priority:"Low", status:"Resolved", date:"Mar 12", replies:[{ text:"Issue fixed — listing is now live.", author:"Divya Rao", time:"Mar 12, 5:00 PM" }], assignedTo:"Divya Rao", is_active:true },
    { id:"#1038", user:"Sunita Verma", role:"Investor", issue:"KYC verification pending for 2 weeks", priority:"High", status:"In Progress", date:"Mar 11", replies:[{ text:"KYC team notified. Expected resolution within 48 hours.", author:"Sneha Joshi", time:"Mar 11, 10:00 AM" }], assignedTo:"Sneha Joshi", is_active:true },
  ],
  team: [
    { id:1, name:"Aditya Kapoor", role:"CEO & Founder", email:"aditya@samudaay.com", phone:"+91 98765 90001", dept:"Leadership", status:"Active", joined:"Jan 2024", permissions:["Vendor Management","Investor Management","Job Moderation","Support","Analytics","Subscriptions","Team Management","System Settings"], is_active:true },
    { id:2, name:"Sneha Joshi", role:"CTO", email:"sneha@samudaay.com", phone:"+91 98765 90002", dept:"Engineering", status:"Active", joined:"Jan 2024", permissions:["Vendor Management","Investor Management","Job Moderation","Support","Analytics","Subscriptions","Team Management","System Settings"], is_active:true },
    { id:3, name:"Rohan Malhotra", role:"Head of Operations", email:"rohan@samudaay.com", phone:"+91 98765 90003", dept:"Operations", status:"Active", joined:"Mar 2024", permissions:["Vendor Management","Job Moderation","Support"], is_active:true },
    { id:4, name:"Divya Rao", role:"Community Manager", email:"divya@samudaay.com", phone:"+91 98765 90004", dept:"Community", status:"Active", joined:"Jun 2024", permissions:["Support","Job Moderation"], is_active:true },
    { id:5, name:"Saurabh Gupta", role:"Finance Lead", email:"saurabh@samudaay.com", phone:"+91 98765 90005", dept:"Finance", status:"Active", joined:"Aug 2024", permissions:["Analytics","Subscriptions","Investor Management"], is_active:true },
    { id:6, name:"Neha Patel", role:"Support Lead", email:"neha@samudaay.com", phone:"+91 98765 90006", dept:"Support", status:"On Leave", joined:"Sep 2024", permissions:["Support"], is_active:true },
  ],
  plans: [
    { id:1, name:"Vendor Basic", price:"999", billingCycle:"monthly", features:["1 active campaign","Basic analytics","Email support","Job posting (2/month)"], active:true, subscriberCount:184 },
    { id:2, name:"Vendor Pro", price:"2499", billingCycle:"monthly", features:["3 campaigns","Advanced analytics","Priority support","Featured listing","Unlimited job posting","Investor messaging"], active:true, subscriberCount:312 },
    { id:3, name:"Investor Premium", price:"499", billingCycle:"monthly", features:["Unlimited investments","Early access to listings","Dedicated relationship manager","Priority KYC","Tax certificate download"], active:true, subscriberCount:2840 },
    { id:4, name:"Investor Basic", price:"0", billingCycle:"free", features:["Up to 3 investments","Standard analytics","Standard KYC processing"], active:true, subscriberCount:2166 },
  ],
  notifications: [
    { id:"notif_001", userId:1, userType:"investor", title:"Investment Confirmed", message:"Your investment of ₹50,000 in Fresh Farms Dairy has been confirmed. Transaction ID: TXN-10234567", type:"investment", read:false, date:"Jan 12, 2025" },
    { id:"notif_002", userId:1, userType:"investor", title:"Return Credited ₹4,167", message:"Monthly return from Fresh Farms Dairy has been credited to your account.", type:"return", read:true, date:"Feb 1, 2025" },
    { id:"notif_003", userId:1, userType:"investor", title:"New Opportunity: 13% Returns", message:"Green Leaf Organics is offering 13% returns. Only ₹2.1L remaining in this campaign.", type:"opportunity", read:false, date:"Mar 10, 2025" },
    { id:"notif_004", userId:1, userType:"investor", title:"KYC Verified ✓", message:"Your KYC documents have been verified successfully. You can now invest in all campaigns.", type:"kyc", read:true, date:"Dec 5, 2024" },
  ],
};

// ─── Storage ──────────────────────────────────────────────────────────────────

const DB_KEY = "samudaay_db_v2";

export function loadDB(): DB {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DB;
      if (!parsed.investments) parsed.investments = seedDB.investments;
      if (!parsed.transactions) parsed.transactions = seedDB.transactions;
      if (!parsed.jobApplications) parsed.jobApplications = seedDB.jobApplications;
      if (!parsed.notifications) parsed.notifications = seedDB.notifications;
      return parsed;
    }
  } catch {}
  return { ...seedDB, lastUpdated: new Date().toISOString() };
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
