import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Gavel, CheckCircle2 } from 'lucide-react';

export default function AdminAuctionPanel({ onNotify }) {
  const { user } = useAuth();
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Quick form state per lot
  const [approvalForms, setApprovalForms] = useState({});

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.token || user?.token;
      const res = await axios.get('http://localhost:5000/api/auction/admin/lots', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allLots = res.data;
      setLots(allLots);
      
      const forms = {};
      allLots.forEach(l => {
        forms[l._id] = {
            lotNumber: '',
            startDate: new Date().toISOString().slice(0, 16),
            endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
          };
      });
      setApprovalForms(forms);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.token || user?.token;
      const form = approvalForms[id];
      await axios.put(`http://localhost:5000/api/auction/${id}/approve`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onNotify('Lot approved successfully!');
      fetchLots(); // Refresh list
    } catch (err) {
      console.error(err);
      onNotify('Failed to approve lot.');
    }
  };

  const updateForm = (id, field, value) => {
    setApprovalForms(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  if (!user || user.role !== 'admin') {
     return <div className="min-h-screen bg-[#0a0907] flex items-center justify-center text-white">Admin access required</div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[var(--color-ivory)] flex flex-col font-sans">
      
      {/* Standalone Dashboard Header */}
      <header className="h-20 bg-black/60 backdrop-blur-xl border-b border-white/[0.05] flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
          <div className="text-2xl font-serif text-[var(--color-ivory)] tracking-widest uppercase">
            The Grand Store
          </div>
          <div className="h-4 w-px bg-white/20 mx-2"></div>
          <div className="text-sm tracking-widest text-gold-gradient font-medium uppercase">
            Admin Portal
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <div className="text-sm font-serif">{user.name}</div>
              <div className="text-xs text-gold-gradient tracking-widest uppercase">System Admin</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-yellow-500 p-[1px]">
              <div className="w-full h-full bg-[#0a0a0a] rounded-full flex items-center justify-center">
                <Gavel size={18} className="text-red-400" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Background glow effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[var(--color-gold)]/5 blur-[150px]"></div>
        </div>

        {/* Glassmorphic Sidebar */}
        <aside className="w-64 bg-white/[0.02] backdrop-blur-xl border-r border-white/[0.02] flex flex-col fixed top-20 bottom-0 left-0 z-10">
          <nav className="flex flex-col flex-1 p-6 gap-2 mt-4">
            <button className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/[0.05] text-gold-gradient shadow-[0_0_15px_rgba(212,175,55,0.05)] transition-all text-left text-xs uppercase tracking-widest font-semibold border border-white/[0.05]">
              <Gavel size={16} /> Auction Approvals
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 ml-64 p-10 lg:p-16 flex flex-col gap-12 z-10">
          
          {/* Welcome Section */}
          <section className="mb-4">
            <h1 className="text-[var(--color-ivory)] font-serif text-5xl mb-4">
              Auction <span className="font-script text-6xl text-gold-gradient font-normal ml-2 tracking-wide drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">Approvals</span>
            </h1>
            <p className="text-[var(--color-ivory-muted)] text-lg max-w-2xl font-light">
              Review vendor submissions, assign lot numbers, and set minimum bids before lots go live.
            </p>
          </section>

          {/* Approvals List */}
          <section>
            {loading ? (
              <div className="py-24 text-center text-[var(--color-ivory-muted)] font-light tracking-wide">Loading pending lots...</div>
            ) : lots.length === 0 ? (
              <div className="py-24 text-center flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-6 shadow-inner">
                  <CheckCircle2 size={48} className="text-gold-gradient opacity-30" />
                </div>
                <h3 className="text-[var(--color-ivory)] font-serif text-3xl mb-3">All Caught Up</h3>
                <p className="text-[var(--color-ivory-muted)] text-lg font-light">There are no pending auction lots requiring approval at this time.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-10">
                {lots.map((lot) => (
                  <div key={lot._id} className="bg-white/[0.02] backdrop-blur-2xl rounded-3xl border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col lg:flex-row">
                    
                    {/* Lot Info */}
                    <div className="flex-1 p-10 flex gap-10">
                      <div className="w-40 h-40 bg-black/40 rounded-2xl flex-shrink-0 flex items-center justify-center p-4 border border-white/[0.05] shadow-inner">
                        <img src={lot.images && lot.images[0] ? lot.images[0] : '/assets/auction/macallan-25.png'} alt={lot.title} className="max-w-full max-h-full object-contain mix-blend-screen hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[var(--color-ivory)] font-serif text-3xl mb-2">{lot.title}</h3>
                        <p className="text-xs tracking-widest uppercase text-[var(--color-ivory-muted)] mb-6">{lot.category}</p>
                        <p className="text-[var(--color-ivory-muted)] font-light leading-relaxed max-w-xl mb-6">{lot.description}</p>
                        
                        <div className="grid grid-cols-2 gap-6 text-sm">
                          <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.02]">
                            <span className="text-[var(--color-ivory-muted)] block text-[10px] uppercase tracking-widest mb-1 font-semibold">Requested Start Bid</span> 
                            <span className="font-serif text-xl text-gold-gradient">R{lot.startingBid?.toLocaleString('en-ZA')}</span>
                          </div>
                          <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.02]">
                            <span className="text-[var(--color-ivory-muted)] block text-[10px] uppercase tracking-widest mb-1 font-semibold">Reserve Price</span> 
                            <span className="font-serif text-xl text-gold-gradient">R{lot.reservePrice?.toLocaleString('en-ZA')}</span>
                          </div>
                          <div className="col-span-2 text-sm font-light">
                            <p className="mb-2"><span className="text-gold-gradient font-medium mr-2">Condition:</span> <span className="text-[var(--color-ivory)]">{lot.condition}</span></p>
                            <p><span className="text-gold-gradient font-medium mr-2">Provenance:</span> <span className="text-[var(--color-ivory)]">{lot.provenance}</span></p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Approval Controls */}
                    <div className="w-full lg:w-96 bg-black/40 border-l border-white/[0.05] p-10 flex flex-col justify-center">
                       <h4 className="font-semibold text-xs text-gold-gradient uppercase tracking-widest border-b border-white/[0.05] pb-4 mb-6">Admin Configuration</h4>
                       <div className="space-y-5">
                         <div>
                           <label className="block text-[10px] text-[var(--color-ivory-muted)] mb-2 uppercase tracking-widest font-semibold">Lot Number</label>
                           <input type="text" value={approvalForms[lot._id]?.lotNumber || ''} onChange={e => updateForm(lot._id, 'lotNumber', e.target.value)} className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-sm text-[var(--color-ivory)] focus:outline-none focus:border-[var(--color-gold)]/50 focus:bg-white/[0.05] transition-all placeholder-white/20" placeholder="e.g. LOT-2024-001" />
                         </div>
                         <div>
                           <label className="block text-[10px] text-[var(--color-ivory-muted)] mb-2 uppercase tracking-widest font-semibold">Start Date/Time</label>
                           <input type="datetime-local" value={approvalForms[lot._id]?.startDate || ''} onChange={e => updateForm(lot._id, 'startDate', e.target.value)} className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-sm text-[var(--color-ivory)] focus:outline-none focus:border-[var(--color-gold)]/50 focus:bg-white/[0.05] transition-all [color-scheme:dark]" />
                         </div>
                         <div>
                           <label className="block text-[10px] text-[var(--color-ivory-muted)] mb-2 uppercase tracking-widest font-semibold">End Date/Time</label>
                           <input type="datetime-local" value={approvalForms[lot._id]?.endDate || ''} onChange={e => updateForm(lot._id, 'endDate', e.target.value)} className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-sm text-[var(--color-ivory)] focus:outline-none focus:border-[var(--color-gold)]/50 focus:bg-white/[0.05] transition-all [color-scheme:dark]" />
                         </div>
                         <button onClick={() => handleApprove(lot._id)} className="w-full mt-8 rounded-xl bg-gold-gradient text-black font-bold uppercase tracking-widest text-xs py-4 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all">
                           Approve & Publish Lot
                         </button>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
