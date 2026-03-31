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
  Building, MapPinned, FileCheck, Share2, ClipboardList,
} from "lucide-react";
import { useDB, addNotification, formatINR } from "@/lib/db";
import { useAuth } from "@/lib/auth";

const navItems = [
  { title: "Find Jobs",      url: "/dashboard/jobs",               icon: Search        },
  { title: "Applications",   url: "/dashboard/jobs/applications",  icon: FileText      },
  { title: "My Resume",      url: "/dashboard/jobs/profile",       icon: FileCheck     },
  { title: "Saved Roles",    url: "/dashboard/jobs/saved",         icon: Bookmark      },
  { title: "Notifications",  url: "/dashboard/jobs/notifications", icon: Bell          },
  { title: "Community",      url: "/dashboard/jobs/community",     icon: MessageCircle },
  { title: "Seeker Profile",  url: "/dashboard/jobs/profile-edit",  icon: User          },
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

  const alreadyApplied = useMemo(() => db.jobApplications
    .filter(a => a.jobSeekerId === SEEKER_ID)
    .map(a => a.jobId), [db.jobApplications, SEEKER_ID]);

  const jobs = db.jobs.filter(j => j.is_active && j.status === "Active");
  const filtered = useMemo(() => jobs.filter(j => {
    const q = search.toLowerCase();
    return (j.title.toLowerCase().includes(q) || j.business.toLowerCase().includes(q) || j.location.toLowerCase().includes(q))
      && (jobType === "All" || j.type === jobType);
  }).sort((a,b) => b.id - a.id), [jobs, search, jobType]);

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
        jobSeekers: prev.jobSeekers.map(s => s.id === SEEKER_ID ? { ...s, appliedJobs: s.appliedJobs + 1 } : s),
        jobApplications: [...prev.jobApplications, app]
      };
      return addNotification(updated, { userId: SEEKER_ID, userType: "jobseeker", title: `Application Sent ✓`, message: `You applied to ${job.title} at ${job.business}.`, type: "application", read: false, date: dateStr });
    });
    setJustApplied(p => [...p, jobId]);
    setApplying(null);
    setCover("");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
        <MetricCard icon={<Calendar className="w-5 h-5 text-success" />} value={String(db.jobApplications.filter(a => a.jobSeekerId === SEEKER_ID && a.status === "Interview Scheduled").length)} title="Interviews Today" />
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
              <div key={job.id} className="card-elevated group p-6 hover:border-primary/30 transition-all duration-300">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-3 mb-2">
                       <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors">{job.title}</h3>
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-accent/50 text-muted-foreground`}>{job.type}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                       <span className="flex items-center gap-1.5 font-medium"><Building className="w-4 h-4 text-primary" />{job.business}</span>
                       <span className="flex items-center gap-1.5"><MapPinned className="w-4 h-4" />{job.location}</span>
                       <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />Posted {job.posted}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed">{job.desc}</p>
                    <div className="flex items-center gap-6">
                       <div className="flex items-center gap-2 text-foreground font-black"><IndianRupee className="w-4 h-4 text-primary"/>{job.salary}</div>
                       <div className="text-xs text-muted-foreground font-bold">{job.apps} applicants so far</div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    {isApplied ? (
                       <Button variant="outline" className="rounded-2xl border-success text-success bg-success/5 pointer-events-none px-6 py-5">Applied ✓</Button>
                    ) : (
                       <Button variant="hero" className="rounded-2xl px-6 py-5 shadow-lg shadow-primary/20" onClick={() => setApplying(job.id)}>Apply Now <ArrowRight className="w-4 h-4 ml-2"/></Button>
                    )}
                    <button onClick={() => setSavedIds(p => isSaved ? p.filter(id => id !== job.id) : [...p, job.id])} className={`p-4 rounded-2xl border-2 transition-all ${isSaved ? "bg-warning/10 border-warning text-warning" : "border-border hover:border-primary/30 text-muted-foreground"}`}>
                       <Bookmark className={`w-5 h-5 ${isSaved ? "fill-warning" : ""}`} />
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
              <Button variant="hero" className="w-full bg-white text-primary border-transparent hover:bg-white/90 rounded-2xl py-6 font-black uppercase tracking-widest text-xs">Verify Profile</Button>
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
  const apps = db.jobApplications.filter(a => a.jobSeekerId === SEEKER_ID);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div><h2 className="text-3xl font-black text-foreground">Track Applications</h2><p className="text-muted-foreground">Manage your current job pipeline and interview schedule.</p></div>
          <div className="p-1 px-4 bg-accent/30 rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground border border-border/50"><Clock className="w-4 h-4"/> Updated Today</div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard icon={<ClipboardList className="w-5 h-5"/>} value={String(apps.length)} title="Total Applied" />
          <MetricCard icon={<Calendar className="px-5 h-5"/>} value={String(apps.filter(a=>a.status.includes("Interview")).length)} title="Interviews" trendUp />
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
                       <p className="text-xs font-bold text-success">Preparing for your {a.businessName} interview? <span className="underline cursor-pointer">View Prep Guide</span></p>
                       <Button variant="hero" size="xs" className="rounded-xl bg-success text-white hover:bg-success/90">Join Zoom</Button>
                    </div>
                  )}
               </div>
             )) : <div className="py-20 text-center font-medium text-muted-foreground">No applications found. <span className="text-primary cursor-pointer hover:underline">Discover Jobs</span></div>}
          </div>
       </div>
    </div>
  );
}

function SeekerProfile() {
  const { user } = useAuth();
  const SEEKER_ID = user?.id || 1;
  const [db, setDB] = useDB();
  const seeker = db.jobSeekers.find(s => s.id === SEEKER_ID);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: seeker?.name||"", email: seeker?.email||"", phone: seeker?.phone||"", experience: seeker?.experience||"", skills: seeker?.skills||"", bio: "Passionately building my career in retail and customer service with 2+ years of experience." });
  
  if (!seeker) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
       <div className="card-elevated p-0 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent"></div>
          <div className="px-10 pb-10 -mt-12 relative z-10">
             <div className="flex flex-col md:flex-row items-end justify-between gap-6">
                <div className="flex flex-col md:flex-row items-end gap-6 text-center md:text-left">
                   <div className="w-32 h-32 rounded-[2.5rem] bg-card border-[6px] border-card shadow-2xl flex items-center justify-center text-primary font-black text-4xl">
                      {form.name[0]}
                   </div>
                   <div className="pb-2">
                      <h2 className="text-3xl font-black text-foreground tracking-tight">{form.name}</h2>
                      <p className="text-muted-foreground text-sm font-medium mt-1">{seeker.education} · {seeker.location}</p>
                   </div>
                </div>
                <div className="flex gap-2 pb-2">
                   <Button variant="hero" className="rounded-2xl px-6"><Share2 className="w-4 h-4 mr-2" /> Share Profile</Button>
                   <Button variant="outline" className="rounded-2xl px-6" onClick={()=>setEditing(!editing)}>{editing ? "Cancel" : "Edit Profile"}</Button>
                </div>
             </div>
          </div>
       </div>

       <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-6">
             <div className="card-elevated p-8">
                <h3 className="text-xl font-bold mb-4">About Me</h3>
                {editing ? <textarea className={inp} rows={4} value={form.bio} onChange={e=>setForm({...form, bio: e.target.value})} /> : <p className="text-muted-foreground leading-relaxed">{form.bio}</p>}
             </div>
             <div className="card-elevated p-8">
                <h3 className="text-xl font-bold mb-6">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                   {form.skills.split(",").map(s => (
                     <span key={s} className="px-5 py-2.5 rounded-2xl bg-accent/40 border border-border/50 text-sm font-bold flex items-center gap-2 group hover:border-primary/30 transition-all cursor-default">
                        {s.trim()}
                        {editing && <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive cursor-pointer"/>}
                     </span>
                   ))}
                   {editing && <button className="px-5 py-2.5 rounded-2xl border-2 border-dashed border-border hover:border-primary/40 text-muted-foreground text-sm font-bold flex items-center gap-2 transition-all">+ Add Skill</button>}
                </div>
             </div>
             <div className="card-elevated p-8">
                <h3 className="text-xl font-bold mb-8">Work Experience</h3>
                <div className="space-y-10 relative ml-4 before:absolute before:left-[-1px] before:top-2 before:bottom-2 before:w-px before:bg-border/50">
                   {[{t:"Store Associate", b:"Fresh Farms Dairy", d:"2022 - Present", s:true}, {t:"Junior Cashier", b:"Silo Retail", d:"2020 - 2022", s:false}].map((w,i) => (
                     <div key={i} className="relative pl-10">
                        <div className={`absolute left-[-8px] top-1.5 w-4 h-4 rounded-full border-4 border-card ${w.s ? "bg-primary" : "bg-accent"}`} />
                        <h4 className="font-bold text-lg leading-none">{w.t}</h4>
                        <div className="text-primary font-bold text-sm mt-2">{w.b}</div>
                        <div className="text-xs text-muted-foreground mt-1">{w.d}</div>
                     </div>
                   ))}
                   <Button variant="ghost" className="w-full text-xs font-bold uppercase tracking-widest hover:bg-primary/5">+ Add Experience</Button>
                </div>
             </div>
          </div>

          <div className="md:col-span-4 space-y-6">
             <div className="card-elevated p-8">
                <h4 className="font-bold mb-6">Resume / CV</h4>
                <div className="p-6 rounded-3xl bg-accent/20 border border-dashed border-border text-center group hover:bg-accent/40 transition-all cursor-pointer">
                   <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-4 text-muted-foreground group-hover:text-primary transition-colors">
                      <Upload className="w-6 h-6" />
                   </div>
                   <p className="text-sm font-bold">Update Resume</p>
                   <p className="text-[10px] text-muted-foreground mt-2 font-medium">PDF, DOCX up to 5MB</p>
                </div>
             </div>
             <div className="card-elevated p-8">
                <h4 className="font-bold mb-6">Badges & KYC</h4>
                <div className="space-y-3">
                   <div className="flex items-center gap-3 p-3 rounded-2xl bg-success/5 border border-success/10">
                      <Award className="w-5 h-5 text-success" />
                      <div><span className="text-xs font-black block text-success">Verified Seeker</span><span className="text-[10px] text-muted-foreground font-medium uppercase">Trust Score: 98</span></div>
                   </div>
                   <div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/5 border border-primary/10 opacity-50">
                      <Zap className="w-5 h-5 text-primary" />
                      <div><span className="text-xs font-black block">Early Adopter</span><span className="text-[10px] text-muted-foreground font-medium uppercase italic">Earn this badge</span></div>
                   </div>
                </div>
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
          <Route path="saved" element={<FindJobs />} /> {/* Placeholder */}
          <Route path="profile" element={<SeekerProfile />} />
          <Route path="profile-edit" element={<SeekerProfile />} />
          <Route path="notifications" element={<Applications />} /> {/* Placeholder */}
          <Route path="community" element={<Applications />} /> {/* Placeholder */}
        </Routes>
      </div>
    </DashboardLayout>
  );
}
