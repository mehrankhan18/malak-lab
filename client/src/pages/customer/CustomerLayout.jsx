import React from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Activity, 
  CalendarCheck, 
  FileSearch, 
  FileText, 
  CreditCard, 
  User, 
  Headphones, 
  ClipboardList,
  LogOut,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard Overview', path: '/customer', icon: Activity },
    { name: 'My Bookings', path: '/customer/bookings', icon: CalendarCheck },
    { name: 'My Test Requests', path: '/customer/requests', icon: ClipboardList },
    { name: 'Live Sample Tracking', path: '/customer/tracking', icon: FileSearch },
    { name: 'My Laboratory Reports', path: '/customer/reports', icon: FileText },
    { name: 'Invoices & Payments', path: '/customer/invoices', icon: CreditCard },
    { name: 'Profile & Addresses', path: '/customer/profile', icon: User },
    { name: 'Support & Inquiries', path: '/customer/support', icon: Headphones },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Customer Sidebar */}
        <div className="space-y-6">
          {/* User Profile Mini Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-500 text-white font-black text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              {user?.name?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Verified Patient
              </span>
              <h3 className="text-base font-bold text-slate-900 truncate mt-1">
                {user?.name || 'Patient Account'}
              </h3>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-3 shadow-xs space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-blue-200' : 'text-slate-300'}`} />
                </Link>
              );
            })}

            <div className="pt-2 border-t border-slate-100 my-1">
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Customer Content Workspace */}
        <div className="min-w-0 lg:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
