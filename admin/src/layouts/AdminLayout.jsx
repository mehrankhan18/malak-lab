import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { 
  LayoutDashboard, 
  FlaskConical, 
  CalendarCheck, 
  Users, 
  FileCheck2, 
  UserCog, 
  Building2, 
  DollarSign, 
  FileText, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  Droplet, 
  Menu, 
  X, 
  Bell, 
  ChevronRight,
  Stethoscope,
  MessageSquareText
} from 'lucide-react';

export default function AdminLayout() {
  const { adminUser, logout, role, isAdmin, isPathologist, isTechnician } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const publicPortalUrl = import.meta.env.VITE_PUBLIC_URL || 'http://localhost:5173';

  const isActive = (path) => location.pathname === path;

  const navGroups = [
    {
      group: 'OVERVIEW',
      items: [
        { name: 'Dashboard Analytics', path: '/', icon: LayoutDashboard },
      ],
    },
    {
      group: 'CLINICAL LABORATORY',
      items: [
        { name: 'Test Catalog & Pricing', path: '/tests', icon: FlaskConical },
        { name: 'Test Price Requests', path: '/inquiries', icon: MessageSquareText },
        { name: 'Sample Workflow (8 Stages)', path: '/samples', icon: Droplet },
        { name: 'Reports & Approval', path: '/reports', icon: FileCheck2 },
      ],
    },
    {
      group: 'PATIENTS & BOOKINGS',
      items: [
        { name: 'Booking Operations', path: '/bookings', icon: CalendarCheck },
        { name: 'Patient Management', path: '/patients', icon: Users },
      ],
    },
    {
      group: 'ADMINISTRATION & RBAC',
      items: [
        ...(isAdmin ? [{ name: 'Staff & Roles (RBAC)', path: '/staff', icon: UserCog }] : []),
        { name: 'Branch Network', path: '/branches', icon: Building2 },
        ...(isAdmin ? [{ name: 'Financials & Invoices', path: '/financials', icon: DollarSign }] : []),
      ],
    },
    {
      group: 'CONTENT & SYSTEM',
      items: [
        { name: 'CMS & Health Articles', path: '/content', icon: FileText },
        { name: 'System Settings & Audit', path: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row antialiased font-sans">
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
            <FlaskConical className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">
            MALAK<span className="text-blue-400"> LAB</span> PORTAL
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Main Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div>
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
                  MALAK<span className="text-blue-400"> LAB</span>
                </span>
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block -mt-1">
                  Staff & Admin Workspace
                </span>
              </div>
            </Link>
          </div>

          {/* User Mini Bar */}
          <div className="p-4 mx-4 mt-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 border border-blue-800/50 flex items-center justify-center font-bold text-sm shrink-0">
              {adminUser?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white truncate">{adminUser?.name || 'Administrator'}</h4>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {role || 'Admin'}
                </span>
                {isPathologist && (
                  <span className="text-[10px] text-teal-400 flex items-center gap-0.5" title="Doctor Sign-off Authorization">
                    <Stethoscope className="w-3 h-3" /> MD
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-230px)]">
            {navGroups.map((grp, idx) => (
              <div key={idx} className="space-y-1">
                <span className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase px-3 block mb-1">
                  {grp.group}
                </span>
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        active
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.name}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 ${active ? 'text-blue-200' : 'text-slate-600'}`} />
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Sign Out Bar */}
        <div className="p-4 border-t border-slate-800/80">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700/60 hover:border-rose-900/50 text-xs font-bold transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Workspace</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              LIS Laboratory Core Online
            </span>
            <span className="text-xs text-slate-400 font-mono">
              MALAK Lab Science Hub · Timergara
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
            <a
              href={publicPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <span>View Public Portal ↗</span>
            </a>

            <div className="h-4 w-px bg-slate-800" />

            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Role: <strong className="text-white uppercase">{role}</strong></span>
            </div>
          </div>
        </header>

        {/* Page Outlet */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
          <div className="mb-6 rounded-2xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-xs leading-relaxed text-blue-200">
            Seed catalog prices are demo placeholders. Public customers can request a quote; replace these values with MALAK-approved PKR rates before enabling billing.
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
