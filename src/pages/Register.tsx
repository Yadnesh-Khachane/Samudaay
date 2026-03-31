import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Store, Briefcase, ShieldCheck, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";

const roles = [
  {
    id: "investor",
    label: "Investor",
    desc: "Fund local businesses & earn returns",
    icon: TrendingUp,
    dashboard: "/dashboard/investor",
  },
  {
    id: "vendor",
    label: "Business Owner",
    desc: "List your business & raise funds",
    icon: Store,
    dashboard: "/dashboard/vendor",
  },
  {
    id: "jobseeker",
    label: "Job Seeker",
    desc: "Find jobs at local businesses",
    icon: Briefcase,
    dashboard: "/dashboard/jobs",
  },
  {
    id: "admin",
    label: "Admin",
    desc: "Manage the platform",
    icon: ShieldCheck,
    dashboard: "/dashboard/admin",
  },
];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const role = roles.find((r) => r.id === selectedRole);
      navigate(role?.dashboard ?? "/dashboard/investor");
    }, 700);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Samudaay</span>
        </Link>

        <div>
          <h2 className="text-4xl font-bold text-foreground mb-4 leading-tight">
            Join 18,000+ community <span className="text-gradient-primary">members</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Whether you invest, build, or seek work — Samudaay connects you with your community.
          </p>

          <div className="space-y-3">
            {[
              "Verified businesses with transparent financials",
              "Community-powered investments with real returns",
              "Local jobs connecting talent with opportunity",
              "Secure, moderated, and community-governed",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <span className="text-foreground text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">© 2025 Samudaay. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Samudaay</span>
        </div>

        <div className="w-full max-w-md">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>1</div>
            <div className={`flex-1 h-1 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>2</div>
          </div>

          {step === 1 ? (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-1">Choose your role</h1>
              <p className="text-muted-foreground text-sm mb-6">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>

              <div className="space-y-3 mb-6">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      selectedRole === role.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-border/60 hover:bg-accent/30"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selectedRole === role.id ? "gradient-primary" : "bg-muted"}`}>
                      <role.icon className={`w-5 h-5 ${selectedRole === role.id ? "text-primary-foreground" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-sm">{role.label}</div>
                      <div className="text-xs text-muted-foreground">{role.desc}</div>
                    </div>
                    {selectedRole === role.id && (
                      <CheckCircle2 className="w-5 h-5 text-primary ml-auto shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <Button
                variant="hero"
                className="w-full"
                disabled={!selectedRole}
                onClick={() => setStep(2)}
              >
                Continue <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-1">Create your account</h1>
              <p className="text-muted-foreground text-sm mb-6">
                Joining as{" "}
                <span className="text-primary font-medium">
                  {roles.find((r) => r.id === selectedRole)?.label}
                </span>
                {" · "}
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground underline text-xs"
                  onClick={() => setStep(1)}
                >
                  Change
                </button>
              </p>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Priya Sharma"
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create Account"}
                  {!loading && <ArrowRight className="w-4 h-4 ml-1" />}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By registering, you agree to our{" "}
                  <span className="text-primary cursor-pointer hover:underline">Terms of Service</span>{" "}
                  and{" "}
                  <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
