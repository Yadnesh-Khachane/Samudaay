import DashboardLayout from "@/components/DashboardLayout";
import { MetricCard, ProgressBar, StatusBadge } from "@/components/ui/metric-card";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useRef, useMemo } from "react";
import {
  Search, Bookmark, FileText, User, MessageCircle, MapPin, Clock,
  IndianRupee, Briefcase, Building2, ArrowRight, BookmarkPlus,
  CheckCircle2, XCircle, Calendar, Bell, Users, Star, X, Upload,
  Save, Pencil, BookmarkX, Send, LayoutDashboard, ChevronRight,
  UserCheck, Award, Zap, LifeBuoy, MoreHorizontal, Filter,
  Building, FileCheck, Share2, ClipboardList, TrendingUp, Download,
  Plus, MessageSquare, Shield,
} from "lucide-react";
import { useDB, addNotification, formatINR, exportToCSV } from "@/lib/db";
import { useAuth } from "@/lib/auth";

const navItems = [
  { title: "Find Jobs",      url: "/dashboard/jobs",               icon: Search        },
  { title: "Applications",   url: "/dashboard/jobs/applications",  icon: FileText      },
  { title: "My Resume",      url: "/dashboard/jobs/profile",       icon: FileCheck     },
  { title: "Saved Roles",    url: "/dashboard/jobs/saved",         icon: Bookmark      },
  { title: "Notifications",  url: "/dashboard/jobs/notifications", icon: Bell          },
  { title: "Community",      url: "/dashboard/jobs/community",     icon: MessageCircle },
  { title: "Seeker Profile", url: "/dashboard/jobs/profile-edit",  icon: User          },
];

const inp = "w-full px-4 py-3 rounded-2xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200";

// --- Components ---

