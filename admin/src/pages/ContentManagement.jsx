import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FileText, Plus, HelpCircle, Star, CheckCircle2, Trash2, X } from 'lucide-react';

export default function ContentManagement() {
  const [blogs, setBlogs] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('blogs'); // 'blogs', 'faqs', 'reviews'

  // New Blog Modal
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCategory, setBlogCategory] = useState('Preventive Healthcare');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogReadTime, setBlogReadTime] = useState('5 min read');

  // New FAQ Modal
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqCategory, setFaqCategory] = useState('General');

  const fetchContent = async () => {
    try {
      const [blogRes, faqRes, revRes] = await Promise.all([
        api.get('/content/blogs'),
        api.get('/content/faqs'),
        api.get('/content/reviews'),
      ]);
      setBlogs(blogRes.data.blogs || []);
      setFaqs(faqRes.data.faqs || []);
      setReviews(revRes.data.reviews || []);
    } catch (err) {
      console.error('Failed to load CMS content', err);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleCreateBlog = async (e) => {
    e.preventDefault();
    try {
      await api.post('/content/blogs', {
        title: blogTitle,
        category: blogCategory,
        excerpt: blogExcerpt,
        content: blogContent,
        readTime: blogReadTime,
      });
      setShowBlogModal(false);
      setBlogTitle('');
      setBlogExcerpt('');
      setBlogContent('');
      fetchContent();
    } catch (err) {
      alert('Failed to publish article');
    }
  };

  const handleCreateFaq = async (e) => {
    e.preventDefault();
    try {
      await api.post('/content/faqs', {
        question: faqQuestion,
        answer: faqAnswer,
        category: faqCategory,
      });
      setShowFaqModal(false);
      setFaqQuestion('');
      setFaqAnswer('');
      fetchContent();
    } catch (err) {
      alert('Failed to create FAQ');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Website Content Management (CMS)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Author medical health blogs, update patient FAQs, and moderate patient testimonials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'blogs' && (
            <button
              onClick={() => setShowBlogModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Publish Health Article
            </button>
          )}
          {activeTab === 'faqs' && (
            <button
              onClick={() => setShowFaqModal(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Add FAQ
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab('blogs')}
          className={`px-4 py-2 rounded-xl transition-all ${activeTab === 'blogs' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
        >
          Health Articles ({blogs.length})
        </button>
        <button
          onClick={() => setActiveTab('faqs')}
          className={`px-4 py-2 rounded-xl transition-all ${activeTab === 'faqs' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
        >
          Frequently Asked Questions ({faqs.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-xl transition-all ${activeTab === 'reviews' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'}`}
        >
          Patient Testimonials ({reviews.length})
        </button>
      </div>

      {/* TAB 1: BLOGS */}
      {activeTab === 'blogs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((b) => (
            <div key={b._id} className="bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
                  {b.category}
                </span>
                <h3 className="text-base font-bold text-white line-clamp-2 leading-snug">{b.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-3">{b.excerpt}</p>
              </div>
              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between items-center">
                <span>By: {b.author?.name}</span>
                <span>{b.readTime}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: FAQS */}
      {activeTab === 'faqs' && (
        <div className="space-y-3">
          {faqs.map((f) => (
            <div key={f._id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-sm">{f.question}</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
                  {f.category}
                </span>
              </div>
              <p className="text-slate-400 leading-relaxed">{f.answer}</p>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r._id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-blue-400">
                  {[...Array(r.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-blue-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed">"{r.comment}"</p>
              </div>
              <div className="pt-3 border-t border-slate-800 text-xs">
                <span className="font-bold text-white block">{r.patientName}</span>
                <span className="text-[10px] text-slate-500">{r.testName} • {r.branchCity}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Blog Modal */}
      {showBlogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Author & Publish Health Article</h3>
              <button onClick={() => setShowBlogModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBlog} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Article Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Interpreting Elevated Liver Enzymes (AST/ALT)"
                  value={blogTitle}
                  onChange={(e) => setBlogTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Category</label>
                  <select
                    value={blogCategory}
                    onChange={(e) => setBlogCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="Preventive Healthcare">Preventive Healthcare</option>
                    <option value="Cardiovascular Health">Cardiovascular Health</option>
                    <option value="Laboratory Guidance">Laboratory Guidance</option>
                    <option value="Endocrine & Thyroid">Endocrine & Thyroid</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Estimated Read Time</label>
                  <input
                    type="text"
                    value={blogReadTime}
                    onChange={(e) => setBlogReadTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Summary / Excerpt *</label>
                <textarea
                  rows="2"
                  required
                  placeholder="Brief 2-line teaser summary..."
                  value={blogExcerpt}
                  onChange={(e) => setBlogExcerpt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Full Article Body *</label>
                <textarea
                  rows="6"
                  required
                  placeholder="Write clinical analysis and recommendations here..."
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBlogModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New FAQ Modal */}
      {showFaqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Add Patient FAQ</h3>
              <button onClick={() => setShowFaqModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFaq} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Question *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Can I take hypertension medication while fasting?"
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Category</label>
                <select
                  value={faqCategory}
                  onChange={(e) => setFaqCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                >
                  <option value="General">General</option>
                  <option value="Booking & Appointments">Booking & Appointments</option>
                  <option value="Sample Collection">Sample Collection</option>
                  <option value="Reports & Results">Reports & Results</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Detailed Answer *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Provide precise answer..."
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFaqModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 text-white font-bold"
                >
                  Add FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

