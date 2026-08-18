import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Gavel, PackageCheck, Heart, AlertCircle } from 'lucide-react';

export default function UserAuctionDashboard() {
  const [bids, setBids] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // We would normally fetch actual user bids/watchlist from an API here
    // For now, it's just a placeholder UI showing the structure
    setLoading(false);
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#e1bd70]">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0a0907] pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button onClick={() => navigate('/customer/profile')} className="inline-flex items-center gap-2 text-[#918a7f] hover:text-white transition-colors">
            <ChevronLeft size={16} /> Back to Profile
          </button>
        </div>

        <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-[#eee8dd] font-serif text-4xl font-medium tracking-tight mb-2 flex items-center gap-4">
              <Gavel className="text-purple-500" size={32} /> Auction Bids
            </h1>
            <p className="text-[#918a7f]">Track your active bids, watched lots, and auction wins.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Active Bids */}
          <div className="bg-[#11100d] border border-white/5 rounded-xl p-6">
            <h2 className="text-[#eee8dd] text-lg font-medium mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
              <Gavel size={18} className="text-[#c9a35b]" /> Active Bids
            </h2>
            {bids.length > 0 ? (
              <div className="space-y-4">
                {/* Map over actual active bids */}
              </div>
            ) : (
              <div className="text-center py-8 text-[#918a7f]">
                <p className="mb-4">You have no active bids.</p>
                <Link to="/auction" className="text-[#c9a35b] hover:text-white underline text-sm">Explore live auctions</Link>
              </div>
            )}
          </div>

          {/* Won Auctions */}
          <div className="bg-[#11100d] border border-white/5 rounded-xl p-6">
            <h2 className="text-[#eee8dd] text-lg font-medium mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
              <PackageCheck size={18} className="text-green-500" /> Won Lots
            </h2>
            <div className="text-center py-8 text-[#918a7f]">
               <p>No auction wins yet.</p>
            </div>
          </div>

          {/* Watchlist */}
          <div className="md:col-span-2 bg-[#11100d] border border-white/5 rounded-xl p-6">
            <h2 className="text-[#eee8dd] text-lg font-medium mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
              <Heart size={18} className="text-red-500" /> Auction Watchlist
            </h2>
            {watchlist.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Map over watchlist items */}
              </div>
            ) : (
              <div className="text-center py-8 text-[#918a7f]">
                <p>You haven't saved any upcoming lots.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
