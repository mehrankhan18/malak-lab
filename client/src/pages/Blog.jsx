import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Clock, User, Tag, Search, ArrowRight } from 'lucide-react';

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await api.get('/content/blogs');
        const list = res.data.blogs || [];
        setBlogs(list);
        if (list.length > 0 && !selectedArticle) {
          setSelectedArticle(list[0]);
        }
      } catch (err) {
        console.error('Failed to load blogs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const filtered = blogs.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.excerpt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
          Medical Insights
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Health Articles & Diagnostics Guidance
        </h1>
        <p className="text-sm text-slate-500">
          Evidence-based articles authored by clinical pathologists, biochemists, and preventive healthcare physicians.
        </p>

        <div className="pt-4 max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search medical articles by keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-blue-500 shadow-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Articles List / Sidebar */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Articles ({filtered.length})
          </h3>
          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
            {filtered.map((b) => (
              <button
                key={b._id}
                onClick={() => setSelectedArticle(b)}
                className={`w-full text-left p-5 rounded-2xl border transition-all ${
                  selectedArticle?._id === b._id
                    ? 'bg-blue-50/70 border-blue-400 shadow-xs'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                  <span className="font-semibold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
                    {b.category}
                  </span>
                  <span>{b.readTime}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                  {b.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                  {b.excerpt}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Article Full View */}
        <div className="lg:col-span-2">
          {selectedArticle ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                  {selectedArticle.category}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {selectedArticle.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  <span>Author: <strong className="text-slate-700">{selectedArticle.author?.name}</strong></span>
                  <span>•</span>
                  <span>{selectedArticle.readTime}</span>
                  <span>•</span>
                  <span>Published: {new Date(selectedArticle.publishedAt).toDateString()}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-700 whitespace-pre-line">
                {selectedArticle.content}
              </div>

              {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Related Topics:</span>
                  {selectedArticle.tags.map((tag, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
              Select an article to read
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