function FindJobs() {
  const { user } = useAuth();
  const SEEKER_ID = user?.id || 1;
  const [db, setDB] = useDB();
  const [search, setSearch]     = useState("");
  const [jobType, setJobType]   = useState("All");
  const [applying, setApplying] = useState<number | null>(null);
  const [cover, setCover]       = useState("");
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [justApplied, setJustApplied] = useState<number[]>([]);

  const alreadyApplied = useMemo(() => (db.jobApplications || [])
    .filter(a => a && a.jobSeekerId === SEEKER_ID)
    .map(a => a.jobId), [db?.jobApplications, SEEKER_ID]);

  const jobsRaw = Array.isArray(db?.jobs) ? db.jobs : [];
  const jobs = jobsRaw.filter(j => j && j.is_active && j.status === "Active");
  const filtered = useMemo(() => jobs.filter(j => {
    if (!j) return false;
    const q = (search || "").toLowerCase();
    const titleMatch = (j.title || "").toLowerCase().includes(q);
    const businessMatch = (j.business || "").toLowerCase().includes(q);
    const locationMatch = (j.location || "").toLowerCase().includes(q);
    return (titleMatch || businessMatch || locationMatch)
      && (jobType === "All" || j.type === jobType);
  }).sort((a,b) => (b.id || 0) - (a.id || 0)), [jobs, search, jobType]);

  const handleApply = (jobId: number) => {
    const job = db.jobs.find(j => j.id === jobId);
    if (!job) return;
    const dateStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    setDB(prev => {
      const app = {
        id: `app_${Date.now()}`, jobSeekerId: SEEKER_ID, jobId,
        jobTitle: job.title, businessName: job.business,
        appliedDate: dateStr, status: "Under Review",
        coverLetter: cover,
      };
      const updated = {
        ...prev,
        jobs: prev.jobs.map(j => j.id === jobId ? { ...j, apps: j.apps + 1 } : j),
        jobSeekers: prev.jobSeekers.map(s => s.id === SEEKER_ID ? { ...s, appliedJobs: (s.appliedJobs || 0) + 1 } : s),
        jobApplications: [...(prev.jobApplications || []), app]
      };
      return addNotification(updated, { userId: SEEKER_ID, userType: "jobseeker", title: `Application Sent ✓`, message: `You applied to ${job.title} at ${job.business}.`, type: "application", read: false, date: dateStr });
    });
    setJustApplied(p => [...p, jobId]);
    setApplying(null);
    setCover("");
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 bg-mesh p-8 rounded-[3rem]">
      {applying !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-card rounded-[2rem] shadow-2xl border border-border w-full max-w-md p-8 animate-in zoom-in-95">
            <h3 className="text-xl font-black mb-2">Quick Application</h3>
            <p className="text-sm text-muted-foreground mb-6">Applying to <span className="text-primary font-bold">{db.jobs.find(j => j.id === applying)?.title}</span> at {db.jobs.find(j => j.id === applying)?.business}</p>
            <div className="mb-6">
               <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Cover Letter / Note</label>
               <textarea rows={4} value={cover} onChange={e => setCover(e.target.value)} placeholder="Why are you a good fit?" className={inp + " resize-none"} />
            </div>
            <div className="flex gap-3">
               <Button variant="hero" className="flex-1 rounded-2xl py-6" onClick={() => handleApply(applying!)}>Submit Application</Button>
               <Button variant="outline" className="flex-1 rounded-2xl py-6" onClick={() => setApplying(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard icon={<Briefcase className="w-5 h-5 text-primary" />} value={String(jobs.length)} title="Open Opportunities" trend="+Today" trendUp />
        <MetricCard icon={<FileText className="w-5 h-5 text-secondary" />} value={String(alreadyApplied.length + justApplied.length)} title="Applications Sent" />
        <MetricCard icon={<Calendar className="w-5 h-5 text-success" />} value={String((db.jobApplications || []).filter(a => a && a.jobSeekerId === SEEKER_ID && a.status?.includes("Interview")).length)} title="Interviews Today" />
        <MetricCard icon={<Bookmark className="w-5 h-5 text-warning" />} value={String(savedIds.length)} title="Saved for Later" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
         <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input placeholder="Search roles, skills, or companies..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-12 pr-6 py-4 rounded-[1.5rem] bg-card border border-border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"/>
         </div>
         <div className="flex gap-2 w-full md:w-auto overflow-x-auto scrollbar-hide pb-1">
            {["All", "Full-time", "Part-time", "Contract", "Internship"].map(t => (
              <button key={t} onClick={() => setJobType(t)} className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all shrink-0 ${jobType === t ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-card text-muted-foreground border border-border hover:border-primary/20"}`}>
                {t}
              </button>
            ))}
         </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          {filtered.length === 0 && <div className="py-20 text-center border-2 border-dashed border-border rounded-[2rem] text-muted-foreground">No jobs found matching your search.</div>}
          {filtered.map(job => {
            const isApplied = alreadyApplied.includes(job.id) || justApplied.includes(job.id);
            const isSaved = savedIds.includes(job.id);
            return (
              <div key={job.id} className="reveal-card glass-premium p-8 hover:border-primary/30 transition-all duration-300">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-3 mb-3">
                       <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors tracking-tight">{job.title}</h3>
                       <span className="badge-pending">{job.type}</span>
                    </div>
                    <div className="flex items-center gap-5 text-sm text-muted-foreground mb-6 font-medium">
                       <span className="flex items-center gap-2"><Building className="w-4 h-4 text-primary" />{job.business}</span>
                       <span className="flex items-center gap-2"><MapPin className="w-4 h-4" />{job.location}</span>
                       <span className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest bg-accent px-2 py-1 rounded-lg">Posted {job.posted}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-8 line-clamp-2 leading-relaxed opacity-80">{job.desc}</p>
                    <div className="flex items-center gap-8">
                       <div className="text-2xl font-black text-foreground tracking-tighter flex items-center gap-1"><IndianRupee className="w-5 h-5 text-primary"/>{job.salary}</div>
                       <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{job.apps} applicants</div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-3 shrink-0">
                    {isApplied ? (
                       <Button className="rounded-2xl bg-success/10 text-success hover:bg-success/20 border-none font-bold px-8 py-7" disabled>✓ Applied</Button>
                    ) : (
                       <Button variant="hero" className="rounded-2xl px-8 py-7 shadow-xl shadow-primary/20 text-xs font-black uppercase tracking-widest" onClick={() => setApplying(job.id)}>Quick Apply</Button>
                    )}
                    <button onClick={() => setSavedIds(p => isSaved ? p.filter(id => id !== job.id) : [...p, job.id])} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isSaved ? "bg-primary text-white rotate-12" : "glass-premium hover:border-primary/40 text-muted-foreground"}`}>
                       <Bookmark className={`w-5 h-5 ${isSaved ? "fill-white" : ""}`} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="card-elevated p-8 bg-primary text-white relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500"><Zap className="w-32 h-32 rotate-12"/></div>
              <h4 className="text-2xl font-black mb-2">Boost Your Profile</h4>
              <p className="text-white/70 text-sm mb-8 leading-relaxed">Verified profiles are 3x more likely to be hired. Complete your KYC and upload your CV.</p>
              <Button variant="hero" className="w-full bg-white text-primary border-transparent hover:bg-white/90 rounded-2xl py-6 font-black uppercase tracking-widest text-xs" onClick={() => addNotification(db, { userId: SEEKER_ID, userType: "jobseeker", title: "KYC Initiated", message: "Verification flow started. Please upload your identity documents in Profile settings.", type: "system", read: false, date: new Date().toLocaleDateString() })}>Verify Profile</Button>
           </div>

           <div className="card-elevated p-8">
              <h4 className="font-bold mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Profile Strength</h4>
              <div className="space-y-4">
                 <div>
                    <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2"><span>Completion</span><span>72%</span></div>
                    <ProgressBar value={72} max={100} className="h-2.5" />
                 </div>
                 <div className="space-y-3 pt-2">
                    {[{t:"Upload CV", s:true}, {t:"KYC Verified", s:false}, {t:"Skills Added", s:true}, {t:"Work History", s:false}].map(l=>(
                      <div key={l.t} className="flex items-center justify-between text-sm">
                        <span className={l.s ? "text-foreground font-medium" : "text-muted-foreground"}>{l.t}</span>
                        {l.s ? <CheckCircle2 className="w-4 h-4 text-success" /> : <div className="w-4 h-4 rounded-full border-2 border-accent" />}
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function Applications() {
  const { user } = useAuth();
  const SEEKER_ID = user?.id || 1;
  const [db] = useDB();
  const apps = (db.jobApplications || []).filter(a => a && a.jobSeekerId === SEEKER_ID);

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 bg-mesh p-8 rounded-[3rem]">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
             <h2 className="text-4xl font-black text-foreground tracking-tight">Your Pipeline</h2>
             <p className="text-muted-foreground font-medium mt-1">Status of {apps.length} active job applications.</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" className="rounded-2xl px-6 font-bold uppercase tracking-widest text-[10px] border-border/60" onClick={() => exportToCSV(apps, "my_applications")}><Download className="w-4 h-4 mr-2"/> Export History</Button>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard icon={<ClipboardList className="w-5 h-5"/>} value={String(apps.length)} title="Total Applied" />
          <MetricCard icon={<Calendar className="w-5 h-5"/>} value={String(apps.filter(a=>a.status?.includes("Interview")).length)} title="Interviews" trendUp />
          <MetricCard icon={<Zap className="w-5 h-5 text-primary"/>} value="3" title="Fast Tracking" subtitle="Under Review" />
          <MetricCard icon={<CheckCircle2 className="w-5 h-5 text-success"/>} value="0" title="Offers Received" />
       </div>

       <div className="card-elevated p-8">
          <div className="space-y-6">
             {apps.length > 0 ? apps.map(a => (
               <div key={a.id} className="p-6 rounded-[2rem] bg-accent/20 border border-border/50 hover:border-primary/20 hover:bg-accent/30 transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                     <div className="flex gap-5 items-center">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-card border border-border flex items-center justify-center text-primary font-black text-2xl shadow-sm">
                           {a.businessName[0]}
                        </div>
                        <div>
                           <h4 className="text-lg font-black">{a.jobTitle}</h4>
                           <div className="flex gap-4 text-xs font-bold text-muted-foreground mt-1">
                              <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5"/>{a.businessName}</span>
                              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/>Applied {a.appliedDate}</span>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-6 self-end md:self-auto">
                        <div className="text-right">
                           <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${a.status === "Interview Scheduled" ? "bg-success/10 text-success" : a.status === "Under Review" ? "bg-primary/10 text-primary" : "bg-card text-muted-foreground"}`}>
                              {a.status}
                           </div>
                           {a.interviewDate && <div className="text-[10px] text-muted-foreground font-medium mt-1">{a.interviewDate}</div>}
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-xl"><MoreHorizontal className="w-5 h-5"/></Button>
                     </div>
                  </div>
                  {a.status === "Interview Scheduled" && (
                    <div className="mt-6 p-4 rounded-2xl bg-success/5 border border-success/10 flex items-center justify-between">
                       <p className="text-xs font-bold text-success">Preparing for your {a.businessName} interview? <span className="underline cursor-pointer" onClick={() => addNotification(db, { userId: SEEKER_ID, userType: "jobseeker", title: "Prep Guide Ready", message: `The interview preparation guide for ${a.businessName} has been generated and sent to your email.`, type: "system", read: false, date: new Date().toLocaleDateString() })}>View Prep Guide</span></p>
                       <Button variant="hero" size="xs" className="rounded-xl bg-success text-white hover:bg-success/90" onClick={() => addNotification(db, { userId: SEEKER_ID, userType: "jobseeker", title: "Meeting Locked", message: "The Zoom interview room will unlock exactly 10 minutes before the scheduled time.", type: "system", read: false, date: new Date().toLocaleDateString() })}>Join Zoom</Button>
                    </div>
                  )}
               </div>
             )) : <div className="py-20 text-center font-medium text-muted-foreground">No applications found. <span className="text-primary cursor-pointer hover:underline">Discover Jobs</span></div>}
          </div>
       </div>
    </div>
  );
}

function SavedJobs() {
  const { user } = useAuth();
  const SEEKER_ID = user?.id || 1;
  const [db] = useDB();
  const jobs = db.jobs.slice(3, 6);

  return (
    <div className="space-y-6 animate-in fade-in duration-700 bg-mesh p-8 rounded-[3rem]">
       <div className="flex justify-between items-center">
         <h2 className="text-3xl font-black">Saved for Later</h2>
         <p className="text-sm text-muted-foreground">{jobs.length} items</p>
       </div>
       <div className="grid md:grid-cols-2 gap-4">
          {jobs.map(job => (
            <div key={job.id} className="card-elevated p-6 flex justify-between items-center group">
              <div>
                <h4 className="font-bold group-hover:text-primary transition-colors">{job.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{job.business} · {job.location}</p>
              </div>
              <Button variant="ghost" size="sm" className="rounded-xl border border-border">View Role</Button>
            </div>
          ))}
       </div>
    </div>
  );
}

function JobNotifications() {
  const { user } = useAuth();
  const SEEKER_ID = user?.id || 1;
  const [db] = useDB();
  const notifs = (db.notifications || []).filter(n => n.userId === SEEKER_ID && n.userType === "jobseeker");

  return (
    <div className="space-y-6 animate-in fade-in duration-700 bg-mesh p-8 rounded-[3rem]">
       <div className="flex justify-between items-center">
         <h2 className="text-3xl font-black">Your Alerts</h2>
         <Button variant="ghost" size="sm" className="text-xs">Mark all read</Button>
       </div>
       <div className="space-y-3">
          {notifs.length > 0 ? notifs.map(n => (
            <div key={n.id} className="p-5 rounded-[2rem] bg-card border border-border flex gap-5 hover:border-primary/30 transition-all group">
               <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                  <Bell className="w-6 h-6" />
               </div>
               <div className="min-w-0">
                  <h4 className="font-bold text-base truncate">{n.title}</h4>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{n.message}</p>
                  <div className="flex gap-4 mt-3 items-center">
                     <span className="text-[10px] text-primary font-black uppercase tracking-widest">{n.date}</span>
                     <span className="w-1 h-1 rounded-full bg-border" />
                     <span className="text-[10px] text-muted-foreground font-bold uppercase">System Update</span>
                  </div>
               </div>
            </div>
          )) : (
            <div className="py-20 text-center text-muted-foreground border-2 border-dashed border-border rounded-[3rem]">
               <Bell className="w-10 h-10 mx-auto mb-4 opacity-20" />
               <p className="font-medium">No new alerts at the moment.</p>
            </div>
          )}
       </div>
    </div>
  );
}

function JobCommunity() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700 bg-mesh p-8 rounded-[3rem]">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <h2 className="text-4xl font-black text-foreground tracking-tight">Community Forum</h2>
            <p className="text-muted-foreground font-medium mt-1">Connect with 5,000+ local job seekers.</p>
         </div>
         <Button variant="hero" className="rounded-2xl px-8 shadow-xl shadow-primary/20"><Plus className="w-5 h-5 mr-2"/> New Discussion</Button>
       </div>
       
       <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
             {[
               { t: "Tips for Retail Interviews", u: "Aditya S.", r: 24, c: "Career Advice" },
               { t: "Anyone working at High Street Phoenix?", u: "Priya K.", r: 156, c: "Salaries" },
               { t: "Best local commute options in Thane", u: "Rahul M.", r: 42, c: "Commute" }
             ].map((d, i) => (
               <div key={i} className="card-elevated p-8 hover:border-primary/20 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                     <span className="px-3 py-1 rounded-full bg-accent text-[10px] font-black uppercase tracking-widest text-muted-foreground">{d.c}</span>
                     <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                        <MessageSquare className="w-4 h-4" /> {d.r}
                     </div>
                  </div>
                  <h4 className="text-xl font-bold group-hover:text-primary transition-colors mb-2">{d.t}</h4>
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                     <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{d.u[0]}</div>
                     Posted by {d.u} · 2h ago
                  </div>
               </div>
             ))}
          </div>
          
          <div className="lg:col-span-4 space-y-6">
             <div className="card-elevated p-8">
                <h4 className="font-bold text-lg mb-6">Trending Tags</h4>
                <div className="flex flex-wrap gap-2">
                   {["#InterviewTips", "#SalaryCheck", "#MumbaiJobs", "#PartTime", "#Freshers"].map(tag => (
                     <span key={tag} className="px-4 py-2 rounded-xl bg-accent/40 border border-border text-xs font-bold hover:bg-primary/5 hover:border-primary/20 cursor-pointer transition-all">{tag}</span>
                   ))}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

function SeekerProfile() {
  const { user } = useAuth();
  const SEEKER_ID = user?.id || 1;
  const [db] = useDB();
  const seeker = db.jobSeekers.find(s => s.id === SEEKER_ID);
  
  if (!seeker) return <div className="py-20 text-center font-medium text-muted-foreground">Profile not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
       <div className="card-elevated p-12 bg-mesh relative overflow-hidden border-border/50">
          <div className="absolute top-0 right-0 p-12 opacity-5"><User className="w-48 h-48" /></div>
          <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
             <div className="w-32 h-32 rounded-[2.5rem] bg-card border border-border shadow-2xl flex items-center justify-center text-primary font-black text-5xl shadow-primary/10">
               {seeker.name[0]}
             </div>
             <div className="text-center md:text-left">
                <h2 className="text-4xl font-black text-foreground tracking-tight">{seeker.name}</h2>
                <p className="text-muted-foreground text-xl font-medium mt-1 uppercase tracking-widest">{seeker.education} Candidate</p>
             </div>
          </div>
       </div>

       <div className="grid md:grid-cols-2 gap-8">
          <div className="card-elevated p-10 space-y-8">
             <h3 className="text-xl font-bold flex items-center gap-3 font-black"><UserCheck className="w-6 h-6 text-primary" /> Personal Identity</h3>
             <div className="space-y-6">
                <div><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Official Email</label><input className={inp} defaultValue={seeker.email} /></div>
                <div><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Registered Phone</label><input className={inp} defaultValue={seeker.phone} /></div>
                <div><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Current City</label><input className={inp} defaultValue={seeker.location} /></div>
                <div className="pt-4"><Button variant="hero" className="w-full rounded-2xl py-7 font-black uppercase tracking-wider shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">Save Profile Changes</Button></div>
             </div>
          </div>

          <div className="card-elevated p-10 space-y-8">
             <h3 className="text-xl font-bold flex items-center gap-3 font-black"><Shield className="w-6 h-6 text-secondary" /> Account Security</h3>
             <div className="space-y-6">
                <div className="flex justify-between items-center p-5 rounded-3xl bg-primary/5 border border-primary/10">
                   <div><p className="text-sm font-bold">Public Profile</p><p className="text-[10px] text-muted-foreground font-black uppercase mt-0.5 tracking-tighter">Visible to all local businesses</p></div>
                   <div className="w-12 h-6 rounded-full bg-primary relative p-1 transition-all"><div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white"></div></div>
                </div>
                <div className="flex justify-between items-center p-5 rounded-3xl bg-accent/20 border border-border/50">
                   <div><p className="text-sm font-bold">Job Alerts</p><p className="text-[10px] text-muted-foreground font-black uppercase mt-0.5 tracking-tighter">Instant WhatsApp notifications</p></div>
                   <div className="w-12 h-6 rounded-full bg-muted relative p-1"><div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm"></div></div>
                </div>
                <div className="pt-4"><Button variant="outline" className="w-full rounded-2xl py-7 font-black uppercase tracking-wider border-2">Change Password</Button></div>
             </div>
          </div>
       </div>
    </div>
  );
}

function MyResume() {
  const { user } = useAuth();
  const SEEKER_ID = user?.id || 1;
  const [db] = useDB();
  const seeker = db.jobSeekers.find(s => s.id === SEEKER_ID);

  if (!seeker) return <div className="py-20 text-center font-medium text-muted-foreground">Profile data missing.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 bg-mesh p-8 rounded-[3rem]">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
             <h2 className="text-4xl font-black text-foreground tracking-tight">Professional Resume</h2>
             <p className="text-muted-foreground font-medium mt-1">Manage your digital CV and skill certifications.</p>
          </div>
          <Button variant="outline" className="rounded-2xl px-6 font-bold" onClick={() => exportToCSV([seeker], "my_resume")}><Download className="w-4 h-4 mr-2"/> Export Resume Data</Button>
       </div>

       <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
             <div className="card-elevated p-10 bg-card">
                <div className="flex justify-between items-start mb-8">
                   <h3 className="text-xl font-bold flex items-center gap-3"><FileCheck className="w-6 h-6 text-primary" /> Active CV</h3>
                   <span className="text-[10px] text-success font-black uppercase tracking-widest bg-success/5 px-4 py-1.5 rounded-full border border-success/10">Parsable by AI</span>
                </div>
                <div className="p-12 rounded-[2.5rem] border-2 border-dashed border-border flex flex-col items-center justify-center text-center group hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer">
                   <div className="w-20 h-20 rounded-3xl bg-card border border-border flex items-center justify-center mb-6 text-muted-foreground group-hover:text-primary transition-colors group-hover:scale-110 transition-transform">
                      <Plus className="w-8 h-8" />
                   </div>
                   <h4 className="text-lg font-bold">Upload New Version</h4>
                   <p className="text-sm text-muted-foreground mt-2 max-w-xs">PDF, DOCX accepted. Our system will automatically update your profile skills.</p>
                </div>
             </div>

             <div className="card-elevated p-10">
                <h3 className="text-xl font-bold mb-8">Experience History</h3>
                <div className="space-y-8 relative ml-4 before:absolute before:left-[-1px] before:top-2 before:bottom-2 before:w-px before:bg-border/50">
                   {[{t:"Senior Associate", b:"Metro Retail", d:"2022 - Present", s:true}, {t:"Sales Junior", b:"Local Mart", d:"2020 - 2022", s:false}].map((w,i) => (
                     <div key={i} className="relative pl-10 group">
                        <div className={`absolute left-[-8px] top-1.5 w-4 h-4 rounded-full border-4 border-card ${w.s ? "bg-primary" : "bg-accent"} group-hover:scale-125 transition-transform`} />
                        <div className="flex justify-between">
                           <h4 className="font-bold text-lg leading-none">{w.t}</h4>
                           <Button variant="ghost" size="icon" className="h-4 w-4 -mt-1"><Pencil className="w-3 h-3"/></Button>
                        </div>
                        <div className="text-primary font-bold text-sm mt-2">{w.b}</div>
                        <div className="text-xs text-muted-foreground mt-1">{w.d}</div>
                     </div>
                   ))}
                   <Button variant="ghost" className="w-full py-4 text-xs font-bold uppercase tracking-widest border border-dashed hover:bg-primary/5">+ Add Work Experience</Button>
                </div>
             </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
             <div className="card-elevated p-8 bg-mesh">
                <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-6 text-muted-foreground">Certified Skills</h4>
                <div className="flex flex-wrap gap-2">
                   {seeker.skills.split(",").map(skill => (
                     <span key={skill} className="px-4 py-2 rounded-xl bg-card border border-border text-[11px] font-black uppercase tracking-tight hover:border-primary/40 cursor-default transition-all">{skill.trim()}</span>
                   ))}
                </div>
                <Button variant="hero" className="w-full mt-8 rounded-2xl py-6 font-black uppercase tracking-widest text-[10px]">Verify Skills via Assessment</Button>
             </div>
          </div>
       </div>
    </div>
  );
}

export default function JobSeekerDashboard() {
  return (
    <DashboardLayout navItems={navItems} groupLabel="Career Hub">
      <div className="max-w-[1200px] mx-auto px-4">
        <Routes>
          <Route index element={<FindJobs />} />
          <Route path="applications" element={<Applications />} />
          <Route path="saved" element={<SavedJobs />} />
          <Route path="profile" element={<MyResume />} />
          <Route path="profile-edit" element={<SeekerProfile />} />
          <Route path="notifications" element={<JobNotifications />} />
          <Route path="community" element={<JobCommunity />} />
        </Routes>
      </div>
    </DashboardLayout>
  );
}
