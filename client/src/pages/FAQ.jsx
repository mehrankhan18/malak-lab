import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ChevronDown, ChevronUp, HelpCircle, Search } from 'lucide-react';

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await api.get('/content/faqs');
        setFaqs(res.data.faqs || []);
      } catch (err) {
        console.error('Failed to load FAQs', err);
      }
    };
    fetchFaqs();
  }, []);

  const categories = ['All', 'General', 'Booking & Appointments', 'Sample Collection', 'Reports & Results'];

  const filtered = faqs.filter(f => {
    const matchesCat = selectedCategory === 'All' || f.category === selectedCategory;
    const matchesSearch = !search || f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
          Knowledge Base
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Find answers to common inquiries regarding our laboratory booking process, fasting rules, sample collection, and report downloads.
        </p>

        {/* Search */}
        <div className="pt-4 max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search questions (e.g. fasting, report delivery, cancellation)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-blue-500 shadow-xs"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordion */}
      <div className="space-y-4">
        {filtered.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                <span className="text-sm font-bold text-slate-900 leading-snug">
                  {faq.question}
                </span>
                <span className="p-1 rounded-lg bg-slate-100 text-slate-500 shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/30">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

