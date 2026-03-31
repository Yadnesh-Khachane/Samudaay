import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Store, Briefcase, ShieldCheck, Eye, EyeOff, ArrowRight, Info } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useDB } from "@/lib/db";

const roles = [
  { id: "investor", label: "Investor", icon: TrendingUp, activeBg: "border-secondary bg-secondary/10", dashboard: "/dashboard/investor", email: "investor@samudaay.com", password: "invest123", hint: "Community investor account" },
  { id: "vendor", label: "Business Owner", icon: Store, activeBg: "border-primary bg-primary/10", dashboard: "/dashboard/vendor", email: "vendor@samudaay.com", password: "vendor123", hint: "Local business account" },
  { id: "jobseeker", label: "Job Seeker", icon: Briefcase, activeBg: "border-success bg-success/10", dashboard: "/dashboard/jobs", email: "jobs@samudaay.com", password: "jobs123", hint: "Job applicant account" },
  { id: "admin", label: "Admin", icon: ShieldCheck, activeBg: "border-foreground bg-muted", dashboard: "/dashboard/admin", email: "admin@samudaay.com", password: "admin123", hint: "Platform administrator" },
];

export default function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("investor");
  const [email, setEmail] = useState("investor@samudaay.com");
  const [password, setPassword] = useState("invest123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [db] = useDB();

  const currentRole = roles.find((r) => r.id === selectedRole)!;

  const handleRoleSelect = (role: typeof roles[0]) => {
    setSelectedRole(role.id);
    setEmail(role.email);
    setPassword(role.password);
    setError("");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const role = roles.find((r) => r.id === selectedRole);
    if (!role) return;
    if (email !== role.email || password !== role.password) {
      setError("Invalid credentials. Use the demo credentials shown.");
      return;
    }
    setLoading(true);

    // Mock realistic login mapping from DB
    let authUser = { id: 1, role: role.id as any, email: role.email, name: role.label };
    if (role.id === "vendor") authUser.name = db.vendors[0]?.name || role.label;
    if (role.id === "investor") authUser.name = db.investors[0]?.name || role.label;
    if (role.id === "jobseeker") authUser.name = db.jobSeekers[0]?.name || role.label;
    if (role.id === "admin") authUser.name = db.team[0]?.name || role.label;

    login(authUser);

    setTimeout(() => navigate(role.dashboard), 600);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-hero flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Samudaay</span>
        </Link>
        <div>
          <h2 className="text-4xl font-bold text-foreground mb-4 leading-tight">
            Welcome back to your <span className="text-gradient-primary">community</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8">Sign in to manage your investments, business, or job applications.</p>
          <div className="card-elevated p-5 mb-6 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Demo Credentials</span>
            </div>
            <div className="space-y-2">
              {roles.map((r) => (
                <div key={r.id} className="text-xs flex gap-2 items-center">
                  <span className="font-medium text-foreground w-28">{r.label}</span>
                  <span className="font-mono text-muted-foreground">{r.email}</span>
                  <span className="font-mono text-primary ml-auto">{r.password}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[{ label: "Community Members", value: "18,000+" }, { label: "Businesses Listed", value: "2,400+" }, { label: "Jobs Created", value: "5,600+" }, { label: "Invested", value: "₹12Cr+" }].map((s) => (
              <div key={s.label} className="card-elevated p-4 text-center">
                <div className="text-2xl font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">© 2025 Samudaay. All rights reserved.</p>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12">
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Samudaay</span>
        </div>
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-1">Sign In</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">Register here</Link>
          </p>
          <div className="mb-5">
            <p className="text-sm font-medium text-foreground mb-2">Sign in as</p>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((role) => (
                <button key={role.id} type="button" onClick={() => handleRoleSelect(role)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium ${selectedRole === role.id ? role.activeBg : "border-border bg-card text-muted-foreground hover:bg-accent/40"}`}>
                  <role.icon className="w-4 h-4 shrink-0" />
                  {role.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4 px-4 py-3 rounded-xl bg-accent/60 border border-border text-xs text-muted-foreground flex items-start gap-2">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
            <span>
              <span className="font-medium text-foreground">{currentRole.hint}</span>{" · "}
              <span className="font-mono text-foreground">{currentRole.email}</span>{" / "}
              <span className="font-mono text-primary">{currentRole.password}</span>
            </span>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition" required />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-foreground">Password</label>
                <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <div className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</div>}
            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}{!loading && <ArrowRight className="w-4 h-4 ml-1" />}
            </Button>
          </form>
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or jump straight in</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {roles.map((role) => (
              <button key={role.id} onClick={() => navigate(role.dashboard)}
                className="flex items-center gap-2 p-3 rounded-xl border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-accent/50 transition-all">
                <role.icon className="w-4 h-4 shrink-0 text-primary" />
                <span className="truncate">{role.label} View</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
