import DashboardLayout from "@/components/DashboardLayout";
import { MetricCard, ProgressBar, StatusBadge } from "@/components/ui/metric-card";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useRef, useMemo } from "react";
import {
  LayoutDashboard, HandCoins, Users, Briefcase, UserCheck, FileText,
  CreditCard, Settings, IndianRupee, Eye, CalendarClock, TrendingUp,
  CheckCircle2, Clock, Download, Plus, Star, Bell, Upload, Save, X,
  Pencil, BarChart3, MapPin, AlertTriangle, Wallet, ShieldCheck,
  Users2, LifeBuoy, MessageSquare, ArrowUpRight, ArrowDownLeft,
  ChevronRight, Search, Filter, MoreHorizontal,
} from "lucide-react";
import { useDB, formatINR, addNotification } from "@/lib/db";
import { useAuth } from "@/lib/auth";

const navItems = [
  { title: "Overview",       url: "/dashboard/vendor",            icon: LayoutDashboard },
  { title: "My Campaign",    url: "/dashboard/vendor/campaign",    icon: HandCoins       },
  { title: "Hiring Suite",   url: "/dashboard/vendor/hiring",      icon: Briefcase       },
  { title: "Investors",      url: "/dashboard/vendor/investors",   icon: Users           },
  { title: "Capital & Payouts", url: "/dashboard/vendor/wallet",      icon: Wallet          },
  { title: "Trust & KYB",    url: "/dashboard/vendor/trust",       icon: ShieldCheck     },
  { title: "Team",           url: "/dashboard/vendor/team",        icon: Users2          },
  { title: "Analytics",      url: "/dashboard/vendor/analytics",   icon: BarChart3       },
  { title: "Support",        url: "/dashboard/vendor/support",     icon: LifeBuoy        },
  { title: "Settings",       url: "/dashboard/vendor/settings",    icon: Settings        },
];

const inp = "w-full px-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200";

// --- Components ---

