import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Phone, Mail, MapPin, CheckCircle2, Plus, Trash2 } from 'lucide-react';

export default function CustomerProfile() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [addresses, setAddresses] = useState(user?.addresses || [
    { label: 'Home', street: '', city: 'Timergara', state: 'Lower Dir', zipCode: '' }
  ]);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    try {
      await updateProfile({ name, phone, addresses });
      setSuccess('Profile and address preferences updated successfully!');
    } catch (err) {
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const addAddress = () => {
    setAddresses([...addresses, { label: 'Office', street: '', city: 'Timergara', state: 'Lower Dir', zipCode: '' }]);
  };

  const removeAddress = (index) => {
    setAddresses(addresses.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Personal Information & Addresses
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage your contact credentials and saved doorstep home collection addresses.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Contact Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Mobile Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1 text-xs">Email Address (Registered)</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-sm text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Saved Addresses */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900">Saved Collection Addresses</h3>
            <button
              type="button"
              onClick={addAddress}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Address
            </button>
          </div>

          <div className="space-y-3">
            {addresses.map((addr, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    placeholder="Address Label (e.g. Home, Work)"
                    value={addr.label}
                    onChange={(e) => {
                      const updated = [...addresses];
                      updated[idx].label = e.target.value;
                      setAddresses(updated);
                    }}
                    className="px-3 py-1 bg-white border border-slate-200 rounded-lg font-bold text-slate-800"
                  />
                  {addresses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAddress(idx)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={addr.street}
                    onChange={(e) => {
                      const updated = [...addresses];
                      updated[idx].street = e.target.value;
                      setAddresses(updated);
                    }}
                    className="sm:col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={addr.city}
                    onChange={(e) => {
                      const updated = [...addresses];
                      updated[idx].city = e.target.value;
                      setAddresses(updated);
                    }}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  />
                  <input
                    type="text"
                    placeholder="Zip Code"
                    value={addr.zipCode}
                    onChange={(e) => {
                      const updated = [...addresses];
                      updated[idx].zipCode = e.target.value;
                      setAddresses(updated);
                    }}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs shadow-md transition-all"
        >
          {saving ? 'Saving Changes...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
}
