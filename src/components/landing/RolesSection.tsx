import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrendingUp, Store, Briefcase, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const roles = [
  {
    icon: TrendingUp,
    title: "Investor",
    desc: "Earn 8-15% returns by funding verified local businesses. Diversify your portfolio with community investments.",
    color: "bg-secondary/10 text-secondary",
    link: "/dashboard/investor",
    cta: "Start Investing",
  },
  {
    icon: Store,
    title: "Business Owner",
    desc: "Get funding from your community. List jobs, manage investors, and grow your business with local support.",
    color: "bg-primary/10 text-primary",
    link: "/dashboard/vendor",
    cta: "List Your Business",
  },
  {
    icon: Briefcase,
    title: "Job Seeker",
    desc: "Find jobs at verified local businesses. Quick apply, track applications, and connect with hiring managers.",
    color: "bg-success/10 text-success",
    link: "/dashboard/jobs",
    cta: "Find Jobs",
  },
  {
    icon: ShieldCheck,
    title: "Platform Admin",
    desc: "Verify businesses, moderate listings, manage disputes, and keep the community safe and thriving.",
    color: "bg-muted text-foreground",
    link: "/dashboard/admin",
    cta: "Admin Panel",
  },
];

const RolesSection = () => (
  <section id="roles" className="py-20 bg-background">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Built For Everyone</h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Whether you invest, build, or seek — Samudaay has a place for you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roles.map((role, i) => (
          <motion.div
            key={role.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="card-elevated p-6 flex flex-col"
          >
            <div className={`w-12 h-12 rounded-xl ${role.color} flex items-center justify-center mb-4`}>
              <role.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{role.title}</h3>
            <p className="text-muted-foreground text-sm flex-1 mb-4">{role.desc}</p>
            <Button variant="ghost" size="sm" className="w-fit text-primary" asChild>
              <Link to={role.link}>
                {role.cta} <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default RolesSection;
