import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Users, Menu, X, ArrowRight, ShieldCheck, TrendingUp, Briefcase, Store,
  Star, MapPin, CheckCircle2, BarChart3, FileText, Bell, IndianRupee,
  ChevronRight, Play, Award, Heart, Zap, Globe, MessageSquare, 
  ArrowUpRight, Shield, Rocket, UserPlus, Search, Landmark,
} from "lucide-react";
import { ProgressBar } from "@/components/ui/metric-card";

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-card/70 backdrop-blur-xl border-b border-border py-4" : "bg-transparent py-6"}`}>
      <div className="container mx-auto flex items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-[1.25rem] bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <Users className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-black text-foreground tracking-tighter">Samudaay</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-muted-foreground">
          <Link to="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link>
          <Link to="/discover" className="hover:text-primary transition-colors">Discover</Link>
          <Link to="/about" className="hover:text-primary transition-colors">About</Link>
          <Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" className="font-bold hover:bg-primary/5" asChild><Link to="/login">Log In</Link></Button>
          <Button variant="hero" className="rounded-2xl px-6 shadow-xl shadow-primary/20" asChild><Link to="/register">Get Started <ArrowRight className="w-4 h-4 ml-2"/></Link></Button>
        </div>

        <button className="md:hidden text-foreground p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-card border-b border-border p-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
          <Link to="/how-it-works" className="block text-lg font-bold text-foreground">How It Works</Link>
          <Link to="/discover" className="block text-lg font-bold text-foreground">Discover</Link>
          <Link to="/about" className="block text-lg font-bold text-foreground">About Us</Link>
          <div className="flex flex-col gap-3 pt-4 border-t border-border">
            <Button variant="hero" className="w-full rounded-2xl py-6" asChild><Link to="/register">Create Account</Link></Button>
            <Button variant="outline" className="w-full rounded-2xl py-6" asChild><Link to="/login">Sign In</Link></Button>
          </div>
        </div>
      )}
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative pt-40 pb-32 overflow-hidden bg-background">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
           <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/5 text-primary text-xs font-black uppercase tracking-widest mb-10 border border-primary/10 animate-in fade-in slide-in-from-bottom-2 duration-700">
             <ShieldCheck className="w-4 h-4" />
             Empowering 18,000+ Indians locally
           </div>
           
           <h1 className="text-6xl md:text-8xl font-black text-foreground leading-[1.05] tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
             Invest in <br/> Your <span className="text-gradient-primary">Neighbours.</span>
           </h1>
           
           <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
             The first-ever community investment platform for India. Earn up to 15% annual returns while building real wealth in your local community.
           </p>

           <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
             <Button variant="hero" size="lg" className="w-full sm:w-auto rounded-3xl px-12 py-8 text-lg font-black shadow-2xl shadow-primary/30" asChild>
               <Link to="/register">Start Growing Free <ArrowRight className="w-6 h-6 ml-2" /></Link>
             </Button>
             <Button variant="hero-outline" size="lg" className="w-full sm:w-auto rounded-3xl px-12 py-8 text-lg font-black border-2 border-primary/20 hover:border-primary transition-all" asChild>
               <Link to="/how-it-works"><Play className="w-5 h-5 mr-3 fill-primary" />How it works</Link>
             </Button>
           </div>
        </div>

        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
           {[
             { label: "Community Invested", val: "₹12.4Cr+", icon: Landmark },
             { label: "Active Investors", val: "18,240+", icon: Users },
             { label: "Verified Businesses", val: "2,400+", icon: Store },
             { label: "Jobs Powered", val: "5,600+", icon: Briefcase },
           ].map((s, i) => (
             <div key={i} className="card-elevated p-8 text-center group hover:-translate-y-2 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                   <s.icon className="w-6 h-6"/>
                </div>
                <div className="text-3xl font-black text-foreground mb-1 tracking-tight">{s.val}</div>
                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{s.label}</div>
             </div>
           ))}
        </div>
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
    </section>
  );
}

function SectionHeader({ over, title, sub, center = true }: { over: string, title: string, sub: string, center?: boolean }) {
  return (
    <div className={`${center ? "text-center" : "text-left"} mb-16`}>
      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 block">{over}</span>
      <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight">{title}</h2>
      <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">{sub}</p>
    </div>
  );
}

function TrustBadges() {
  return (
    <div className="bg-card border-y border-border py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap items-center justify-center gap-12 text-muted-foreground opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
           {["RBI COMPLIANT", "ISO 27001", "SEBI REGISTERED", "PCI DSS", "GDPR READY", "MADE IN INDIA"].map(t => (
             <span key={t} className="text-xs font-black tracking-[0.15em] border border-muted-foreground/30 px-4 py-2 rounded-xl">{t}</span>
           ))}
        </div>
      </div>
    </div>
  );
}

