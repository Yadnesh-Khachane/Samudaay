import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Store, Briefcase, ArrowRight, CheckCircle2, Shield, IndianRupee, FileText, Smartphone } from "lucide-react";

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-card/90 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center"><Users className="w-5 h-5 text-primary-foreground"/></div>
          <span className="text-xl font-bold text-foreground">Samudaay</span>
        </Link>
        <div className="flex gap-3">
          <Button variant="ghost" size="sm" asChild><Link to="/login">Log In</Link></Button>
          <Button variant="hero" size="sm" asChild><Link to="/register">Join Free</Link></Button>
        </div>
      </div>
    </nav>
  );
}

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-4">How Samudaay Works</h1>
          <p className="text-xl text-muted-foreground">A simple, transparent, and secure way to invest in your community.</p>
        </div>

        <div className="space-y-16">
          {[
            { role: "For Investors", icon: TrendingUp, color: "bg-secondary/10 text-secondary", steps: [
              { title: "Create Your Account", desc: "Sign up free with your email, phone, and basic details. Takes under 5 minutes." },
              { title: "Complete KYC", desc: "Upload your PAN card and Aadhaar. Our team verifies within 24 hours. Required only once." },
              { title: "Discover Businesses", desc: "Browse our marketplace of verified local businesses. Read financials, owner profiles, and return history." },
              { title: "Invest via UPI or Card", desc: "Choose an amount (min ₹5,000), pay securely using UPI/Card/Net Banking. Get an instant e-signed agreement." },
              { title: "Receive Monthly Returns", desc: "Returns are credited to your bank account every month. Track everything on your dashboard." },
            ]},
            { role: "For Business Owners", icon: Store, color: "bg-primary/10 text-primary", steps: [
              { title: "Register Your Business", desc: "Create your vendor profile with business details, photos, and a description of your venture." },
              { title: "Document Verification", desc: "Submit GST certificate, bank statements, and business license. Verified within 3 working days." },
              { title: "Set Funding Parameters", desc: "Define your goal amount, return rate (8–15%), tenure (6–36 months), and minimum investment." },
              { title: "Get Funded", desc: "Your campaign goes live to 18,000+ investors. Get notified for each investment in real time." },
              { title: "Pay Returns Monthly", desc: "The platform handles automated return calculations. You pay investors monthly directly through Samudaay." },
            ]},
            { role: "For Job Seekers", icon: Briefcase, color: "bg-success/10 text-success", steps: [
              { title: "Create Your Profile", desc: "Add your work experience, skills, education, and upload your resume." },
              { title: "Browse Local Jobs", desc: "Filter by location, salary, job type, and skill. All postings are from verified businesses only." },
              { title: "Quick Apply", desc: "Apply with one click — your profile is your application. Add a cover letter optionally." },
              { title: "Track Applications", desc: "See real-time status updates: Under Review → Shortlisted → Interview → Hired." },
              { title: "Get Hired Locally", desc: "Interview and join a local business that you can walk to. Build your career in your community." },
            ]},
          ].map(section => (
            <div key={section.role} className="card-elevated p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className={`w-12 h-12 rounded-xl ${section.color} flex items-center justify-center`}>
                  <section.icon className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">{section.role}</h2>
              </div>
              <div className="space-y-6">
                {section.steps.map((step, i) => (
                  <div key={step.title} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0 mt-0.5">{i+1}</div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                      <p className="text-muted-foreground text-sm">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-primary/5 rounded-2xl border border-primary/20 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Security & Compliance</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: Shield, title: "256-bit SSL", desc: "All transactions encrypted with bank-grade security." },
              { icon: FileText, title: "Legal Agreements", desc: "Every investment backed by a stamped e-signed contract." },
              { icon: Smartphone, title: "2-Factor Auth", desc: "OTP verification on every payment." },
            ].map(s => (
              <div key={s.title} className="flex flex-col items-center gap-2">
                <s.icon className="w-8 h-8 text-primary" />
                <div className="font-semibold text-foreground">{s.title}</div>
                <div className="text-sm text-muted-foreground">{s.desc}</div>
              </div>
            ))}
          </div>
          <Button variant="hero" size="lg" asChild><Link to="/register">Get Started Now <ArrowRight className="w-4 h-4 ml-1" /></Link></Button>
        </div>
      </div>
    </div>
  );
}
