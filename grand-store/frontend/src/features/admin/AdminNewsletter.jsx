import React, { useState, useEffect } from 'react';
import { Mail, Search, Filter, Send, X, Users, Globe, Clock, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import api from '../../api';

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCountry, setFilterCountry] = useState('All');
  const [countries, setCountries] = useState(['All']);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSubscribers();
  }, [filterCountry]);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/newsletter/subscribers`, {
        params: { country: filterCountry }
      });
      setSubscribers(res.data);
      
      // Extract unique countries if 'All' is selected
      if (filterCountry === 'All') {
        const uniqueCountries = ['All', ...new Set(res.data.map(s => s.country || 'Unknown'))];
        setCountries(uniqueCountries);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!subject || !htmlContent) return;

    try {
      setSending(true);
      setMessage('');
      const res = await api.post('/newsletter/send', {
        subject,
        htmlContent,
        country: filterCountry
      });
      setMessage({ type: 'success', text: res.data.message });
      setTimeout(() => {
        setIsModalOpen(false);
        setMessage('');
        setSubject('');
        setHtmlContent('');
      }, 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to send newsletter' });
    } finally {
      setSending(false);
    }
  };

  const activeCount = subscribers.filter(s => s.status === 'subscribed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-[#0a0a0a] p-6 rounded-2xl border border-white/5">
        <div>
          <h1 className="text-2xl font-light text-white mb-2">Newsletter</h1>
          <p className="text-white/50 text-sm">Manage subscribers and send bulk campaigns</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gold text-black px-6 py-2 rounded-lg font-medium hover:bg-white transition-colors flex items-center gap-2"
        >
          <Send size={18} /> Compose Email
        </button>
      </div>

      {/* Stats & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
            <Users size={24} />
          </div>
          <div>
            <div className="text-2xl text-white">{subscribers.length}</div>
            <div className="text-white/50 text-xs uppercase tracking-widest mt-1">Total Subscribers</div>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-2xl text-white">{activeCount}</div>
            <div className="text-white/50 text-xs uppercase tracking-widest mt-1">Active Subscribers</div>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
            <Filter size={24} />
          </div>
          <div className="flex-1">
            <div className="text-white/50 text-xs uppercase tracking-widest mb-1">Filter by Country</div>
            <select 
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="w-full bg-transparent text-white border-b border-white/20 pb-1 outline-none focus:border-gold"
            >
              {countries.map(c => (
                <option key={c} value={c} className="bg-black text-white">{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-white/50 text-xs uppercase tracking-widest">
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Country</th>
                <th className="p-4 font-medium">IP Address</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Subscribed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-white/50">Loading subscribers...</td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-white/50">No subscribers found.</td>
                </tr>
              ) : (
                subscribers.map((sub) => (
                  <tr key={sub._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50">
                          <Mail size={14} />
                        </div>
                        <span className="text-white">{sub.email}</span>
                      </div>
                    </td>
                    <td className="p-4 text-white/70">
                      <div className="flex items-center gap-2">
                        <Globe size={14} className="text-white/30" />
                        {sub.country || 'Unknown'}
                      </div>
                    </td>
                    <td className="p-4 text-white/70 font-mono text-sm">
                      {sub.ipAddress || '-'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                        sub.status === 'subscribed' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-4 text-white/50 text-sm">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compose Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form onSubmit={handleSend} className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Header - Fixed */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
              <h2 className="text-xl text-white font-light">Compose Newsletter</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1 min-h-0 flex flex-col gap-6">
              {message && (
                <div className={`p-4 rounded-lg border text-sm ${
                  message.type === 'success' 
                    ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  {message.text}
                </div>
              )}

              <div className="bg-gold/10 border border-gold/30 rounded-lg p-4 text-gold text-sm flex items-center gap-3 shrink-0">
                <Users size={18} />
                <span>
                  You are sending this email to <strong>{activeCount} active subscribers</strong> 
                  {filterCountry !== 'All' ? ` in ${filterCountry}` : ' worldwide'}.
                </span>
              </div>

              <div className="shrink-0">
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">Subject Line</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold transition-colors"
                  placeholder="Enter a captivating subject..."
                  required
                />
              </div>

              <div className="flex-1 flex flex-col min-h-[250px]">
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">Email Body (HTML Supported)</label>
                <textarea 
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="w-full flex-1 min-h-[200px] bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-gold transition-colors"
                  placeholder="<h1>Hello World</h1><p>Your content here...</p>"
                  required
                ></textarea>
                <p className="text-white/30 text-xs mt-2 shrink-0">
                  This content will be automatically wrapped in The Grand Store's email template (header, logo, styling).
                </p>
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="p-6 border-t border-white/10 flex justify-end items-center shrink-0 bg-[#0a0a0a]">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 text-white/50 hover:text-white mr-4 transition-colors"
                disabled={sending}
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={sending || !subject || !htmlContent}
                className="bg-gold text-black px-8 py-2 rounded-lg font-medium hover:bg-white transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {sending ? 'Sending...' : <><Send size={18} /> Send Campaign</>}
              </button>
            </div>
            
          </form>
        </div>
      )}
    </div>
  );
}
