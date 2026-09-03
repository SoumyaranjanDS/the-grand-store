import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';
import { ChevronLeft, Gavel, PackageCheck, Heart, AlertCircle } from 'lucide-react';
import Price from '../../components/ui/Price';
import BidderKycCard from '../../components/auction/BidderKycCard';

export default function UserAuctionDashboard() {
  const [bids, setBids] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [wonLots, setWonLots] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const res = await api.get(`/auction/user/dashboard`, {
          headers: { Authorization: `Bearer ${userInfo?.token}` }
        });
        setBids(res.data.activeLots);
        setWonLots(res.data.wonLots);
        setWatchlist(res.data.watchlist);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#e1bd70]">Loading...</div>;
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 md:gap-12">

        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-[#eee8dd] font-serif text-4xl font-medium tracking-tight mb-2 flex items-center gap-4">
              <Gavel className="text-purple-500" size={32} /> Auction Bids
            </h1>
            <p className="text-[#918a7f]">Track your active bids, watched lots, and auction wins.</p>
          </div>
        </div>

        {/* 18+ Bidder Qualification & VIP Upgrade */}
        <BidderKycCard />

        <div className="grid md:grid-cols-2 gap-8">
          {/* Active Bids */}
          <div className="bg-[#11100d] border border-white/5 rounded-xl p-6">
            <h2 className="text-[#eee8dd] text-lg font-medium mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
              <Gavel size={18} className="text-gold-gradient" /> Active Bids
            </h2>
            {bids.length > 0 ? (
              <div className="space-y-4">
                {bids.map(lot => (
                  <div key={lot._id} className="flex justify-between items-center bg-black/40 p-4 rounded-lg border border-white/5">
                    <div>
                      <Link to={`/auction/${lot._id}`} className="text-white hover:text-gold-gradient transition-colors font-serif block">{lot.title}</Link>
                      <span className="text-xs text-[#918a7f]">Current Bid: <Price amount={lot.currentBid.toLocaleString('en-ZA')} /></span>
                    </div>
                    <Link to={`/auction/${lot._id}`} className="px-3 py-1 bg-gold-gradient text-black rounded text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform">
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#918a7f]">
                <p className="mb-4">You have no active bids.</p>
                <Link to="/auction" className="text-gold-gradient hover:text-white underline text-sm">Explore live auctions</Link>
              </div>
            )}
          </div>

          {/* Won Auctions */}
          <div className="bg-[#11100d] border border-white/5 rounded-xl p-6">
            <h2 className="text-[#eee8dd] text-lg font-medium mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
              <PackageCheck size={18} className="text-green-500" /> Won Lots
            </h2>
            {wonLots.length > 0 ? (
              <div className="space-y-4">
                {wonLots.map(lot => (
                  <div key={lot._id} className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-green-500/20 pb-4 mb-4">
                      <div>
                        <Link to={`/auction/${lot._id}`} className="text-white hover:text-green-400 transition-colors font-serif block text-lg mb-1">{lot.title}</Link>
                        <span className="text-[10px] text-green-300/70 uppercase tracking-widest block">
                          Lot {lot.lotNumber || lot._id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-widest font-bold ${lot.paymentStatus === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {lot.paymentStatus === 'Paid' ? 'Payment Completed' : 'Awaiting Payment'}
                        </span>
                        {lot.paymentStatus === 'Pending' && (
                          <Link to={`/auction/checkout/${lot._id}`} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black rounded text-[10px] font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                            Pay Now
                          </Link>
                        )}
                        <Link to={`/auction/${lot._id}`} className="px-4 py-2 border border-green-500/50 hover:bg-green-500/10 text-green-400 rounded text-[10px] font-bold uppercase tracking-widest transition-colors">
                          View Lot
                        </Link>
                      </div>
                    </div>

                    <div className="text-sm font-mono text-green-100/70 space-y-1">
                      <div className="flex justify-between"><span>Winning Bid:</span> <span><Price amount={lot.winningBid?.toLocaleString('en-ZA')} /></span></div>
                      {lot.paymentStatus === 'Paid' && (
                        <>
                          <div className="flex justify-between"><span>Buyer Premium:</span> <span><Price amount={lot.buyerPremiumAmount?.toLocaleString('en-ZA')} /></span></div>
                          <div className="flex justify-between"><span>BAR Charge:</span> <span><Price amount={lot.barChargeAmount?.toLocaleString('en-ZA')} /></span></div>
                          <div className="flex justify-between"><span>VAT:</span> <span><Price amount={lot.vatAmount?.toLocaleString('en-ZA')} /></span></div>
                          <div className="flex justify-between"><span>Shipping:</span> <span><Price amount={lot.shippingCost?.toLocaleString('en-ZA')} /></span></div>
                          <div className="flex justify-between border-t border-green-500/20 pt-2 mt-2 text-green-300 font-bold text-base">
                            <span>Total Paid:</span> <span><Price amount={lot.totalPaidByBuyer?.toLocaleString('en-ZA')} /></span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#918a7f]">
                 <p>No auction wins yet.</p>
              </div>
            )}
          </div>

          {/* Watchlist */}
          <div className="md:col-span-2 bg-[#11100d] border border-white/5 rounded-xl p-6">
            <h2 className="text-[#eee8dd] text-lg font-medium mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
              <Heart size={18} className="text-red-500" /> Auction Watchlist
            </h2>
            {watchlist.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {watchlist.map(lot => (
                  <Link key={lot._id} to={`/auction/${lot._id}`} className="block group">
                    <div className="bg-black/40 border border-white/5 rounded-lg overflow-hidden relative">
                      <div className="h-24 bg-[#1a1a1a] flex items-center justify-center p-2">
                         <img src={lot.images && lot.images[0] ? lot.images[0] : '/assets/auction/hibiki-17.jpeg'} alt={lot.title} className="max-h-full object-contain group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="p-3">
                        <h3 className="text-white text-xs font-serif line-clamp-1 group-hover:text-gold-gradient transition-colors">{lot.title}</h3>
                        <p className="text-[10px] text-[#918a7f] mt-1"><Price amount={(lot.currentBid || 0).toLocaleString('en-ZA')} /></p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#918a7f]">
                <p>You haven't saved any upcoming lots.</p>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
