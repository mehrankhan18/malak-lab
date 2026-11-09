import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Headphones, Send, Plus, CheckCircle2, MessageSquare, Clock } from 'lucide-react';

export default function CustomerSupport() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);

  // New ticket modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('Report Inquiry');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newMessage, setNewMessage] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/support/my');
      const list = res.data.tickets || [];
      setTickets(list);
      if (list.length > 0 && !selectedTicket) {
        setSelectedTicket(list[0]);
      }
    } catch (err) {
      console.error('Failed to load tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/support', {
        subject: newSubject,
        category: newCategory,
        priority: newPriority,
        message: newMessage,
      });
      setShowNewModal(false);
      setNewSubject('');
      setNewMessage('');
      fetchTickets();
      setSelectedTicket(res.data.ticket);
    } catch (err) {
      alert('Failed to submit ticket');
    } finally {
      setCreating(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    try {
      const res = await api.put(`/support/${selectedTicket._id}/reply`, {
        message: replyText,
      });
      setSelectedTicket(res.data.ticket);
      setReplyText('');
      fetchTickets();
    } catch (err) {
      alert('Failed to send reply');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Customer Support & Inquiries
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Submit a query to our patient support coordinators or review existing conversations.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Raise Support Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
            My Tickets ({tickets.length})
          </span>
          {tickets.length === 0 ? (
            <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
              No tickets raised yet.
            </div>
          ) : (
            tickets.map((t) => (
              <button
                key={t._id}
                onClick={() => setSelectedTicket(t)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedTicket?._id === t._id
                    ? 'bg-blue-50/70 border-blue-400 shadow-xs'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-[10px] font-bold text-slate-400">{t.ticketId}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    t.status === 'Resolved' ? 'bg-blue-100 text-blue-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {t.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 truncate">{t.subject}</h4>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                  <span>{t.category}</span>
                  <span>•</span>
                  <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Selected Ticket Conversation Thread */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col h-[520px] justify-between">
              <div>
                <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">
                      {selectedTicket.category} • Priority: {selectedTicket.priority}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{selectedTicket.subject}</h3>
                    <span className="text-[11px] text-slate-400 font-mono">Ticket ID: {selectedTicket.ticketId}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                    {selectedTicket.status}
                  </span>
                </div>

                {/* Messages stream */}
                <div className="overflow-y-auto max-h-72 space-y-3 py-4 pr-1">
                  {(selectedTicket.messages || []).map((msg, idx) => {
                    const isStaff = msg.senderRole && msg.senderRole !== 'customer';
                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl max-w-md text-xs space-y-1 ${
                          isStaff
                            ? 'bg-slate-100 text-slate-800 mr-auto rounded-tl-xs'
                            : 'bg-blue-600 text-white ml-auto rounded-tr-xs'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] opacity-75">
                          <span className="font-bold">{msg.senderName} {isStaff ? '(MALAK Lab Support)' : ''}</span>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="leading-relaxed">{msg.message}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  placeholder="Type a response to support coordinators..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-400">
              Select or raise a support inquiry
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
              Raise a Support Inquiry
            </h3>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Question regarding Vitamin D report"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Report Inquiry">Report Inquiry</option>
                    <option value="Appointment Reschedule">Appointment Reschedule</option>
                    <option value="Payment Issue">Payment Issue</option>
                    <option value="Home Collection Delay">Home Collection Delay</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Message Description</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Explain your inquiry in detail..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  {creating ? 'Submitting...' : 'Submit Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
