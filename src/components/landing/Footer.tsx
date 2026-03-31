import { Users } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-foreground text-background/70 py-12">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Users className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-background">Samudaay</span>
          </div>
          <p className="text-sm">Connecting communities through trust, investment, and opportunity.</p>
        </div>
        <div>
          <h4 className="font-semibold text-background mb-3">Platform</h4>
          <div className="space-y-2 text-sm">
            <Link to="/register" className="block hover:text-background transition-colors">For Investors</Link>
            <Link to="/register" className="block hover:text-background transition-colors">For Businesses</Link>
            <Link to="/register" className="block hover:text-background transition-colors">For Job Seekers</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-background mb-3">Legal</h4>
          <div className="space-y-2 text-sm">
            <a href="#" className="block hover:text-background transition-colors">Terms of Service</a>
            <a href="#" className="block hover:text-background transition-colors">Privacy Policy</a>
            <a href="#" className="block hover:text-background transition-colors">Risk Disclosure</a>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-background mb-3">Support</h4>
          <div className="space-y-2 text-sm">
            <a href="#" className="block hover:text-background transition-colors">Help Center</a>
            <a href="#" className="block hover:text-background transition-colors">Contact Us</a>
            <a href="#" className="block hover:text-background transition-colors">Grievance Officer</a>
          </div>
        </div>
      </div>
      <div className="border-t border-background/10 pt-6 text-center text-sm">
        © 2026 Samudaay. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
