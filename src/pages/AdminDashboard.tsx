import DashboardLayout from "@/components/DashboardLayout";
import { MetricCard, StatusBadge } from "@/components/ui/metric-card";
import { Routes, Route } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useRef, useCallback } from "react";
import {
  LayoutDashboard, Store, TrendingUp, Briefcase, MessageSquare, BarChart3,
  CreditCard, UserCog, ShieldCheck, AlertTriangle, Clock, Users, CheckCircle2,
  Search, Bell, Star, PieChart, Activity, DollarSign, Plus, Pencil, Trash2,
  X, Save, Send, Ban, Check, RefreshCw, ToggleLeft, ToggleRight,
  FileText, Upload, Eye, Download, Database, UserX, Archive,
} from "lucide-react";
import {
  useDB, softDelete, genId, genTicketId, resetDB,
  type Vendor, type Investor, type JobSeeker, type Job,
  type SupportTicket, type TeamMember, type SubscriptionPlan, type DocFile,
  formatINR,
} from "@/lib/db";

const navItems = [
  { title: "Overview",       url: "/dashboard/admin",                icon: LayoutDashboard },
  { title: "Vendors",        url: "/dashboard/admin/vendors",        icon: Store           },
  { title: "Investors",      url: "/dashboard/admin/investors",      icon: TrendingUp      },
  { title: "Job Seekers",    url: "/dashboard/admin/jobseekers",     icon: Users           },
  { title: "Job Moderation", url: "/dashboard/admin/jobs",          icon: Briefcase       },
  { title: "Support",        url: "/dashboard/admin/support",        icon: MessageSquare   },
  { title: "Analytics",      url: "/dashboard/admin/analytics",      icon: BarChart3       },
  { title: "Subscriptions",  url: "/dashboard/admin/subs",          icon: CreditCard      },
  { title: "Team",           url: "/dashboard/admin/team",          icon: UserCog         },
  { title: "DB Inspector",   url: "/dashboard/admin/db",            icon: Database        },
];

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm">
      <div className={`bg-card rounded-2xl shadow-xl border border-border w-full ${wide ? "max-w-3xl" : "max-w-lg"} max-h-[92vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="font-semibold text-foreground">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel, confirmLabel = "Deactivate", isDanger = true }: {
  message: string; onConfirm: () => void; onCancel: () => void; confirmLabel?: string; isDanger?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm">
      <div className="bg-card rounded-2xl shadow-xl border border-border p-6 w-full max-w-sm">
        <div className="flex items-start gap-3 mb-5">
          <div className={`w-10 h-10 rounded-xl ${isDanger ? "bg-destructive/10" : "bg-amber-500/10"} flex items-center justify-center shrink-0`}>
            <AlertTriangle className={`w-5 h-5 ${isDanger ? "text-destructive" : "text-amber-500"}`} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Confirm Action</h3>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          <Button size="sm" className={isDanger ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-amber-500 text-white hover:bg-amber-600"} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, col2 }: { label: string; children: React.ReactNode; col2?: boolean }) {
  return (
    <div className={col2 ? "col-span-2" : ""}>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      {children}
    </div>
  );
}

const inp = "w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const sel = inp + " cursor-pointer";

// ─── PDF Upload Component ─────────────────────────────────────────────────────

function DocUploader({ docs, onChange, entityLabel }: {
  docs: DocFile[]; onChange: (docs: DocFile[]) => void; entityLabel: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState("kyc");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newDoc: DocFile = {
          id: `doc_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          name: file.name,
          type: docType,
          size: file.size,
          uploadedAt: new Date().toLocaleString("en-IN"),
          base64: ev.target?.result as string,
        };
        onChange([...docs, newDoc]);
      };
      reader.readAsDataURL(file);
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeDoc = (id: string) => onChange(docs.filter(d => d.id !== id));

  const downloadDoc = (doc: DocFile) => {
    if (!doc.base64) return;
    const a = document.createElement("a");
    a.href = doc.base64;
    a.download = doc.name;
    a.click();
  };

  const docTypeLabels: Record<string, string> = {
    kyc: "KYC / Aadhaar", resume: "Resume / CV", gst: "GST Certificate",
    business_reg: "Business Registration", agreement: "Agreement / Contract",
    pan: "PAN Card", bank: "Bank Statement", other: "Other Document",
  };

  const typeColor: Record<string, string> = {
    kyc: "bg-blue-100 text-blue-700", resume: "bg-green-100 text-green-700",
    gst: "bg-orange-100 text-orange-700", business_reg: "bg-purple-100 text-purple-700",
    agreement: "bg-red-100 text-red-700", pan: "bg-yellow-100 text-yellow-700",
    bank: "bg-teal-100 text-teal-700", other: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Document Type</label>
          <select className={sel} value={docType} onChange={e => setDocType(e.target.value)}>
            {Object.entries(docTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
        >
          <Upload className="w-4 h-4" /> Upload PDF / Image
        </button>
        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" multiple className="hidden" onChange={handleFile} />
      </div>

      {docs.length > 0 ? (
        <div className="space-y-2">
          {docs.map(doc => (
            <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-accent/50 border border-border/50 gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{doc.name}</div>
                  <div className="text-xs text-muted-foreground">{(doc.size / 1024).toFixed(1)} KB · {doc.uploadedAt}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[doc.type] || typeColor.other}`}>
                  {docTypeLabels[doc.type] || doc.type}
                </span>
                {doc.base64 && (
                  <button onClick={() => downloadDoc(doc)} title="Download" className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => removeDoc(doc.id)} title="Remove" className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 rounded-xl border-2 border-dashed border-border text-muted-foreground text-sm">
          No documents uploaded for this {entityLabel} yet.
        </div>
      )}
    </div>
  );
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────

function Overview() {
  const [db] = useDB();
  const activeVendors   = db.vendors.filter(v => v.is_active && v.status === "Verified").length;
  const activeInvestors = db.investors.filter(i => i.is_active && i.status === "Active").length;
  const activeJobs      = db.jobs.filter(j => j.is_active && j.status === "Active").length;
  const openTickets     = db.tickets.filter(t => t.is_active && t.status === "Open").length;
  const flaggedJobs     = db.jobs.filter(j => j.is_active && j.status === "Flagged").length;
  const pendingVendors  = db.vendors.filter(v => v.is_active && v.status === "Pending").length;
  const pendingKYC      = db.investors.filter(i => i.is_active && i.kycStatus === "Pending").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={<Store className="w-5 h-5"/>}     value={String(activeVendors)}   title="Verified Vendors"        trend="+12%" trendUp />
        <MetricCard icon={<TrendingUp className="w-5 h-5"/>} value={String(activeInvestors)} title="Active Investors"         trend="+8%"  trendUp />
        <MetricCard icon={<Briefcase className="w-5 h-5"/>}  value={String(activeJobs)}       title="Active Jobs"              trend="+23%" trendUp />
        <MetricCard icon={<CreditCard className="w-5 h-5"/>} value="₹12.4Cr" title="Investments Facilitated" trend="+18%" trendUp />
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card-elevated p-5 lg:col-span-2">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-primary"/>Platform Health</h3>
          {[
            { label: "Vendor Verification Rate", val: Math.round(activeVendors / Math.max(db.vendors.filter(v=>v.is_active).length, 1) * 100), color: "gradient-primary" },
            { label: "Investor Retention",       val: 94, color: "bg-secondary"     },
            { label: "Job Fill Rate",            val: 61, color: "bg-success"       },
            { label: "Support Resolution",       val: Math.round(db.tickets.filter(t=>t.is_active && t.status==="Resolved").length / Math.max(db.tickets.filter(t=>t.is_active).length,1) * 100), color: "bg-primary" },
          ].map(m => (
            <div key={m.label} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{m.label}</span>
                <span className="font-medium text-foreground">{m.val}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.val}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="card-elevated p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-destructive"/>Needs Action</h3>
          <div className="space-y-3">
            {[
              { label: "Pending Verifications", count: pendingVendors, color: "bg-primary/10 text-primary" },
              { label: "Open Support Tickets",  count: openTickets,    color: "bg-destructive/10 text-destructive" },
              { label: "Flagged Job Listings",  count: flaggedJobs,    color: "bg-amber-500/10 text-amber-600" },
              { label: "Pending KYC",           count: pendingKYC,     color: "bg-secondary/10 text-secondary" },
            ].map(a => (
              <div key={a.label} className="flex justify-between items-center p-3 rounded-xl bg-accent/50">
                <span className="text-sm text-foreground">{a.label}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${a.color}`}>{a.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── VENDORS ──────────────────────────────────────────────────────────────────

const cats = ["Food","Services","Beauty","Retail","Manufacturing","Technology","Education","Healthcare"];

function Vendors() {
  const [db, setDB] = useDB();
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("All");
  const [showInactive, setShowInactive] = useState(false);
  const [editing, setEditing]   = useState<Vendor | null>(null);
  const [adding, setAdding]     = useState(false);
  const [deactivating, setDeactivating] = useState<number | null>(null);
  const [viewingDocs, setViewingDocs]   = useState<Vendor | null>(null);

  const blank: Omit<Vendor,"id"> = { name:"",owner:"",email:"",phone:"",category:"Food",location:"",status:"Pending",goal:0,raised:0,returns:"",tenure:"",investors:0,description:"",gstNumber:"",bankAccount:"",joinedDate:new Date().toLocaleDateString("en-IN",{month:"short",year:"numeric"}),documents:[],is_active:true,minInvest:5000,maxInvest:200000,rating:4.5, walletBalance:0, updates:[], milestones:[], team:[] };
  const [draft, setDraft] = useState<Omit<Vendor,"id">>(blank);

  const vendors = db.vendors;
  const shown = vendors.filter(v => {
    if (!showInactive && !v.is_active) return false;
    const q = search.toLowerCase();
    const matchQ = v.name.toLowerCase().includes(q) || v.owner.toLowerCase().includes(q);
    const matchF = filter === "All" || v.status === filter;
    return matchQ && matchF;
  });

  const save = () => {
    setDB(d => ({ ...d, vendors: d.vendors.map(v => v.id === editing!.id ? editing! : v) }));
    setEditing(null);
  };
  const add = () => {
    setDB(d => ({ ...d, vendors: [...d.vendors, { id: genId(d.vendors), ...draft }] }));
    setAdding(false); setDraft(blank);
  };
  const deactivate = (id: number) => {
    setDB(d => ({ ...d, vendors: d.vendors.map(v => v.id === id ? softDelete(v) : v) }));
    setDeactivating(null);
  };
  const restore = (id: number) => {
    setDB(d => ({ ...d, vendors: d.vendors.map(v => v.id === id ? { ...v, is_active: true, deleted_at: undefined } : v) }));
  };
  const changeStatus = (id: number, status: string) => {
    setDB(d => ({ ...d, vendors: d.vendors.map(v => v.id === id ? { ...v, status } : v) }));
  };
  const saveDocs = (id: number, docs: DocFile[]) => {
    setDB(d => ({ ...d, vendors: d.vendors.map(v => v.id === id ? { ...v, documents: docs } : v) }));
    if (viewingDocs) setViewingDocs(prev => prev ? { ...prev, documents: docs } : null);
  };

  const statusColor: Record<string,string> = {
    Verified: "badge-verified", Pending: "badge-pending",
    Suspended: "bg-destructive/10 text-destructive inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
  };
  const statuses = ["All","Verified","Pending","Suspended"];

  return (
    <div className="space-y-5 animate-fade-in">
      {deactivating !== null && <ConfirmDialog message="This vendor will be marked inactive and hidden from the website. Data is preserved in the database." onConfirm={() => deactivate(deactivating!)} onCancel={() => setDeactivating(null)} confirmLabel="Deactivate" isDanger={false} />}

      {viewingDocs && (
        <Modal title={`Documents — ${viewingDocs.name}`} onClose={() => setViewingDocs(null)} wide>
          <DocUploader
            docs={viewingDocs.documents}
            entityLabel="vendor"
            onChange={docs => saveDocs(viewingDocs.id, docs)}
          />
        </Modal>
      )}

      {editing && (
        <Modal title={`Edit Vendor — ${editing.name}`} onClose={() => setEditing(null)} wide>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Business Name"><input className={inp} value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} /></Field>
            <Field label="Owner Name"><input className={inp} value={editing.owner} onChange={e=>setEditing({...editing,owner:e.target.value})} /></Field>
            <Field label="Email"><input className={inp} value={editing.email} onChange={e=>setEditing({...editing,email:e.target.value})} /></Field>
            <Field label="Phone"><input className={inp} value={editing.phone} onChange={e=>setEditing({...editing,phone:e.target.value})} /></Field>
            <Field label="Category">
              <select className={sel} value={editing.category} onChange={e=>setEditing({...editing,category:e.target.value})}>
                {cats.map(c=><option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Location"><input className={inp} value={editing.location} onChange={e=>setEditing({...editing,location:e.target.value})} /></Field>
            <Field label="Status">
              <select className={sel} value={editing.status} onChange={e=>setEditing({...editing,status:e.target.value})}>
                {["Verified","Pending","Suspended"].map(s=><option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Funding Goal"><input className={inp} type="number" value={editing.goal} onChange={e=>setEditing({...editing,goal:parseInt(e.target.value)||0})} /></Field>
            <Field label="Returns Offered"><input className={inp} value={editing.returns} onChange={e=>setEditing({...editing,returns:e.target.value})} /></Field>
            <Field label="Tenure"><input className={inp} value={editing.tenure} onChange={e=>setEditing({...editing,tenure:e.target.value})} /></Field>
            <Field label="GST Number"><input className={inp} value={editing.gstNumber} onChange={e=>setEditing({...editing,gstNumber:e.target.value})} /></Field>
            <Field label="Bank Account"><input className={inp} value={editing.bankAccount} onChange={e=>setEditing({...editing,bankAccount:e.target.value})} /></Field>
            <Field label="Description" col2>
              <textarea rows={2} className={inp} value={editing.description} onChange={e=>setEditing({...editing,description:e.target.value})} />
            </Field>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5"><FileText className="w-4 h-4"/>Documents</h4>
            <DocUploader docs={editing.documents} entityLabel="vendor" onChange={docs => setEditing({...editing, documents: docs})} />
          </div>
          <div className="flex gap-2 mt-5 justify-end">
            <Button variant="outline" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="hero" size="sm" onClick={save}><Save className="w-4 h-4 mr-1"/>Save Changes</Button>
          </div>
        </Modal>
      )}

      <div className="grid grid-cols-4 gap-4">
        <MetricCard icon={<Store className="w-5 h-5"/>}        value={String(vendors.filter(v=>v.is_active).length)}                          title="Active Vendors" />
        <MetricCard icon={<CheckCircle2 className="w-5 h-5"/>} value={String(vendors.filter(v=>v.is_active&&v.status==="Verified").length)}    title="Verified" trendUp trend="live" />
        <MetricCard icon={<Clock className="w-5 h-5"/>}        value={String(vendors.filter(v=>v.is_active&&v.status==="Pending").length)}     title="Pending" />
        <MetricCard icon={<Archive className="w-5 h-5"/>}      value={String(vendors.filter(v=>!v.is_active).length)}                          title="Inactive (DB)" />
      </div>

      <div className="card-elevated p-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
            <input placeholder="Search name or owner…" value={search} onChange={e=>setSearch(e.target.value)} className={inp+" pl-9"} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statuses.map(s=>(
              <button key={s} onClick={()=>setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter===s?"bg-primary text-primary-foreground":"bg-accent text-muted-foreground hover:text-foreground"}`}>{s}</button>
            ))}
          </div>
          <label className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer select-none">
            <input type="checkbox" checked={showInactive} onChange={e=>setShowInactive(e.target.checked)} className="accent-primary" />
            Show Inactive
          </label>
          <Button variant="hero" size="sm" onClick={() => { setAdding(true); setDraft(blank); }}><Plus className="w-4 h-4 mr-1"/>Add Vendor</Button>
        </div>

        {adding && (
          <div className="mb-5 p-5 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
            <h4 className="font-semibold text-foreground text-sm flex items-center gap-2"><Plus className="w-4 h-4"/>New Vendor</h4>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Business Name"><input className={inp} placeholder="e.g. City Cafe" value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} /></Field>
              <Field label="Owner Name"><input className={inp} placeholder="Owner full name" value={draft.owner} onChange={e=>setDraft({...draft,owner:e.target.value})} /></Field>
              <Field label="Email"><input className={inp} placeholder="owner@biz.com" value={draft.email} onChange={e=>setDraft({...draft,email:e.target.value})} /></Field>
              <Field label="Phone"><input className={inp} placeholder="+91 XXXXX XXXXX" value={draft.phone} onChange={e=>setDraft({...draft,phone:e.target.value})} /></Field>
              <Field label="Category">
                <select className={sel} value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value})}>
                  {cats.map(c=><option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Location"><input className={inp} placeholder="City / Area" value={draft.location} onChange={e=>setDraft({...draft,location:e.target.value})} /></Field>
              <Field label="Funding Goal"><input className={inp} type="number" placeholder="1200000" value={draft.goal || ""} onChange={e=>setDraft({...draft,goal:parseInt(e.target.value)||0})} /></Field>
              <Field label="Returns Offered"><input className={inp} placeholder="10%" value={draft.returns} onChange={e=>setDraft({...draft,returns:e.target.value})} /></Field>
              <Field label="Tenure"><input className={inp} placeholder="12 mo" value={draft.tenure} onChange={e=>setDraft({...draft,tenure:e.target.value})} /></Field>
              <Field label="GST Number"><input className={inp} placeholder="27XXXXX" value={draft.gstNumber} onChange={e=>setDraft({...draft,gstNumber:e.target.value})} /></Field>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="hero" size="sm" onClick={add} disabled={!draft.name||!draft.owner}><Save className="w-4 h-4 mr-1"/>Create Vendor</Button>
              <Button variant="outline" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted-foreground border-b border-border">
              <th className="pb-3 font-medium">Business</th>
              <th className="pb-3 font-medium">Owner</th>
              <th className="pb-3 font-medium">Category</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Raised</th>
              <th className="pb-3 font-medium">Docs</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {shown.map(v=>(
                <tr key={v.id} className={`border-b border-border/40 last:border-0 ${!v.is_active ? "opacity-50" : ""}`}>
                  <td className="py-3 font-medium">
                    {v.name}
                    {!v.is_active && <span className="ml-2 text-xs text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">INACTIVE</span>}
                  </td>
                  <td className="py-3 text-muted-foreground">{v.owner}</td>
                  <td className="py-3 text-muted-foreground">{v.category}</td>
                  <td className="py-3"><span className={statusColor[v.status]||"badge-pending"}>{v.status}</span></td>
                  <td className="py-3 font-medium">{v.raised === 0 ? "—" : formatINR(v.raised)}</td>
                  <td className="py-3">
                    <button onClick={() => setViewingDocs(v)} className="flex items-center gap-1 text-xs text-primary hover:underline">
                      <FileText className="w-3 h-3"/>{v.documents.length} file{v.documents.length !== 1 ? "s" : ""}
                    </button>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-1 flex-wrap">
                      {v.is_active && v.status==="Pending" && <>
                        <button onClick={()=>changeStatus(v.id,"Verified")} title="Approve" className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"><Check className="w-3.5 h-3.5"/></button>
                        <button onClick={()=>changeStatus(v.id,"Suspended")} title="Reject" className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"><X className="w-3.5 h-3.5"/></button>
                      </>}
                      {v.is_active && v.status==="Verified" && <button onClick={()=>changeStatus(v.id,"Suspended")} title="Suspend" className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-colors"><Ban className="w-3.5 h-3.5"/></button>}
                      {v.is_active && v.status==="Suspended" && <button onClick={()=>changeStatus(v.id,"Verified")} title="Reinstate" className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"><RefreshCw className="w-3.5 h-3.5"/></button>}
                      {v.is_active && <button onClick={()=>setEditing({...v})} title="Edit" className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"><Pencil className="w-3.5 h-3.5"/></button>}
                      {v.is_active
                        ? <button onClick={()=>setDeactivating(v.id)} title="Deactivate (soft)" className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"><UserX className="w-3.5 h-3.5"/></button>
                        : <button onClick={()=>restore(v.id)} title="Restore" className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"><RefreshCw className="w-3.5 h-3.5"/></button>
                      }
                    </div>
                  </td>
                </tr>
              ))}
              {shown.length===0 && <tr><td colSpan={7} className="py-8 text-center text-muted-foreground text-sm">No vendors match your search.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── INVESTORS ────────────────────────────────────────────────────────────────

function Investors() {
  const [db, setDB] = useDB();
  const [search, setSearch]       = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [editing, setEditing]     = useState<Investor|null>(null);
  const [adding, setAdding]       = useState(false);
  const [deactivating, setDeactivating] = useState<number|null>(null);
  const [viewingDocs, setViewingDocs]   = useState<Investor|null>(null);

  const blank: Omit<Investor,"id"> = { name:"",email:"",phone:"",location:"",totalInvested:0,totalReturns:0,portfolio:0,status:"Active",joined:new Date().toLocaleDateString("en-IN",{month:"short",year:"numeric"}),plan:"Basic",panNumber:"",bankAccount:"",kycStatus:"Pending",documents:[],is_active:true };
  const [draft, setDraft] = useState<Omit<Investor,"id">>(blank);

  const investors = db.investors;
  const shown = investors.filter(i => {
    if (!showInactive && !i.is_active) return false;
    const q = search.toLowerCase();
    return i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q);
  });

  const save  = () => { setDB(d=>({...d,investors:d.investors.map(i=>i.id===editing!.id?editing!:i)})); setEditing(null); };
  const add   = () => { setDB(d=>({...d,investors:[...d.investors,{id:genId(d.investors),...draft}]})); setAdding(false); setDraft(blank); };
  const deactivate = (id:number) => { setDB(d=>({...d,investors:d.investors.map(i=>i.id===id?softDelete(i):i)})); setDeactivating(null); };
  const restore    = (id:number) => { setDB(d=>({...d,investors:d.investors.map(i=>i.id===id?{...i,is_active:true,deleted_at:undefined}:i)})); };
  const toggle     = (id:number) => { setDB(d=>({...d,investors:d.investors.map(i=>i.id===id?{...i,status:i.status==="Active"?"Suspended":"Active"}:i)})); };
  const saveDocs   = (id:number, docs:DocFile[]) => {
    setDB(d=>({...d,investors:d.investors.map(i=>i.id===id?{...i,documents:docs}:i)}));
    if (viewingDocs) setViewingDocs(prev=>prev?{...prev,documents:docs}:null);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {deactivating!==null && <ConfirmDialog message="This investor will be marked inactive and hidden from the website. All data is preserved." onConfirm={()=>deactivate(deactivating!)} onCancel={()=>setDeactivating(null)} confirmLabel="Deactivate" isDanger={false}/>}

      {viewingDocs && (
        <Modal title={`Documents — ${viewingDocs.name}`} onClose={()=>setViewingDocs(null)} wide>
          <DocUploader docs={viewingDocs.documents} entityLabel="investor" onChange={docs=>saveDocs(viewingDocs.id,docs)} />
        </Modal>
      )}

      {editing && (
        <Modal title={`Edit Investor — ${editing.name}`} onClose={()=>setEditing(null)} wide>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full Name"><input className={inp} value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} /></Field>
            <Field label="Email"><input className={inp} value={editing.email} onChange={e=>setEditing({...editing,email:e.target.value})} /></Field>
            <Field label="Phone"><input className={inp} value={editing.phone} onChange={e=>setEditing({...editing,phone:e.target.value})} /></Field>
            <Field label="Location"><input className={inp} value={editing.location} onChange={e=>setEditing({...editing,location:e.target.value})} /></Field>
            <Field label="Total Invested"><input className={inp} type="number" value={editing.totalInvested} onChange={e=>setEditing({...editing,totalInvested:parseInt(e.target.value)||0})} /></Field>
            <Field label="Returns Earned"><input className={inp} type="number" value={editing.totalReturns} onChange={e=>setEditing({...editing,totalReturns:parseInt(e.target.value)||0})} /></Field>
            <Field label="PAN Number"><input className={inp} value={editing.panNumber} onChange={e=>setEditing({...editing,panNumber:e.target.value})} /></Field>
            <Field label="Bank Account"><input className={inp} value={editing.bankAccount} onChange={e=>setEditing({...editing,bankAccount:e.target.value})} /></Field>
            <Field label="KYC Status">
              <select className={sel} value={editing.kycStatus} onChange={e=>setEditing({...editing,kycStatus:e.target.value})}>
                {["Pending","Verified","Rejected"].map(s=><option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Plan">
              <select className={sel} value={editing.plan} onChange={e=>setEditing({...editing,plan:e.target.value})}>
                {["Basic","Premium"].map(p=><option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className={sel} value={editing.status} onChange={e=>setEditing({...editing,status:e.target.value})}>
                {["Active","Suspended"].map(s=><option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5"><FileText className="w-4 h-4"/>Documents (KYC, PAN, Bank Statements)</h4>
            <DocUploader docs={editing.documents} entityLabel="investor" onChange={docs=>setEditing({...editing,documents:docs})} />
          </div>
          <div className="flex gap-2 mt-5 justify-end">
            <Button variant="outline" size="sm" onClick={()=>setEditing(null)}>Cancel</Button>
            <Button variant="hero" size="sm" onClick={save}><Save className="w-4 h-4 mr-1"/>Save</Button>
          </div>
        </Modal>
      )}

      <div className="grid grid-cols-4 gap-4">
        <MetricCard icon={<Users className="w-5 h-5"/>}       value={String(investors.filter(i=>i.is_active).length)}                    title="Active Investors" />
        <MetricCard icon={<Activity className="w-5 h-5"/>}    value={String(investors.filter(i=>i.is_active&&i.status==="Active").length)} title="Active"     trendUp />
        <MetricCard icon={<Star className="w-5 h-5"/>}        value={String(investors.filter(i=>i.is_active&&i.plan==="Premium").length)}  title="Premium" trendUp />
        <MetricCard icon={<Archive className="w-5 h-5"/>}     value={String(investors.filter(i=>!i.is_active).length)}                    title="Inactive (DB)" />
      </div>

      <div className="card-elevated p-5">
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
            <input placeholder="Search investors…" value={search} onChange={e=>setSearch(e.target.value)} className={inp+" pl-9"} />
          </div>
          <label className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer select-none">
            <input type="checkbox" checked={showInactive} onChange={e=>setShowInactive(e.target.checked)} className="accent-primary" />
            Show Inactive
          </label>
          <Button variant="hero" size="sm" onClick={()=>{setAdding(true);setDraft(blank);}}><Plus className="w-4 h-4 mr-1"/>Add Investor</Button>
        </div>

        {adding && (
          <div className="mb-5 p-5 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
            <h4 className="font-semibold text-foreground text-sm">New Investor Account</h4>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name"><input className={inp} placeholder="Investor name" value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} /></Field>
              <Field label="Email"><input className={inp} placeholder="email@example.com" value={draft.email} onChange={e=>setDraft({...draft,email:e.target.value})} /></Field>
              <Field label="Phone"><input className={inp} placeholder="+91 XXXXX XXXXX" value={draft.phone} onChange={e=>setDraft({...draft,phone:e.target.value})} /></Field>
              <Field label="Location"><input className={inp} placeholder="City" value={draft.location} onChange={e=>setDraft({...draft,location:e.target.value})} /></Field>
              <Field label="PAN Number"><input className={inp} placeholder="ABCDE1234F" value={draft.panNumber} onChange={e=>setDraft({...draft,panNumber:e.target.value})} /></Field>
              <Field label="Plan">
                <select className={sel} value={draft.plan} onChange={e=>setDraft({...draft,plan:e.target.value})}>
                  <option>Basic</option><option>Premium</option>
                </select>
              </Field>
            </div>
            <div className="flex gap-2">
              <Button variant="hero" size="sm" onClick={add} disabled={!draft.name||!draft.email}><Save className="w-4 h-4 mr-1"/>Create</Button>
              <Button variant="outline" size="sm" onClick={()=>setAdding(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted-foreground border-b border-border">
              <th className="pb-3 font-medium">Investor</th>
              <th className="pb-3 font-medium">Location</th>
              <th className="pb-3 font-medium">Invested</th>
              <th className="pb-3 font-medium">Returns</th>
              <th className="pb-3 font-medium">KYC</th>
              <th className="pb-3 font-medium">Plan</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Docs</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {shown.map(inv=>(
                <tr key={inv.id} className={`border-b border-border/40 last:border-0 ${!inv.is_active?"opacity-50":""}`}>
                  <td className="py-3">
                    <div className="font-medium text-foreground">{inv.name}{!inv.is_active&&<span className="ml-2 text-xs text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">INACTIVE</span>}</div>
                    <div className="text-xs text-muted-foreground">{inv.email}</div>
                  </td>
                  <td className="py-3 text-muted-foreground">{inv.location}</td>
                  <td className="py-3 font-medium">{formatINR(inv.totalInvested)}</td>
                  <td className="py-3 text-success">+{formatINR(inv.totalReturns)}</td>
                  <td className="py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${inv.kycStatus==="Verified"?"badge-verified":inv.kycStatus==="Rejected"?"bg-destructive/10 text-destructive inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium":"badge-pending"}`}>{inv.kycStatus}</span>
                  </td>
                  <td className="py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${inv.plan==="Premium"?"badge-premium":"bg-muted text-foreground"}`}>{inv.plan}</span></td>
                  <td className="py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${inv.status==="Active"?"badge-verified":"bg-destructive/10 text-destructive"}`}>{inv.status}</span></td>
                  <td className="py-3">
                    <button onClick={()=>setViewingDocs(inv)} className="flex items-center gap-1 text-xs text-primary hover:underline">
                      <FileText className="w-3 h-3"/>{inv.documents.length}
                    </button>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      {inv.is_active && <>
                        <button onClick={()=>toggle(inv.id)} title={inv.status==="Active"?"Suspend":"Reinstate"}
                          className={`p-1.5 rounded-lg transition-colors ${inv.status==="Active"?"bg-amber-500/10 text-amber-600 hover:bg-amber-500/20":"bg-success/10 text-success hover:bg-success/20"}`}>
                          {inv.status==="Active"?<Ban className="w-3.5 h-3.5"/>:<RefreshCw className="w-3.5 h-3.5"/>}
                        </button>
                        <button onClick={()=>setEditing({...inv})} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"><Pencil className="w-3.5 h-3.5"/></button>
                        <button onClick={()=>setDeactivating(inv.id)} className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"><UserX className="w-3.5 h-3.5"/></button>
                      </>}
                      {!inv.is_active && <button onClick={()=>restore(inv.id)} title="Restore" className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"><RefreshCw className="w-3.5 h-3.5"/></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── JOB SEEKERS ──────────────────────────────────────────────────────────────

function JobSeekers() {
  const [db, setDB] = useDB();
  const [search, setSearch]       = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [editing, setEditing]     = useState<JobSeeker|null>(null);
  const [adding, setAdding]       = useState(false);
  const [deactivating, setDeactivating] = useState<number|null>(null);
  const [viewingDocs, setViewingDocs]   = useState<JobSeeker|null>(null);

  const blank: Omit<JobSeeker,"id"> = { name:"",email:"",phone:"",location:"",skills:"",experience:"Fresher",status:"Active",appliedJobs:0,joinedDate:new Date().toLocaleDateString("en-IN",{month:"short",year:"numeric"}),currentRole:"",education:"",documents:[],is_active:true };
  const [draft, setDraft] = useState<Omit<JobSeeker,"id">>(blank);

  const seekers = db.jobSeekers;
  const shown = seekers.filter(s => {
    if (!showInactive && !s.is_active) return false;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.skills.toLowerCase().includes(q);
  });

  const save  = () => { setDB(d=>({...d,jobSeekers:d.jobSeekers.map(s=>s.id===editing!.id?editing!:s)})); setEditing(null); };
  const add   = () => { setDB(d=>({...d,jobSeekers:[...d.jobSeekers,{id:genId(d.jobSeekers),...draft}]})); setAdding(false); setDraft(blank); };
  const deactivate = (id:number) => { setDB(d=>({...d,jobSeekers:d.jobSeekers.map(s=>s.id===id?softDelete(s):s)})); setDeactivating(null); };
  const restore    = (id:number) => { setDB(d=>({...d,jobSeekers:d.jobSeekers.map(s=>s.id===id?{...s,is_active:true,deleted_at:undefined}:s)})); };
  const saveDocs   = (id:number, docs:DocFile[]) => {
    setDB(d=>({...d,jobSeekers:d.jobSeekers.map(s=>s.id===id?{...s,documents:docs}:s)}));
    if (viewingDocs) setViewingDocs(prev=>prev?{...prev,documents:docs}:null);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {deactivating!==null && <ConfirmDialog message="This job seeker profile will be marked inactive. Data remains in the database." onConfirm={()=>deactivate(deactivating!)} onCancel={()=>setDeactivating(null)} confirmLabel="Deactivate" isDanger={false}/>}

      {viewingDocs && (
        <Modal title={`Documents — ${viewingDocs.name}`} onClose={()=>setViewingDocs(null)} wide>
          <DocUploader docs={viewingDocs.documents} entityLabel="job seeker" onChange={docs=>saveDocs(viewingDocs.id,docs)} />
        </Modal>
      )}

      {editing && (
        <Modal title={`Edit Job Seeker — ${editing.name}`} onClose={()=>setEditing(null)} wide>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full Name"><input className={inp} value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} /></Field>
            <Field label="Email"><input className={inp} value={editing.email} onChange={e=>setEditing({...editing,email:e.target.value})} /></Field>
            <Field label="Phone"><input className={inp} value={editing.phone} onChange={e=>setEditing({...editing,phone:e.target.value})} /></Field>
            <Field label="Location"><input className={inp} value={editing.location} onChange={e=>setEditing({...editing,location:e.target.value})} /></Field>
            <Field label="Experience"><input className={inp} value={editing.experience} onChange={e=>setEditing({...editing,experience:e.target.value})} /></Field>
            <Field label="Education"><input className={inp} value={editing.education} onChange={e=>setEditing({...editing,education:e.target.value})} /></Field>
            <Field label="Current Role / Seeking"><input className={inp} value={editing.currentRole} onChange={e=>setEditing({...editing,currentRole:e.target.value})} /></Field>
            <Field label="Status">
              <select className={sel} value={editing.status} onChange={e=>setEditing({...editing,status:e.target.value})}>
                {["Active","Inactive"].map(s=><option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Skills" col2>
              <input className={inp} value={editing.skills} onChange={e=>setEditing({...editing,skills:e.target.value})} placeholder="Comma-separated skills" />
            </Field>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5"><FileText className="w-4 h-4"/>Documents (Resume, Certificates)</h4>
            <DocUploader docs={editing.documents} entityLabel="job seeker" onChange={docs=>setEditing({...editing,documents:docs})} />
          </div>
          <div className="flex gap-2 mt-5 justify-end">
            <Button variant="outline" size="sm" onClick={()=>setEditing(null)}>Cancel</Button>
            <Button variant="hero" size="sm" onClick={save}><Save className="w-4 h-4 mr-1"/>Save</Button>
          </div>
        </Modal>
      )}

      <div className="grid grid-cols-4 gap-4">
        <MetricCard icon={<Users className="w-5 h-5"/>}   value={String(seekers.filter(s=>s.is_active).length)}               title="Active Seekers" />
        <MetricCard icon={<CheckCircle2 className="w-5 h-5"/>} value={String(seekers.filter(s=>s.is_active&&s.status==="Active").length)} title="Searching" trendUp />
        <MetricCard icon={<Briefcase className="w-5 h-5"/>} value={String(seekers.filter(s=>s.is_active).reduce((a,s)=>a+s.appliedJobs,0))} title="Total Applications" />
        <MetricCard icon={<Archive className="w-5 h-5"/>} value={String(seekers.filter(s=>!s.is_active).length)} title="Inactive (DB)" />
      </div>

      <div className="card-elevated p-5">
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
            <input placeholder="Search name, email, or skill…" value={search} onChange={e=>setSearch(e.target.value)} className={inp+" pl-9"} />
          </div>
          <label className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer select-none">
            <input type="checkbox" checked={showInactive} onChange={e=>setShowInactive(e.target.checked)} className="accent-primary" />
            Show Inactive
          </label>
          <Button variant="hero" size="sm" onClick={()=>{setAdding(true);setDraft(blank);}}><Plus className="w-4 h-4 mr-1"/>Add Job Seeker</Button>
        </div>

        {adding && (
          <div className="mb-5 p-5 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
            <h4 className="font-semibold text-foreground text-sm">New Job Seeker Profile</h4>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name"><input className={inp} placeholder="Full name" value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} /></Field>
              <Field label="Email"><input className={inp} placeholder="email@example.com" value={draft.email} onChange={e=>setDraft({...draft,email:e.target.value})} /></Field>
              <Field label="Phone"><input className={inp} placeholder="+91 XXXXX XXXXX" value={draft.phone} onChange={e=>setDraft({...draft,phone:e.target.value})} /></Field>
              <Field label="Location"><input className={inp} placeholder="City / Area" value={draft.location} onChange={e=>setDraft({...draft,location:e.target.value})} /></Field>
              <Field label="Experience"><input className={inp} placeholder="e.g. 2 years" value={draft.experience} onChange={e=>setDraft({...draft,experience:e.target.value})} /></Field>
              <Field label="Education"><input className={inp} placeholder="Highest qualification" value={draft.education} onChange={e=>setDraft({...draft,education:e.target.value})} /></Field>
              <Field label="Skills" col2><input className={inp} placeholder="Comma-separated skills" value={draft.skills} onChange={e=>setDraft({...draft,skills:e.target.value})} /></Field>
            </div>
            <div className="flex gap-2">
              <Button variant="hero" size="sm" onClick={add} disabled={!draft.name||!draft.email}><Save className="w-4 h-4 mr-1"/>Create Profile</Button>
              <Button variant="outline" size="sm" onClick={()=>setAdding(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted-foreground border-b border-border">
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium">Location</th>
              <th className="pb-3 font-medium">Skills</th>
              <th className="pb-3 font-medium">Experience</th>
              <th className="pb-3 font-medium">Applications</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Docs</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {shown.map(s=>(
                <tr key={s.id} className={`border-b border-border/40 last:border-0 ${!s.is_active?"opacity-50":""}`}>
                  <td className="py-3">
                    <div className="font-medium text-foreground">{s.name}{!s.is_active&&<span className="ml-2 text-xs text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">INACTIVE</span>}</div>
                    <div className="text-xs text-muted-foreground">{s.email}</div>
                  </td>
                  <td className="py-3 text-muted-foreground">{s.location}</td>
                  <td className="py-3 text-muted-foreground max-w-32 truncate" title={s.skills}>{s.skills || "—"}</td>
                  <td className="py-3 text-muted-foreground">{s.experience}</td>
                  <td className="py-3 font-medium">{s.appliedJobs}</td>
                  <td className="py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.status==="Active"?"badge-verified":"bg-muted text-muted-foreground"}`}>{s.status}</span></td>
                  <td className="py-3">
                    <button onClick={()=>setViewingDocs(s)} className="flex items-center gap-1 text-xs text-primary hover:underline">
                      <FileText className="w-3 h-3"/>{s.documents.length}
                    </button>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      {s.is_active && <>
                        <button onClick={()=>setEditing({...s})} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"><Pencil className="w-3.5 h-3.5"/></button>
                        <button onClick={()=>setDeactivating(s.id)} className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"><UserX className="w-3.5 h-3.5"/></button>
                      </>}
                      {!s.is_active && <button onClick={()=>restore(s.id)} className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"><RefreshCw className="w-3.5 h-3.5"/></button>}
                    </div>
                  </td>
                </tr>
              ))}
              {shown.length===0&&<tr><td colSpan={8} className="py-8 text-center text-muted-foreground text-sm">No job seekers found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── JOB MODERATION ───────────────────────────────────────────────────────────

function JobModeration() {
  const [db, setDB] = useDB();
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("All");
  const [showInactive, setShowInactive] = useState(false);
  const [editing, setEditing]   = useState<Job|null>(null);
  const [adding, setAdding]     = useState(false);
  const [deactivating, setDeactivating] = useState<number|null>(null);

  const blank: Omit<Job,"id"> = { title:"",business:"",type:"Full-time",salary:"",location:"",posted:new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short"}),apps:0,status:"Active",desc:"",requirements:"",is_active:true };
  const [draft, setDraft] = useState<Omit<Job,"id">>(blank);

  const jobs = db.jobs;
  const statuses = ["All","Active","Flagged","Expired","Removed"];
  const shown = jobs.filter(j=>{
    if (!showInactive && !j.is_active) return false;
    const q=search.toLowerCase();
    const mQ=j.title.toLowerCase().includes(q)||j.business.toLowerCase().includes(q);
    const mF=filter==="All"||j.status===filter;
    return mQ&&mF;
  });

  const save      = () => { setDB(d=>({...d,jobs:d.jobs.map(j=>j.id===editing!.id?editing!:j)})); setEditing(null); };
  const add       = () => { setDB(d=>({...d,jobs:[...d.jobs,{id:genId(d.jobs),...draft}]})); setAdding(false); setDraft(blank); };
  const deactivate= (id:number)=>{ setDB(d=>({...d,jobs:d.jobs.map(j=>j.id===id?softDelete(j):j)})); setDeactivating(null); };
  const restore   = (id:number)=>{ setDB(d=>({...d,jobs:d.jobs.map(j=>j.id===id?{...j,is_active:true,deleted_at:undefined}:j)})); };
  const setStatus = (id:number,s:string)=>setDB(d=>({...d,jobs:d.jobs.map(j=>j.id===id?{...j,status:s}:j)}));

  const statusColor: Record<string,string> = {
    Active:"badge-verified", Flagged:"badge-pending",
    Expired:"bg-muted text-muted-foreground inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
    Removed:"bg-destructive/10 text-destructive inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {deactivating!==null && <ConfirmDialog message="This job listing will be flagged as inactive in the database. It won't appear on the website." onConfirm={()=>deactivate(deactivating!)} onCancel={()=>setDeactivating(null)} confirmLabel="Deactivate" isDanger={false}/>}
      {editing && (
        <Modal title={`Edit Job — ${editing.title}`} onClose={()=>setEditing(null)}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Job Title"><input className={inp} value={editing.title} onChange={e=>setEditing({...editing,title:e.target.value})} /></Field>
            <Field label="Business"><input className={inp} value={editing.business} onChange={e=>setEditing({...editing,business:e.target.value})} /></Field>
            <Field label="Type">
              <select className={sel} value={editing.type} onChange={e=>setEditing({...editing,type:e.target.value})}>
                {["Full-time","Part-time","Contract","Internship"].map(t=><option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Salary Range"><input className={inp} value={editing.salary} onChange={e=>setEditing({...editing,salary:e.target.value})} /></Field>
            <Field label="Location"><input className={inp} value={editing.location} onChange={e=>setEditing({...editing,location:e.target.value})} /></Field>
            <Field label="Status">
              <select className={sel} value={editing.status} onChange={e=>setEditing({...editing,status:e.target.value})}>
                {statuses.filter(s=>s!=="All").map(s=><option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Description" col2>
              <textarea rows={2} className={inp} value={editing.desc} onChange={e=>setEditing({...editing,desc:e.target.value})} />
            </Field>
            <Field label="Requirements" col2>
              <textarea rows={2} className={inp} value={editing.requirements} onChange={e=>setEditing({...editing,requirements:e.target.value})} />
            </Field>
          </div>
          <div className="flex gap-2 mt-4 justify-end">
            <Button variant="outline" size="sm" onClick={()=>setEditing(null)}>Cancel</Button>
            <Button variant="hero" size="sm" onClick={save}><Save className="w-4 h-4 mr-1"/>Save</Button>
          </div>
        </Modal>
      )}

      <div className="grid grid-cols-4 gap-4">
        <MetricCard icon={<Briefcase className="w-5 h-5"/>}    value={String(jobs.filter(j=>j.is_active).length)}               title="Total Active Listings" />
        <MetricCard icon={<CheckCircle2 className="w-5 h-5"/>} value={String(jobs.filter(j=>j.is_active&&j.status==="Active").length)}  title="Live" trendUp />
        <MetricCard icon={<AlertTriangle className="w-5 h-5"/>}value={String(jobs.filter(j=>j.is_active&&j.status==="Flagged").length)}  title="Flagged" />
        <MetricCard icon={<Users className="w-5 h-5"/>}        value={String(jobs.filter(j=>j.is_active).reduce((a,j)=>a+j.apps,0))}    title="Total Applications" trendUp />
      </div>

      <div className="card-elevated p-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
            <input placeholder="Search jobs or businesses…" value={search} onChange={e=>setSearch(e.target.value)} className={inp+" pl-9"} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statuses.map(s=>(
              <button key={s} onClick={()=>setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter===s?"bg-primary text-primary-foreground":"bg-accent text-muted-foreground hover:text-foreground"}`}>{s}</button>
            ))}
          </div>
          <label className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer select-none">
            <input type="checkbox" checked={showInactive} onChange={e=>setShowInactive(e.target.checked)} className="accent-primary" />
            Show Inactive
          </label>
          <Button variant="hero" size="sm" onClick={()=>{setAdding(true);setDraft(blank);}}><Plus className="w-4 h-4 mr-1"/>Add Job</Button>
        </div>

        {adding && (
          <div className="mb-5 p-5 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
            <h4 className="font-semibold text-foreground text-sm">New Job Listing</h4>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Job Title"><input className={inp} placeholder="e.g. Sales Executive" value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} /></Field>
              <Field label="Business"><input className={inp} placeholder="Business name" value={draft.business} onChange={e=>setDraft({...draft,business:e.target.value})} /></Field>
              <Field label="Type">
                <select className={sel} value={draft.type} onChange={e=>setDraft({...draft,type:e.target.value})}>
                  {["Full-time","Part-time","Contract","Internship"].map(t=><option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Salary"><input className={inp} placeholder="₹X–₹Y" value={draft.salary} onChange={e=>setDraft({...draft,salary:e.target.value})} /></Field>
              <Field label="Location"><input className={inp} placeholder="Area, City" value={draft.location} onChange={e=>setDraft({...draft,location:e.target.value})} /></Field>
            </div>
            <Field label="Description"><textarea rows={2} className={inp+" mt-1"} placeholder="Role description…" value={draft.desc} onChange={e=>setDraft({...draft,desc:e.target.value})} /></Field>
            <div className="flex gap-2">
              <Button variant="hero" size="sm" onClick={add} disabled={!draft.title||!draft.business}><Save className="w-4 h-4 mr-1"/>Post Job</Button>
              <Button variant="outline" size="sm" onClick={()=>setAdding(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {shown.map(j=>(
            <div key={j.id} className={`flex items-start justify-between p-4 rounded-xl bg-accent/50 gap-4 ${!j.is_active?"opacity-50":""}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="font-medium text-foreground text-sm">{j.title}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${j.type==="Full-time"?"bg-success/10 text-success":j.type==="Part-time"?"bg-secondary/10 text-secondary":"bg-primary/10 text-primary"}`}>{j.type}</span>
                  <span className={statusColor[j.status]||"badge-pending"}>{j.status}</span>
                  {!j.is_active && <span className="text-xs text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">INACTIVE</span>}
                </div>
                <div className="text-xs text-muted-foreground">{j.business} · {j.location} · {j.salary} · {j.apps} applications · Posted {j.posted}</div>
                {j.status==="Flagged" && <div className="mt-1 text-xs text-amber-600 bg-amber-500/10 px-2 py-1 rounded-lg w-fit">⚠ Flagged for review</div>}
              </div>
              <div className="flex gap-1 shrink-0 flex-wrap">
                {j.is_active && j.status==="Flagged" && <>
                  <button onClick={()=>setStatus(j.id,"Active")} title="Approve" className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"><Check className="w-3.5 h-3.5"/></button>
                  <button onClick={()=>setStatus(j.id,"Removed")} title="Remove" className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"><Ban className="w-3.5 h-3.5"/></button>
                </>}
                {j.is_active && j.status==="Active" && <button onClick={()=>setStatus(j.id,"Flagged")} title="Flag" className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-colors"><AlertTriangle className="w-3.5 h-3.5"/></button>}
                {j.is_active && j.status==="Expired" && <button onClick={()=>setStatus(j.id,"Active")} title="Reactivate" className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"><RefreshCw className="w-3.5 h-3.5"/></button>}
                {j.is_active && <button onClick={()=>setEditing({...j})} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"><Pencil className="w-3.5 h-3.5"/></button>}
                {j.is_active
                  ? <button onClick={()=>setDeactivating(j.id)} className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"><UserX className="w-3.5 h-3.5"/></button>
                  : <button onClick={()=>restore(j.id)} className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"><RefreshCw className="w-3.5 h-3.5"/></button>
                }
              </div>
            </div>
          ))}
          {shown.length===0 && <p className="text-center text-muted-foreground text-sm py-8">No job listings match your filter.</p>}
        </div>
      </div>
    </div>
  );
}

// ─── SUPPORT ──────────────────────────────────────────────────────────────────

const teamNames = ["Unassigned","Rohan Malhotra","Divya Rao","Sneha Joshi","Neha Patel","Saurabh Gupta"];

function Support() {
  const [db, setDB] = useDB();
  const [filter, setFilter]     = useState("All");
  const [selected, setSelected] = useState<string|null>(null);
  const [reply, setReply]       = useState("");
  const [deactivating, setDeactivating] = useState<string|null>(null);
  const [adding, setAdding]     = useState(false);
  const blank = { user:"",role:"Investor",issue:"",priority:"Medium" };
  const [draft, setDraft]       = useState(blank);

  const tickets = db.tickets;
  const statuses = ["All","Open","In Progress","Resolved"];
  const shown = tickets.filter(t => t.is_active && (filter==="All"||t.status===filter));
  const ticket = tickets.find(t=>t.id===selected);

  const updateTicket = (id:string, patch: Partial<SupportTicket>) =>
    setDB(d=>({...d,tickets:d.tickets.map(t=>t.id===id?{...t,...patch}:t)}));

  const sendReply = () => {
    if (!reply.trim()||!selected) return;
    const newReply = { text: reply, author: "Admin", time: new Date().toLocaleString("en-IN",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}) };
    updateTicket(selected, {
      replies:[...(ticket?.replies||[]), newReply],
      status: ticket?.status==="Open" ? "In Progress" : ticket?.status||"In Progress"
    });
    setReply("");
  };

  const deactivate = (id:string) => {
    setDB(d=>({...d,tickets:d.tickets.map(t=>t.id===id?softDelete(t):t)}));
    setDeactivating(null);
    if (selected===id) setSelected(null);
  };

  const add = () => {
    const id = genTicketId(tickets);
    const newTicket: SupportTicket = {
      id, ...draft,
      status:"Open", date:new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short"}),
      replies:[], assignedTo:"Unassigned", is_active:true,
    };
    setDB(d=>({...d,tickets:[...d.tickets,newTicket]}));
    setAdding(false); setDraft(blank);
  };

  const priorityColor: Record<string,string> = { High:"text-destructive bg-destructive/10", Medium:"text-primary bg-primary/10", Low:"text-muted-foreground bg-muted" };
  const statusColor: Record<string,string>   = { Open:"badge-pending", "In Progress":"badge-premium", Resolved:"badge-verified" };

  return (
    <div className="space-y-5 animate-fade-in">
      {deactivating && <ConfirmDialog message="This support ticket will be archived. Data is preserved in the database." onConfirm={()=>deactivate(deactivating)} onCancel={()=>setDeactivating(null)} confirmLabel="Archive" isDanger={false}/>}

      <div className="grid grid-cols-4 gap-4">
        <MetricCard icon={<MessageSquare className="w-5 h-5"/>}  value={String(tickets.filter(t=>t.is_active).length)}                     title="Total Tickets" />
        <MetricCard icon={<Bell className="w-5 h-5"/>}           value={String(tickets.filter(t=>t.is_active&&t.status==="Open").length)}        title="Open" />
        <MetricCard icon={<Activity className="w-5 h-5"/>}       value={String(tickets.filter(t=>t.is_active&&t.status==="In Progress").length)}  title="In Progress" />
        <MetricCard icon={<CheckCircle2 className="w-5 h-5"/>}   value={String(tickets.filter(t=>t.is_active&&t.status==="Resolved").length)}     title="Resolved" trendUp />
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 card-elevated p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-2 flex-wrap">
              {statuses.map(s=>(
                <button key={s} onClick={()=>setFilter(s)} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${filter===s?"bg-primary text-primary-foreground":"bg-accent text-muted-foreground hover:text-foreground"}`}>{s}</button>
              ))}
            </div>
            <Button variant="hero" size="sm" className="text-xs py-1 h-auto" onClick={()=>setAdding(true)}><Plus className="w-3 h-3 mr-0.5"/>New</Button>
          </div>

          {adding && (
            <div className="mb-3 p-3 rounded-xl border border-primary/30 bg-primary/5 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Field label="User Name"><input className={inp} placeholder="User name" value={draft.user} onChange={e=>setDraft({...draft,user:e.target.value})} /></Field>
                <Field label="Role">
                  <select className={sel} value={draft.role} onChange={e=>setDraft({...draft,role:e.target.value})}>
                    {["Investor","Vendor","Job Seeker","Admin"].map(r=><option key={r}>{r}</option>)}
                  </select>
                </Field>
                <Field label="Priority">
                  <select className={sel} value={draft.priority} onChange={e=>setDraft({...draft,priority:e.target.value})}>
                    {["Low","Medium","High"].map(p=><option key={p}>{p}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Issue">
                <textarea rows={2} className={inp} placeholder="Describe the issue…" value={draft.issue} onChange={e=>setDraft({...draft,issue:e.target.value})} />
              </Field>
              <div className="flex gap-2">
                <Button variant="hero" size="sm" onClick={add} disabled={!draft.user||!draft.issue}><Save className="w-3 h-3 mr-1"/>Create</Button>
                <Button variant="outline" size="sm" onClick={()=>setAdding(false)}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {shown.map(t=>(
              <div key={t.id} onClick={()=>setSelected(t.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all border ${selected===t.id?"border-primary bg-primary/5":"border-transparent bg-accent/50 hover:bg-accent"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-muted-foreground">{t.id}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColor[t.priority]}`}>{t.priority}</span>
                </div>
                <div className="font-medium text-foreground text-xs truncate">{t.issue}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{t.user} · {t.date}</div>
                <div className="mt-1"><span className={statusColor[t.status]}>{t.status}</span></div>
              </div>
            ))}
            {shown.length===0 && <p className="text-center text-muted-foreground text-sm py-6">No tickets.</p>}
          </div>
        </div>

        <div className="lg:col-span-3 card-elevated p-5">
          {!ticket ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm py-20">Select a ticket to view details</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground">{ticket.id}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColor[ticket.priority]}`}>{ticket.priority} Priority</span>
                    <span className={statusColor[ticket.status]}>{ticket.status}</span>
                  </div>
                  <h3 className="font-semibold text-foreground">{ticket.issue}</h3>
                  <p className="text-sm text-muted-foreground">{ticket.user} ({ticket.role}) · Filed {ticket.date}</p>
                </div>
                <button onClick={()=>setDeactivating(ticket.id)} className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors shrink-0" title="Archive ticket"><Archive className="w-4 h-4"/></button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Change Status</label>
                  <select className={sel} value={ticket.status} onChange={e=>updateTicket(ticket.id,{status:e.target.value})}>
                    {["Open","In Progress","Resolved","Closed"].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Assign To</label>
                  <select className={sel} value={ticket.assignedTo} onChange={e=>updateTicket(ticket.id,{assignedTo:e.target.value})}>
                    {teamNames.map(n=><option key={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Priority</label>
                  <select className={sel} value={ticket.priority} onChange={e=>updateTicket(ticket.id,{priority:e.target.value})}>
                    {["Low","Medium","High"].map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {ticket.replies.length===0 ? <p className="text-xs text-muted-foreground italic">No replies yet.</p> : ticket.replies.map((r,i)=>(
                  <div key={i} className="bg-primary/5 border border-primary/10 rounded-xl p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-primary">{r.author}</span>
                      <span className="text-xs text-muted-foreground">{r.time}</span>
                    </div>
                    <div className="text-sm text-foreground">{r.text}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <textarea value={reply} onChange={e=>setReply(e.target.value)} rows={2}
                  placeholder="Type your reply or admin note…"
                  className={inp+" flex-1 resize-none"} />
                <button onClick={sendReply} disabled={!reply.trim()}
                  className="px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 shrink-0">
                  <Send className="w-4 h-4"/>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────

function Analytics() {
  const [db] = useDB();
  const months = ["Oct","Nov","Dec","Jan","Feb","Mar"];
  const data   = [42,58,71,85,96,124];
  const maxV   = Math.max(...data);
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-4 gap-4">
        <MetricCard icon={<PieChart className="w-5 h-5"/>}    value="₹12.4Cr" title="Total Volume"    trend="+18%" trendUp />
        <MetricCard icon={<Users className="w-5 h-5"/>}       value={String(db.vendors.filter(v=>v.is_active).length + db.investors.filter(i=>i.is_active).length + db.jobSeekers.filter(s=>s.is_active).length)} title="Total Users" trend="+11%" trendUp />
        <MetricCard icon={<Activity className="w-5 h-5"/>}    value="68%"     title="Retention Rate"  trend="+4%"  trendUp />
        <MetricCard icon={<DollarSign className="w-5 h-5"/>}  value="₹4.2L"   title="Revenue (MTD)"   trend="+9%"  trendUp />
      </div>
      <div className="card-elevated p-5">
        <h3 className="font-semibold text-foreground mb-6">Investment Volume (₹ Lakhs) — Last 6 Months</h3>
        <div className="flex items-end gap-4 h-48">
          {months.map((m,i)=>(
            <div key={m} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-medium text-foreground">{data[i]}L</span>
              <div className="w-full rounded-t-lg gradient-primary" style={{height:`${(data[i]/maxV)*160}px`}}/>
              <span className="text-xs text-muted-foreground">{m}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="card-elevated p-5">
          <h3 className="font-semibold text-foreground mb-4">Vendors by Category</h3>
          {[...new Map(db.vendors.filter(v=>v.is_active).map(v=>[v.category, (db.vendors.filter(x=>x.is_active&&x.category===v.category).length)])).entries()].slice(0,5).map(([cat,count])=>(
            <div key={cat} className="mb-3">
              <div className="flex justify-between text-sm mb-1"><span className="text-foreground">{cat}</span><span className="text-muted-foreground">{count} vendors</span></div>
              <div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full gradient-primary" style={{width:`${Math.round(count/db.vendors.filter(v=>v.is_active).length*100)}%`}}/></div>
            </div>
          ))}
        </div>
        <div className="card-elevated p-5">
          <h3 className="font-semibold text-foreground mb-4">User Distribution</h3>
          {[{role:"Investors",count:db.investors.filter(i=>i.is_active).length},{role:"Job Seekers",count:db.jobSeekers.filter(s=>s.is_active).length},{role:"Vendors",count:db.vendors.filter(v=>v.is_active).length}].map(r=>{
            const total = db.investors.filter(i=>i.is_active).length + db.jobSeekers.filter(s=>s.is_active).length + db.vendors.filter(v=>v.is_active).length;
            return (
              <div key={r.role} className="mb-3">
                <div className="flex justify-between text-sm mb-1"><span className="text-foreground">{r.role}</span><span className="text-muted-foreground">{r.count}</span></div>
                <div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-secondary" style={{width:`${Math.round(r.count/Math.max(total,1)*100)}%`}}/></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────

function Subscriptions() {
  const [db, setDB] = useDB();
  const [editing, setEditing] = useState<SubscriptionPlan|null>(null);
  const [adding, setAdding]   = useState(false);
  const [deleting, setDeleting]=useState<number|null>(null);
  const [newFeat, setNewFeat] = useState("");

  const blank: Omit<SubscriptionPlan,"id"> = { name:"",price:"",billingCycle:"monthly",features:[],active:true,subscriberCount:0 };
  const [draft, setDraft]      = useState<Omit<SubscriptionPlan,"id">>(blank);

  const plans = db.plans;
  const save = () => { setDB(d=>({...d,plans:d.plans.map(p=>p.id===editing!.id?editing!:p)})); setEditing(null); setNewFeat(""); };
  const add  = () => { setDB(d=>({...d,plans:[...d.plans,{id:genId(d.plans),...draft}]})); setAdding(false); setDraft(blank); };
  const del  = (id:number) => { setDB(d=>({...d,plans:d.plans.filter(p=>p.id!==id)})); setDeleting(null); };
  const toggleActive = (id:number) => setDB(d=>({...d,plans:d.plans.map(p=>p.id===id?{...p,active:!p.active}:p)}));

  return (
    <div className="space-y-5 animate-fade-in">
      {deleting!==null && <ConfirmDialog message="This subscription plan will be permanently deleted." onConfirm={()=>del(deleting!)} onCancel={()=>setDeleting(null)} />}
      {editing && (
        <Modal title={`Edit Plan — ${editing.name}`} onClose={()=>setEditing(null)}>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Field label="Plan Name"><input className={inp} value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} /></Field>
            <Field label="Price (₹/period)"><input className={inp} value={editing.price} onChange={e=>setEditing({...editing,price:e.target.value})} /></Field>
            <Field label="Billing Cycle">
              <select className={sel} value={editing.billingCycle} onChange={e=>setEditing({...editing,billingCycle:e.target.value})}>
                {["monthly","yearly","free"].map(c=><option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className={sel} value={editing.active?"Active":"Inactive"} onChange={e=>setEditing({...editing,active:e.target.value==="Active"})}>
                <option>Active</option><option>Inactive</option>
              </select>
            </Field>
          </div>
          <Field label="Features">
            <div className="space-y-2 mt-1 mb-2">
              {editing.features.map((f,i)=>(
                <div key={i} className="flex items-center gap-2">
                  <input className={inp+" flex-1"} value={f} onChange={e=>setEditing({...editing,features:editing.features.map((ff,ii)=>ii===i?e.target.value:ff)})} />
                  <button onClick={()=>setEditing({...editing,features:editing.features.filter((_,ii)=>ii!==i)})} className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"><X className="w-3.5 h-3.5"/></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input className={inp+" flex-1"} placeholder="Add feature…" value={newFeat} onChange={e=>setNewFeat(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newFeat.trim()){setEditing({...editing,features:[...editing.features,newFeat.trim()]});setNewFeat("");}}} />
              <button onClick={()=>{if(newFeat.trim()){setEditing({...editing,features:[...editing.features,newFeat.trim()]});setNewFeat("");}}} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Add</button>
            </div>
          </Field>
          <div className="flex gap-2 mt-5 justify-end">
            <Button variant="outline" size="sm" onClick={()=>setEditing(null)}>Cancel</Button>
            <Button variant="hero" size="sm" onClick={save}><Save className="w-4 h-4 mr-1"/>Save Plan</Button>
          </div>
        </Modal>
      )}

      <div className="grid grid-cols-3 gap-4">
        <MetricCard icon={<CreditCard className="w-5 h-5"/>}  value={String(plans.reduce((a,p)=>a+p.subscriberCount,0))} title="Total Subscriptions" trend="+14%" trendUp />
        <MetricCard icon={<DollarSign className="w-5 h-5"/>}  value="₹50.5L" title="MRR" trend="+19%" trendUp />
        <MetricCard icon={<Activity className="w-5 h-5"/>}    value="4.2%"   title="Churn Rate" />
      </div>

      <div className="flex justify-end">
        <Button variant="hero" size="sm" onClick={()=>{setAdding(true);setDraft(blank);}}><Plus className="w-4 h-4 mr-1"/>New Plan</Button>
      </div>

      {adding && (
        <div className="card-elevated p-5 border border-primary/30 bg-primary/5 space-y-3">
          <h4 className="font-semibold text-foreground text-sm">New Subscription Plan</h4>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Plan Name"><input className={inp} placeholder="e.g. Investor Pro" value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} /></Field>
            <Field label="Price (₹)"><input className={inp} placeholder="999" value={draft.price} onChange={e=>setDraft({...draft,price:e.target.value})} /></Field>
            <Field label="Billing Cycle">
              <select className={sel} value={draft.billingCycle} onChange={e=>setDraft({...draft,billingCycle:e.target.value})}>
                {["monthly","yearly","free"].map(c=><option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex gap-2">
            <Button variant="hero" size="sm" onClick={add} disabled={!draft.name}><Save className="w-4 h-4 mr-1"/>Create Plan</Button>
            <Button variant="outline" size="sm" onClick={()=>setAdding(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.map(p=>(
          <div key={p.id} className={`card-elevated p-5 border-2 ${p.active?"border-transparent":"border-destructive/20 opacity-70"}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-foreground text-sm">{p.name}</h3>
                <div className="text-2xl font-bold text-primary mt-1">
                  {p.price==="0"?"Free":`₹${p.price}`}
                  {p.billingCycle!=="free" && <span className="text-xs text-muted-foreground font-normal">/{p.billingCycle==="monthly"?"mo":"yr"}</span>}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{p.subscriberCount} subscribers</div>
              </div>
              <button onClick={()=>toggleActive(p.id)} title={p.active?"Deactivate":"Activate"}
                className={`p-1.5 rounded-lg transition-colors ${p.active?"bg-success/10 text-success hover:bg-success/20":"bg-muted text-muted-foreground hover:bg-accent"}`}>
                {p.active?<ToggleRight className="w-4 h-4"/>:<ToggleLeft className="w-4 h-4"/>}
              </button>
            </div>
            <ul className="space-y-1.5 mb-4 mt-3">
              {p.features.map(f=>(
                <li key={f} className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-success shrink-0"/>{f}
                </li>
              ))}
            </ul>
            <div className="flex gap-2 pt-3 border-t border-border">
              <button onClick={()=>{setEditing({...p});setNewFeat("");}} className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-primary hover:bg-primary/10 py-1.5 rounded-lg transition-colors"><Pencil className="w-3 h-3"/>Edit</button>
              <button onClick={()=>setDeleting(p.id)} className="flex items-center justify-center gap-1 text-xs font-medium text-destructive hover:bg-destructive/10 py-1.5 px-2 rounded-lg transition-colors"><Trash2 className="w-3 h-3"/>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TEAM ─────────────────────────────────────────────────────────────────────

const allPerms = ["Vendor Management","Investor Management","Job Moderation","Support","Analytics","Subscriptions","Team Management","System Settings"];

function Team() {
  const [db, setDB] = useDB();
  const [editing, setEditing]   = useState<TeamMember|null>(null);
  const [adding, setAdding]     = useState(false);
  const [deactivating, setDeactivating] = useState<number|null>(null);

  const blank: Omit<TeamMember,"id"> = { name:"",role:"",email:"",phone:"",dept:"Operations",status:"Active",joined:new Date().toLocaleDateString("en-IN",{month:"short",year:"numeric"}),permissions:[],is_active:true };
  const [draft, setDraft] = useState<Omit<TeamMember,"id">>(blank);

  const team = db.team;
  const save = () => { setDB(d=>({...d,team:d.team.map(t=>t.id===editing!.id?editing!:t)})); setEditing(null); };
  const add  = () => { setDB(d=>({...d,team:[...d.team,{id:genId(d.team),...draft}]})); setAdding(false); setDraft(blank); };
  const deactivate = (id:number) => { setDB(d=>({...d,team:d.team.map(t=>t.id===id?softDelete(t):t)})); setDeactivating(null); };
  const restore    = (id:number) => { setDB(d=>({...d,team:d.team.map(t=>t.id===id?{...t,is_active:true,deleted_at:undefined}:t)})); };
  const toggleStatus = (id:number) => setDB(d=>({...d,team:d.team.map(t=>t.id===id?{...t,status:t.status==="Active"?"Suspended":"Active"}:t)}));
  const togglePerm = (m:TeamMember, perm:string) => ({...m,permissions:m.permissions.includes(perm)?m.permissions.filter(p=>p!==perm):[...m.permissions,perm]});

  const statusColor: Record<string,string> = {
    Active:"badge-verified","On Leave":"badge-pending",
    Suspended:"bg-destructive/10 text-destructive inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {deactivating!==null && <ConfirmDialog message="This team member will be deactivated. Their data is preserved in the database." onConfirm={()=>deactivate(deactivating!)} onCancel={()=>setDeactivating(null)} confirmLabel="Deactivate" isDanger={false}/>}
      {editing && (
        <Modal title={`Edit Member — ${editing.name}`} onClose={()=>setEditing(null)}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Field label="Full Name"><input className={inp} value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} /></Field>
            <Field label="Role / Title"><input className={inp} value={editing.role} onChange={e=>setEditing({...editing,role:e.target.value})} /></Field>
            <Field label="Email"><input className={inp} value={editing.email} onChange={e=>setEditing({...editing,email:e.target.value})} /></Field>
            <Field label="Phone"><input className={inp} value={editing.phone} onChange={e=>setEditing({...editing,phone:e.target.value})} /></Field>
            <Field label="Department"><input className={inp} value={editing.dept} onChange={e=>setEditing({...editing,dept:e.target.value})} /></Field>
            <Field label="Status">
              <select className={sel} value={editing.status} onChange={e=>setEditing({...editing,status:e.target.value})}>
                {["Active","On Leave","Suspended"].map(s=><option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {allPerms.map(perm=>(
                <label key={perm} className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={editing.permissions.includes(perm)} onChange={()=>setEditing(togglePerm(editing,perm))} className="w-4 h-4 accent-primary rounded" />
                  <span className="text-sm text-foreground">{perm}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-5 justify-end">
            <Button variant="outline" size="sm" onClick={()=>setEditing(null)}>Cancel</Button>
            <Button variant="hero" size="sm" onClick={save}><Save className="w-4 h-4 mr-1"/>Save Member</Button>
          </div>
        </Modal>
      )}

      <div className="grid grid-cols-4 gap-4">
        <MetricCard icon={<UserCog className="w-5 h-5"/>}      value={String(team.filter(m=>m.is_active).length)}                    title="Active Members" />
        <MetricCard icon={<CheckCircle2 className="w-5 h-5"/>} value={String(team.filter(m=>m.is_active&&m.status==="Active").length)} title="Active" trendUp />
        <MetricCard icon={<Clock className="w-5 h-5"/>}        value={String(team.filter(m=>m.is_active&&m.status==="On Leave").length)} title="On Leave" />
        <MetricCard icon={<Archive className="w-5 h-5"/>}      value={String(team.filter(m=>!m.is_active).length)}                    title="Inactive (DB)" />
      </div>

      <div className="card-elevated p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Team Directory</h3>
          <Button variant="hero" size="sm" onClick={()=>{setAdding(true);setDraft(blank);}}><Plus className="w-4 h-4 mr-1"/>Invite Member</Button>
        </div>

        {adding && (
          <div className="mb-5 p-5 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
            <h4 className="font-semibold text-foreground text-sm">New Team Member</h4>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name"><input className={inp} placeholder="Full name" value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} /></Field>
              <Field label="Role"><input className={inp} placeholder="e.g. Operations Manager" value={draft.role} onChange={e=>setDraft({...draft,role:e.target.value})} /></Field>
              <Field label="Email"><input className={inp} placeholder="email@samudaay.com" value={draft.email} onChange={e=>setDraft({...draft,email:e.target.value})} /></Field>
              <Field label="Phone"><input className={inp} placeholder="+91 XXXXX XXXXX" value={draft.phone} onChange={e=>setDraft({...draft,phone:e.target.value})} /></Field>
              <Field label="Department"><input className={inp} placeholder="e.g. Finance" value={draft.dept} onChange={e=>setDraft({...draft,dept:e.target.value})} /></Field>
            </div>
            <div className="flex gap-2">
              <Button variant="hero" size="sm" onClick={add} disabled={!draft.name||!draft.email}><Save className="w-4 h-4 mr-1"/>Add Member</Button>
              <Button variant="outline" size="sm" onClick={()=>setAdding(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {team.map(m=>(
            <div key={m.id} className={`flex items-start justify-between p-4 rounded-xl bg-accent/50 gap-4 ${!m.is_active?"opacity-50":""}`}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
                  {m.name.split(" ").map(n=>n[0]).join("")}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-foreground text-sm">{m.name}{!m.is_active&&<span className="ml-2 text-xs text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">INACTIVE</span>}</div>
                  <div className="text-xs text-muted-foreground">{m.role} · {m.dept} · {m.email}</div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {m.permissions.slice(0,3).map(p=>(
                      <span key={p} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{p}</span>
                    ))}
                    {m.permissions.length>3 && <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">+{m.permissions.length-3} more</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={statusColor[m.status]||"badge-pending"}>{m.status}</span>
                {m.is_active && <>
                  <button onClick={()=>toggleStatus(m.id)} title={m.status==="Active"?"Suspend":"Reinstate"}
                    className={`p-1.5 rounded-lg transition-colors ${m.status==="Active"?"bg-amber-500/10 text-amber-600 hover:bg-amber-500/20":"bg-success/10 text-success hover:bg-success/20"}`}>
                    {m.status==="Active"?<Ban className="w-3.5 h-3.5"/>:<RefreshCw className="w-3.5 h-3.5"/>}
                  </button>
                  <button onClick={()=>setEditing({...m})} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"><Pencil className="w-3.5 h-3.5"/></button>
                  <button onClick={()=>setDeactivating(m.id)} className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"><UserX className="w-3.5 h-3.5"/></button>
                </>}
                {!m.is_active && <button onClick={()=>restore(m.id)} title="Restore" className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"><RefreshCw className="w-3.5 h-3.5"/></button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DB INSPECTOR ─────────────────────────────────────────────────────────────

function DBInspector() {
  const [db, setDB] = useDB();
  const [tab, setTab]         = useState<keyof typeof db>("vendors");
  const [resetConfirm, setResetConfirm] = useState(false);
  const [copied, setCopied]   = useState(false);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "samudaay_db.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const copyJSON = () => {
    const safe = { ...db };
    // Strip base64 for copy to keep it manageable
    if (Array.isArray((safe as any)[tab])) {
      navigator.clipboard.writeText(JSON.stringify((safe as any)[tab], null, 2));
    }
    setCopied(true);
    setTimeout(()=>setCopied(false), 2000);
  };

  const tabKeys = ["vendors","investors","investments","transactions","jobSeekers","jobApplications","jobs","tickets","team","plans"] as const;
  const counts: Record<string, { total: number; active: number }> = {};
  tabKeys.forEach(k => {
    const arr = (db as any)[k] as any[];
    counts[k] = { total: arr.length, active: arr.filter((x: any) => x.is_active !== false).length };
  });

  const arr = (db as any)[tab] as any[];

  return (
    <div className="space-y-5 animate-fade-in">
      {resetConfirm && (
        <ConfirmDialog
          message="This will reset ALL database data to the default seed data. All your changes will be lost. This cannot be undone."
          onConfirm={() => { setDB(resetDB()); setResetConfirm(false); }}
          onCancel={() => setResetConfirm(false)}
          confirmLabel="Reset DB"
          isDanger
        />
      )}

      <div className="card-elevated p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-foreground text-lg flex items-center gap-2"><Database className="w-5 h-5 text-primary"/>Database Inspector</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Last updated: {new Date(db.lastUpdated).toLocaleString("en-IN")}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyJSON}>{copied ? "Copied!" : "Copy Table JSON"}</Button>
            <Button variant="outline" size="sm" onClick={exportJSON}><Download className="w-4 h-4 mr-1"/>Export Full DB</Button>
            <Button size="sm" className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={()=>setResetConfirm(true)}>Reset DB</Button>
          </div>
        </div>

        <div className="grid grid-cols-4 lg:grid-cols-7 gap-2 mb-5">
          {tabKeys.map(k=>(
            <button key={k} onClick={()=>setTab(k as any)}
              className={`p-3 rounded-xl text-left transition-all border ${tab===k?"border-primary bg-primary/5":"border-border bg-accent/50 hover:bg-accent"}`}>
              <div className="font-semibold text-foreground text-sm capitalize">{k === "jobSeekers" ? "Job Seekers" : k}</div>
              <div className="text-xs text-muted-foreground mt-1">{counts[k].active}/{counts[k].total} active</div>
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                {arr.length > 0 && Object.keys(arr[0]).filter(k => k !== "base64" && k !== "documents").map(k => (
                  <th key={k} className="pb-2 pr-3 font-medium whitespace-nowrap">{k}</th>
                ))}
                {arr.length > 0 && (arr[0] as any).documents !== undefined && <th className="pb-2 pr-3 font-medium">docs</th>}
              </tr>
            </thead>
            <tbody>
              {arr.map((row: any, idx: number) => (
                <tr key={idx} className={`border-b border-border/30 ${!row.is_active ? "opacity-40" : ""}`}>
                  {Object.entries(row).filter(([k]) => k !== "base64" && k !== "documents").map(([k, v]) => (
                    <td key={k} className="py-1.5 pr-3 text-foreground align-top max-w-32">
                      {typeof v === "boolean"
                        ? <span className={`px-1.5 py-0.5 rounded text-xs ${v ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{String(v)}</span>
                        : Array.isArray(v)
                          ? <span className="text-muted-foreground">[{v.length} items]</span>
                          : <span className="truncate block max-w-32" title={String(v)}>{String(v)}</span>
                      }
                    </td>
                  ))}
                  {row.documents !== undefined && (
                    <td className="py-1.5 pr-3 text-muted-foreground">{row.documents.length} file(s)</td>
                  )}
                </tr>
              ))}
              {arr.length === 0 && <tr><td colSpan={20} className="py-6 text-center text-muted-foreground">No records in this table.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-4 border-t border-border flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          <span>💾 All data persists in <code className="bg-accent px-1 py-0.5 rounded">localStorage</code> across page refreshes</span>
          <span>🔒 Deleted records are <strong className="text-foreground">flagged inactive</strong>, never truly deleted</span>
          <span>📄 PDF/document files stored as base64 in the database</span>
          <span>🔄 Changes on any dashboard page sync here automatically</span>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  return (
    <DashboardLayout navItems={navItems} groupLabel="Admin">
      <Routes>
        <Route index              element={<Overview />}      />
        <Route path="vendors"    element={<Vendors />}       />
        <Route path="investors"  element={<Investors />}     />
        <Route path="jobseekers" element={<JobSeekers />}    />
        <Route path="jobs"       element={<JobModeration />} />
        <Route path="support"    element={<Support />}       />
        <Route path="analytics"  element={<Analytics />}     />
        <Route path="subs"       element={<Subscriptions />} />
        <Route path="team"       element={<Team />}          />
        <Route path="db"         element={<DBInspector />}   />
      </Routes>
    </DashboardLayout>
  );
}
