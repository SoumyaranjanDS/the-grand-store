import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ShieldCheck, AlertCircle, CheckCircle2, X, Crown, Sparkles, 
  Landmark, CreditCard, UploadCloud, Copy, Loader2, ArrowRight, Info, ExternalLink
} from 'lucide-react';
import api from '../../api';

export default function BidderVerificationModal({ isOpen, onClose, onSuccess, onNotify, bidderProfile }) {
  const isAlreadyVerified = Boolean(bidderProfile?.isVerified);

  const [dateOfBirth, setDateOfBirth] = useState('');
  const [idType, setIdType] = useState('National ID');
  const [idNumber, setIdNumber] = useState('');
  const [acceptRules, setAcceptRules] = useState(false);
  
  // Tier selection: 'normal' vs 'premium'
  const [tier, setTier] = useState(isAlreadyVerified ? 'premium' : 'normal');

  // Dynamic Settings from Admin
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Refund Bank Details (for Premium Tier)
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    branchCode: ''
  });

  // Deposit Payment Method & Proof
  const [depositPaymentMethod, setDepositPaymentMethod] = useState('payfast');
  const [depositProofUrl, setDepositProofUrl] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (isAlreadyVerified) {
      setTier('premium');
      setAcceptRules(true);
    }

    // Auto-fill KYC details if present on bidderProfile
    if (bidderProfile) {
      if (bidderProfile.dateOfBirth) {
        try {
          const dob = new Date(bidderProfile.dateOfBirth).toISOString().split('T')[0];
          setDateOfBirth(dob);
        } catch (e) {}
      }
      if (bidderProfile.idType) {
        setIdType(bidderProfile.idType);
      }
      if (bidderProfile.idNumber) {
        setIdNumber(bidderProfile.idNumber);
      }
      if (bidderProfile.bankAccountDetails) {
        setBankDetails(prev => ({
          bankName: bidderProfile.bankAccountDetails.bankName || prev.bankName || '',
          accountHolder: bidderProfile.bankAccountDetails.accountHolder || prev.accountHolder || '',
          accountNumber: bidderProfile.bankAccountDetails.accountNumber || prev.accountNumber || '',
          branchCode: bidderProfile.bankAccountDetails.branchCode || prev.branchCode || ''
        }));
      }
    }

    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings/public');
        setSettings(res.data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoadingSettings(false);
      }
    };

    // Auto-fetch saved customer bank details if not already loaded
    const fetchSavedBankDetails = async () => {
      try {
        const res = await api.get('/auth/banking');
        if (res.data?.bankAccountDetails?.accountNumber) {
          const b = res.data.bankAccountDetails;
          setBankDetails(prev => ({
            bankName: prev.bankName || b.bankName || '',
            accountHolder: prev.accountHolder || b.accountHolder || '',
            accountNumber: prev.accountNumber || b.accountNumber || '',
            branchCode: prev.branchCode || b.branchCode || ''
          }));
        }
      } catch (err) {
        // Silently ignore if not logged in or error
      }
    };

    fetchSettings();
    fetchSavedBankDetails();
  }, [isOpen, isAlreadyVerified, bidderProfile]);

  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const dynamicDepositAmount = settings?.auctionPremiumDepositAmount !== undefined 
    ? settings.auctionPremiumDepositAmount 
    : 5000;
  const standardLimit = settings?.auctionStandardBiddingLimit || 25000;
  const premiumLimit = settings?.auctionPremiumBiddingLimit || 250000;

  const handleBankChange = (field, value) => {
    setBankDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProof(true);
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await api.post('/vendor/upload-public', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDepositProofUrl(res.data.url);
      if (onNotify) onNotify('Deposit proof of payment uploaded successfully');
    } catch (err) {
      console.error('File upload error:', err);
      if (onNotify) onNotify(err.response?.data?.message || 'Failed to upload proof document');
    } finally {
      setUploadingProof(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // If already verified, handle the deposit upgrade directly
    if (isAlreadyVerified) {
      if (!bankDetails.bankName || !bankDetails.accountHolder || !bankDetails.accountNumber) {
        setError('Please provide your bank name, account holder, and account number for refundable deposit processing.');
        return;
      }
      if (depositPaymentMethod === 'eft' && !depositProofUrl) {
        setError('Please upload your EFT deposit payment receipt or screenshot.');
        return;
      }

      setSubmitting(true);
      try {
        const res = await api.post('/auction/bidder/deposit', {
          amount: dynamicDepositAmount,
          tier: 'premium',
          paymentMethod: depositPaymentMethod,
          proofOfPayment: depositProofUrl,
          bankAccountDetails: bankDetails
        });

        if (onNotify) onNotify(`Deposit submitted! Admin will verify and activate your R${premiumLimit.toLocaleString()} VIP limit.`);
        if (onSuccess) onSuccess({ bidderDepositStatus: 'pending', bidderDepositAmount: dynamicDepositAmount });
        onClose();
      } catch (err) {
        console.error('Deposit submission error:', err);
        setError(err.response?.data?.message || 'Deposit submission failed.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // New verification flow
    if (!dateOfBirth) {
      setError('Date of birth is required.');
      return;
    }

    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      setError('You must be at least 18 years of age to bid on alcohol auctions.');
      return;
    }

    if (!acceptRules) {
      setError('You must read and accept the Rules of Auction.');
      return;
    }

    if (tier === 'premium') {
      if (!bankDetails.bankName || !bankDetails.accountHolder || !bankDetails.accountNumber) {
        setError('Please provide your bank name, account holder, and account number for refundable deposit processing.');
        return;
      }
      if (depositPaymentMethod === 'eft' && !depositProofUrl) {
        setError('Please upload your EFT deposit payment receipt or screenshot.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await api.post('/auction/bidder/verify', {
        dateOfBirth,
        idType,
        idNumber,
        acceptRulesVersion: 'v1.0',
        tier,
        bankAccountDetails: tier === 'premium' ? bankDetails : undefined,
        depositPaymentMethod: tier === 'premium' ? depositPaymentMethod : undefined,
        depositProofUrl: tier === 'premium' ? depositProofUrl : undefined
      });

      if (onNotify) onNotify(res.data.message || 'Verification submitted for administrator approval.');
      if (onSuccess) onSuccess(res.data.bidder);
      onClose();
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.response?.data?.message || 'Verification failed. Please check your information.');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-start justify-center p-4 pt-20 sm:pt-28 pb-16 bg-black/90 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl my-auto bg-[#0c0c0c] border border-[var(--color-gold)]/30 rounded-3xl p-6 sm:p-10 text-[var(--color-ivory)] shadow-[0_25px_70px_rgba(0,0,0,0.95)]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors cursor-pointer p-1"
        >
          <X size={24} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30 flex items-center justify-center text-[var(--color-gold)] shrink-0">
            {isAlreadyVerified ? <Crown size={26} /> : <ShieldCheck size={26} />}
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-serif text-[var(--color-gold)]">
              {isAlreadyVerified ? 'Upgrade to Premium VIP Bidding' : 'Bidder Verification & Qualification'}
            </h3>
            <p className="text-xs sm:text-sm text-white/50 tracking-wider font-sans uppercase mt-0.5">
              {isAlreadyVerified 
                ? `Unlock High-Value & Reserve Bidding (Up to R${premiumLimit.toLocaleString()})`
                : 'South African CPA & 18+ Liquor Compliance'
              }
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-7">
          
          {/* Section 1: 18+ Age & Identity Verification */}
          {isAlreadyVerified ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-sm text-emerald-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span>18+ KYC Verified • Bidder Number: <strong className="text-white font-mono text-base">{bidderProfile.bidderNumber}</strong></span>
              </div>
              <span className="text-xs uppercase font-bold text-white/70 bg-emerald-500/20 px-3 py-1 rounded-lg">
                Current Limit: R{(bidderProfile.biddingLimit || 0).toLocaleString()}
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="text-xs uppercase tracking-widest text-white/50 font-bold flex items-center gap-1.5 border-b border-white/5 pb-2">
                <span>1. Mandatory 18+ KYC Identity</span>
              </h4>

              <div>
                <label className="block text-xs uppercase tracking-widest text-white/70 mb-1.5 font-bold">
                  Date of Birth <span className="text-[var(--color-gold)]">*</span> (Must be 18+)
                </label>
                <input 
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[var(--color-gold)] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/70 mb-1.5 font-bold">
                    ID Document Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'National ID', label: 'SA ID' },
                      { id: 'Passport', label: 'Passport' },
                      { id: 'Driver License', label: "License" }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setIdType(item.id)}
                        className={`py-2.5 px-2 text-center text-xs rounded-xl border transition-all cursor-pointer font-semibold ${
                          idType === item.id
                            ? 'bg-[var(--color-gold)]/20 border-[var(--color-gold)] text-[var(--color-gold)] shadow-[0_0_12px_rgba(212,175,55,0.2)]'
                            : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-white/70 mb-1.5 font-bold">
                    ID / Passport Number
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. 9204155029087"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[var(--color-gold)] transition-colors placeholder:text-white/20 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Tier Selection (Shown if not already verified) */}
          {!isAlreadyVerified && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs uppercase tracking-widest text-white/50 font-bold flex items-center justify-between border-b border-white/5 pb-2">
                <span>2. Select Your Bidding Tier</span>
                <span className="text-xs text-white/40 font-normal">Choose your bidding limit</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Option A: Normal / Standard Bidding */}
                <label 
                  className={`cursor-pointer rounded-2xl p-5 border transition-all flex flex-col justify-between relative ${
                    tier === 'normal'
                      ? 'bg-white/[0.05] border-white/40 ring-1 ring-white/20'
                      : 'bg-black/30 border-white/10 hover:border-white/20'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="biddingTier" 
                    value="normal" 
                    checked={tier === 'normal'} 
                    onChange={() => setTier('normal')} 
                    className="hidden" 
                  />
                  <div>
                    <div className="flex justify-between items-start mb-2.5">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-white/10 text-white/70">
                        Standard
                      </span>
                      <span className="text-sm font-bold text-white">Free (R0)</span>
                    </div>
                    <h5 className="text-base font-semibold text-white mb-1.5">Standard Bidding</h5>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Standard 18+ KYC verification. Access standard lots with bidding limit up to <strong>R{standardLimit.toLocaleString()}</strong>. No deposit required.
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
                    <span>Standard Lots</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${tier === 'normal' ? 'border-white bg-white' : 'border-white/30'}`}>
                      {tier === 'normal' && <div className="w-2 h-2 rounded-full bg-black"></div>}
                    </div>
                  </div>
                </label>

                {/* Option B: Premium VIP Bidding (Refundable Deposit) */}
                <label 
                  className={`cursor-pointer rounded-2xl p-5 border transition-all flex flex-col justify-between relative overflow-hidden ${
                    tier === 'premium'
                      ? 'bg-gradient-to-br from-[#c9a35b]/15 to-transparent border-[var(--color-gold)] ring-1 ring-[var(--color-gold)]/50 shadow-[0_0_25px_rgba(212,175,55,0.15)]'
                      : 'bg-black/30 border-white/10 hover:border-[var(--color-gold)]/40'
                  }`}
                >
                  <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                    <Crown size={70} />
                  </div>
                  <div>
                    <div className="flex justify-between items-start mb-2.5 relative z-10">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-[var(--color-gold)]/20 text-[var(--color-gold)] border border-[var(--color-gold)]/30 flex items-center gap-1">
                        <Sparkles size={11} /> VIP Tier
                      </span>
                      <span className="text-sm font-bold text-[var(--color-gold)] font-mono">
                        R{dynamicDepositAmount.toLocaleString()} Deposit
                      </span>
                    </div>
                    <h5 className="text-base font-semibold text-white mb-1.5 flex items-center gap-1.5">
                      Premium VIP Bidding
                    </h5>
                    <p className="text-xs text-white/65 leading-relaxed">
                      Unlocks reserve, rare & luxury lots with enhanced limit up to <strong>R{premiumLimit.toLocaleString()}+</strong>.
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-[var(--color-gold)] font-medium">
                    <span className="text-xs text-emerald-400 font-semibold">100% Refundable to Bank</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${tier === 'premium' ? 'border-[var(--color-gold)] bg-[var(--color-gold)]' : 'border-white/30'}`}>
                      {tier === 'premium' && <div className="w-2 h-2 rounded-full bg-black"></div>}
                    </div>
                  </div>
                </label>

              </div>
            </div>
          )}

          {/* Section 3: Premium Deposit Details & Refund Bank Account */}
          {(tier === 'premium' || isAlreadyVerified) && (
            <div className="space-y-6 p-6 sm:p-7 rounded-3xl bg-[#090909] border border-[var(--color-gold)]/30 animate-fadeIn">
              
              {/* Refundability Guarantee Banner */}
              <div className="flex items-start gap-3.5 text-sm text-amber-300/90 bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
                <Info size={20} className="shrink-0 mt-0.5 text-amber-400" />
                <p className="leading-relaxed">
                  <strong className="text-amber-200 font-semibold">100% Refundable Security Guarantee:</strong> The security deposit of <strong className="text-[var(--color-gold)] font-mono">R{dynamicDepositAmount.toLocaleString()}</strong> is held in a protected escrow trust account. It is 100% refundable back to your South African bank account if you do not win any lots or whenever you request it.
                </p>
              </div>

              {/* Refund Bank Details Inputs */}
              <div>
                <div className="mb-4">
                  <h5 className="text-sm font-bold text-white flex items-center gap-2">
                    <Landmark size={17} className="text-[var(--color-gold)]" /> Your Bank Account for Deposit Refund
                  </h5>
                  <p className="text-xs text-white/50 mt-1">
                    Please provide the South African bank account where your deposit will be returned upon auction conclusion.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5 font-semibold">
                      Bank Name <span className="text-[var(--color-gold)]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Standard Bank, FNB, ABSA, Capitec..."
                      value={bankDetails.bankName}
                      onChange={(e) => handleBankChange('bankName', e.target.value)}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[var(--color-gold)] transition-colors placeholder:text-white/25"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5 font-semibold">
                      Account Holder Name <span className="text-[var(--color-gold)]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Full name as on bank account"
                      value={bankDetails.accountHolder}
                      onChange={(e) => handleBankChange('accountHolder', e.target.value)}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[var(--color-gold)] transition-colors placeholder:text-white/25"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5 font-semibold">
                      Account Number <span className="text-[var(--color-gold)]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1012345678"
                      value={bankDetails.accountNumber}
                      onChange={(e) => handleBankChange('accountNumber', e.target.value)}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[var(--color-gold)] font-mono transition-colors placeholder:text-white/25"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-white/70 mb-1.5 font-semibold">
                      Branch Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 051001"
                      value={bankDetails.branchCode}
                      onChange={(e) => handleBankChange('branchCode', e.target.value)}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[var(--color-gold)] font-mono transition-colors placeholder:text-white/25"
                    />
                  </div>
                </div>
              </div>

              {/* Deposit Payment Method */}
              <div className="pt-3 border-t border-white/10">
                <div className="mb-4">
                  <h5 className="text-sm font-bold text-white flex items-center gap-2">
                    <CreditCard size={17} className="text-[var(--color-gold)]" /> Pay Refundable Deposit (R{dynamicDepositAmount.toLocaleString()})
                  </h5>
                  <p className="text-xs text-white/50 mt-0.5">
                    Select your preferred payment method to fund the refundable guarantee deposit.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5">
                  <label className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center gap-3.5 text-sm ${depositPaymentMethod === 'payfast' ? 'bg-[var(--color-gold)]/10 border-[var(--color-gold)] text-white shadow-[0_0_15px_rgba(212,175,55,0.15)]' : 'bg-black/30 border-white/10 text-white/60 hover:border-white/20'}`}>
                    <input 
                      type="radio" 
                      name="depositMethod" 
                      value="payfast" 
                      checked={depositPaymentMethod === 'payfast'} 
                      onChange={() => setDepositPaymentMethod('payfast')} 
                      className="hidden" 
                    />
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[var(--color-gold)] shrink-0">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-white">PayFast (Instant)</p>
                      <p className="text-xs text-white/50">Credit/Debit Card & Instant EFT</p>
                    </div>
                  </label>

                  <label className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center gap-3.5 text-sm ${depositPaymentMethod === 'eft' ? 'bg-[var(--color-gold)]/10 border-[var(--color-gold)] text-white shadow-[0_0_15px_rgba(212,175,55,0.15)]' : 'bg-black/30 border-white/10 text-white/60 hover:border-white/20'}`}>
                    <input 
                      type="radio" 
                      name="depositMethod" 
                      value="eft" 
                      checked={depositPaymentMethod === 'eft'} 
                      onChange={() => setDepositPaymentMethod('eft')} 
                      className="hidden" 
                    />
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[var(--color-gold)] shrink-0">
                      <Landmark size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-white">Manual Bank Transfer</p>
                      <p className="text-xs text-white/50">Direct EFT with payment proof</p>
                    </div>
                  </label>
                </div>

                {/* EFT Bank Details & Receipt Upload Container */}
                {depositPaymentMethod === 'eft' && (
                  <div className="space-y-5 p-5 sm:p-6 bg-gradient-to-br from-[#131313] to-[#080808] rounded-2xl border border-[var(--color-gold)]/25 shadow-xl animate-fadeIn">
                    
                    <div>
                      <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
                        <span className="text-xs uppercase tracking-widest text-[var(--color-gold)] font-bold flex items-center gap-2">
                          <Landmark size={16} /> Grand Store Escrow Bank Account
                        </span>
                        <span className="text-xs font-semibold text-white/80 bg-white/10 px-2.5 py-1 rounded-md">
                          Standard Bank
                        </span>
                      </div>

                      {/* 3 Prominent Copyable Data Tiles */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        
                        {/* Account Number */}
                        <div className="p-4 rounded-xl bg-black/70 border border-white/10 flex flex-col justify-between">
                          <span className="text-xs uppercase tracking-wider text-white/50 block mb-1">Account Number</span>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-base sm:text-lg font-bold text-white tracking-wider">0123456789</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText('0123456789');
                                if (onNotify) onNotify('Account number copied to clipboard');
                              }}
                              className="text-white/40 hover:text-[var(--color-gold)] transition-colors p-1.5 rounded hover:bg-white/5 cursor-pointer"
                              title="Copy Account Number"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Branch Code */}
                        <div className="p-4 rounded-xl bg-black/70 border border-white/10 flex flex-col justify-between">
                          <span className="text-xs uppercase tracking-wider text-white/50 block mb-1">Branch Code</span>
                          <span className="font-mono text-base sm:text-lg font-bold text-white tracking-wider">051001</span>
                        </div>

                        {/* Reference */}
                        <div className="p-4 rounded-xl bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/40 flex flex-col justify-between">
                          <span className="text-xs uppercase tracking-wider text-[var(--color-gold)]/80 block mb-1 font-semibold">Payment Reference</span>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-base sm:text-lg font-bold text-[var(--color-gold)] tracking-wider">DEP-VIP</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText('DEP-VIP');
                                if (onNotify) onNotify('Reference copied to clipboard');
                              }}
                              className="text-[var(--color-gold)] hover:text-white transition-colors p-1.5 rounded hover:bg-white/5 cursor-pointer"
                              title="Copy Reference"
                            >
                              <Copy size={16} />
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Upload Receipt Dropzone */}
                    <div className="pt-2">
                      <label className="block text-xs uppercase tracking-wider text-white/70 mb-2 font-bold">
                        Proof of Payment Screenshot or PDF <span className="text-[var(--color-gold)]">*</span>
                      </label>

                      {depositProofUrl ? (
                        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                              <CheckCircle2 size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-emerald-300">Payment Screenshot Attached</p>
                              <a
                                href={depositProofUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-emerald-400/80 hover:underline inline-flex items-center gap-1.5 mt-0.5"
                              >
                                View uploaded document <ExternalLink size={12} />
                              </a>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDepositProofUrl('')}
                            className="px-3.5 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold cursor-pointer transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col sm:flex-row items-center justify-center gap-4 p-6 sm:p-8 border-2 border-dashed border-white/20 hover:border-[var(--color-gold)] bg-black/40 rounded-2xl cursor-pointer transition-all group">
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={uploadingProof}
                          />
                          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--color-gold)] group-hover:scale-110 transition-transform shrink-0 shadow-lg">
                            {uploadingProof ? (
                              <Loader2 size={26} className="animate-spin text-[var(--color-gold)]" />
                            ) : (
                              <UploadCloud size={26} />
                            )}
                          </div>
                          <div className="text-center sm:text-left">
                            <p className="text-sm sm:text-base font-bold text-white group-hover:text-[var(--color-gold)] transition-colors">
                              {uploadingProof ? 'Uploading Receipt to Cloudinary...' : 'Click to Upload Deposit Screenshot or PDF'}
                            </p>
                            <p className="text-xs text-white/40 mt-1">
                              PNG, JPG, WebP or PDF receipt generated from your banking app
                            </p>
                          </div>
                        </label>
                      )}
                    </div>

                  </div>
                )}
              </div>

            </div>
          )}

          {/* Section 4: Rules Acceptance (Only for new registrations) */}
          {!isAlreadyVerified && (
            <div className="pt-2">
              <label className="flex items-start gap-3.5 cursor-pointer group">
                <input 
                  type="checkbox"
                  required
                  checked={acceptRules}
                  onChange={(e) => setAcceptRules(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded accent-[var(--color-gold)] cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-white/70 leading-relaxed font-light">
                  I warrant that I am at least 18 years of age and agree to the <strong className="text-[var(--color-gold)]">Grand Store Rules of Auction v1.0</strong>. Bids placed are legally binding under South African CPA regulations.
                </span>
              </label>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={submitting || uploadingProof}
              className="w-full bg-gold-gradient text-black py-4 rounded-2xl font-bold uppercase tracking-widest text-xs sm:text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer shadow-[0_0_25px_rgba(212,175,55,0.35)]"
            >
              {submitting ? (
                <><Loader2 size={18} className="animate-spin" /> Processing Application...</>
              ) : isAlreadyVerified ? (
                <>Submit VIP Upgrade (R{dynamicDepositAmount.toLocaleString()} Refundable Deposit) <Crown size={18} /></>
              ) : tier === 'premium' ? (
                <>Submit Premium VIP Application (R{dynamicDepositAmount.toLocaleString()} Deposit) <ArrowRight size={18} /></>
              ) : (
                <>Submit Standard 18+ Verification (Free) <CheckCircle2 size={18} /></>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>,
    document.body
  );
}
