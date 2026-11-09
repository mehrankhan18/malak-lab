import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Building2, 
  MapPin, 
  PhoneCall, 
  Mail, 
  Clock, 
  ShieldCheck, 
  Search,
  ExternalLink
} from 'lucide-react';

export default function FindBranch() {
  const [branches, setBranches] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.get('/branches');
        setBranches(res.data.branches || []);
      } catch (err) {
        console.error('Failed to load branches', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBranches();
  }, []);

  const filtered = branches.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.address.city.toLowerCase().includes(search.toLowerCase()) ||
    b.address.street.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
          Our Diagnostic Network
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Find MALAK Lab Science Hub
        </h1>
        <p className="text-sm text-slate-500">
          Visit us opposite DHQ Hospital on Main GT Road in Timergara, Lower Dir.
        </p>

        {/* Search */}
        <div className="pt-4 max-w-md mx-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by city, neighborhood, or branch name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-blue-500 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Branches List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((branch) => (
          <div key={branch._id} className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
                  <Building2 className="w-6 h-6" />
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {branch.code}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {branch.name}
                </h3>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>{branch.address.street}, {branch.address.area ? `${branch.address.area}, ` : ''}{branch.address.city}, {branch.address.state} {branch.address.zipCode}</span>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${branch.address.street}, ${branch.address.area || ''}, ${branch.address.city}, ${branch.address.state}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 font-semibold text-blue-700 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Get directions
                </a>
                {branch.phone && <a href={`tel:${branch.phone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-2.5 hover:text-blue-600">
                  <PhoneCall className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{branch.phone}</span>
                </a>}
                {branch.email && <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{branch.email}</span>
                </div>}
              </div>

              {/* Working Hours */}
              {(branch.openingHours?.monFri || branch.openingHours?.saturday || branch.openingHours?.sunday) && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" /> Operating Hours:
                  </span>
                  {branch.openingHours?.monFri && <p>Monday - Friday: {branch.openingHours.monFri}</p>}
                  {branch.openingHours?.saturday && <p>Saturday: {branch.openingHours.saturday}</p>}
                  {branch.openingHours?.sunday && <p>Sunday: {branch.openingHours.sunday}</p>}
                </div>
              )}

              {/* Services Offered */}
              {branch.services && branch.services.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {branch.services.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                to="/book-test"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                Confirm Prices & Availability
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
