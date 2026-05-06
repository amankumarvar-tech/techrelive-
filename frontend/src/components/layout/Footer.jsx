import { Link } from "react-router-dom";
import { Zap, Github, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
                <Zap size={15} className="text-white" fill="white" />
              </div>
              <span className="font-display font-bold text-lg">
                Tech<span className="text-brand-400">Relive</span>
              </span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              Give tech a second life. Buy and sell verified second-hand gadgets with confidence.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-white/30 hover:text-white transition-colors"><Twitter size={18} /></a>
              <a href="#" className="text-white/30 hover:text-white transition-colors"><Github size={18} /></a>
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm mb-3 text-white/80">Explore</h4>
            <ul className="space-y-2 text-sm text-white/40">
              <li><Link to="/?category=Mobile" className="hover:text-white transition-colors">Mobiles</Link></li>
              <li><Link to="/?category=Laptop" className="hover:text-white transition-colors">Laptops</Link></li>
              <li><Link to="/?category=Accessories" className="hover:text-white transition-colors">Accessories</Link></li>
              <li><Link to="/?category=Audio" className="hover:text-white transition-colors">Audio</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm mb-3 text-white/80">Account</h4>
            <ul className="space-y-2 text-sm text-white/40">
              <li><Link to="/register" className="hover:text-white transition-colors">Sign Up</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/seller/dashboard" className="hover:text-white transition-colors">Sell a Gadget</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-white/20 text-xs font-mono">© {new Date().getFullYear()} TechRelive. All rights reserved.</p>
          <p className="text-white/20 text-xs">Condition Grades: A = Like New · B = Good · C = Fair</p>
        </div>
      </div>
    </footer>
  );
}
