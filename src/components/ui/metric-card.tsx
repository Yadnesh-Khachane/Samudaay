import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export function MetricCard({ title, value, subtitle, icon, trend, trendUp }: MetricCardProps) {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trendUp ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{title}</div>
      {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
    </div>
  );
}

export function ProgressBar({ value, max, className = "" }: { value: number; max: number; className?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className={`h-2 rounded-full bg-muted overflow-hidden ${className}`}>
      <div className="h-full rounded-full gradient-primary transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    verified: "badge-verified",
    pending: "badge-pending",
    premium: "badge-premium",
    rejected: "bg-destructive/10 text-destructive inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
    active: "badge-verified",
    expired: "bg-destructive/10 text-destructive inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
  };
  return <span className={styles[status.toLowerCase()] || "badge-pending"}>{status}</span>;
}
