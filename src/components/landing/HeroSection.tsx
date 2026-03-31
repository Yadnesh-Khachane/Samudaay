import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, TrendingUp, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { label: "Local Businesses", value: "2,400+" },
  { label: "Community Investors", value: "18,000+" },
  { label: "Jobs Created", value: "5,600+" },
  { label: "Invested", value: "₹12Cr+" },
];

const HeroSection = () => (
  <section className="relative overflow-hidden gradient-hero">
    <div className="container mx-auto px-4 pt-20 pb-16 md:pt-28 md:pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto text-center"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <ShieldCheck className="w-4 h-4" />
          Trusted by 18,000+ community members
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
          Invest in Your{" "}
          <span className="text-gradient-primary">Neighbourhood</span>,{" "}
          Grow Together
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Samudaay connects verified local businesses with community investors and job seekers. 
          Build wealth locally, create jobs, and strengthen your community.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
          <Button variant="hero" size="lg" asChild>
            <Link to="/register">
              Start Investing <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
          <Button variant="hero-outline" size="lg" asChild>
            <Link to="/register">List Your Business</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
              className="card-elevated p-4 text-center"
            >
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>

    {/* Decorative elements */}
    <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute bottom-10 right-10 w-56 h-56 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
  </section>
);

export default HeroSection;
