import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Gavel, Crown, CheckCircle2, Clock, AlertCircle, 
  Sparkles, ArrowRight, RefreshCw, Landmark, ExternalLink
} from 'lucide-react';
import api from '../../api';
import BidderVerificationModal from '../modals/BidderVerificationModal';

export default function BidderKycCard({ onNotify }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchBidderStatus = async () => {
    try {
      const [statusRes, settingsRes] = await Promise.all([
        api.get('/auction/bidder/status').catch(() => ({ data: null })),
        api.get('/settings/public').catch(() => ({ data: null }))
      ]);
      if (statusRes?.data) setProfile(statusRes.data);
      if (settingsRes?.data) setSettings(settingsRes.data);
    } catch (err) {
      console.error('Error fetching bidder status or settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBidderStatus();
  }, []);

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-[#11100e] border border-white/5 animate-pulse flex items-center justify-between text-xs text-white/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5" />
          <div className="space-y-2">
            <div className="w-40 h-3 bg-white/10 rounded" />
            <div className="w-24 h-2 bg-white/5 rounded" />
          </div>
        </div>
        <div className="w-24 h-8 bg-white/5 rounded-xl" />
      </div>
    );
  }

  const isVerified = profile?.isVerified;
  const isPending = profile?.isPending;
  const isRejected = profile?.bidderApprovalStatus === 'rejected';
  const isUnregistered = !profile || profile.bidderApprovalStatus === 'unregistered';
  const isVip = profile?.bidderLevel === 'level_3_enhanced' || profile?.bidderLevel === 'level_4_vip';

  const depositAmount = settings?.auctionPremiumDepositAmount !== undefined 
    ? settings.auctionPremiumDepositAmount 
    : 5000;
  const standardLimit = settings?.auctionStandardBiddingLimit || 25000;
  const premiumLimit = settings?.auctionPremiumBiddingLimit || 250000;

  return (
    <section className="bg-[#11100e] border border-[#c9a35b]/30 rounded-2xl p-6 relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#c9a35b]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isVip 
              ? 'bg-[var(--color-gold)]/20 text-[var(--color-gold)] border border-[var(--color-gold)]/40' 
              : isVerified 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : isPending 
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
              : 'bg-white/5 text-white/60 border border-white/10'
          }`}>
            {isVip ? <Crown size={20} /> : <ShieldCheck size={20} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-serif text-white font-medium">
                18+ Auction Qualification & KYC
              </h3>
              {isVip && (
                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[var(--color-gold)]/20 text-[var(--color-gold)] border border-[var(--color-gold)]/30 flex items-center gap-1">
                  <Sparkles size={9} /> VIP Bidder
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--color-ivory-muted)] font-light">
              South African CPA & 18+ Liquor Compliance Verification
            </p>
          </div>
        </div>

        {/* Top Status Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isVerified && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <CheckCircle2 size={13} /> {isVip ? 'VIP Verified' : 'Standard Verified'}
            </span>
          )}
          {isPending && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
              <Clock size={13} /> Under Compliance Review
            </span>
          )}
          {isRejected && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1.5">
              <AlertCircle size={13} /> Application Rejected
            </span>
          )}
          {isUnregistered && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-white/50 border border-white/10">
              Not Verified (18+)
            </span>
          )}
        </div>
      </div>

      {/* STATE 1: UNREGISTERED */}
      {isUnregistered && (
        <div className="space-y-4">
          <p className="text-xs text-white/70 leading-relaxed font-light">
            Per South African Auction & Liquor laws, you must complete a fast 18+ age verification to bid in auctions. 
            Choose between <strong>Standard Bidding (Free, R{standardLimit.toLocaleString()} limit)</strong> or <strong>Premium VIP Bidding (R{depositAmount.toLocaleString()} refundable guarantee deposit, R{premiumLimit.toLocaleString()}+ limit)</strong>.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="py-2.5 px-5 bg-gold-gradient text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.25)]"
            >
              Verify 18+ & Unlock Bidding <ArrowRight size={14} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/auction/vip-checkout')}
              className="py-2.5 px-5 bg-white/5 hover:bg-white/10 text-[var(--color-gold)] font-bold uppercase tracking-wider text-xs rounded-xl border border-[var(--color-gold)]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Crown size={14} /> VIP Deposit Checkout (R{depositAmount.toLocaleString()})
            </button>
          </div>
        </div>
      )}

      {/* STATE 2: PENDING APPROVAL */}
      {isPending && (
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs text-amber-300/80 space-y-1.5">
          <p className="font-semibold text-amber-300 flex items-center gap-1.5">
            <Clock size={14} /> Application Under Administrator Review
          </p>
          <p className="leading-relaxed">
            Your 18+ KYC verification application has been submitted and is currently being reviewed by our compliance officers. 
            Your public Bidder Number is <strong className="text-white font-mono">{profile.bidderNumber}</strong>. 
            Bidding privileges will be activated once documents are confirmed.
          </p>
        </div>
      )}

      {/* STATE 3: REJECTED */}
      {isRejected && (
        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 text-xs text-red-300/80 space-y-3">
          <p className="font-semibold text-red-300 flex items-center gap-1.5">
            <AlertCircle size={14} /> Verification Application Rejected
          </p>
          <p className="leading-relaxed">
            {profile.bidderRejectionReason || 'Your submitted identification documents could not be validated.'}
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Re-apply for Verification
          </button>
        </div>
      )}

      {/* STATE 4: APPROVED BIDDER (STANDARD OR VIP) */}
      {isVerified && (
        <div className="space-y-5">
          {/* Active Credentials Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-black/40 p-3 rounded-xl border border-white/5">
              <span className="text-white/40 block text-[9px] uppercase tracking-wider mb-0.5">Bidder Number</span>
              <span className="text-white font-mono font-bold">{profile.bidderNumber}</span>
            </div>
            <div className="bg-black/40 p-3 rounded-xl border border-white/5">
              <span className="text-white/40 block text-[9px] uppercase tracking-wider mb-0.5">Tier Level</span>
              <span className="text-white font-semibold capitalize">
                {isVip ? 'VIP Enhanced' : 'Standard Verified'}
              </span>
            </div>
            <div className="bg-black/40 p-3 rounded-xl border border-white/5">
              <span className="text-white/40 block text-[9px] uppercase tracking-wider mb-0.5">Bidding Limit</span>
              <span className="text-[var(--color-gold)] font-mono font-bold">
                R{(profile.biddingLimit || standardLimit).toLocaleString()}
              </span>
            </div>
            <div className="bg-black/40 p-3 rounded-xl border border-white/5">
              <span className="text-white/40 block text-[9px] uppercase tracking-wider mb-0.5">Refundable Deposit</span>
              <span className={`font-semibold capitalize ${profile.bidderDepositStatus === 'paid' ? 'text-emerald-400' : profile.bidderDepositStatus === 'pending' ? 'text-amber-400' : 'text-white/40'}`}>
                {profile.bidderDepositStatus === 'paid' ? `R${(profile.bidderDepositAmount || depositAmount).toLocaleString()} (Paid)` : profile.bidderDepositStatus === 'pending' ? 'Awaiting Verification' : 'None Required'}
              </span>
            </div>
          </div>

          {/* UPGRADE CALLOUT BANNER (If currently Standard) */}
          {!isVip && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#c9a35b]/10 via-[#c9a35b]/5 to-transparent border border-[#c9a35b]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-gold)]">
                  <Crown size={14} /> Upgrade to Premium VIP Bidding
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed max-w-lg">
                  Want to bid on reserve, rare & high-value lots? Place an <strong>R{depositAmount.toLocaleString()} security guarantee deposit</strong> to unlock bidding limits up to <strong>R{premiumLimit.toLocaleString()}+</strong>. 
                  <span className="text-emerald-400 block sm:inline sm:ml-1">100% refundable back to your bank account upon request.</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/auction/vip-checkout')}
                className="py-2.5 px-5 rounded-xl bg-gold-gradient text-black font-bold uppercase tracking-wider text-[11px] hover:brightness-110 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-[0_0_12px_rgba(212,175,55,0.25)]"
              >
                <Crown size={13} /> Upgrade to VIP (R{depositAmount.toLocaleString()})
              </button>
            </div>
          )}

          {/* VIP CONFIRMATION NOTICE (If VIP) */}
          {isVip && (
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs text-white/60 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles size={14} className="text-[var(--color-gold)]" />
                <span>You have unlocked full high-value bidding reserves up to R{(profile.biddingLimit || premiumLimit).toLocaleString()} across all Grand Store live auctions.</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Escrow Protected
              </span>
            </div>
          )}
        </div>
      )}

      {/* Active Modal */}
      <BidderVerificationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        bidderProfile={profile}
        onSuccess={(updated) => {
          fetchBidderStatus();
          if (onNotify) {
            onNotify('Bidder application submitted successfully!');
          }
        }}
        onNotify={onNotify}
      />
    </section>
  );
}
