import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Landmark, ShieldCheck, CheckCircle2, AlertCircle, Loader2, 
  Copy, Edit2, Save, X, Info, Crown, Sparkles, ArrowRight, Lock
} from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import BidderVerificationModal from '../../components/modals/BidderVerificationModal';

export default function CustomerBankDetails() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(null);
  const [settings, setSettings] = useState(null);
  
  // Bank Account State
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    branchCode: ''
  });

  // Bidder / Deposit info
  const [bidderProfile, setBidderProfile] = useState(null);
  const [vipModalOpen, setVipModalOpen] = useState(false);
  const [showFullAccount, setShowFullAccount] = useState(false);

  const fetchBankingData = async () => {
    try {
      const [bankRes, bidderRes, settingsRes] = await Promise.allSettled([
        api.get('/auth/banking'),
        api.get('/auction/bidder/status'),
        api.get('/settings/public')
      ]);

      if (settingsRes.status === 'fulfilled' && settingsRes.value.data) {
        setSettings(settingsRes.value.data);
      }

      if (bankRes.status === 'fulfilled' && bankRes.value.data?.bankAccountDetails) {
        const b = bankRes.value.data.bankAccountDetails;
        setBankDetails({
          bankName: b.bankName || '',
          accountHolder: b.accountHolder || '',
          accountNumber: b.accountNumber || '',
          branchCode: b.branchCode || ''
        });
        if (!b.accountNumber) {
          setIsEditing(true); // Open edit form if no bank account is saved yet
        }
      } else {
        setIsEditing(true);
      }

      if (bidderRes.status === 'fulfilled') {
        setBidderProfile(bidderRes.value.data);
      }
    } catch (err) {
      console.error('Error fetching bank details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankingData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!bankDetails.bankName || !bankDetails.accountHolder || !bankDetails.accountNumber) {
      setMessage({ type: 'error', text: 'Please fill in Bank Name, Account Holder Name, and Account Number.' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const res = await api.put('/auth/banking', bankDetails);
      setMessage({ type: 'success', text: res.data.message || 'Bank details saved successfully!' });
      setIsEditing(false);
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      console.error('Save bank details error:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save bank details.' });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: 'success', text: `${label} copied to clipboard!` });
    setTimeout(() => setMessage(null), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-[var(--color-gold)]">
        <Loader2 size={32} className="animate-spin" />
      </div>
    );
  }

  const hasSavedAccount = Boolean(bankDetails.accountNumber);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-10 pb-16 animate-fadeIn">
      
      {/* Page Header */}
      <section className="border-b border-white/10 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[var(--color-ivory)] font-serif text-3xl sm:text-4xl mb-2 flex items-center gap-3 tracking-wide">
              <Landmark className="text-[var(--color-gold)]" size={32} />
              Bank Details & Payouts
            </h1>
            <p className="text-[var(--color-ivory-muted)] text-sm font-light leading-relaxed">
              Your registered South African bank account for auction security deposit returns, order refunds, and escrow payouts.
            </p>
          </div>
          {hasSavedAccount && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <Edit2 size={14} /> Update Bank Details
            </button>
          )}
        </div>
      </section>

      {message && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-2.5 ${
          message.type === 'error' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
        }`}>
          {message.type === 'error' ? <AlertCircle size={18} className="shrink-0" /> : <CheckCircle2 size={18} className="shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* SECTION 1: ACTIVE BANK CARD DISPLAY */}
      {hasSavedAccount && !isEditing ? (
        <section className="space-y-6">
          {/* Luxury Card Mockup */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c1a16] via-[#12110f] to-[#080808] border border-[var(--color-gold)]/40 p-7 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-gold)]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-gold)]/15 border border-[var(--color-gold)]/30 flex items-center justify-center text-[var(--color-gold)]">
                  <Landmark size={24} />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif text-white font-medium">{bankDetails.bankName}</h3>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 size={12} /> Active Payout Account
                  </span>
                </div>
              </div>
              <span className="text-xs uppercase font-mono tracking-widest text-[var(--color-gold)] font-bold bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20 px-3 py-1 rounded-full">
                ZAR Account
              </span>
            </div>

            <div className="space-y-6 relative z-10">
              {/* Account Number Display */}
              <div>
                <span className="text-xs uppercase tracking-widest text-white/40 block mb-1.5 font-medium">Account Number</span>
                <div className="flex items-center gap-4">
                  <span className="text-2xl sm:text-3xl font-mono text-white tracking-widest font-bold">
                    {showFullAccount 
                      ? bankDetails.accountNumber 
                      : `•••• •••• ${bankDetails.accountNumber.slice(-4) || '••••'}`
                    }
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFullAccount(!showFullAccount)}
                    className="text-xs text-white/50 hover:text-[var(--color-gold)] transition-colors underline cursor-pointer"
                  >
                    {showFullAccount ? 'Hide' : 'Reveal'}
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(bankDetails.accountNumber, 'Account number')}
                    className="p-1.5 text-white/40 hover:text-[var(--color-gold)] transition-colors cursor-pointer"
                    title="Copy Account Number"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              {/* Account Holder & Branch Code Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/10">
                <div>
                  <span className="text-xs uppercase tracking-widest text-white/40 block mb-1 font-medium">Account Holder Name</span>
                  <span className="text-base sm:text-lg text-white font-medium">{bankDetails.accountHolder}</span>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-widest text-white/40 block mb-1 font-medium">Branch Code</span>
                  <span className="text-base sm:text-lg font-mono text-white font-medium">{bankDetails.branchCode || 'Default / Universal'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Refundable Escrow Trust Guarantee */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4 text-xs text-white/70 leading-relaxed">
            <Lock size={20} className="text-[var(--color-gold)] shrink-0 mt-0.5" />
            <div>
              <strong className="text-white font-medium block mb-0.5">Secure Escrow & Direct Deposit Return:</strong>
              When you participate in Grand Store auctions, any refundable bidder security deposit or overpayment is automatically returned directly to this bank account upon auction conclusion or your request.
            </div>
          </div>
        </section>
      ) : null}

      {/* SECTION 2: EDIT / ADD BANK ACCOUNT FORM */}
      {isEditing && (
        <section className="bg-[#11100e] border border-[var(--color-gold)]/30 rounded-3xl p-6 sm:p-9 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-xl font-serif text-[var(--color-gold)] font-medium">
                {hasSavedAccount ? 'Update Bank Account Details' : 'Add South African Bank Account'}
              </h2>
              <p className="text-xs text-white/50 mt-0.5">
                Ensure account holder name matches your legal 18+ identity for KYC compliance.
              </p>
            </div>
            {hasSavedAccount && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-white/40 hover:text-white transition-colors cursor-pointer p-1"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div>
                <label className="block text-xs uppercase tracking-wider text-white/70 mb-2 font-semibold">
                  Bank Name <span className="text-[var(--color-gold)]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard Bank, FNB, ABSA, Capitec, Nedbank..."
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[var(--color-gold)] transition-colors placeholder:text-white/25"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-white/70 mb-2 font-semibold">
                  Account Holder Name <span className="text-[var(--color-gold)]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Full name as registered with your bank"
                  value={bankDetails.accountHolder}
                  onChange={(e) => setBankDetails({...bankDetails, accountHolder: e.target.value})}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[var(--color-gold)] transition-colors placeholder:text-white/25"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-white/70 mb-2 font-semibold">
                  Account Number <span className="text-[var(--color-gold)]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1012345678"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[var(--color-gold)] font-mono transition-colors placeholder:text-white/25"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-white/70 mb-2 font-semibold">
                  Branch Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 051001"
                  value={bankDetails.branchCode}
                  onChange={(e) => setBankDetails({...bankDetails, branchCode: e.target.value})}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[var(--color-gold)] font-mono transition-colors placeholder:text-white/25"
                />
              </div>

            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <button
                type="submit"
                disabled={saving}
                className="py-3 px-6 bg-gold-gradient text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Bank Details
              </button>
              {hasSavedAccount && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="py-3 px-5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>
      )}

      {/* SECTION 3: AUCTION DEPOSIT ESCROW LINKAGE */}
      <section className="bg-gradient-to-br from-[#12110e] to-[#0a0a0a] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={20} className="text-[var(--color-gold)]" />
            <h4 className="text-base font-serif text-white font-medium">
              Auction Deposit Escrow Status
            </h4>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
            bidderProfile?.bidderDepositStatus === 'paid'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
              : bidderProfile?.bidderDepositStatus === 'pending'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
              : 'bg-white/5 text-white/50 border border-white/10'
          }`}>
            {bidderProfile?.bidderDepositStatus === 'paid' 
              ? 'Active VIP Deposit Held in Escrow' 
              : bidderProfile?.bidderDepositStatus === 'pending' 
              ? 'Deposit Payment Pending Review' 
              : 'No Active Deposit'
            }
          </span>
        </div>

        {(() => {
          const depositAmount = settings?.auctionPremiumDepositAmount !== undefined 
            ? settings.auctionPremiumDepositAmount 
            : 5000;
          const standardLimit = settings?.auctionStandardBiddingLimit || 25000;
          const premiumLimit = settings?.auctionPremiumBiddingLimit || 250000;

          return (
            <>
              <p className="text-xs text-white/60 leading-relaxed font-light">
                {bidderProfile?.bidderDepositStatus === 'paid' ? (
                  <>
                    Your refundable security deposit of <strong>R{(bidderProfile.bidderDepositAmount || depositAmount).toLocaleString()}</strong> is currently held in Grand Store's protected escrow account. This unlocks VIP reserve bidding up to <strong>R{(bidderProfile.biddingLimit || premiumLimit).toLocaleString()}+</strong>. Whenever you request a refund or auctions conclude, funds will be returned to your bank account above.
                  </>
                ) : (
                  <>
                    Standard bidders have a default bidding limit of R{standardLimit.toLocaleString()}. By placing an R{depositAmount.toLocaleString()} security deposit (100% refundable back to your bank account above), you unlock VIP bidding privileges up to R{premiumLimit.toLocaleString()}+.
                  </>
                )}
              </p>

              {bidderProfile?.bidderLevel !== 'level_3_enhanced' && bidderProfile?.bidderLevel !== 'level_4_vip' && (
                <div className="pt-2">
                  <button
                    onClick={() => navigate('/auction/vip-checkout')}
                    className="py-2.5 px-5 bg-gold-gradient text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:brightness-110 transition-all inline-flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                  >
                    <Crown size={14} /> Upgrade to VIP Bidding (R{depositAmount.toLocaleString()} Deposit) <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </>
          );
        })()}
      </section>

      {/* VIP Upgrade Modal */}
      <BidderVerificationModal
        isOpen={vipModalOpen}
        onClose={() => setVipModalOpen(false)}
        bidderProfile={bidderProfile}
        onSuccess={() => {
          fetchBankingData();
          setMessage({ type: 'success', text: 'VIP upgrade application submitted successfully!' });
        }}
      />

    </div>
  );
}
