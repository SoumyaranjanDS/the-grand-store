import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { CheckCircle, XCircle, Clock, Search, FileText } from "lucide-react";

export default function AdminVendors() {
  const { user } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const goldText = "text-[#c9a35b]";
  const fetchVendors = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/vendors`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setVendors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [user]);

  const handleStatusUpdate = async (vendorId, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this vendor as ${newStatus}?`)) return;
    
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/admin/vendors/${vendorId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      // Refresh list
      fetchVendors();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 w-max"><CheckCircle size={12}/> Approved</span>;
      case 'pending_approval': return <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 w-max"><Clock size={12}/> Pending</span>;
      case 'rejected': return <span className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 w-max"><XCircle size={12}/> Rejected</span>;
      case 'draft': return <span className="px-2 py-1 bg-white/5 text-white/50 border border-white/10 rounded text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 w-max"><FileText size={12}/> Draft</span>;
      default: return <span className="px-2 py-1 bg-white/5 text-white/50 border border-white/10 rounded text-[10px] uppercase font-bold tracking-widest w-max">{status}</span>;
    }
  };

  const filtered = vendors.filter(v => 
    v.businessInfo?.legalName?.toLowerCase().includes(search.toLowerCase()) ||
    v.userId?.email?.toLowerCase().includes(search.toLowerCase()) ||
    v.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-10 w-full max-w-7xl mx-auto pb-10">
      <section>
        <h1 className="text-[var(--color-ivory)] font-serif text-5xl mb-4 leading-tight">
          Vendor <span className={goldText} >Management</span>
        </h1>
        <p className="text-[var(--color-ivory-muted)] text-lg font-light">
          Review, approve, or reject vendor applications.
        </p>
      </section>

      <div className="flex items-center gap-2 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 w-full md:w-96">
        <Search size={16} className="text-[var(--color-ivory-muted)]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by legal name, email, or status..."
          className="bg-transparent text-sm text-white outline-none placeholder:text-white/30 w-full"
        />
      </div>

      <div className="overflow-x-auto bg-[#0a0a0a] border border-white/5 rounded-2xl">
        {loading ? (
          <div className="p-12 text-center text-[var(--color-ivory-muted)] animate-pulse">Loading vendors...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-[var(--color-ivory-muted)]">No vendors found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-[var(--color-ivory-muted)] bg-black/20">
                <th className="py-4 pl-6 font-semibold">Business Name</th>
                <th className="py-4 font-semibold">Email</th>
                <th className="py-4 font-semibold">Status</th>
                <th className="py-4 font-semibold">Step</th>
                <th className="py-4 font-semibold">Date Applied</th>
                <th className="py-4 pr-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v, i) => (
                <tr key={v._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 pl-6 text-sm text-[var(--color-ivory)] font-serif">{v.businessInfo?.legalName || 'N/A'}</td>
                  <td className="py-4 text-xs text-[var(--color-ivory-muted)]">{v.userId?.email || 'N/A'}</td>
                  <td className="py-4">{getStatusBadge(v.status)}</td>
                  <td className="py-4 text-xs text-[var(--color-gold)] font-mono">{v.onboardingStep}/10</td>
                  <td className="py-4 text-xs text-[var(--color-ivory-muted)]">
                    {new Date(v.createdAt).toLocaleDateString("en-ZA")}
                  </td>
                  <td className="py-4 pr-6">
                    <div className="flex justify-end gap-2">
                      {v.status === 'pending_approval' && (
                        <>
                          <button onClick={() => handleStatusUpdate(v._id, 'approved')} className="px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded border border-green-500/30 text-[10px] font-bold uppercase tracking-widest transition-colors">
                            Approve
                          </button>
                          <button onClick={() => handleStatusUpdate(v._id, 'rejected')} className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded border border-red-500/30 text-[10px] font-bold uppercase tracking-widest transition-colors">
                            Reject
                          </button>
                        </>
                      )}
                      {v.status === 'approved' && (
                        <button onClick={() => handleStatusUpdate(v._id, 'suspended')} className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded border border-red-500/30 text-[10px] font-bold uppercase tracking-widest transition-colors">
                          Suspend
                        </button>
                      )}
                      {v.status === 'rejected' && (
                        <button onClick={() => handleStatusUpdate(v._id, 'pending_approval')} className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded border border-yellow-500/30 text-[10px] font-bold uppercase tracking-widest transition-colors">
                          Allow Reapply
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
