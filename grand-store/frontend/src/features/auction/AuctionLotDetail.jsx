import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ShieldCheck, Clock, History, AlertCircle } from 'lucide-react';
import AuctionCountdown from './AuctionCountdown';
import BidConfirmationModal from '../../components/modals/BidConfirmationModal';

export default function AuctionLotDetail({ onNotify }) {
  const { id } = useParams();
  const [lot, setLot] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [isMaxBid, setIsMaxBid] = useState(false);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    
    const fetchLot = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auction/${id}`);
        setLot(res.data.lot);
        setBids(res.data.bids);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    
    fetchLot();
    const interval = setInterval(fetchLot, 5000);

    return () => {
      window.clearInterval(timer);
      clearInterval(interval);
    };
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading Lot...</div>;
  if (!lot) return <div className="min-h-screen flex items-center justify-center text-white">Lot not found</div>;

  const nextMinimum = lot.currentBid === 0 ? lot.startingBid : lot.currentBid + lot.bidIncrement;
  const isLive = lot.status === 'live';
  const hasEnded = new Date(lot.endDate).getTime() < now;

  const handleBidClick = (e) => {
    e.preventDefault();
    const amt = Number(bidAmount);
    
    if (isNaN(amt) || amt < nextMinimum) {
      onNotify(`Your bid must be at least R${nextMinimum.toLocaleString('en-ZA')}`);
      return;
    }
    
    // Check if token exists
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const token = userInfo?.token;
    if (!token) {
      onNotify('You must be logged in to place a bid.');
      return;
    }

    setModalOpen(true);
  };

  const submitBid = async () => {
    setSubmitting(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.token;

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auction/${id}/bid`, {
        amount: Number(bidAmount),
        isMaxBid
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onNotify(res.data.message || 'Bid placed successfully!');
      setLot(res.data.lot);
      setModalOpen(false);
      setBidAmount('');
    } catch (err) {
      console.error(err);
      onNotify(err.response?.data?.message || 'Failed to place bid');
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="pt-0 pb-20 min-h-screen bg-[#0a0907] text-[#eee8dd]">
      <div className="shell">
        <div className="mb-8">
          <Link to="/auction" className="inline-flex items-center gap-2 text-[#918a7f] hover:text-white transition-colors">
            <ChevronLeft size={16} /> Back to Auctions
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="bg-[#11100d] border border-white/5 rounded-xl aspect-[4/5] flex items-center justify-center p-8 relative overflow-hidden">
              <img 
                src={lot.images && lot.images[0] ? lot.images[0] : '/assets/auction/macallan-25.png'} 
                alt={lot.title} 
                className="max-w-full max-h-full object-contain"
              />
              <div className="absolute top-4 right-4 bg-gold-gradient text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Lot {lot.lotNumber}
              </div>
            </div>
            
            {/* Thumbnails (Placeholder for additional images) */}
            {lot.images && lot.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {lot.images.slice(1, 5).map((img, i) => (
                  <div key={i} className="bg-[#11100d] border border-white/5 rounded-lg aspect-square flex items-center justify-center p-2 cursor-pointer hover:border-[#c9a35b] transition-colors">
                    <img src={img} alt="" className="max-w-full max-h-full object-contain" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="mb-6">
              <p className="text-gold-gradient text-sm font-semibold uppercase tracking-wider mb-2">{lot.category}</p>
              <h1 className="text-4xl md:text-5xl font-serif mb-4">{lot.title}</h1>
              <p className="text-[#918a7f] text-lg leading-relaxed">{lot.description}</p>
            </div>

            {/* Bidding Panel */}
            <div className="bg-[#11100d] border border-white/10 rounded-xl p-6 md:p-8 mb-8">
              <div className="flex flex-wrap gap-6 items-center justify-between mb-8 pb-8 border-b border-white/10">
                <div>
                  <p className="text-[#918a7f] uppercase tracking-wider text-sm font-semibold mb-1">Current Bid</p>
                  <p className="text-4xl font-semibold">R{lot.currentBid ? lot.currentBid.toLocaleString('en-ZA') : '0'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#918a7f] uppercase tracking-wider text-sm font-semibold mb-1 flex items-center justify-end gap-2"><Clock size={14} /> Ends In</p>
                  <div className="text-xl font-mono text-gold-gradient">
                    {hasEnded ? 'Auction Closed' : <AuctionCountdown endTime={new Date(lot.endDate).getTime()} now={now} />}
                  </div>
                </div>
              </div>

              {isLive && !hasEnded ? (
                <form onSubmit={handleBidClick} className="space-y-6">
                  <div>
                    <label className="flex items-center justify-between text-sm mb-2">
                      <span className="text-[#eee8dd]">Your Bid Amount (ZAR)</span>
                      <span className="text-[#918a7f]">Next min: R{nextMinimum.toLocaleString('en-ZA')}</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#918a7f] font-semibold">R</span>
                      <input 
                        type="number" 
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={nextMinimum.toString()}
                        min={nextMinimum}
                        step={lot.bidIncrement}
                        className="w-full bg-[#0a0907] border border-white/10 rounded-md py-4 pl-10 pr-4 focus:outline-none focus:border-[#c9a35b] text-lg font-mono"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isMaxBid ? 'bg-gold-gradient border-[#c9a35b]' : 'border-white/20 group-hover:border-white/40'}`}>
                      {isMaxBid && <div className="w-2.5 h-2.5 bg-black rounded-sm" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={isMaxBid} onChange={(e) => setIsMaxBid(e.target.checked)} />
                    <div>
                      <p className="text-sm font-semibold text-[#eee8dd]">Set as Maximum Bid</p>
                      <p className="text-xs text-[#918a7f]">The system will automatically bid for you up to this amount.</p>
                    </div>
                  </label>

                  <button 
                    type="submit" 
                    className="w-full bg-gold-gradient text-black font-bold uppercase tracking-wider py-4 rounded-md hover:bg-[#e1bd70] transition-colors flex items-center justify-center gap-2"
                  >
                    Place Bid
                  </button>
                </form>
              ) : (
                <div className="bg-[#0a0907] p-4 rounded-lg flex items-center justify-center gap-2 text-[#918a7f]">
                  <AlertCircle size={18} />
                  <span>This auction is currently {lot.status}. Bidding is disabled.</span>
                </div>
              )}
            </div>

            {/* Authentication & Provenance */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <ShieldCheck className="text-gold-gradient shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-lg mb-1">Grand Store Verified</h4>
                  <p className="text-sm text-[#918a7f] mb-3">Product condition and provenance reviewed by specialists.</p>
                  {lot.condition && (
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-white/50 uppercase mr-2">Condition:</span>
                      <span className="text-sm">{lot.condition}</span>
                    </div>
                  )}
                  {lot.provenance && (
                    <div>
                      <span className="text-xs font-semibold text-white/50 uppercase mr-2">Provenance:</span>
                      <span className="text-sm">{lot.provenance}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4 pt-6 border-t border-white/10">
                <History className="text-gold-gradient shrink-0 mt-1" />
                <div className="w-full">
                  <h4 className="font-semibold text-lg mb-4">Bid History</h4>
                  {bids.length > 0 ? (
                    <div className="space-y-3">
                      {bids.map((bid, i) => (
                        <div key={bid._id} className="flex items-center justify-between text-sm py-2 border-b border-white/5 last:border-0">
                          <span className="text-[#918a7f]">{bid.bidder}</span>
                          <span className="font-mono">R{bid.amount.toLocaleString('en-ZA')}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#918a7f]">No bids placed yet. Be the first!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BidConfirmationModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        lot={lot} 
        bidAmount={Number(bidAmount)} 
        isMaxBid={isMaxBid} 
        onConfirm={submitBid} 
        loading={submitting} 
      />
    </main>
  );
}
