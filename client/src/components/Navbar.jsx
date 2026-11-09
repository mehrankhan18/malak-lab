import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { FlaskConical, Menu, X } from 'lucide-react';

export default function Navbar({ onOpenCart }) {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full" style={{ backgroundColor: '#1c1917', borderBottom: '1px solid #27272a' }}>
      <nav className="backdrop-blur-md" style={{ backgroundColor: 'rgba(28, 25, 23, 0.9)', borderBottom: '1px solid rgba(39, 39, 42, 0.5)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform" style={{ backgroundColor: '#3b82f6' }}>
                <FlaskConical className="w-5 h-5" style={{ color: '#000000' }} />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                MALAK<span className="text-blue-400"> LAB</span>
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-6 font-medium text-sm">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg transition-colors ${isActive('/') ? 'text-blue-400 font-bold bg-blue-500/10' : 'text-white/70 hover:text-blue-300 hover:bg-white/10'}`}
              >
                Home
              </Link>
              <Link
                to="/tests"
                className={`px-3 py-2 rounded-lg transition-colors ${isActive('/tests') ? 'text-blue-400 font-bold bg-blue-500/10' : 'text-white/70 hover:text-blue-300 hover:bg-white/10'}`}
              >
                Tests
              </Link>
              <Link
                to="/packages"
                className={`px-3 py-2 rounded-lg transition-colors ${isActive('/packages') ? 'text-blue-400 font-bold bg-blue-500/10' : 'text-white/70 hover:text-blue-300 hover:bg-white/10'}`}
              >
                Packages
              </Link>
              <Link
                to="/track"
                className={`px-3 py-2 rounded-lg transition-colors ${isActive('/track') ? 'text-blue-400 font-bold bg-blue-500/10' : 'text-white/70 hover:text-blue-300 hover:bg-white/10'}`}
              >
                Track
              </Link>
              <Link
                to="/contact"
                className={`px-3 py-2 rounded-lg transition-colors ${isActive('/contact') ? 'text-blue-400 font-bold bg-blue-500/10' : 'text-white/70 hover:text-blue-300 hover:bg-white/10'}`}
              >
                Contact
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              {user ? (
                <Link
                  to="/customer"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl border border-white/30 text-white hover:text-blue-300 hover:bg-white/10 transition-all"
                >
                  Login
                </Link>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-white hover:bg-white/10"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-stone-900 px-4 pt-4 pb-6 space-y-2 shadow-2xl animate-in slide-in-from-top-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-white hover:bg-white/10 hover:text-blue-300 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/tests"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-white hover:bg-white/10 hover:text-blue-300 transition-colors"
          >
            Tests
          </Link>
          <Link
            to="/packages"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-white hover:bg-white/10 hover:text-blue-300 transition-colors"
          >
            Packages
          </Link>
          <Link
            to="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-white hover:bg-white/10 hover:text-blue-300 transition-colors"
          >
            Track Report
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-white hover:bg-white/10 hover:text-blue-300 transition-colors"
          >
            Contact
          </Link>
          {user ? (
            <>
              <Link
                to="/customer"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-semibold text-white hover:bg-white/10 hover:text-blue-300 transition-colors"
              >
                Customer Dashboard
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-semibold text-white hover:bg-white/10 hover:text-blue-300 transition-colors"
            >
              Login
            </Link>
          )}
          <div className="pt-4">
            <Link
              to="/book-test"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/30"
            >
              Book a Test
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
