import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Loader2, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/newsletter/subscribers`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      setSubscribers(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch newsletter subscribers');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-[var(--color-gold)]" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[var(--color-ivory)]">Newsletter Subscribers</h1>
          <p className="text-[var(--color-ivory-muted)] mt-1">Manage users who have opted into marketing emails</p>
        </div>
        <div className="bg-[#111] border border-white/[0.05] rounded-xl px-6 py-3 flex items-center gap-4">
          <div className="bg-[var(--color-gold)]/20 p-2 rounded-lg">
            <Mail className="text-[var(--color-gold)]" size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--color-ivory)]">{subscribers.length}</div>
            <div className="text-xs uppercase tracking-widest text-[var(--color-ivory-muted)]">Total Subscribers</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/[0.05] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.05] bg-black/40">
                <th className="p-4 text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] font-medium">Email Address</th>
                <th className="p-4 text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] font-medium">Status</th>
                <th className="p-4 text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] font-medium">Date Subscribed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-[var(--color-ivory-muted)] font-serif">
                    No subscribers found.
                  </td>
                </tr>
              ) : (
                subscribers.map((sub) => (
                  <tr key={sub._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Mail size={16} className="text-[var(--color-gold)]" />
                        <span className="text-[var(--color-ivory)] font-medium">{sub.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${
                        sub.status === 'subscribed' 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-[var(--color-ivory-muted)]">
                        <Calendar size={14} />
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
