import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Gavel, CheckCircle2 } from 'lucide-react';
import Price from '../../components/ui/Price';

export default function AdminAuctionPanel({ onNotify }) {
  const { user } = useAuth();
  const [lots, setLots] = useState([]);
  const [allLots, setAllLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
  const [expandedLot, setExpandedLot] = useState(null);
  
  // Quick form state per lot
  const [approvalForms, setApprovalForms] = useState({});

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.token || user?.token;
      
      const pendingRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/auction/admin/lots`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const pendingLots = pendingRes.data;
      setLots(pendingLots);

      const allRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/auction/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllLots(allRes.data);
      
      
      const forms = {};
      const currentYear = new Date().getFullYear();

      const toDatetimeLocal = (date) => {
        const d = new Date(date);
        const pad = (n) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };

      pendingLots.forEach(l => {
        const sd = l.startDate ? new Date(l.startDate) : new Date();
        const ed = l.endDate ? new Date(l.endDate) : new Date(Date.now() + 7 * 86400000);
        
        forms[l._id] = {
            lotNumber: `LOT-${currentYear}-${l._id.substring(l._id.length - 5).toUpperCase()}`,
            startDate: toDatetimeLocal(sd),
            endDate: toDatetimeLocal(ed),
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
      await axios.put(`${import.meta.env.VITE_API_URL}/api/auction/${id}/approve`, form, {
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
    <div className="flex flex-col gap-12 w-full max-w-7xl mx-auto relative z-10">
      {/* Welcome Section */}
      <section className="mb-4">
        <h1 className="text-[var(--color-ivory)] font-serif text-3xl md:text-5xl mb-4">
          Auction <span className="text-4xl md:text-6xl text-gold-gradient font-normal ml-2 tracking-wide drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">Management</span>
        </h1>
        <p className="text-[var(--color-ivory-muted)] text-base md:text-lg max-w-2xl font-light">
          Review vendor submissions, assign lot numbers, and track sold auction lots and financials.
        </p>

        <div className="flex gap-4 mt-8 border-b border-white/10 pb-4">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`text-sm uppercase tracking-widest font-bold px-4 py-2 rounded-lg transition-colors ${activeTab === 'pending' ? 'bg-[var(--color-gold)]/20 text-[var(--color-gold)] border border-[var(--color-gold)]/30' : 'text-white/50 hover:text-white'}`}
          >
            Pending Approvals ({lots.length})
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`text-sm uppercase tracking-widest font-bold px-4 py-2 rounded-lg transition-colors ${activeTab === 'history' ? 'bg-[var(--color-gold)]/20 text-[var(--color-gold)] border border-[var(--color-gold)]/30' : 'text-white/50 hover:text-white'}`}
          >
            Auction History
          </button>
        </div>
      </section>

      {activeTab === 'pending' ? (
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
              <div key={lot._id} className="bg-white/[0.02] backdrop-blur-2xl rounded-3xl border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col xl:flex-row">
                
                {/* Lot Info */}
                <div className="flex-1 p-6 md:p-10 flex flex-col md:flex-row gap-10">
                  <div className="w-full md:w-40 h-40 bg-black/40 rounded-2xl flex-shrink-0 flex items-center justify-center p-4 border border-white/[0.05] shadow-inner">
                    <img src={lot.images && lot.images[0] ? lot.images[0] : '/assets/auction/macallan-25.png'} alt={lot.title} className="max-w-full max-h-full object-contain mix-blend-screen hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[var(--color-ivory)] font-serif text-2xl md:text-3xl mb-2">{lot.title}</h3>
                    <p className="text-[10px] md:text-xs tracking-widest uppercase text-[var(--color-ivory-muted)] mb-6">{lot.category}</p>
                    <p className="text-[var(--color-ivory-muted)] font-light leading-relaxed max-w-xl mb-6 text-sm md:text-base">{lot.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm">
                      <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.02]">
                        <span className="text-[var(--color-ivory-muted)] block text-[10px] uppercase tracking-widest mb-1 font-semibold">Requested Start Bid</span> 
                        <span className="font-serif text-lg md:text-xl text-gold-gradient"><Price amount={lot.startingBid?.toLocaleString('en-ZA')} /></span>
                      </div>
                      <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.02]">
                        <span className="text-[var(--color-ivory-muted)] block text-[10px] uppercase tracking-widest mb-1 font-semibold">Reserve Price</span> 
                        <span className="font-serif text-lg md:text-xl text-gold-gradient"><Price amount={lot.reservePrice?.toLocaleString('en-ZA')} /></span>
                      </div>
                      <div className="col-span-1 md:col-span-2 text-xs md:text-sm font-light mt-2">
                        <p className="mb-2"><span className="text-gold-gradient font-medium mr-2">Condition:</span> <span className="text-[var(--color-ivory)]">{lot.condition}</span></p>
                        <p><span className="text-gold-gradient font-medium mr-2">Provenance:</span> <span className="text-[var(--color-ivory)]">{lot.provenance}</span></p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Approval Controls */}
                <div className="w-full xl:w-96 bg-black/40 xl:border-l border-t xl:border-t-0 border-white/[0.05] p-6 md:p-10 flex flex-col justify-center">
                   <h4 className="font-semibold text-xs text-gold-gradient uppercase tracking-widest border-b border-white/[0.05] pb-4 mb-6 flex items-center gap-2"><Gavel size={14} /> Admin Configuration</h4>
                   <div className="space-y-5">
                     <div>
                       <label className="block text-[10px] text-[var(--color-ivory-muted)] mb-2 uppercase tracking-widest font-semibold flex justify-between">
                         Lot Number
                         <span className="text-[var(--color-gold)] opacity-70">Auto-generated</span>
                       </label>
                       <input type="text" readOnly value={approvalForms[lot._id]?.lotNumber || ''} className="w-full bg-black/50 border border-white/[0.02] rounded-xl p-3 text-sm text-[var(--color-ivory)]/70 focus:outline-none cursor-not-allowed" />
                     </div>
                     <div>
                       <label className="block text-[10px] text-[var(--color-ivory-muted)] mb-2 uppercase tracking-widest font-semibold">Start Date/Time</label>
                       <input type="datetime-local" readOnly value={approvalForms[lot._id]?.startDate || ''} onChange={e => updateForm(lot._id, 'startDate', e.target.value)} className="w-full bg-black/50 border border-white/[0.02] rounded-xl p-3 text-sm text-[var(--color-ivory)]/70 focus:outline-none cursor-not-allowed [color-scheme:dark]" />
                     </div>
                     <div>
                       <label className="block text-[10px] text-[var(--color-ivory-muted)] mb-2 uppercase tracking-widest font-semibold">End Date/Time</label>
                       <input type="datetime-local" readOnly value={approvalForms[lot._id]?.endDate || ''} onChange={e => updateForm(lot._id, 'endDate', e.target.value)} className="w-full bg-black/50 border border-white/[0.02] rounded-xl p-3 text-sm text-[var(--color-ivory)]/70 focus:outline-none cursor-not-allowed [color-scheme:dark]" />
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
      ) : (
      <section>
        {loading ? (
          <div className="py-24 text-center text-[var(--color-ivory-muted)] font-light tracking-wide">Loading history...</div>
        ) : allLots.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-[var(--color-ivory-muted)]">No auction history found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white/[0.01] border border-white/5 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-[var(--color-ivory-muted)] bg-black/20">
                  <th className="py-4 font-semibold pl-6">Lot Info</th>
                  <th className="py-4 font-semibold">Status</th>
                  <th className="py-4 font-semibold">Vendor</th>
                  <th className="py-4 font-semibold">Current/Winning Bid</th>
                  <th className="py-4 font-semibold pr-6">Action</th>
                </tr>
              </thead>
              <tbody>
                {allLots.map((lot) => (
                  <React.Fragment key={lot._id}>
                    <tr className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                      <td className="py-4 pl-6">
                        <div className="font-serif text-sm text-[var(--color-ivory)]">{lot.title}</div>
                        <div className="text-[10px] text-[var(--color-ivory-muted)] tracking-widest uppercase">Lot {lot.lotNumber || lot._id.slice(-6)}</div>
                      </td>
                      <td className="py-4 text-xs font-bold uppercase tracking-widest text-[var(--color-gold)]">
                        {lot.status.replace('_', ' ')}
                        {lot.status === 'sold' && (
                          <span className={`ml-2 px-1.5 py-0.5 rounded text-[8px] ${lot.paymentStatus === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {lot.paymentStatus || 'Pending'}
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-xs text-[var(--color-ivory)]">
                         {lot.vendor?.name || 'Unknown'}
                      </td>
                      <td className="py-4 text-sm font-bold text-[var(--color-ivory)] font-serif">
                        <Price amount={(lot.winningBid || lot.currentBid || 0).toLocaleString('en-ZA')} />
                      </td>
                      <td className="py-4 pr-6 text-sm">
                        {lot.status === 'sold' && (
                          <button 
                            onClick={() => setExpandedLot(expandedLot === lot._id ? null : lot._id)} 
                            className="text-[10px] border border-white/20 text-white hover:bg-white/10 px-3 py-1.5 rounded uppercase tracking-widest font-bold transition-all"
                          >
                            {expandedLot === lot._id ? 'Hide Details' : 'View Details'}
                          </button>
                        )}
                      </td>
                    </tr>
                    
                    {expandedLot === lot._id && lot.status === 'sold' && (
                      <tr className="bg-white/[0.02]">
                        <td colSpan="5" className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                            <div className="bg-[#0a0a0a] p-5 rounded-xl border border-white/10">
                               <h4 className="text-[var(--color-gold)] font-bold tracking-widest uppercase text-[10px] mb-4">Financial Breakdown</h4>
                               <div className="space-y-2 font-mono text-[var(--color-ivory-muted)]">
                                  <div className="flex justify-between"><span>Winning Bid:</span> <span><Price amount={lot.winningBid?.toLocaleString('en-ZA')} /></span></div>
                                  <div className="flex justify-between"><span>Buyer Premium ({(lot.buyerPremiumPct || 5)}%):</span> <span>+ <Price amount={lot.buyerPremiumAmount?.toLocaleString('en-ZA')} /></span></div>
                                  <div className="flex justify-between"><span>BAR Charge ({(lot.barChargePct || 2)}%):</span> <span>+ <Price amount={lot.barChargeAmount?.toLocaleString('en-ZA')} /></span></div>
                                  <div className="flex justify-between"><span>VAT ({(lot.vatPct || 15)}%):</span> <span>+ <Price amount={lot.vatAmount?.toLocaleString('en-ZA')} /></span></div>
                                  <div className="flex justify-between"><span>Shipping:</span> <span>+ <Price amount={lot.shippingCost?.toLocaleString('en-ZA')} /></span></div>
                                  <div className="flex justify-between border-t border-white/10 pt-2 mt-2 text-white font-bold">
                                     <span>Total Paid By Buyer:</span> 
                                     <span className="text-[var(--color-gold)]"><Price amount={lot.totalPaidByBuyer?.toLocaleString('en-ZA')} /></span>
                                  </div>
                                  
                                  <div className="flex justify-between border-t border-dashed border-white/10 pt-2 mt-2"><span>Commission Earned ({(lot.commissionPct || 15)}%):</span> <span className="text-green-400"><Price amount={lot.commissionAmount?.toLocaleString('en-ZA')} /></span></div>
                                  <div className="flex justify-between"><span>Vendor Payout Net:</span> <span className="text-yellow-400"><Price amount={lot.vendorPayable?.toLocaleString('en-ZA')} /></span></div>
                               </div>
                            </div>
                            <div className="bg-[#0a0a0a] p-5 rounded-xl border border-white/10">
                               <h4 className="text-[var(--color-gold)] font-bold tracking-widest uppercase text-[10px] mb-4">Winner & Delivery Details</h4>
                               {lot.winner ? (
                                  <div className="mb-4">
                                    <p className="text-white">{lot.winner.name}</p>
                                    <p className="text-[var(--color-ivory-muted)]">{lot.winner.email}</p>
                                  </div>
                               ) : (
                                  <p className="text-[var(--color-ivory-muted)] mb-4">Winner info not available.</p>
                               )}
                               
                               <h5 className="text-[var(--color-ivory-muted)] text-[10px] tracking-widest uppercase font-bold mb-2">Shipping Address</h5>
                               {lot.paymentStatus === 'Paid' && lot.shippingAddress ? (
                                  <div className="text-[var(--color-ivory-muted)] text-xs">
                                     <p>{lot.shippingAddress.address}</p>
                                     <p>{lot.shippingAddress.city}, {lot.shippingAddress.postalCode}</p>
                                     <p>{lot.shippingAddress.country}</p>
                                  </div>
                               ) : (
                                  <p className="text-[var(--color-ivory-muted)] text-xs italic">
                                     {lot.paymentStatus === 'Paid' ? 'No shipping address provided.' : 'Waiting for buyer to complete checkout.'}
                                  </p>
                               )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      )}
    </div>
  );
}