function BentoFeatures() {
  return (
    <section className="py-32 bg-background">
      <div className="container mx-auto px-6">
        <SectionHeader 
          over="THE PLATFORM" 
          title="Engineered for Trust." 
          sub="Everything you need to grow your wealth safely and support local growth." 
        />
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 card-elevated p-10 bg-gradient-to-br from-primary/10 to-transparent group hover:border-primary/20 transition-all duration-500 overflow-hidden relative">
             <div className="absolute -right-20 -bottom-20 opacity-5 group-hover:opacity-10 transition-opacity duration-500"><Shield className="w-80 h-80 rotate-12"/></div>
             <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center mb-8 shadow-xl shadow-primary/20"><ShieldCheck className="w-8 h-8"/></div>
                <h3 className="text-3xl font-black mb-4">Hyper-Verified Businesses</h3>
                <p className="text-lg text-muted-foreground max-w-md font-medium leading-relaxed">
                  Every vendor undergoes a 12-point audit including GST checks, bank statement analysis, and in-person site visits. Only 3% make the cut.
                </p>
                <Button variant="ghost" className="mt-8 font-black p-0 hover:bg-transparent hover:text-primary">Learn about verification <ArrowRight className="w-4 h-4 ml-2"/></Button>
             </div>
          </div>
          
          <div className="card-elevated p-10 flex flex-col justify-between group hover:border-success/30 transition-all duration-500">
             <div className="w-14 h-14 rounded-2xl bg-success text-white flex items-center justify-center mb-8 shadow-xl shadow-success/20"><TrendingUp className="w-8 h-8"/></div>
             <div>
                <h3 className="text-2xl font-black mb-4 tracking-tight">8–15% Returns</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  Earn higher yields than traditional bank accounts while contributing directly to your community's growth.
                </p>
             </div>
          </div>

          <div className="card-elevated p-10 flex flex-col justify-between group hover:border-primary/20 transition-all duration-500">
             <div className="w-14 h-14 rounded-2xl bg-accent text-primary flex items-center justify-center mb-8"><Zap className="w-8 h-8"/></div>
             <div>
                <h3 className="text-2xl font-black mb-4 tracking-tight">Monthly Payouts</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  No long lock-in periods. Your returns are credited directly to your bank account every single month.
                </p>
             </div>
          </div>

          <div className="md:col-span-2 card-elevated p-10 bg-card relative overflow-hidden group">
             <div className="flex flex-col md:flex-row gap-10 items-center">
                <div className="flex-1">
                   <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-8"><Award className="w-8 h-8"/></div>
                   <h3 className="text-3xl font-black mb-4">Legal Protection</h3>
                   <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                     Every investment is bound by an e-signed legal agreement, giving you the same protections as institutional investors.
                   </p>
                </div>
                <div className="w-full md:w-64 h-48 bg-accent/30 rounded-3xl border border-dashed border-border flex items-center justify-center p-6 text-center">
                   <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Instant<br/>E-Agreements<br/>via Digilocker</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ExploreBusinesses() {
  const samples = [
    { n: "Fresh Farms Dairy", c: "Food", l: "Andheri West", r: "10%", g: "₹12L", p: 72, i: "🥛" },
    { n: "AutoCare Plus", c: "Services", l: "Bandra East", r: "12%", g: "₹8L", p: 85, i: "🚗" },
    { n: "Silk & Thread", c: "Retail", l: "Dadar", r: "11%", g: "₹6L", p: 40, i: "👔" },
  ];
  return (
    <section className="py-32 bg-card relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
           <div className="max-w-xl">
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 block">LIVE CAMPAIGNS</span>
              <h2 className="text-5xl font-black text-foreground tracking-tight">Active Opportunities.</h2>
           </div>
           <Button variant="hero" className="rounded-2xl px-10 py-6" asChild><Link to="/register">Explore Marketplace <ArrowUpRight className="w-5 h-5 ml-2"/></Link></Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
           {samples.map((s, i) => (
             <div key={i} className="card-elevated p-8 bg-background group cursor-pointer hover:scale-[1.02] transition-all duration-300">
                <div className="w-16 h-16 rounded-[2rem] bg-accent/50 flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all">{s.i}</div>
                <h3 className="text-2xl font-black mb-2">{s.n}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mb-6"><MapPin className="w-4 h-4 text-primary"/>{s.l} · {s.c}</p>
                
                <div className="space-y-4 mb-8">
                   <div className="flex justify-between items-end">
                      <div className="text-3xl font-black text-success">{s.r}</div>
                      <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Fixed Return</div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                         <span>Raised: {s.p}%</span>
                         <span>Goal: {s.g}</span>
                      </div>
                      <ProgressBar value={s.p} max={100} className="h-2.5 rounded-full" />
                   </div>
                </div>

                <Button variant="outline" className="w-full rounded-2xl py-6 font-black border-primary/20 text-primary hover:bg-primary hover:text-white transition-all group-hover:border-primary">View Details</Button>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-40 bg-background relative overflow-hidden">
       <div className="container mx-auto px-6 relative z-10">
          <div className="card-elevated p-16 md:p-32 bg-primary text-white text-center rounded-[4rem] relative overflow-hidden group">
             <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
             <div className="relative z-10 max-w-2xl mx-auto">
                <Rocket className="w-16 h-16 mx-auto mb-10 animate-bounce" />
                <h2 className="text-5xl md:text-7xl font-black mb-8 leading-tight">Build Wealth. <br/> Locally.</h2>
                <p className="text-xl md:text-2xl text-white/70 mb-12 font-medium">Join 18,000+ community members making India stronger, one local business at a time.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                   <Button variant="hero" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 rounded-3xl px-12 py-8 text-xl font-black shadow-2xl" asChild>
                      <Link to="/register">Create Free Account <UserPlus className="w-6 h-6 ml-3"/></Link>
                   </Button>
                   <Button variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 rounded-3xl px-12 py-8 text-xl font-black" asChild>
                      <Link to="/contact">Talk to Expert</Link>
                   </Button>
                </div>
                <p className="text-xs text-white/40 mt-10 font-bold tracking-[0.2em] uppercase">No Minimum Commitment · Regulated & Secure</p>
             </div>
          </div>
       </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-card pt-32 pb-16 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-12 gap-16 mb-24">
           <div className="md:col-span-5">
              <Link to="/" className="flex items-center gap-3 mb-8 group">
                 <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <Users className="w-7 h-7 text-primary-foreground" />
                 </div>
                 <span className="text-3xl font-black text-foreground tracking-tighter">Samudaay</span>
              </Link>
              <p className="text-lg text-muted-foreground font-medium mb-10 leading-relaxed max-w-md">
                We're on a mission to democratise community investment and create sustainable wealth for every Indian.
              </p>
              <div className="flex gap-4">
                 {/* Social placeholders */}
                 {[1,2,3,4].map(i => <div key={i} className="w-12 h-12 rounded-2xl bg-accent border border-border flex items-center justify-center cursor-pointer hover:border-primary/40 hover:text-primary transition-all">#</div>)}
              </div>
           </div>
           
           <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-foreground">Explore</h4>
                 <div className="space-y-4 text-muted-foreground font-bold">
                    <Link to="/discover" className="block hover:text-primary transition-all">Marketplace</Link>
                    <Link to="/how-it-works" className="block hover:text-primary transition-all">How it works</Link>
                    <Link to="/about" className="block hover:text-primary transition-all">About Us</Link>
                    <Link to="/faq" className="block hover:text-primary transition-all">Financial FAQ</Link>
                 </div>
              </div>
              <div>
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-foreground">Community</h4>
                 <div className="space-y-4 text-muted-foreground font-bold">
                    <Link to="/register" className="block hover:text-primary transition-all">For Investors</Link>
                    <Link to="/register" className="block hover:text-primary transition-all">For Businesses</Link>
                    <Link to="/register" className="block hover:text-primary transition-all">For Seekers</Link>
                    <Link to="/contact" className="block hover:text-primary transition-all">Support Hub</Link>
                 </div>
              </div>
              <div>
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-foreground">Legal</h4>
                 <div className="space-y-4 text-muted-foreground font-bold">
                    <Link to="/privacy" className="block hover:text-primary transition-all">Privacy Policy</Link>
                    <Link to="/terms" className="block hover:text-primary transition-all">Terms of Use</Link>
                    <a href="#" className="block hover:text-primary transition-all">Risk Disclosure</a>
                    <a href="#" className="block hover:text-primary transition-all">Grievance</a>
                 </div>
              </div>
           </div>
        </div>

        <div className="pt-24 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
           <div>© 2026 Samudaay Technologies Pvt. Ltd.</div>
           <div className="flex gap-8">
              <span>CIN: L72900MH2024PTC012345</span>
              <span>SEBI REG: INZ000000000</span>
           </div>
        </div>
      </div>
    </footer>
  );
}

export default function Index() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-white">
      <Navbar />
      <Hero />
      <TrustBadges />
      <BentoFeatures />
      <ExploreBusinesses />
      <CTA />
      <Footer />
    </div>
  );
}
