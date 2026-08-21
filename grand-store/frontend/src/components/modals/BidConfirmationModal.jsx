import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import Price from '../ui/Price';

export default function BidConfirmationModal({ isOpen, onClose, lot, bidAmount, isMaxBid, onConfirm, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#11100d] border border-[#c9a35b]/30 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-[#eee8dd]">Confirm Your Bid</h3>
          <button onClick={onClose} disabled={loading} className="text-[#918a7f] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <p className="text-sm text-[#918a7f] mb-1">You are bidding on:</p>
            <p className="font-semibold text-[#eee8dd]">{lot.title}</p>
            <p className="text-xs text-gold-gradient">Lot {lot.lotNumber}</p>
          </div>

          <div className="bg-[#0a0907] p-4 rounded-lg border border-white/5 mb-6 text-center">
            <p className="text-sm text-[#918a7f] mb-1">{isMaxBid ? 'Your Maximum Bid' : 'Your Bid'}</p>
            <p className="text-3xl font-bold text-[#eee8dd]"><Price amount={bidAmount.toLocaleString('en-ZA')} /></p>
          </div>

          <div className="flex items-start gap-3 bg-[#c9a35b]/10 text-gold-gradient p-4 rounded-lg text-sm mb-6">
            <ShieldCheck size={20} className="shrink-0 mt-0.5" />
            <p>
              By confirming, you agree to purchase this lot if you are the successful bidder. 
              {isMaxBid && " The system will automatically bid on your behalf up to your maximum amount."}
              <br /><br />
              <span className="text-[#eee8dd] font-medium text-[12px]">Please note: A Buyer's Premium (e.g. 5%), BAR charge (e.g. 2%), flat shipping fee, and VAT (15%) will be added to the final winning bid amount at checkout.</span>
              <br /><br />
              <strong>This is a legally binding contract.</strong>
            </p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={onClose} 
              disabled={loading}
              className="flex-1 py-3 text-[#eee8dd] bg-transparent border border-white/20 rounded-md hover:bg-white/5 font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm} 
              disabled={loading}
              className="flex-1 py-3 bg-gold-gradient text-black rounded-md hover:bg-[#e1bd70] font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Bid'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
