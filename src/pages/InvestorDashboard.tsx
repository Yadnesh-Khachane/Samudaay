import DashboardLayout from "@/components/DashboardLayout";
import { MetricCard, ProgressBar, StatusBadge } from "@/components/ui/metric-card";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useCallback, useMemo, useRef } from "react";
import {
  LayoutDashboard, Search, Wallet, History, FileText, MessageCircle, Settings,
  TrendingUp, CalendarClock, IndianRupee, Star, MapPin, ArrowRight,
  CheckCircle2, Clock, Download, Users, Bell, X, CreditCard,
  Smartphone, Shield, Lock, AlertCircle, ChevronRight, Building2,
  RefreshCw, Copy, Check, BookOpen, UserCheck, BadgeCheck,
  TrendingDown, PieChart, Landmark, ArrowUpRight, ArrowDownLeft,
  Filter, MoreHorizontal, Upload,
} from "lucide-react";
import {
  useDB, formatINR, addNotification, exportToCSV,
  type Vendor, type Investment, type Transaction,
} from "@/lib/db";
import { useAuth } from "@/lib/auth";

const navItems = [
  { title: "Portfolio",       url: "/dashboard/investor",              icon: LayoutDashboard },
  { title: "Discover",        url: "/dashboard/investor/discover",     icon: Search          },
  { title: "My Investments",  url: "/dashboard/investor/investments",  icon: Wallet          },
  { title: "Transactions",    url: "/dashboard/investor/transactions", icon: History         },
  { title: "Agreements",      url: "/dashboard/investor/agreements",   icon: FileText        },
  { title: "Trust & KYC",     url: "/dashboard/investor/kyc",          icon: BadgeCheck      },
  { title: "Community",       url: "/dashboard/investor/community",    icon: MessageCircle   },
  { title: "Settings",        url: "/dashboard/investor/settings",     icon: Settings        },
];

const inp = "w-full px-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200";

// --- Components ---

