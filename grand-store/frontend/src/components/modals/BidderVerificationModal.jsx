import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, X } from 'lucide-react';
import api from '../../api';

export default function BidderVerificationModal({ isOpen, onClose, onSuccess, onNotify }) {
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [idType, setIdType] = useState('National ID');
  const [idNumber, setIdNumber] = useState('');
  const [acceptRules, setAcceptRules] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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

    setSubmitting(true);
    try {
      const res = await api.post('/auction/bidder/verify', {
        dateOfBirth,
        idType,
        idNumber,
        acceptRulesVersion: 'v1.0'
      });

      if (onNotify) onNotify(res.data.message || 'Verification submitted! Pending administrator approval.');
      if (onSuccess) onSuccess(res.data.bidder);
      onClose();
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.response?.data?.message || 'Verification failed. Please check your information.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0c0c0c] border border-[var(--color-gold)]/30 rounded-2xl p-6 sm:p-8 text-[var(--color-ivory)] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30 flex items-center justify-center text-[var(--color-gold)]">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 className="text-xl font-serif text-[var(--color-gold)]">Bidder Verification & Qualification</h3>
            <p className="text-xs text-white/50 tracking-wider font-sans uppercase">South African CPA & 18+ Compliance</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs mb-6 space-y-1">
          <p className="font-semibold text-blue-100 flex items-center gap-1.5">
            <ShieldCheck size={14} /> Mandatory Administrator Review
          </p>
          <p className="text-blue-200/80 leading-relaxed">
            Per South African Liquor Act (18+) and Auction Rules, all new bidder registrations require administrative KYC review before bidding privileges and limits are activated.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-white/60 mb-1 font-bold">
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
              <label className="block text-[11px] uppercase tracking-widest text-white/60 mb-1 font-bold">
                ID Document Type
              </label>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[var(--color-gold)] transition-colors"
              >
                <option value="National ID">South African ID</option>
                <option value="Passport">International Passport</option>
                <option value="Driver License">Driver's License</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-widest text-white/60 mb-1 font-bold">
                ID / Passport Number
              </label>
              <input 
                type="text"
                required
                placeholder="e.g. 9204155029087"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[var(--color-gold)] transition-colors placeholder:text-white/20"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input 
                type="checkbox"
                required
                checked={acceptRules}
                onChange={(e) => setAcceptRules(e.target.checked)}
                className="mt-1 rounded accent-[var(--color-gold)]"
              />
              <span className="text-xs text-white/70 leading-relaxed font-light">
                I warrant that I am at least 18 years of age and agree to the <strong className="text-[var(--color-gold)]">Grand Store Rules of Auction v1.0</strong>. Bids are legally binding under South African CPA regulations.
              </span>
            </label>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gold-gradient text-black py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Submitting Application...' : 'Submit Verification for Admin Approval'}
              <CheckCircle2 size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
