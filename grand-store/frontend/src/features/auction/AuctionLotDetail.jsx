import Price from '../../components/ui/Price';
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api';
import { ChevronLeft, ShieldCheck, Clock, History, AlertCircle, ArrowRight } from 'lucide-react';
import AuctionCountdown from './AuctionCountdown';
import BidConfirmationModal from '../../components/modals/BidConfirmationModal';

export default function AuctionLotDetail({ onNotify }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentStatus = searchParams.get('payment');
  const [lot, setLot] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [isMaxBid, setIsMaxBid] = useState(false);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [now, setNow] = useState(() => Date.now());

  const fetchLot = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const headers = {};
      if (userInfo && userInfo.token) {
         headers.Authorization = `Bearer ${userInfo.token}`;
      }

      const res = await api.get(`/auction/${id}`, { headers });
      setLot(res.data.lot);
      setBids(res.data.bids);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    
    fetchLot();
    const interval = setInterval(fetchLot, 5000);

    return () => {
      window.clearInterval(timer);
      clearInterval(interval);
    };
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading Lot...</div>;
  if (!lot) return <div className="min-h-screen flex items-center justify-center text-white">Lot not found</div>;

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const user = userInfo;

  const isWinner = user && lot.winner && (user._id === (typeof lot.winner === 'object' ? lot.winner._id : lot.winner));
  const isAdmin = user && user.role === 'admin';
  const isVendor = user && lot.vendor && (user._id === (typeof lot.vendor === 'object' ? lot.vendor._id : lot.vendor));
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
      const res = await api.post(`/auction/${id}/bid`, {
        amount: Number(bidAmount),
        isMaxBid
      });
      
      onNotify(res.data.message || 'Bid placed successfully!');
      await fetchLot(); // Instant UI update of both price and bids array
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

  const vendorName = lot.vendor ? (lot.vendor.storeName || lot.vendor.name) : 'The Grand Store';

  const currentUserId = user?._id;
  const isRestrictedRole = user?.role === 'admin' || user?.role === 'vendor_active';
  const isUpcoming = lot.status === 'upcoming';
  const targetTime = isUpcoming ? new Date(lot.startDate).getTime() : new Date(lot.endDate).getTime();

  return (
    <main className="min-h-screen bg-[#050505] text-[var(--color-ivory)] font-sans">
      
      {/* Top Navigation Bar */}
      <nav className="w-full border-b border-white/[0.05] bg-[#050505] sticky top-0 z-50 px-8 py-6 flex items-center justify-between">
        <Link to="/auction" className="inline-flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold text-[var(--color-ivory-muted)] hover:text-[var(--color-gold)] transition-colors group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Live Catalogue
        </Link>
        <div className="flex items-center gap-4">
           {isLive && !hasEnded && (
             <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-red-500">
               <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Live
             </span>
           )}
           <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-ivory-muted)] px-3 py-1 border border-white/10 rounded-full">
             Lot {lot.lotNumber}
           </span>
        </div>
      </nav>

      <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-80px)]">
        
        {/* Left Side: Immaculate Image Showcase */}
        <div className="w-full lg:w-1/2 lg:h-[calc(100vh-80px)] lg:sticky top-[80px] bg-[#0a0a0a] flex flex-col justify-center items-center p-12 lg:border-r border-white/[0.05]">
          <div className="w-full max-w-lg aspect-[3/4] flex items-center justify-center relative">
             <img 
               src={lot.images && lot.images[0] ? lot.images[0] : '/assets/auction/macallan-25.png'} 
               alt={lot.title} 
               className="max-h-[100%] max-w-[100%] object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.8)] mix-blend-lighten"
             />
          </div>
        </div>

        {/* Right Side: Structured Details & Bidding */}
        <div className="w-full lg:w-1/2 bg-[#050505]">
          <div className="max-w-2xl mx-auto px-8 lg:px-16 py-16 lg:py-24">
            
            {/* Header section */}
            <div className="mb-16">
              <p className="text-gold-gradient text-[10px] uppercase tracking-widest font-bold mb-6">{lot.category}</p>
              
              {paymentStatus === 'success' && (
                 <div className="mb-6 px-4 py-3 bg-green-900/30 border border-green-500/50 rounded-lg text-green-400 font-medium text-sm">
                    Payment completed successfully via PayFast.
                 </div>
              )}
              {paymentStatus === 'cancel' && (
                 <div className="mb-6 px-4 py-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 font-medium text-sm">
                    Payment was cancelled. You can retry payment below if you are the winner.
                 </div>
              )}

              <h1 className="text-4xl lg:text-6xl font-serif text-[var(--color-ivory)] leading-[1.1] mb-8 tracking-tight">{lot.title}</h1>
              <p className="text-[var(--color-ivory-muted)] text-lg font-light leading-relaxed">
                {lot.description}
              </p>
            </div>

            {/* Bidding Console */}
            <div className="mb-16">
               <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 border-b border-white/[0.05] pb-8">
                 <div>
                    <p className="text-[10px] uppercase tracking-widest text-[var(--color-ivory-muted)] mb-3 font-bold">Current Bid</p>
                    <div className="text-4xl md:text-5xl font-serif font-medium text-[var(--color-ivory)] mb-2">
                      <span className="text-xl text-[var(--color-ivory-muted)] mr-2 font-sans font-light">ZAR</span>
                      {lot.currentBid ? lot.currentBid.toLocaleString('en-ZA') : (lot.startingBid ? lot.startingBid.toLocaleString('en-ZA') : '0')}
                    </div>
                 </div>
                 <div className="text-left sm:text-right">
                    <p className="text-[10px] uppercase tracking-widest text-[var(--color-ivory-muted)] mb-3 font-bold">
                      {isUpcoming ? 'Bidding Opens In' : (hasEnded ? 'Auction Ended' : 'Time Remaining')}
                    </p>
                    <div className="text-2xl font-mono text-[var(--color-ivory)] font-light tracking-wider">
                      {hasEnded ? 'Closed' : <AuctionCountdown endTime={targetTime} now={now} />}
                    </div>
                 </div>
               </div>

               {isLive && !hasEnded ? (
                  isRestrictedRole ? (
                     <div className="border border-white/[0.05] p-6 flex items-center gap-4 text-[var(--color-ivory-muted)]">
                        <AlertCircle className="text-[var(--color-ivory-muted)] shrink-0" size={24} />
                        <p className="text-sm font-light leading-relaxed">Admins and Vendors cannot participate in bidding.</p>
                     </div>
                  ) : (
                  <form onSubmit={handleBidClick} className="flex flex-col gap-6">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                         <label className="text-[10px] uppercase tracking-widest text-[var(--color-ivory)] font-bold">Your Bid</label>
                         <span className="text-[10px] text-[var(--color-gold)] font-mono">Next Bid: ZA<Price amount={nextMinimum.toLocaleString('en-ZA')} /></span>
                      </div>
                      <div className="relative">
                         <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--color-ivory-muted)] font-serif text-lg">R</span>
                         <input 
                           type="number"
                           required
                           value={bidAmount}
                           onChange={(e) => setBidAmount(e.target.value)}
                           placeholder={nextMinimum.toLocaleString('en-ZA')}
                           min={nextMinimum}
                           step="1"
                           className="w-full bg-transparent border border-white/20 rounded-none py-5 pl-12 pr-6 text-xl font-mono text-[var(--color-ivory)] focus:outline-none focus:border-[var(--color-gold)] transition-colors placeholder-white/20"
                         />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                         <div className={`w-4 h-4 border flex items-center justify-center transition-colors ${isMaxBid ? 'bg-gold-gradient border-[var(--color-gold)]' : 'border-white/20 group-hover:border-white/40'}`}>
                           {isMaxBid && <div className="w-2 h-2 bg-black" />}
                         </div>
                         <input type="checkbox" className="hidden" checked={isMaxBid} onChange={(e) => setIsMaxBid(e.target.checked)} />
                         <span className="text-[10px] uppercase tracking-widest text-[var(--color-ivory-muted)] font-bold group-hover:text-white transition-colors">Place Max Auto-Bid</span>
                      </label>
                    </div>

                    <button 
                      type="submit"
                      disabled={submitting}
                      className="w-full mt-4 bg-gold-gradient text-black font-bold uppercase tracking-widest text-xs py-5 hover:brightness-110 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {submitting ? 'Processing...' : 'Submit Bid'} <ArrowRight size={14} />
                    </button>
                  </form>
                  )
               ) : isUpcoming ? (
                  <div className="border border-blue-500/20 bg-blue-500/5 p-6 flex flex-col items-center justify-center text-center text-blue-400 rounded-xl">
                     <Clock className="text-blue-400 mb-3" size={32} />
                     <p className="text-lg font-serif">Bidding will open when the auction starts.</p>
                     <p className="text-sm font-mono mt-2 tracking-wider"><AuctionCountdown endTime={targetTime} now={now} compact /></p>
                  </div>
               ) : (
                  <div className="flex flex-col gap-6">
                    {lot.status === 'sold' && isWinner ? (
                      <div className="border border-[var(--color-gold)] p-8 bg-[var(--color-gold)]/5">
                        <div className="flex items-center gap-3 mb-6">
                           <span className="text-2xl">🎉</span>
                           <h3 className="text-xl font-serif text-[var(--color-gold)]">CONGRATULATIONS</h3>
                        </div>
                        <p className="text-lg text-white mb-6">YOU WON LOT {lot.lotNumber || lot._id.slice(-6).toUpperCase()}</p>
                        
                        <div className="space-y-3 font-mono text-sm text-[var(--color-ivory-muted)] border-t border-b border-white/10 py-6 mb-6">
                          <div className="flex justify-between"><span>Winning Bid:</span> <span><Price amount={lot.winningBid.toLocaleString('en-ZA')} /></span></div>
                          <div className="flex justify-between"><span>Buyer Premium:</span> <span><Price amount={lot.buyerPremiumAmount.toLocaleString('en-ZA')} /></span></div>
                          <div className="flex justify-between"><span>BAR Charge:</span> <span><Price amount={lot.barChargeAmount.toLocaleString('en-ZA')} /></span></div>
                          <div className="flex justify-between"><span>VAT ({lot.vatPct}%):</span> <span><Price amount={lot.vatAmount.toLocaleString('en-ZA')} /></span></div>
                          <div className="flex justify-between"><span>Shipping:</span> <span>{lot.shippingCost ? `R ${lot.shippingCost.toLocaleString('en-ZA')}` : 'TBD at Checkout'}</span></div>
                        </div>

                        <div className="flex justify-between items-center text-[var(--color-ivory)] mb-8">
                           <span className="text-sm uppercase tracking-widest font-bold">Total Payable</span>
                           <span className="text-2xl font-serif"><Price amount={lot.totalPaidByBuyer.toLocaleString('en-ZA')} /></span>
                        </div>

                        {lot.paymentStatus === 'Paid' ? (
                          <div className="w-full bg-green-500/20 text-green-400 font-bold uppercase tracking-widest text-xs py-5 text-center border border-green-500/50">
                            Paid Successfully
                          </div>
                        ) : (
                          <Link to={`/auction/checkout/${lot._id}`} className="block w-full bg-gold-gradient text-black font-bold uppercase tracking-widest text-xs py-5 text-center hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all">
                            Complete Checkout Now
                          </Link>
                        )}
                      </div>
                    ) : lot.status === 'sold' && (isAdmin || isVendor) ? (
                      <div className="border border-white/10 p-8 bg-black/40">
                        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                           <h3 className="text-sm font-bold tracking-widest uppercase text-[var(--color-gold)]">
                             {isAdmin ? 'Admin View: Sold Lot' : 'Vendor View: Sold Lot'}
                           </h3>
                           <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-widest font-bold ${lot.paymentStatus === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                             {lot.paymentStatus === 'Paid' ? 'Paid' : 'Payment Pending'}
                           </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-mono text-[var(--color-ivory-muted)]">
                          <div>
                            <h4 className="text-[10px] uppercase tracking-widest text-white mb-2 font-sans font-bold">Financials</h4>
                            <div className="space-y-2">
                               <div className="flex justify-between"><span>Winning Bid:</span> <span><Price amount={lot.winningBid?.toLocaleString('en-ZA')} /></span></div>
                               {isAdmin && (
                                 <>
                                  <div className="flex justify-between"><span>Buyer Premium:</span> <span><Price amount={lot.buyerPremiumAmount?.toLocaleString('en-ZA')} /></span></div>
                                  <div className="flex justify-between"><span>BAR Charge:</span> <span><Price amount={lot.barChargeAmount?.toLocaleString('en-ZA')} /></span></div>
                                  <div className="flex justify-between"><span>Shipping:</span> <span><Price amount={lot.shippingCost?.toLocaleString('en-ZA')} /></span></div>
                                  <div className="flex justify-between"><span>Total Buyer Paid:</span> <span className="text-[var(--color-gold)]"><Price amount={lot.totalPaidByBuyer?.toLocaleString('en-ZA')} /></span></div>
                                 </>
                               )}
                               <div className="flex justify-between"><span>Commission ({lot.commissionPct}%):</span> <span className="text-red-400">- <Price amount={lot.commissionAmount?.toLocaleString('en-ZA')} /></span></div>
                               <div className="flex justify-between"><span>VAT:</span> <span className="text-red-400">- <Price amount={lot.vatAmount?.toLocaleString('en-ZA')} /></span></div>
                               <div className="flex justify-between border-t border-white/10 pt-2 mt-2 text-white font-bold">
                                  <span>Net Vendor Payout:</span> 
                                  <span className="text-yellow-400"><Price amount={lot.vendorPayable?.toLocaleString('en-ZA')} /></span>
                               </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-[10px] uppercase tracking-widest text-white mb-2 font-sans font-bold">Delivery Details</h4>
                            <p className="text-white font-sans">{typeof lot.winner === 'object' ? lot.winner.name : lot.winner}</p>
                            {typeof lot.winner === 'object' && <p className="mb-4">{lot.winner.email}</p>}
                            
                            {lot.paymentStatus === 'Paid' && lot.shippingAddress ? (
                               <div className="text-xs">
                                  <p>{lot.shippingAddress.address}</p>
                                  <p>{lot.shippingAddress.city}, {lot.shippingAddress.postalCode}</p>
                                  <p>{lot.shippingAddress.country}</p>
                               </div>
                            ) : (
                               <p className="text-xs italic text-yellow-400">
                                  {lot.paymentStatus === 'Paid' ? 'No shipping address provided.' : 'Waiting for buyer to complete checkout.'}
                               </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : lot.status === 'sold' ? (
                      <div className="border border-white/10 p-8 text-center bg-black/40">
                        <h3 className="text-lg font-serif text-white mb-2">Auction Closed</h3>
                        <p className="text-sm font-light">This lot has been sold. You were outbid or did not participate.</p>
                      </div>
                    ) : lot.status === 'unsold' ? (
                      <div className="border border-white/[0.05] p-6 flex flex-col gap-4 text-[var(--color-ivory-muted)] bg-white/[0.02]">
                        <h3 className="text-lg font-serif text-white mb-2">Auction Closed</h3>
                        <p className="text-sm font-light">This lot did not meet its reserve or received no bids. (Unsold)</p>
                      </div>
                    ) : (
                      <div className="border border-white/[0.05] p-6 flex items-center gap-4 text-[var(--color-ivory-muted)]">
                        <AlertCircle className="text-[var(--color-ivory-muted)] shrink-0" size={24} />
                        <p className="text-sm font-light leading-relaxed">This auction is currently <strong className="uppercase tracking-wider text-white text-xs">{lot.status}</strong>. Bidding is disabled.</p>
                      </div>
                    )}
                  </div>
               )}
            </div>

            {/* Structured Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.05] border border-white/[0.05] mb-16">
               <div className="bg-[#050505] p-8">
                 <p className="text-[10px] uppercase tracking-widest text-[var(--color-ivory-muted)] mb-3 font-bold">Condition</p>
                 <p className="text-sm font-light text-[var(--color-ivory)] leading-relaxed">{lot.condition || 'Verified'}</p>
               </div>
               <div className="bg-[#050505] p-8">
                 <p className="text-[10px] uppercase tracking-widest text-[var(--color-ivory-muted)] mb-3 font-bold">Provenance</p>
                 <p className="text-sm font-light text-[var(--color-ivory)] leading-relaxed">{lot.provenance || 'Verified'}</p>
               </div>
               <div className="col-span-1 md:col-span-2 bg-[#050505] p-8 flex items-center gap-4">
                 <ShieldCheck className="text-[var(--color-gold)]" size={24} />
                 <div>
                   <p className="text-[10px] uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1 font-bold">Offered By</p>
                   <p className="text-sm font-medium text-[var(--color-gold)]">{vendorName}</p>
                 </div>
               </div>
            </div>

            {/* Bid History */}
            <div>
               <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.05]">
                 <h3 className="font-serif text-2xl text-[var(--color-ivory)]">Bid History</h3>
                 <History className="text-[var(--color-ivory-muted)]" size={20} />
               </div>
               
               <div>
                 {bids.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {bids.map((bid, i) => (
                        <div key={bid._id} className="flex items-center justify-between py-4 border-b border-white/[0.02]">
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] text-[var(--color-ivory-muted)] font-mono w-6">#{bids.length - i}</span>
                            <span className="text-sm font-light text-[var(--color-ivory)]">{bid.bidder}</span>
                          </div>
                          <span className="font-mono text-sm text-[var(--color-ivory)]">ZA<Price amount={bid.amount.toLocaleString('en-ZA')} /></span>
                        </div>
                      ))}
                    </div>
                 ) : (
                    <div className="py-8 text-sm font-light text-[var(--color-ivory-muted)]">
                      No bids have been recorded. Be the first to acquire this lot.
                    </div>
                 )}
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