function PaymentGateway({ vendor, onClose, onSuccess }: {
  vendor: Vendor;
  onClose: () => void;
  onSuccess: (amount: number, txnId: string, method: string) => void;
}) {
  const [step, setStep] = useState<"amount"|"method"|"upi"|"card"|"processing"|"success"|"failed">("amount");
  const [amount, setAmount]     = useState("");
  const [method, setMethod]     = useState<"upi"|"card"|"netbanking">("upi");
  const [upiId, setUpiId]       = useState("");
  const [cardNum, setCardNum]   = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExp, setCardExp]   = useState("");
  const [cardCvv, setCardCvv]   = useState("");
  const [otp, setOtp]           = useState("");
  const [otpSent, setOtpSent]   = useState(false);
  const [error, setError]       = useState("");
  const [copied, setCopied]     = useState(false);
  const [procMsg, setProcMsg]   = useState("");
  const [bank, setBank]         = useState("HDFC Bank");

  const amtNum = parseFloat(amount) || 0;
  const remaining = vendor.goal - vendor.raised;
  const returnsNum = parseFloat(vendor.returns) || 10;
  const annualReturn = Math.round(amtNum * returnsNum / 100);
  const txnRef = `TXN-${Date.now().toString().slice(-8)}`;
  const formatCard = (v: string) => v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  const formatExp  = (v: string) => { const d=v.replace(/\D/g,"").slice(0,4); return d.length>2?d.slice(0,2)+"/"+d.slice(2):d; };

  const simulate = (label: string) => {
    const msgs = ["Connecting to gateway…","Verifying wallet…","Processing transaction…","Confirming with bank…","Finalizing investment…"];
    setStep("processing"); let i=0; setProcMsg(msgs[0]);
    const iv = setInterval(()=>{ i++; if(i<msgs.length){setProcMsg(msgs[i]);}else{ clearInterval(iv); setStep("success"); onSuccess(amtNum, txnRef, label); }}, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-card rounded-[2.5rem] shadow-2xl border border-border w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="gradient-primary p-6 text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10"><Shield className="w-24 h-24 rotate-12"/></div>
          <div className="relative z-10 flex items-center justify-between">
             <div className="flex items-center gap-2">
               <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm"><Lock className="w-5 h-5"/></div>
               <div><h3 className="font-bold">Secure Invest</h3><p className="text-[10px] opacity-70">SSL ENCRYPTED · PCI COMPLIANT</p></div>
             </div>
             {step !== "processing" && step !== "success" && <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5"/></button>}
          </div>
          <div className="mt-6">
            <h2 className="text-xl font-bold">{vendor.name}</h2>
            <p className="text-xs opacity-80">{vendor.location} · {vendor.returns} Fixed Returns</p>
          </div>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
          {step === "amount" && (<>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-accent/40 rounded-2xl p-4 border border-border/50">
                   <div className="text-lg font-bold text-foreground">{vendor.returns}</div>
                   <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">Returns p.a.</div>
                </div>
                <div className="bg-accent/40 rounded-2xl p-4 border border-border/50">
                   <div className="text-lg font-bold text-foreground">{vendor.tenure}</div>
                   <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">Tenure</div>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Investment Amount</label>
                <div className="relative group">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-primary">₹</span>
                   <input type="number" placeholder="Enter amount" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full bg-accent/20 border-2 border-transparent focus:border-primary/20 rounded-3xl pl-10 pr-6 py-5 text-2xl font-black focus:outline-none transition-all"/>
                </div>
                <div className="flex gap-2 mt-3">
                  {[5000, 10000, 25000, 50000].map(v => (
                    <button key={v} onClick={()=>setAmount(String(v))} className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${amtNum===v ? "bg-primary text-white border-primary" : "bg-card border-border hover:border-primary/40 text-muted-foreground"}`}>₹{v/1000}K</button>
                  ))}
                </div>
              </div>
            </div>
            {amtNum >= vendor.minInvest && (
              <div className="p-4 rounded-2xl bg-success/5 border border-success/10 space-y-2 animate-in slide-in-from-top-2">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Projected Earnings</span><span className="text-success font-bold">+{formatINR(annualReturn)}/year</span></div>
                <ProgressBar value={vendor.raised} max={vendor.goal} className="h-1.5" />
                <div className="flex justify-between text-[10px] text-muted-foreground"><span>Current Progress</span><span>{Math.round(vendor.raised/vendor.goal*100)}% Funded</span></div>
              </div>
            )}
            {error && <p className="text-xs text-destructive text-center font-medium bg-destructive/5 py-2 rounded-lg">{error}</p>}
            <Button variant="hero" className="w-full py-7 text-lg shadow-xl shadow-primary/20" onClick={()=>{
               if(amtNum < vendor.minInvest) { setError(`Min. investment is ${formatINR(vendor.minInvest)}`); return; }
               if(amtNum > remaining) { setError(`Max. available: ${formatINR(remaining)}`); return; }
               setError(""); setStep("method");
            }}>Proceed to Payment <ArrowRight className="w-5 h-5 ml-2"/></Button>
          </>)}

          {step === "method" && (<>
            <div className="text-center mb-6">
               <div className="text-3xl font-black text-foreground">{formatINR(amtNum)}</div>
               <p className="text-xs text-muted-foreground">Confirming your investment</p>
            </div>
            <div className="space-y-3">
              {[
                {id:"upi", label:"UPI instant Pay", sub:"GPay, PhonePe, Paytm", icon:Smartphone, color:"bg-purple-500/10 text-purple-600"},
                {id:"card", label:"Credit / Debit Card", sub:"Visa, MasterCard, RuPay", icon:CreditCard, color:"bg-blue-500/10 text-blue-600"},
                {id:"netbanking", label:"Net Banking", sub:"All major banks", icon:Landmark, color:"bg-green-500/10 text-green-600"},
              ].map(m=>(
                <button key={m.id} onClick={()=>setMethod(m.id as any)} className={`w-full flex items-center gap-4 p-5 rounded-3xl border-2 transition-all group ${method===m.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/20"}`}>
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${m.color} group-hover:scale-110 transition-transform`}><m.icon className="w-6 h-6"/></div>
                   <div className="text-left flex-1"><div className="font-bold text-sm">{m.label}</div><div className="text-[10px] text-muted-foreground">{m.sub}</div></div>
                   {method===m.id && <CheckCircle2 className="w-6 h-6 text-primary"/>}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-2xl" onClick={()=>setStep("amount")}>Back</Button>
              <Button variant="hero" className="flex-1 rounded-2xl" onClick={()=>setStep(method==="upi"?"upi":"card")}>Pay Now</Button>
            </div>
          </>)}

          {step === "processing" && (
            <div className="py-12 text-center space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                 <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                 <RefreshCw className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse"/>
              </div>
              <div><h3 className="text-lg font-bold">Safely Processing...</h3><p className="text-sm text-muted-foreground mt-1">{procMsg}</p></div>
              <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Do not refresh or close</p>
            </div>
          )}

          {step === "success" && (
            <div className="py-8 text-center space-y-6 animate-in zoom-in-95">
               <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto border-4 border-success/20 overflow-hidden">
                 <div className="bg-success text-white p-4 rounded-full animate-bounce"><Check className="w-10 h-10 stroke-[3px]"/></div>
               </div>
               <div><h3 className="text-2xl font-black">Success!</h3><p className="text-sm text-muted-foreground">Investment of {formatINR(amtNum)} confirmed.</p></div>
               <div className="bg-accent/40 rounded-3xl p-6 text-left text-sm space-y-3">
                  <div className="flex justify-between font-medium"><span>Transaction ID</span><span className="font-mono text-xs opacity-60">{txnRef}</span></div>
                  <div className="flex justify-between font-medium"><span>Business</span><span>{vendor.name}</span></div>
                  <div className="flex justify-between font-bold text-success"><span>Annual Return</span><span>+{vendor.returns}</span></div>
                  <div className="flex justify-between font-medium"><span>Next Payout</span><span>1st of next month</span></div>
               </div>
               <Button variant="hero" className="w-full rounded-2xl" onClick={onClose}>Go to Portfolio <ChevronRight className="w-4 h-4 ml-2"/></Button>
            </div>
          )}

          {/* Simple UPI/Card placeholders similarly styled... */}
          {(step === "upi" || step === "card") && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
               <div className="text-center"><h3 className="font-bold">Finalize Payment</h3><p className="text-xs text-muted-foreground mt-1">Paying {formatINR(amtNum)} to {vendor.name}</p></div>
               {step === "upi" ? (
                 <div className="space-y-4">
                   <input className={inp + " text-center text-lg font-bold border-2 border-primary/20"} placeholder="yourname@bank" value={upiId} onChange={e=>setUpiId(e.target.value)}/>
                   <p className="text-[10px] text-center text-muted-foreground uppercase font-bold tracking-widest">or scan qr code</p>
                   <div className="w-40 h-40 mx-auto bg-white rounded-3xl p-4 border-2 border-accent flex items-center justify-center">
                     <svg viewBox="0 0 100 100" className="w-full h-full opacity-80"><rect width="100" height="100" fill="transparent"/><path d="M10 10h30v30h-30z M60 10h30v30h-30z M10 60h30v30h-30z M60 60h30v30h-30z" fill="#000" fillOpacity="0.2"/></svg>
                   </div>
                 </div>
               ) : (
                 <div className="space-y-3">
                   <input className={inp} placeholder="Card Number" value={cardNum} onChange={e=>setCardNum(formatCard(e.target.value))}/>
                   <div className="grid grid-cols-2 gap-3">
                     <input className={inp} placeholder="MM/YY" value={cardExp} onChange={e=>setCardExp(formatExp(e.target.value))}/>
                     <input className={inp} placeholder="CVV" type="password" value={cardCvv} onChange={e=>setCardCvv(e.target.value)}/>
                   </div>
                 </div>
               )}
               <div className="flex gap-2">
                 <Button variant="outline" className="flex-1 rounded-2xl" onClick={()=>setStep("method")}>Back</Button>
                 <Button variant="hero" className="flex-1 rounded-2xl" onClick={()=>simulate(step==="upi"?"UPI":"CARD")}>Confirm</Button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Portfolio() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const INVESTOR_ID = user?.id || 1;
  const [db] = useDB();
  const investor = db.investors.find(i => i.id === INVESTOR_ID);
  const myInvestments = db.investments.filter(i => i.investorId === INVESTOR_ID);
  
  const metrics = useMemo(() => {
    const total = myInvestments.reduce((a,i) => a+i.amount, 0);
    const earned = myInvestments.reduce((a,i) => a+i.returnsEarned, 0);
    return { total, earned, current: total + earned };
  }, [myInvestments]);

  if (!investor) return null;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 bg-mesh p-8 rounded-[3rem]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">Portfolio</h2>
          <p className="text-muted-foreground mt-1">Welcome back, {investor.name}. Your wealth is growing.</p>
        </div>
        <div className="flex items-center gap-2 p-1.5 bg-accent/40 rounded-2xl border border-border/50">
           <div className={`px-4 py-2 rounded-xl text-xs font-bold ${investor.kycStatus === "Verified" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
             {investor.kycStatus === "Verified" ? "✓ KYC VERIFIED" : "⚠ KYC PENDING"}
           </div>
           <div className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">{investor.plan} PLAN</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="reveal-card glass-premium p-10 relative overflow-hidden group">
           <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-125 transition-transform duration-700 text-primary"><IndianRupee className="w-40 h-40" /></div>
           <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Total Assets</p>
           <h3 className="text-5xl font-black text-foreground tracking-tighter">{formatINR(metrics.total)}</h3>
           <div className="mt-10 flex items-center gap-2 text-success font-black text-xs bg-success/10 w-fit px-4 py-2 rounded-full border border-success/20 animate-float"><TrendingUp className="w-4 h-4"/> +14.2% APY</div>
        </div>
        <div className="reveal-card glass-premium p-10 relative overflow-hidden group">
           <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-125 transition-transform duration-700 text-success"><TrendingUp className="w-40 h-40" /></div>
           <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Realized Returns</p>
           <h3 className="text-5xl font-black text-success tracking-tighter">{formatINR(metrics.earned)}</h3>
           <p className="text-[10px] font-bold text-muted-foreground mt-10 uppercase tracking-widest">Efficiency: <span className="text-foreground">98.4%</span></p>
        </div>
        <div className="reveal-card glass-premium p-10 relative overflow-hidden group">
           <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-125 transition-transform duration-700 text-secondary"><CalendarClock className="w-40 h-40" /></div>
           <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Estimated Payout</p>
           <h3 className="text-5xl font-black text-foreground tracking-tighter">Apr 01</h3>
           <p className="text-[10px] font-bold text-muted-foreground mt-10 uppercase tracking-widest">Liquidity: <span className="text-success font-black">HIGH</span></p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 card-elevated p-8">
           <div className="flex justify-between items-center mb-10">
             <h4 className="text-xl font-bold flex items-center gap-2"><PieChart className="w-5 h-5 text-primary" /> Active Stakes</h4>
             <Button variant="ghost" size="sm" className="text-xs" onClick={() => addNotification(db, { userId: INVESTOR_ID, userType: "investor", title: "Analytics Hub", message: "Portfolio performance visualization is being recalculated for Q2 2025.", type: "system", read: false, date: new Date().toLocaleDateString() })}>View Performance <ArrowRight className="w-4 h-4 ml-1"/></Button>
           </div>
           <div className="space-y-6">
             {myInvestments.length > 0 ? myInvestments.map(inv => {
               const vendor = db.vendors.find(v => v.id === inv.vendorId);
               return (
                 <div key={inv.id} className="group p-6 rounded-3xl bg-accent/20 border border-border/50 hover:border-primary/20 hover:bg-accent/40 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4 items-center">
                        <div className="w-14 h-14 rounded-2xl bg-white border border-border/50 flex items-center justify-center text-primary font-black text-xl shadow-sm group-hover:scale-105 transition-transform">
                          {vendor?.name[0]}
                        </div>
                        <div>
                          <h5 className="font-bold text-lg">{vendor?.name}</h5>
                          <div className="flex gap-3 text-xs text-muted-foreground font-medium">
                            <span>{formatINR(inv.amount)} invested</span>
                            <span className="text-primary">{vendor?.returns} p.a.</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                         <div className="text-lg font-black text-success">+{formatINR(inv.returnsEarned)}</div>
                         <div className="text-[10px] text-muted-foreground font-bold tracking-tighter uppercase">Total Earned</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                         <span>Tenure Progress</span>
                         <span>{inv.completedMonths} / {inv.tenureMonths} Months</span>
                       </div>
                       <ProgressBar value={inv.completedMonths} max={inv.tenureMonths} className="h-2.5" />
                    </div>
                 </div>
               );
             }) : (
               <div className="py-20 text-center border-2 border-dashed border-border rounded-[2rem]">
                  <p className="text-muted-foreground">Start investing to see your stakes here.</p>
               </div>
             )}
           </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <div className="card-elevated p-8">
              <h4 className="font-bold mb-6 flex items-center gap-2"><Bell className="w-5 h-5 text-secondary" /> Investment Activity</h4>
              <div className="space-y-6 relative ml-2 before:absolute before:left-[-1px] before:top-2 before:bottom-2 before:w-px before:bg-border/50">
                 {db.transactions.filter(t => t.investorId === INVESTOR_ID).slice(0, 4).map(t => (
                   <div key={t.id} className="relative pl-6">
                      <div className={`absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-card ${t.type === "Investment" ? "bg-primary" : "bg-success"}`} />
                      <div className="flex justify-between items-start gap-2">
                         <div>
                            <div className="text-sm font-bold leading-tight">{t.type} in {t.vendorName}</div>
                            <div className="text-[10px] text-muted-foreground font-medium mt-0.5">{t.date}</div>
                         </div>
                         <div className={`text-sm font-black ${t.type === "Investment" ? "text-foreground" : "text-success"}`}>
                           {t.type === "Investment" ? "-" : "+"}{formatINR(t.amount)}
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
              <Button variant="outline" className="w-full mt-8 rounded-2xl text-xs font-bold tracking-widest uppercase" onClick={() => navigate("/dashboard/investor/transactions")}>View All History</Button>
           </div>

           <div className="reveal-card glass-premium p-1 bg-primary text-white overflow-hidden relative group cursor-pointer" onClick={() => addNotification(db, { userId: INVESTOR_ID, userType: "investor", title: "Waitlist Joined", message: "You are now on the waitlist for the Premium Samudaay Tier. We will contact you soon.", type: "system", read: false, date: new Date().toLocaleDateString() })}>
              <div className="absolute -right-4 -top-4 opacity-20"><TrendingUp className="w-32 h-32 rotate-12 group-hover:scale-110 transition-transform"/></div>
              <div className="p-8">
                <h5 className="text-xl font-black mb-2 leading-none">Upgrade to <br/>Premium Plan</h5>
                <p className="text-white/70 text-xs mb-6">Access exclusive 15%+ return deals and zero platform fees.</p>
                <div className="flex items-center gap-2 text-xs font-bold">Inquire Now <ArrowRight className="w-4 h-4"/></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function Discover() {
  const [db, setDB] = useDB();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [selected, setSelected] = useState<Vendor|null>(null);
  
  const { user } = useAuth();
  const INVESTOR_ID = user?.id || 1;

  const cats = ["All", "Food", "Services", "Retail", "Manufacturing", "Tech"];
  const vendors = db.vendors.filter(v => v.is_active && v.status === "Verified" && v.raised < v.goal);
  
  const filtered = useMemo(() => vendors.filter(v => {
    const mQ = v.name.toLowerCase().includes(search.toLowerCase());
    const mC = cat === "All" || v.category === cat;
    return mQ && mC;
  }), [vendors, search, cat]);

  const handleInvestSuccess = useCallback((amount: number, txnId: string, method: string) => {
    if (!selected) return;
    const dateStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const nextMonth = new Date(); nextMonth.setMonth(nextMonth.getMonth()+1); nextMonth.setDate(1);
    const nextPayoutStr = nextMonth.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
    const tenureMonths = parseInt(selected.tenure) || 12;

    setDB(prev => {
      const inv: Investment = {
        id: `inv_${Date.now()}`, investorId: INVESTOR_ID, vendorId: selected.id,
        amount, txnId, paymentMethod: method, date: dateStr, status: "Active",
        returnsEarned: 0, nextPayout: nextPayoutStr, tenureMonths, completedMonths: 0,
      };
      const txn: Transaction = {
        id: `txn_${Date.now()}`, investorId: INVESTOR_ID, vendorId: selected.id,
        vendorName: selected.name, type: "Investment",
        amount, date: dateStr, status: "Success", txnId, paymentMethod: method,
      };
      
      let updated = {
        ...prev,
        vendors: prev.vendors.map(v => v.id === selected.id ? { ...v, raised: v.raised + amount, investors: v.investors + 1 } : v),
        investors: prev.investors.map(i => i.id === INVESTOR_ID ? { ...i, totalInvested: i.totalInvested + amount, portfolio: i.portfolio + 1 } : i),
        investments: [...prev.investments, inv],
        transactions: [...prev.transactions, txn],
      };
      return addNotification(updated, { userId: INVESTOR_ID, userType: "investor", title: "Investment Successful", message: `${formatINR(amount)} invested in ${selected.name}`, type: "investment", read: false, date: dateStr });
    });
    setSelected(null);
  }, [selected, setDB, INVESTOR_ID]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {selected && <PaymentGateway vendor={selected} onClose={() => setSelected(null)} onSuccess={handleInvestSuccess} />}

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <input placeholder="Discover local gems..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-12 pr-6 py-4 rounded-[1.5rem] bg-card border border-border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"/>
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto scrollbar-hide pb-1">
           {cats.map(c => (
             <button key={c} onClick={() => setCat(c)} className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all shrink-0 ${cat === c ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-card text-muted-foreground border border-border hover:border-primary/20"}`}>
               {c}
             </button>
           ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(v => (
          <div key={v.id} className="card-elevated group flex flex-col h-full overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-500">
             <div className="p-8 pb-0">
               <div className="flex justify-between items-start mb-6">
                 <div className="w-14 h-14 rounded-3xl bg-primary/5 flex items-center justify-center text-primary font-black text-xl group-hover:scale-110 transition-transform">
                   {v.name[0]}
                 </div>
                 <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-accent text-[10px] font-black uppercase tracking-tighter text-muted-foreground">{v.category}</span>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/5 text-amber-600 rounded-full text-[10px] font-black"><Star className="w-3 h-3 fill-amber-500"/>{Number(v.rating).toFixed(1)}</div>
                 </div>
               </div>
               <h3 className="text-xl font-black text-foreground mb-2 group-hover:text-primary transition-colors">{v.name}</h3>
               <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-6">{v.description}</p>
             </div>

             <div className="mt-auto px-8 pb-8 space-y-6">
               <div>
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                    <span>Target: {formatINR(v.goal)}</span>
                    <span className="text-primary">{Math.round(v.raised/v.goal*100)}%</span>
                  </div>
                  <ProgressBar value={v.raised} max={v.goal} className="h-2 rounded-full overflow-hidden" />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-success/5 border border-success/10 rounded-2xl p-4 text-center">
                     <div className="text-lg font-black text-success">{v.returns}</div>
                     <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Returns</div>
                  </div>
                  <div className="bg-accent/40 rounded-2xl p-4 text-center">
                     <div className="text-lg font-black text-foreground">{v.tenure}</div>
                     <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Tenure</div>
                  </div>
               </div>

               <Button variant="hero" className="w-full py-6 rounded-2xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-xl shadow-primary/20" onClick={()=>setSelected(v)}>
                  Invest Now <ArrowRight className="w-4 h-4 ml-2"/>
               </Button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrustKYC() {
  const [db, setDB] = useDB();
  const { user } = useAuth();
  const INVESTOR_ID = user?.id || 1;
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    addNotification(db, { userId: INVESTOR_ID, userType: "investor", title: "Document Uploaded", message: "Your document is being reviewed by our compliance team.", type: "system", read: false, date: new Date().toLocaleDateString() });
  };
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
       <div className="card-elevated p-10 bg-gradient-to-br from-primary/5 to-transparent border-primary/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5"><BadgeCheck className="w-40 h-40" /></div>
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
             <div className="w-24 h-24 rounded-[2rem] bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/30">
                <BadgeCheck className="w-12 h-12" />
             </div>
             <div>
                <h2 className="text-3xl font-black text-foreground tracking-tight">Trust & Verification</h2>
                <p className="text-muted-foreground text-lg mt-2">Your profile is currently <span className="text-success font-bold">Verified</span>. You have full access to high-yield investment opportunities.</p>
             </div>
          </div>
       </div>

       <div className="grid md:grid-cols-2 gap-8">
          <div className="card-elevated p-8 space-y-6">
             <h3 className="text-xl font-bold flex items-center gap-2"><UserCheck className="w-5 h-5 text-primary" /> Identity Documents</h3>
             <div className="space-y-4">
                {[{name:"Personal PAN Card", status:"verified"}, {name:"Aadhaar Identity", status:"verified"}, {name:"Bank Statement (Last 6mo)", status:"pending"}].map(d => (
                  <div key={d.name} className="flex items-center justify-between p-5 rounded-3xl bg-accent/20 border border-border/50 hover:border-primary/20 transition-all group">
                     <div className="flex gap-4 items-center">
                       <div className="p-3 rounded-2xl bg-card border border-border group-hover:text-primary transition-colors transform group-hover:rotate-6"><FileText className="w-5 h-5"/></div>
                       <div><span className="text-sm font-bold block">{d.name}</span><span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{d.status}</span></div>
                     </div>
                     <StatusBadge status={d.status} />
                  </div>
                ))}
             </div>
             <input type="file" ref={fileRef} className="hidden" onChange={handleUpload} />
             <Button variant="outline" className="w-full py-6 rounded-2xl font-bold" onClick={() => fileRef.current?.click()}><Upload className="w-4 h-4 mr-2" /> Upload New Document</Button>
          </div>

          <div className="card-elevated p-8">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Shield className="w-5 h-5 text-success" /> Verification Log</h3>
             <div className="space-y-8 relative ml-3 before:absolute before:left-[-1px] before:top-2 before:bottom-2 before:w-px before:bg-border">
                {[{t:"PAN Card Verified", d:"Mar 12, 2024", s:true}, {t:"Address Verification Success", d:"Mar 14, 2024", s:true}, {t:"Video KYC Completed", d:"Mar 15, 2024", s:true}, {t:"Auto-Investment Limit Upgrade", d:"Next Review...", s:false}].map((l, i) => (
                   <div key={i} className="relative pl-8">
                     <div className={`absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-card ${l.s ? "bg-success shadow-sm shadow-success" : "bg-accent"}`} />
                     <div className="text-sm font-bold leading-none">{l.t}</div>
                     <div className="text-[10px] text-muted-foreground font-medium mt-1 tracking-wider uppercase">{l.d}</div>
                   </div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );
}

function Transactions() {
  const { user } = useAuth();
  const INVESTOR_ID = user?.id || 1;
  const [db] = useDB();
  const txns = db.transactions.filter(t => t.investorId === INVESTOR_ID);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-foreground">Transactions</h2>
        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => exportToCSV(txns, "investor_transactions")}><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
      </div>

      <div className="card-elevated overflow-hidden border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-accent/30 text-left text-muted-foreground">
                <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Reference</th>
                <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Business</th>
                <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Type</th>
                <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Amount</th>
                <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px]">Date</th>
                <th className="px-8 py-5 font-bold uppercase tracking-widest text-[10px] text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {txns.map(t => (
                <tr key={t.id} className="border-b border-border/40 last:border-0 hover:bg-accent/10 transition-colors">
                  <td className="px-8 py-6 font-mono text-xs opacity-60">{t.txnId}</td>
                  <td className="px-8 py-6 font-bold">{t.vendorName}</td>
                  <td className="px-8 py-6">
                     <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${t.type === "Investment" ? "bg-primary/10 text-primary" : "bg-success/10 text-success"}`}>
                       {t.type}
                     </span>
                  </td>
                  <td className="px-8 py-6 font-black text-lg">{formatINR(t.amount)}</td>
                  <td className="px-8 py-6 text-muted-foreground">{t.date}</td>
                  <td className="px-8 py-6 text-right"><StatusBadge status="verified" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {txns.length === 0 && <div className="py-20 text-center text-muted-foreground font-medium">No transactions found.</div>}
        </div>
      </div>
    </div>
  );
}

export default function InvestorDashboard() {
  return (
    <DashboardLayout navItems={navItems} groupLabel="Wealth Management">
      <div className="max-w-[1200px] mx-auto px-4">
        <Routes>
          <Route index element={<Portfolio/>}/>
          <Route path="discover" element={<Discover/>}/>
          <Route path="investments" element={<MyInvestments/>}/>
          <Route path="transactions" element={<Transactions/>}/>
          <Route path="agreements" element={<InvestorAgreements/>}/>
          <Route path="kyc" element={<TrustKYC/>}/>
          <Route path="community" element={<InvestorCommunity/>}/>
          <Route path="settings" element={<InvestorSettings/>}/>
        </Routes>
      </div>
    </DashboardLayout>
  );
}

function MyInvestments() {
  const { user } = useAuth();
  const INVESTOR_ID = user?.id || 1;
  const [db] = useDB();
  const myInvestments = (db.investments || []).filter(i => i.investorId === INVESTOR_ID);

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 bg-mesh p-8 rounded-[3rem]">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
             <h2 className="text-4xl font-black text-foreground tracking-tight">Active Stakes</h2>
             <p className="text-muted-foreground font-medium mt-1">Management of your {myInvestments.length} live business investments.</p>
          </div>
          <Button variant="outline" className="rounded-2xl px-6 font-bold" onClick={() => exportToCSV(myInvestments, "my_investments")}><Download className="w-4 h-4 mr-2"/> Export Portfolio</Button>
       </div>

       <div className="grid gap-6">
          {myInvestments.map(inv => {
            const vendor = db.vendors.find(v => v.id === inv.vendorId);
            return (
              <div key={inv.id} className="card-elevated p-8 hover:border-primary/20 transition-all group">
                 <div className="flex flex-col lg:flex-row lg:items-center gap-10">
                    <div className="flex gap-6 items-center lg:w-1/3">
                       <div className="w-20 h-20 rounded-[2rem] bg-white border border-border shadow-sm flex items-center justify-center text-primary font-black text-3xl group-hover:scale-110 transition-transform">
                          {vendor?.name[0]}
                       </div>
                       <div>
                          <h4 className="text-2xl font-bold">{vendor?.name}</h4>
                          <p className="text-muted-foreground text-sm font-medium">{vendor?.category} · {vendor?.location}</p>
                       </div>
                    </div>

                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6">
                       <div><p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Staked</p><p className="text-xl font-black">{formatINR(inv.amount)}</p></div>
                       <div><p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Returns</p><p className="text-xl font-black text-success">{vendor?.returns}</p></div>
                       <div><p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Earned</p><p className="text-xl font-black text-primary">+{formatINR(inv.returnsEarned)}</p></div>
                       <div><p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Next Pay</p><p className="text-xl font-black text-foreground">{inv.nextPayout}</p></div>
                    </div>

                    <div className="lg:w-1/4">
                       <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                          <span className="text-muted-foreground">Tenure</span>
                          <span className="text-primary">{inv.completedMonths} / {inv.tenureMonths} mo</span>
                       </div>
                       <ProgressBar value={inv.completedMonths} max={inv.tenureMonths} className="h-3" />
                    </div>
                 </div>
              </div>
            );
          })}
          {myInvestments.length === 0 && <div className="py-20 text-center font-medium text-muted-foreground">No active investments found. <span className="text-primary cursor-pointer underline">Browse Businesses</span></div>}
       </div>
    </div>
  );
}

function InvestorAgreements() {
  const { user } = useAuth();
  const INVESTOR_ID = user?.id || 1;
  const [db] = useDB();
  const myInvestments = (db.investments || []).filter(i => i.investorId === INVESTOR_ID);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 bg-mesh p-8 rounded-[3rem]">
       <h2 className="text-4xl font-black text-foreground tracking-tight">Legal Repository</h2>
       <p className="text-muted-foreground font-medium -mt-4">Signed Master Community Agreements (MCA) for all your active stakes.</p>
       
       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myInvestments.length > 0 ? myInvestments.map(inv => {
            const vendor = db.vendors.find(v => v.id === inv.vendorId);
            return (
              <div key={inv.id} className="card-elevated p-8 flex flex-col gap-8 hover:border-primary/40 transition-all group">
                 <div className="flex gap-5 items-start">
                    <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 transform group-hover:rotate-6 flex-shrink-0">
                       <FileText className="w-7 h-7" />
                    </div>
                    <div className="min-w-0">
                       <h4 className="font-bold text-lg truncate">{vendor?.name} Contract</h4>
                       <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Reference: {inv.txnId}</p>
                    </div>
                 </div>
                 <div className="pt-4 border-t border-border/50 flex gap-3">
                    <Button variant="outline" className="flex-1 rounded-xl text-xs font-bold" onClick={() => addNotification(db, { userId: INVESTOR_ID, userType: "investor", title: "Generating PDF", message: "Digital signature validated for " + vendor?.name + ". Preview is being prepared.", type: "system", read: false, date: new Date().toLocaleDateString() })}>Preview</Button>
                    <Button variant="ghost" className="rounded-xl px-4" onClick={() => addNotification(db, { userId: INVESTOR_ID, userType: "investor", title: "Download Started", message: "Merchant Agreement MCA-420-99... is downloading.", type: "system", read: false, date: new Date().toLocaleDateString() })}><Download className="w-4 h-4"/></Button>
                 </div>
              </div>
            );
          }) : (
            <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed border-border rounded-[3rem]">
               No agreements found. Agreements are generated upon your first investment.
            </div>
          )}
       </div>
    </div>
  );
}

function InvestorCommunity() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700 bg-mesh p-8 rounded-[3rem]">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <h2 className="text-4xl font-black text-foreground tracking-tight">Local Newsroom</h2>
            <p className="text-muted-foreground font-medium mt-1">Updates and milestones from businesses you believe in.</p>
         </div>
         <Button variant="hero" className="rounded-2xl px-8 shadow-xl shadow-primary/20">Join Discussion</Button>
       </div>

       <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
             {["Organic Junction expands to new location", "TechFlow Solutions records 45% revenue growth", "Green Grocers now serving 5,000+ households"].map((news, i) => (
               <div key={i} className="card-elevated p-10 group cursor-pointer hover:border-primary/30 transition-all">
                  <div className="flex gap-4 items-center mb-6">
                     <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">Company Update</span>
                     <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase italic">4 hours ago</span>
                  </div>
                  <h4 className="text-3xl font-black group-hover:text-primary transition-colors leading-tight mb-4 tracking-tight">{news}</h4>
                  <p className="text-muted-foreground text-lg leading-relaxed">This growth phase is a testament to the community support we have received through Samudaay. Your investments have allowed us to scale inventory by 40% and hire 12 more local staff members...</p>
                  <div className="mt-10 flex gap-8 items-center text-xs font-black uppercase tracking-widest text-muted-foreground">
                     <span className="flex items-center gap-2 hover:text-primary transition-colors"><MessageCircle className="w-4 h-4 text-primary"/> 18 Comments</span>
                     <span className="flex items-center gap-2 hover:text-primary transition-colors"><Copy className="w-4 h-4 text-primary"/> Share Update</span>
                  </div>
               </div>
             ))}
          </div>

          <div className="lg:col-span-4 space-y-6">
             <div className="card-elevated p-8 bg-card">
                <h4 className="font-bold text-lg mb-6">Community Highlights</h4>
                <div className="space-y-8">
                   <div>
                      <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2"><span className="text-muted-foreground">Local Jobs</span><span className="text-primary">+1,200</span></div>
                      <ProgressBar value={65} max={100} className="h-2.5 rounded-full" />
                   </div>
                   <div>
                      <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-2"><span className="text-muted-foreground">Wealth Generated</span><span className="text-success">₹12.8M</span></div>
                      <ProgressBar value={40} max={100} className="h-2.5 rounded-full" />
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

function InvestorSettings() {
  const { user } = useAuth();
  const [db] = useDB();
  const INVESTOR_ID = user?.id || 1;
  const investor = db.investors.find(i => i.id === INVESTOR_ID);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
       <div className="card-elevated p-12 bg-mesh relative overflow-hidden border-border/50">
          <div className="absolute top-0 right-0 p-12 opacity-5"><Settings className="w-48 h-48" /></div>
          <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
             <div className="w-32 h-32 rounded-[2.5rem] bg-card border border-border shadow-2xl flex items-center justify-center text-primary font-black text-5xl shadow-primary/10">
               {investor?.name?.[0]}
             </div>
             <div className="text-center md:text-left">
                <h2 className="text-4xl font-black text-foreground tracking-tight">{investor?.name}</h2>
                <p className="text-muted-foreground text-xl font-medium mt-1 uppercase tracking-widest">{investor?.plan} Tier Account</p>
             </div>
          </div>
       </div>

       <div className="grid md:grid-cols-2 gap-8">
          <div className="card-elevated p-10 space-y-8">
             <h3 className="text-xl font-bold flex items-center gap-3 font-black"><Smartphone className="w-6 h-6 text-primary" /> Account Profile</h3>
             <div className="space-y-6">
                <div><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Official Email</label><input className={inp} defaultValue={investor?.email} /></div>
                <div><label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Registered Phone</label><input className={inp} defaultValue={investor?.phone} /></div>
                <div className="pt-4"><Button variant="hero" className="w-full rounded-2xl py-7 font-black uppercase tracking-wider shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">Save Profile Changes</Button></div>
             </div>
          </div>

          <div className="card-elevated p-10 space-y-8">
             <h3 className="text-xl font-bold flex items-center gap-3 font-black"><Shield className="w-6 h-6 text-secondary" /> Privacy & Security</h3>
             <div className="space-y-6">
                <div className="flex justify-between items-center p-5 rounded-3xl bg-primary/5 border border-primary/10">
                   <div><p className="text-sm font-bold">Biometric Login</p><p className="text-[10px] text-muted-foreground font-black uppercase mt-0.5 tracking-tighter">Secure FaceID/TouchID Active</p></div>
                   <div className="w-12 h-6 rounded-full bg-primary relative p-1 transition-all"><div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white"></div></div>
                </div>
                <div className="flex justify-between items-center p-5 rounded-3xl bg-accent/20 border border-border/50">
                   <div><p className="text-sm font-bold">Public Analytics</p><p className="text-[10px] text-muted-foreground font-black uppercase mt-0.5 tracking-tighter">Anonymize data on billboards</p></div>
                   <div className="w-12 h-6 rounded-full bg-muted relative p-1"><div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm"></div></div>
                </div>
                <div className="pt-4"><Button variant="outline" className="w-full rounded-2xl py-7 font-black uppercase tracking-wider border-2">Update Security Keys</Button></div>
             </div>
          </div>
       </div>
    </div>
  );
}
