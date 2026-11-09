import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FlaskConical, 
  ShieldCheck, 
  MapPin, 
  PhoneCall, 
  Mail
} from 'lucide-react';

export default function Footer() {
  const adminPortalUrl = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174';

  return (
    <footer className="bg-dark-950 text-dark-400 pt-16 pb-8 border-t border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 4-column footer links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center text-white">
                <FlaskConical className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                MALAK LAB SCIENCE HUB
              </span>
            </Link>
            <p className="text-sm text-dark-400 leading-relaxed max-w-sm">
              MALAK Lab Science Hub provides laboratory testing in Timergara, Lower Dir, with HPLC HbA1c, CLIA hormone testing, and ABG analysis.
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Opposite DHQ Hospital, Main GT Road, Timergara, Lower Dir</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="tel:+923285027351" className="hover:text-white">0328 5027351</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="https://www.facebook.com/profile.php?id=100071293330399" target="_blank" rel="noreferrer" className="hover:text-white">MALAK Lab Science Hub on Facebook</a>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase">Our Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/tests" className="hover:text-white transition-colors">All Medical Tests</Link></li>
              <li><Link to="/packages" className="hover:text-white transition-colors">Executive Health Packages</Link></li>
              <li><Link to="/home-collection" className="hover:text-white transition-colors">Home Sample Collection</Link></li>
              <li><Link to="/laboratories" className="hover:text-white transition-colors">Our Laboratories</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Clinical Pathology Services</Link></li>
              <li><Link to="/doctors" className="hover:text-white transition-colors">Lab Equipment & Quality</Link></li>
            </ul>
          </div>

          {/* Col 3: Patient Care */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase">Patient Care</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/track" className="text-blue-400 font-semibold hover:underline">Track Sample / Report</Link></li>
              <li><Link to="/book-test" className="hover:text-white transition-colors">Request Test Prices</Link></li>
              <li><Link to="/test-preparation" className="hover:text-white transition-colors">Test Preparation Guidelines</Link></li>
              <li><Link to="/branches" className="hover:text-white transition-colors">Find Nearest Branch</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Customer Support Helpdesk</Link></li>
            </ul>
          </div>

          {/* Col 4: Legal & Articles */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase">Company & Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">About MALAK Lab</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Health & Wellness Blog</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li>
                <a 
                  href={adminPortalUrl}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-blue-400 bg-blue-950/60 border border-blue-800/40 px-2.5 py-1 rounded inline-flex items-center gap-1.5 mt-2 hover:bg-blue-900 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Staff & Admin Portal ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-dark-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-dark-500">
          <p>© {new Date().getFullYear()} MALAK Lab Science Hub. Timergara, Lower Dir, Pakistan.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-400">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-400">Terms of Service</Link>
            <span>Medical Disclaimer: Laboratory results must be clinically correlated with a certified physician.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
