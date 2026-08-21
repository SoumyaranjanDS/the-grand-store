import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Clock, ShieldCheck, ChevronDown, Check } from 'lucide-react';
import AuctionCountdown from './AuctionCountdown';

export default function LuxuryAuctionHero({ lots, now, onNotify, onRefresh }) {
  if (!lots || lots.length === 0) return null;

  const handleScrollToGrid = () => {
    document.getElementById('current-auctions')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative w-full bg-[#050505]">
      {lots.map((lot, index) => (
        <LuxuryAuctionSlide 
          key={lot._id} 
          lot={lot} 
          now={now} 
          index={index}
          total={lots.length}
          onNotify={onNotify}
          onRefresh={onRefresh}
        />
      ))}
      
      {/* Global View All button at the bottom of the hero sections */}
      <div className="absolute bottom-10 left-0 w-full flex justify-center z-50 pointer-events-none">
        <button 
          onClick={handleScrollToGrid}
          className="pointer-events-auto flex flex-col items-center gap-2 text-[var(--color-ivory-muted)] hover:text-gold-gradient transition-colors group"
        >
          <span className="text-[10px] uppercase tracking-widest font-bold">View All Auctions</span>
          <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-black/50 backdrop-blur-md group-hover:border-[var(--color-gold)]/50 transition-colors">
            <ChevronDown size={18} className="animate-bounce" />
          </div>
        </button>
      </div>
    </div>
  );
}

function LuxuryAuctionSlide({ lot, now, index, total, onNotify, onRefresh }) {
  const [bidAmount, setBidAmount] = useState('');
  const [isMaxBid, setIsMaxBid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const endTime = new Date(lot.endDate).getTime();
  const nextMinimum = lot.currentBid === 0 ? lot.startingBid : lot.currentBid + lot.bidIncrement;
  const vendorName = lot.vendor ? (lot.vendor.storeName || lot.vendor.name) : 'The Grand Store';

  const submitBid = async (e) => {
    e.preventDefault();
    const amt = Number(bidAmount);
    
    if (isNaN(amt) || amt < nextMinimum) {
      onNotify(`Your bid must be at least R${nextMinimum.toLocaleString('en-ZA')}`);
      return;
    }
    
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const token = userInfo?.token;
    if (!token) {
      onNotify('You must be logged in to place a bid.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auction/${lot._id}/bid`, {
        amount: amt,
        isMaxBid
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onNotify(res.data.message || 'Bid placed successfully!');
      setBidAmount('');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      onNotify(err.response?.data?.message || 'Failed to place bid');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full sticky top-0 overflow-hidden flex items-center justify-center bg-[#050505] border-b border-white/[0.02]">
      {/* Abstract Background Glows */}
      <div className="absolute top-1/4 -left-1/4 w-[50%] h-[50%] rounded-full bg-[var(--color-gold)]/5 blur-[150px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-[50%] h-[50%] rounded-full bg-red-500/5 blur-[150px] mix-blend-screen pointer-events-none" />
      
      <div className="w-full max-w-[1400px] mx-auto px-6 py-24 flex flex-col lg:flex-row items-center gap-12 lg:gap-24 relative z-10">
        
        {/* Left: Product Image */}
        <div className="flex-1 w-full flex items-center justify-center relative">
          <div className="relative w-full max-w-lg aspect-[3/4] flex items-center justify-center">
            {/* Elegant framing */}
            <div className="absolute inset-0 border border-white/[0.05] rounded-[2rem] transform -rotate-3 transition-transform duration-700 hover:rotate-0" />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 to-transparent rounded-[2rem] z-10" />
            <img 
              src={lot.images && lot.images[0] ? lot.images[0] : '/assets/auction/macallan-25.png'} 
              alt={lot.title} 
              className="max-h-[90%] max-w-[90%] object-contain z-20 drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
            />
            
            <div className="absolute top-8 left-8 z-30 flex flex-col gap-2">
              <span className="bg-red-600/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                Live Auction
              </span>
              <span className="bg-black/60 backdrop-blur-md text-[var(--color-ivory)] text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/10">
                Lot {lot.lotNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Auction Details & Bidding Console */}
        <div className="flex-1 w-full flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
             <div className="h-px w-12 bg-gold-gradient" />
             <span className="text-gold-gradient text-[10px] uppercase tracking-widest font-bold">Featured Collection {index + 1}/{total}</span>
          </div>
          
          <h2 className="text-5xl lg:text-7xl font-serif text-[var(--color-ivory)] leading-[1.1] mb-6">
            {lot.title}
          </h2>
          
          <p className="text-[var(--color-ivory-muted)] text-lg font-light leading-relaxed mb-8 max-w-xl">
            {lot.description}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-10 max-w-xl">
             <div className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1 opacity-60">Provenance</p>
                <p className="text-sm font-medium text-[var(--color-ivory)] truncate">{lot.provenance}</p>
             </div>
             <div className="bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl backdrop-blur-md">
                <p className="text-[10px] uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1 opacity-60">Offered By</p>
                <p className="text-sm font-medium text-gold-gradient truncate">{vendorName}</p>
             </div>
          </div>

          {/* Bidding Console */}
          <div className="bg-black/40 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] max-w-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 pb-8 border-b border-white/[0.05]">
               <div>
                  <p className="text-[10px] uppercase tracking-widest text-gold-gradient mb-2 font-bold flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> Current Bid
                  </p>
                  <div className="text-4xl md:text-5xl font-serif font-bold text-[var(--color-ivory)]">
                    <span className="text-2xl text-[var(--color-ivory-muted)] mr-2">ZAR</span>
                    {lot.currentBid ? lot.currentBid.toLocaleString('en-ZA') : (lot.startingBid ? lot.startingBid.toLocaleString('en-ZA') : '0')}
                  </div>
               </div>
               <div className="text-left sm:text-right">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-ivory-muted)] mb-2 font-bold flex items-center sm:justify-end gap-2">
                    <Clock size={12} className="text-red-400" /> Ends In
                  </p>
                  <div className="text-xl font-mono text-red-400 tracking-wider">
                    <AuctionCountdown endTime={endTime} now={now} />
                  </div>
               </div>
            </div>

            <form onSubmit={submitBid} className="flex flex-col gap-4">
               <div className="flex flex-col sm:flex-row gap-4">
                 <div className="relative flex-1">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--color-ivory-muted)] font-serif text-lg">R</span>
                    <input 
                      type="number"
                      required
                      value={bidAmount}
                      onChange={e => setBidAmount(e.target.value)}
                      placeholder={nextMinimum.toLocaleString('en-ZA')}
                      min={nextMinimum}
                      step="1"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-lg font-mono text-[var(--color-ivory)] focus:outline-none focus:border-[var(--color-gold)] transition-colors placeholder-white/20"
                    />
                 </div>
                 <button 
                   disabled={submitting}
                   className="bg-gold-gradient text-black font-bold uppercase tracking-widest text-xs px-8 py-4 rounded-2xl hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 whitespace-nowrap"
                 >
                   {submitting ? 'Placing...' : 'Place Bid'} <ArrowRight size={14} />
                 </button>
               </div>
               
               <div className="flex items-center justify-between mt-2">
                 <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${isMaxBid ? 'bg-gold-gradient border-[var(--color-gold)]' : 'border-white/20 group-hover:border-white/40'}`}>
                      {isMaxBid && <Check size={10} className="text-black" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={isMaxBid} onChange={(e) => setIsMaxBid(e.target.checked)} />
                    <span className="text-[10px] uppercase tracking-widest text-[var(--color-ivory-muted)] font-medium">Set as Maximum Bid</span>
                 </label>
                 
                 <Link to={`/auction/${lot._id}`} className="text-[10px] uppercase tracking-widest text-[var(--color-gold)] hover:text-white transition-colors underline underline-offset-4">
                   View Full Details
                 </Link>
               </div>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}
