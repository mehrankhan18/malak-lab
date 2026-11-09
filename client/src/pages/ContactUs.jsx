import React, { useState } from 'react';
import {
  getMalakWhatsAppUrl,
  MALAK_LAB_PHONE,
  MALAK_LAB_PHONE_LINK,
  MALAK_LAB_WHATSAPP_DISPLAY,
} from '../utils/contact';
import { PhoneCall, Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const message = [
      `Hello MALAK Lab Science Hub,`,
      `Name: ${formData.name}`,
      `Email: ${formData.email}`,
      `Phone: ${formData.phone || 'Not provided'}`,
      `Subject: ${formData.subject || 'General inquiry'}`,
      `Message: ${formData.message}`,
    ].join('\n');
    const whatsappWindow = window.open(getMalakWhatsAppUrl(message), '_blank');
    if (!whatsappWindow) {
      window.location.assign(getMalakWhatsAppUrl(message));
    } else {
      whatsappWindow.opener = null;
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
          We Are Here to Assist
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Contact MALAK Lab Science Hub
        </h1>
        <p className="text-sm text-slate-500">
          Ask us about available tests, preparation instructions, or reports. Call or message the lab team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Contact Cards */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Call</h4>
              <p className="text-xs text-slate-500 mt-1">Call MALAK Lab Science Hub directly.</p>
              <a href={`tel:${MALAK_LAB_PHONE_LINK}`} className="text-sm font-bold text-blue-600 hover:underline block mt-2">
                {MALAK_LAB_PHONE}
              </a>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">WhatsApp</h4>
              <p className="text-xs text-slate-500 mt-1">Send a message to ask about laboratory services.</p>
              <a href={getMalakWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 hover:underline block mt-2">
                Message MALAK Lab at {MALAK_LAB_WHATSAPP_DISPLAY}
              </a>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Visit the Laboratory</h4>
              <p className="text-xs text-slate-600 mt-1">
                Opposite DHQ Hospital, Main GT Road, Timergara, Lower Dir, Pakistan
              </p>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Contact Form */}
        <div className="lg:col-span-2">
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Send Us a Direct Message</h3>
            <p className="text-xs text-slate-500 mb-6">
            This opens a pre-filled message to {MALAK_LAB_WHATSAPP_DISPLAY}. Review it and press Send in WhatsApp. Do not include sensitive medical details.
            </p>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-blue-600 mx-auto" />
                <h4 className="font-bold text-base">WhatsApp message ready</h4>
                <p className="text-xs text-blue-700">
                  WhatsApp opened with your message. Review it and press Send to contact the lab.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="johndoe@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="03XX XXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Subject</label>
                    <input
                      type="text"
                      placeholder="Inquiry regarding lipid fasting"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Your Message (do not include medical details) *</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Ask about test availability, pricing, or preparation. Do not include medical details."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-bold rounded-2xl shadow-md shadow-blue-600/20 text-xs flex items-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Opening WhatsApp...' : 'Continue in WhatsApp'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