function Overview() {
  const { user } = useAuth();
  const VENDOR_ID = user?.id || 1;
  const [db] = useDB();
  const navigate = useNavigate();
  const vendor = db.vendors.find(v => v.id === VENDOR_ID);
  const myInvestors = db.investments.filter(i => i.vendorId === VENDOR_ID);
  
  if (!vendor) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Welcome back, {vendor.owner} 👋</h2>
          <p className="text-muted-foreground">Here's what's happening with {vendor.name} today.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/vendor/hiring")}>
            <Plus className="w-4 h-4 mr-2" /> Post a Job
          </Button>
          <Button variant="hero" size="sm" onClick={() => navigate("/dashboard/vendor/campaign")}>
            <ArrowUpRight className="w-4 h-4 mr-2" /> Update Campaign
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={<IndianRupee className="w-5 h-5"/>} value={formatINR(vendor.raised)} title="Total Funding" trend="+₹1.2L" trendUp/>
        <MetricCard icon={<Wallet className="w-5 h-5 text-secondary"/>} value={formatINR(vendor.walletBalance)} title="Wallet Balance" subtitle="Available to withdraw"/>
        <MetricCard icon={<Users className="w-5 h-5 text-primary"/>} value={String(vendor.investors)} title="Active Investors" trend="+4 this month" trendUp/>
        <MetricCard icon={<Star className="w-5 h-5 text-warning"/>} value={String(vendor.rating)} title="Vendor Rating" subtitle="Top 5% in category"/>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Campaign Card */}
        <div className="lg:col-span-2 card-elevated p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <HandCoins className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <HandCoins className="w-5 h-5 text-primary" /> Active Campaign
              </h3>
              <StatusBadge status="verified" />
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress: {formatINR(vendor.raised)} / {formatINR(vendor.goal)}</span>
                  <span className="font-bold text-primary">{Math.round(vendor.raised/vendor.goal*100)}%</span>
                </div>
                <ProgressBar value={vendor.raised} max={vendor.goal} className="h-3" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-accent/40 rounded-2xl p-4 border border-border/50">
                  <div className="text-xl font-bold text-foreground">{vendor.returns}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Returns</div>
                </div>
                <div className="bg-accent/40 rounded-2xl p-4 border border-border/50">
                  <div className="text-xl font-bold text-foreground">{vendor.tenure}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Tenure</div>
                </div>
                <div className="bg-accent/40 rounded-2xl p-4 border border-border/50">
                  <div className="text-xl font-bold text-foreground">{formatINR(vendor.minInvest)}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Min. Entry</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications/Updates */}
        <div className="card-elevated p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-secondary" /> Recent Activity
          </h3>
          <div className="space-y-4">
            {myInvestors.length > 0 ? myInvestors.slice(0, 4).map(inv => (
              <div key={inv.id} className="flex gap-3 items-start p-3 rounded-xl hover:bg-accent/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium">New Investment from #{inv.investorId}</div>
                  <div className="text-xs text-muted-foreground">{inv.date} · {formatINR(inv.amount)}</div>
                </div>
              </div>
            )) : <div className="text-center py-8 text-muted-foreground">No recent activity.</div>}
            <Button variant="ghost" className="w-full text-sm text-primary" size="sm">
              View All Activity <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Payouts Section */}
      <div className="card-elevated p-6">
        <h3 className="font-semibold mb-6 flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-success" /> Upcoming Returns Due
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="pb-4 font-medium">Investor</th>
                <th className="pb-4 font-medium">Investment</th>
                <th className="pb-4 font-medium">Monthly Due</th>
                <th className="pb-4 font-medium">Due Date</th>
                <th className="pb-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {myInvestors.slice(0, 3).map(inv => {
                const monthly = Math.round(inv.amount * parseFloat(vendor.returns) / 100 / 12);
                return (
                  <tr key={inv.id} className="border-b border-border/50 last:border-0 hover:bg-accent/20 transition-colors">
                    <td className="py-4 font-medium">Investor #{inv.investorId}</td>
                    <td className="py-4 text-muted-foreground">{formatINR(inv.amount)}</td>
                    <td className="py-4 text-success font-semibold">{formatINR(monthly)}</td>
                    <td className="py-4 text-muted-foreground">{inv.nextPayout}</td>
                    <td className="py-4 text-right">
                      <Button variant="outline" size="sm" className="h-7 px-2 text-[10px] font-bold">Pay Now</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CampaignManager() {
  const { user } = useAuth();
  const VENDOR_ID = user?.id || 1;
  const [db, setDB] = useDB();
  const vendor = db.vendors.find(v => v.id === VENDOR_ID);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ 
    goal: String(vendor?.goal||0), 
    returns: vendor?.returns||"10%", 
    tenure: vendor?.tenure||"12 mo", 
    minInvest: String(vendor?.minInvest||5000), 
    maxInvest: String(vendor?.maxInvest||200000), 
    description: vendor?.description||"" 
  });
  const [newUpdate, setNewUpdate] = useState({ title: "", content: "" });
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  if (!vendor) return null;

  const save = () => {
    setDB(d => ({...d, vendors: d.vendors.map(v => v.id===VENDOR_ID ? {
      ...v, 
      goal:parseInt(form.goal)||v.goal, 
      returns:form.returns, 
      tenure:form.tenure, 
      minInvest:parseInt(form.minInvest)||v.minInvest, 
      maxInvest:parseInt(form.maxInvest)||v.maxInvest, 
      description:form.description
    } : v)}));
    setEditing(false);
    addNotification(db, { userId: VENDOR_ID, userType: "vendor", title: "Campaign Updated", message: "Your campaign details have been updated successfully.", type: "system", read: false, date: new Date().toLocaleDateString() });
  };

  const postUpdate = () => {
    if (!newUpdate.title || !newUpdate.content) return;
    const update = { id: `upd_${Date.now()}`, title: newUpdate.title, content: newUpdate.content, date: new Date().toLocaleDateString("en-IN") };
    setDB(d => ({...d, vendors: d.vendors.map(v => v.id===VENDOR_ID ? {...v, updates: [update, ...(v.updates||[])]} : v)}));
    setNewUpdate({ title: "", content: "" });
    setShowUpdateModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h3 className="text-xl font-bold">Campaign Performance</h3>
          <p className="text-sm text-muted-foreground">Manage your funding campaign and communicate with investors.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowUpdateModal(true)}>
             <MessageSquare className="w-4 h-4 mr-2" /> Post Investor Update
          </Button>
          <Button variant={editing ? "hero" : "outline"} onClick={() => editing ? save() : setEditing(true)}>
            {editing ? <><Save className="w-4 h-4 mr-2"/>Save</> : <><Pencil className="w-4 h-4 mr-2"/>Edit Settings</>}
          </Button>
          {editing && <Button variant="ghost" size="icon" onClick={() => setEditing(false)}><X className="w-4 h-4 text-destructive"/></Button>}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Campaign Settings */}
        <div className="card-elevated p-6 space-y-6">
          <h4 className="font-semibold flex items-center gap-2"><Settings className="w-4 h-4 text-primary" /> Campaign Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Funding Goal</label>
              <input disabled={!editing} type="number" value={form.goal} onChange={e=>setForm(p=>({...p,goal:e.target.value}))} className={inp}/>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Return Rate (%)</label>
              <input disabled={!editing} value={form.returns} onChange={e=>setForm(p=>({...p,returns:e.target.value}))} className={inp}/>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Tenure (Months)</label>
              <input disabled={!editing} value={form.tenure} onChange={e=>setForm(p=>({...p,tenure:e.target.value}))} className={inp}/>
            </div>
             <div>
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Min. Investment</label>
              <input disabled={!editing} type="number" value={form.minInvest} onChange={e=>setForm(p=>({...p,minInvest:e.target.value}))} className={inp}/>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Business Pitch/Description</label>
              <textarea disabled={!editing} rows={4} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} className={inp + " resize-none"}/>
            </div>
          </div>
        </div>

        {/* Investor Updates */}
        <div className="card-elevated p-6 flex flex-col h-full">
          <h4 className="font-semibold flex items-center gap-2 mb-4"><Bell className="w-4 h-4 text-secondary" /> Investor Updates</h4>
          <div className="space-y-4 flex-1 overflow-auto max-h-[350px] pr-2">
            {(vendor.updates || []).length > 0 ? (vendor.updates || []).map(upd => (
              <div key={upd.id} className="p-4 rounded-2xl bg-accent/30 border border-border/50">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-semibold text-sm">{upd.title}</h5>
                  <span className="text-[10px] text-muted-foreground font-medium">{upd.date}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{upd.content}</p>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center mb-4 text-muted-foreground">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-sm text-muted-foreground">No updates posted yet.<br/>Keep your investors informed!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showUpdateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-3xl border border-border shadow-2xl p-6 animate-in zoom-in-95">
            <h3 className="text-lg font-bold mb-4">New Investor Update</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Title</label>
                <input placeholder="e.g. Sales reached new peak!" value={newUpdate.title} onChange={e=>setNewUpdate(p=>({...p,title:e.target.value}))} className={inp}/>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Content</label>
                <textarea rows={4} placeholder="What would you like to tell your investors?" value={newUpdate.content} onChange={e=>setNewUpdate(p=>({...p,content:e.target.value}))} className={inp + " resize-none"}/>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="hero" className="flex-1" onClick={postUpdate}>Post Update</Button>
                <Button variant="outline" className="flex-1" onClick={()=>setShowUpdateModal(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HiringSuite() {
  const { user } = useAuth();
  const VENDOR_ID = user?.id || 1;
  const [db, setDB] = useDB();
  const myJobs = db.jobs.filter(j => j.vendorId === VENDOR_ID && j.is_active);
  const myJobIds = myJobs.map(j => j.id);
  const applications = db.jobApplications.filter(a => myJobIds.includes(a.jobId));
  
  const [tab, setTab] = useState<"listings" | "applicants">("listings");
  const [addingJob, setAddingJob] = useState(false);
  const [newJob, setNewJob] = useState({ title: "", type: "Full-time", salary: "", location: "", desc: "", requirements: "", deadline: "" });

  const addJob = () => {
    if (!newJob.title || !newJob.salary) return;
    const job = {
      id: Math.max(...db.jobs.map(j=>j.id),0)+1,
      ...newJob,
      business: "Fresh Farms Dairy",
      vendorId: VENDOR_ID,
      posted: "Today",
      apps: 0,
      status: "Active",
      is_active: true
    };
    setDB(d => ({...d, jobs: [job, ...d.jobs]}));
    setAddingJob(false);
    setNewJob({ title: "", type: "Full-time", salary: "", location: "", desc: "", requirements: "", deadline: "" });
  };

  const updateAppStatus = (id: string, status: string) => {
    setDB(d => ({...d, jobApplications: d.jobApplications.map(a => a.id === id ? {...a, status} : a)}));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1 bg-accent/40 rounded-2xl border border-border/50">
          <button onClick={() => setTab("listings")} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === "listings" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Jobs Listings</button>
          <button onClick={() => setTab("applicants")} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === "applicants" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Applicants ({applications.length})</button>
        </div>
        {tab === "listings" && (
          <Button variant="hero" onClick={() => setAddingJob(true)}><Plus className="w-4 h-4 mr-2" /> Post New Job</Button>
        )}
      </div>

      {tab === "listings" ? (
        <div className="grid gap-4">
          {addingJob && (
            <div className="card-elevated p-6 animate-in zoom-in-95 border-primary/20">
              <h4 className="font-bold mb-4">Post a New Role</h4>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-muted-foreground uppercase mb-1">Title</label><input value={newJob.title} onChange={e=>setNewJob(p=>({...p,title:e.target.value}))} className={inp} placeholder="e.g. Sales Manager" /></div>
                <div><label className="text-xs font-bold text-muted-foreground uppercase mb-1">Category</label><select value={newJob.type} onChange={e=>setNewJob(p=>({...p,type:e.target.value}))} className={inp}><option>Full-time</option><option>Part-time</option><option>Contract</option></select></div>
                <div><label className="text-xs font-bold text-muted-foreground uppercase mb-1">Salary</label><input value={newJob.salary} onChange={e=>setNewJob(p=>({...p,salary:e.target.value}))} className={inp} placeholder="₹20,000 - ₹30,000" /></div>
                <div><label className="text-xs font-bold text-muted-foreground uppercase mb-1">Location</label><input value={newJob.location} onChange={e=>setNewJob(p=>({...p,location:e.target.value}))} className={inp} /></div>
                <div className="col-span-2"><label className="text-xs font-bold text-muted-foreground uppercase mb-1">Job Description</label><textarea rows={3} value={newJob.desc} onChange={e=>setNewJob(p=>({...p,desc:e.target.value}))} className={inp + " resize-none"} /></div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button variant="hero" onClick={addJob}>Post Live</Button>
                <Button variant="outline" onClick={() => setAddingJob(false)}>Cancel</Button>
              </div>
            </div>
          )}
          {myJobs.map(job => (
            <div key={job.id} className="card-elevated p-5 flex items-center justify-between hover:border-primary/30 transition-colors">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{job.title}</h4>
                  <p className="text-sm text-muted-foreground">{job.type} · {job.salary} · {job.apps} applicants</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={job.status === "Active" ? "verified" : "expired"} />
                <Button variant="ghost" size="icon"><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive"><X className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
          {myJobs.length === 0 && !addingJob && (
            <div className="py-20 text-center text-muted-foreground">No active job listings.</div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
           {applications.map(app => {
             const seeker = db.jobSeekers.find(s => s.id === app.jobSeekerId);
             return (
               <div key={app.id} className="card-elevated p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <div className="flex gap-4 items-center">
                   <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center font-bold text-secondary">
                    {seeker?.name.split(" ").map(n=>n[0]).join("")}
                   </div>
                   <div>
                     <h4 className="font-bold text-foreground">{seeker?.name}</h4>
                     <p className="text-sm text-muted-foreground">Applying for: <span className="font-medium text-foreground">{app.jobTitle}</span></p>
                     <div className="flex gap-2 mt-1">
                        {seeker?.skills.split(",").slice(0,3).map(s => <span key={s} className="px-2 py-0.5 rounded-md bg-accent text-[10px] text-muted-foreground">{s.trim()}</span>)}
                     </div>
                   </div>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className={`px-3 py-1 rounded-full text-xs font-bold ${app.status === "Shortlisted" ? "bg-success/10 text-success" : "bg-accent text-muted-foreground"}`}>
                     {app.status}
                   </div>
                   <select 
                    value={app.status} 
                    onChange={e => updateAppStatus(app.id, e.target.value)}
                    className="text-xs p-2 bg-card rounded-lg border border-border focus:outline-none"
                   >
                     <option>Under Review</option>
                     <option>Shortlisted</option>
                     <option>Interview Scheduled</option>
                     <option>Rejected</option>
                     <option>Hired</option>
                   </select>
                   <Button variant="outline" size="sm">View Profile</Button>
                 </div>
               </div>
             );
           })}
           {applications.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">No applications yet.</div>
          )}
        </div>
      )}
    </div>
  );
}

function WalletAndPayouts() {
  const { user } = useAuth();
  const VENDOR_ID = user?.id || 1;
  const [db, setDB] = useDB();
  const vendor = db.vendors.find(v => v.id === VENDOR_ID);
  const myInvestments = db.investments.filter(i => i.vendorId === VENDOR_ID);
  
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [amount, setAmount] = useState("");

  if (!vendor) return null;

  const handleWithdraw = () => {
    const val = parseInt(amount);
    if (!val || val > vendor.walletBalance) return;
    setDB(d => ({...d, vendors: d.vendors.map(v => v.id === VENDOR_ID ? {...v, walletBalance: v.walletBalance - val} : v)}));
    setWithdrawModal(false);
    setAmount("");
  };

  const payReturns = () => {
    // Bulk simulate returns payout for all active investors
    let totalPaid = 0;
    const newInvestments = db.investments.map(inv => {
      if (inv.vendorId === VENDOR_ID && inv.status === "Active") {
          const monthly = Math.round(inv.amount * parseFloat(vendor.returns) / 100 / 12);
          totalPaid += monthly;
          return {...inv, completedMonths: inv.completedMonths + 1, returnsEarned: inv.returnsEarned + monthly};
      }
      return inv;
    });
    setDB(d => ({...d, investments: newInvestments}));
    addNotification(db, { userId: VENDOR_ID, userType: "vendor", title: "Returns Paid", message: `Successfully paid ${formatINR(totalPaid)} in returns to your investors.`, type: "payment", read: false, date: new Date().toLocaleDateString() });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card-elevated p-6 bg-primary/10 border-primary/20 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform"><Wallet className="w-24 h-24" /></div>
          <p className="text-xs font-bold text-muted-foreground uppercase opacity-70">Available Balance</p>
          <h3 className="text-3xl font-bold text-foreground mt-1 mb-4">{formatINR(vendor.walletBalance)}</h3>
          <Button variant="hero" className="w-full" onClick={() => setWithdrawModal(true)}>Withdraw Fund</Button>
        </div>
        <MetricCard icon={<IndianRupee className="w-5 h-5"/>} value={formatINR(vendor.raised)} title="Funds Raised" subtitle="Total investment secured"/>
        <MetricCard icon={<ArrowDownLeft className="w-5 h-5 text-destructive"/>} value={formatINR(12000)} title="Platform Fees Due" subtitle="Next billing: Apr 15"/>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-elevated p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold">Payouts to Investors</h4>
            <Button variant="outline" size="sm" onClick={payReturns}>Pay All Monthly Returns</Button>
          </div>
          <div className="space-y-4">
            {myInvestments.map(inv => (
              <div key={inv.id} className="flex items-center justify-between p-4 rounded-2xl bg-accent/30 border border-border/50">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success"><ArrowUpRight className="w-5 h-5"/></div>
                  <div>
                    <h5 className="font-bold text-sm">Investor #{inv.investorId}</h5>
                    <p className="text-[10px] text-muted-foreground tracking-tight">PROGRESS: {inv.completedMonths}/{inv.tenureMonths} MONTHS</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-success">+{formatINR(Math.round(inv.amount * parseFloat(vendor.returns) / 100 / 12))}/mo</div>
                  <div className="text-[10px] text-muted-foreground font-medium uppercase">Next: {inv.nextPayout}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-elevated p-6 space-y-6">
          <h4 className="font-bold">Payment Methods & Gateway</h4>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 font-bold italic">RP</div>
                <div><h5 className="font-bold text-sm">Razorpay Integration</h5><p className="text-xs text-muted-foreground">Status: <span className="text-success font-medium">Connected</span></p></div>
              </div>
              <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">Configure</Button>
            </div>
             <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 font-bold">St</div>
                <div><h5 className="font-bold text-sm">Stripe Connect</h5><p className="text-xs text-muted-foreground">Link your international account</p></div>
              </div>
              <Button variant="outline" size="sm">Connect</Button>
            </div>
             <div className="p-4 rounded-2xl bg-accent/20 border border-dashed border-border text-center">
              <p className="text-xs text-muted-foreground mb-2">Want to receive payments directly?</p>
              <Button variant="ghost" size="sm" className="h-7 text-primary text-[10px]"><Plus className="w-3 h-3 mr-1" /> Add Payment Gateway</Button>
            </div>
          </div>
        </div>
      </div>

      {withdrawModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-3xl border border-border shadow-2xl p-6 animate-in zoom-in-95">
            <h3 className="text-lg font-bold mb-4">Withdraw Funds</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Max Available</p>
                <div className="text-2xl font-bold">{formatINR(vendor.walletBalance)}</div>
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">Amount to Withdraw</label>
                <input placeholder="Enter amount" value={amount} onChange={e=>setAmount(e.target.value)} className={inp}/>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="hero" className="flex-1" onClick={handleWithdraw} disabled={!amount}>Confirm Withdrawal</Button>
                <Button variant="outline" className="flex-1" onClick={()=>setWithdrawModal(false)}>Cancel</Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">Funds will be credited to {vendor.bankAccount} within 24-48 hours.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TrustVerification() {
  const { user } = useAuth();
  const VENDOR_ID = user?.id || 1;
  const [db, setDB] = useDB();
  const vendor = db.vendors.find(v => v.id === VENDOR_ID);
  const docRef = useRef<HTMLInputElement>(null);

  if (!vendor) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-6 p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
        <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
          <ShieldCheck className="w-10 h-10 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Business Trust & Verification</h2>
          <p className="text-muted-foreground mt-1">Ensure your business is fully verified to access higher funding limits and feature-rich plans.</p>
          <div className="flex gap-4 mt-4">
             <div className="flex items-center gap-1.5"><StatusBadge status="verified" /><span className="text-xs font-semibold">IDENTITY</span></div>
             <div className="flex items-center gap-1.5"><StatusBadge status="verified" /><span className="text-xs font-semibold">GST REG.</span></div>
             <div className="flex items-center gap-1.5"><StatusBadge status="pending" /><span className="text-xs font-semibold">BANK AUDIT</span></div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-elevated p-6 space-y-5">
           <div className="flex justify-between items-center">
             <h4 className="font-bold">Mandatory Documents</h4>
             <Button variant="hero" size="sm" className="h-7 px-2 text-[10px]" onClick={() => docRef.current?.click()}><Upload className="w-3 h-3 mr-1" /> Upload</Button>
             <input type="file" ref={docRef} className="hidden" />
           </div>
           <div className="space-y-3">
             {[{name: "GST Certificate", status: "Verified"}, {name: "Business PAN", status: "Verified"}, {name: "Audit Statement 2024", status: "Pending"}, {name: "Bank Passbook", status: "Rejected"}].map(doc => (
               <div key={doc.name} className="flex items-center justify-between p-3.5 rounded-2xl bg-card border border-border group hover:border-primary/30 transition-colors">
                 <div className="flex gap-3 items-center">
                   <div className="p-2 rounded-lg bg-accent text-muted-foreground group-hover:text-primary transition-colors"><FileText className="w-4 h-4"/></div>
                   <span className="text-sm font-medium">{doc.name}</span>
                 </div>
                 <StatusBadge status={doc.status === "Verified" ? "verified" : doc.status === "Rejected" ? "expired" : "pending"} />
               </div>
             ))}
           </div>
        </div>

        <div className="card-elevated p-6 space-y-4">
          <h4 className="font-bold">KYB Status Timeline</h4>
          <div className="space-y-6 relative ml-3 before:content-[''] before:absolute before:left-[-1px] before:top-2 before:bottom-2 before:w-px before:bg-border">
             {[{title: "KYB Initiated", date: "Oct 12, 2024", completed: true}, {title: "Documents Uploaded", date: "Oct 15, 2024", completed: true}, {title: "Manual Verification", date: "Oct 18, 2024", completed: true}, {title: "Platform Onboarding", date: "Waitlists...", completed: false}].map((s, i) => (
               <div key={i} className="relative pl-6">
                 <div className={`absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-card ${s.completed ? "bg-primary" : "bg-accent"}`}></div>
                 <div className="text-sm font-bold leading-none">{s.title}</div>
                 <div className="text-[10px] text-muted-foreground mt-1">{s.date}</div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamManagement() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Your Team</h3>
        <Button variant="hero" size="sm"><Plus className="w-4 h-4 mr-2" /> Add Member</Button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[{name: "Amit Patel", role: "Business Owner", email: "amit@freshfarms.com"}, {name: "Rajesh Kumar", role: "Store Manager", email: "rajesh@freshfarms.com"}, {name: "Sita Devi", role: "Accountant", email: "sita@freshfarms.com"}].map(m => (
          <div key={m.email} className="card-elevated p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xl mb-4">
              {m.name.split(" ").map(n=>n[0]).join("")}
            </div>
            <h4 className="font-bold">{m.name}</h4>
            <p className="text-xs text-primary font-semibold mt-1 uppercase tracking-wider">{m.role}</p>
            <p className="text-sm text-muted-foreground mt-1">{m.email}</p>
            <div className="flex gap-2 mt-6 w-full">
              <Button variant="outline" className="flex-1 text-xs" size="sm">Manage</Button>
              <Button variant="ghost" className="flex-1 text-xs text-destructive" size="sm">Remove</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SupportHub() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="card-elevated p-8 text-center bg-gradient-to-b from-card to-accent/20">
         <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
           <LifeBuoy className="w-8 h-8" />
         </div>
         <h2 className="text-2xl font-bold">How can we help?</h2>
         <p className="text-muted-foreground mt-2 max-w-md mx-auto">Get in touch with our support team or browse our help center for common issues.</p>
         <div className="flex gap-3 justify-center mt-8">
           <Button variant="hero" className="px-8"><MessageSquare className="w-4 h-4 mr-2" /> Start Live Chat</Button>
           <Button variant="outline" className="px-8 flex items-center">Open Help Center <ArrowUpRight className="w-4 h-4 ml-2" /></Button>
         </div>
       </div>

       <div className="grid md:grid-cols-2 gap-6">
         <div className="card-elevated p-6">
           <h4 className="font-bold mb-4">Funder Support</h4>
           <div className="space-y-4">
             {["How to increase my goal?", "Why is my withdrawal pending?", "Connecting Razorpay help"].map(q => (
               <button key={q} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 text-sm text-left transition-colors font-medium">
                 {q} <ChevronRight className="w-4 h-4 text-muted-foreground" />
               </button>
             ))}
           </div>
         </div>
         <div className="card-elevated p-6">
           <h4 className="font-bold mb-4">Your Recent Tickets</h4>
           <div className="space-y-4">
             <div className="p-4 rounded-2xl bg-accent/30 border border-border/50">
               <div className="flex justify-between items-center mb-1">
                 <span className="text-xs font-bold text-primary">#TKT-4921</span>
                 <StatusBadge status="verified" />
               </div>
               <h5 className="text-sm font-semibold">Payment Gateway Issue</h5>
               <p className="text-[10px] text-muted-foreground mt-1">LAST UPDATED: 2 DAYS AGO</p>
             </div>
           </div>
           <Button variant="ghost" className="w-full mt-4 text-sm font-bold">Create New Ticket</Button>
         </div>
       </div>
    </div>
  );
}

function VendorSettings() {
  const { user } = useAuth();
  const VENDOR_ID = user?.id || 1;
  const [db, setDB] = useDB();
  const vendor = db.vendors.find(v=>v.id===VENDOR_ID);
  const [form, setForm] = useState({name:vendor?.name||"",owner:vendor?.owner||"",email:vendor?.email||"",phone:vendor?.phone||"",category:vendor?.category||"",location:vendor?.location||"",gstNumber:vendor?.gstNumber||"",bankAccount:vendor?.bankAccount||""});
  const [saved, setSaved] = useState(false);
  const save = () => {
    setDB(d=>({...d,vendors:d.vendors.map(v=>v.id===VENDOR_ID?{...v,...form}:v)}));
    setSaved(true); setTimeout(()=>setSaved(false),2000);
  };
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="card-elevated p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5"><Settings className="w-32 h-32" /></div>
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Settings className="w-5 h-5 text-primary" /> Profile Settings</h3>
        <div className="grid grid-cols-2 gap-6 relative z-10">
          {[{label:"Business Name",key:"name"as const},{label:"Owner Name",key:"owner"as const},{label:"Email",key:"email"as const},{label:"Phone",key:"phone"as const},{label:"Category",key:"category"as const},{label:"Location",key:"location"as const},{label:"GST Number",key:"gstNumber"as const},{label:"Bank Account",key:"bankAccount"as const}].map(f=>(
            <div key={f.key}>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-2 ml-1">{f.label}</label>
              <input value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} className={inp}/>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-8 pt-6 border-t border-border">
          <Button variant={saved ? "outline" : "hero"} className="px-12" onClick={save}>{saved?"✓ Saved!":"Save Updates"}</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-elevated p-6 border-destructive/20 bg-destructive/[0.02]">
          <h4 className="font-bold text-destructive">Danger Zone</h4>
          <p className="text-xs text-muted-foreground mt-1 mb-6">Deactivating your account will pause all active campaigns and job listings.</p>
          <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive hover:text-white transition-all font-bold">Deactivate Business Profile</Button>
        </div>
        <div className="card-elevated p-6">
           <h4 className="font-bold">Security</h4>
           <p className="text-xs text-muted-foreground mt-1 mb-6">Update your password or enable two-factor authentication.</p>
           <Button variant="outline" className="w-full font-bold">Update Password</Button>
        </div>
      </div>
    </div>
  );
}

export default function VendorDashboard() {
  return (
    <DashboardLayout navItems={navItems} groupLabel="Business Suite">
      <div className="max-w-[1200px] mx-auto">
        <Routes>
          <Route index element={<Overview/>}/>
          <Route path="campaign" element={<CampaignManager/>}/>
          <Route path="hiring" element={<HiringSuite/>}/>
          <Route path="investors" element={<Overview/>}/> {/* Linked to overview or dedicated list */}
          <Route path="wallet" element={<WalletAndPayouts/>}/>
          <Route path="trust" element={<TrustVerification/>}/>
          <Route path="team" element={<TeamManagement/>}/>
          <Route path="analytics" element={<Overview/>}/> {/* Placeholder */}
          <Route path="support" element={<SupportHub/>}/>
          <Route path="settings" element={<VendorSettings/>}/>
        </Routes>
      </div>
    </DashboardLayout>
  );
}
