import { ShieldCheck, BarChart3, Users, FileText, Bell, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: ShieldCheck, title: "Verified Businesses", desc: "Every vendor is KYC-verified with license and profit documentation." },
  { icon: BarChart3, title: "Transparent Returns", desc: "Real-time profit tracking, clear tenure options, and predictable payouts." },
  { icon: Users, title: "Community First", desc: "Invest in your neighbours. Create local jobs. Strengthen your community." },
  { icon: FileText, title: "Legal Protection", desc: "E-signed agreements, dispute resolution, and regulatory compliance built in." },
  { icon: Bell, title: "Smart Notifications", desc: "Payout reminders, application updates, and investment opportunities — never miss a beat." },
  { icon: MapPin, title: "Hyperlocal", desc: "Discover businesses and jobs near you with map-based search and filters." },
];

const FeaturesSection = () => (
  <section id="features" className="py-20 bg-card">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Why Samudaay?</h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Trust, transparency, and community — the foundation of every feature.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            className="flex gap-4 p-5 rounded-2xl hover:bg-accent/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <f.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
