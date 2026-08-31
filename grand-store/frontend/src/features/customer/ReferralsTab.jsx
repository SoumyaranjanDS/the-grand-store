import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Copy, Check, Users, Gift, Clock3 } from 'lucide-react';
import Price from '../../components/ui/Price';
import api from '../../api';

export default function ReferralsTab() {
  const { user, updateUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [summary, setSummary] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (user?._id) {
      setLoadingProfile(true);
      setLoadError('');
      api.get('/auth/referrals')
        .then((res) => {
          setSummary(res.data);
          updateUser({
            referralCode: res.data.referralCode,
            rewardBalance: res.data.rewardBalance,
            totalReferrals: res.data.successfulReferrals
          });
        })
        .catch((err) => {
          console.error('Failed to fetch referral details:', err);
          setLoadError(err.response?.data?.message || 'Unable to load your referral details.');
        })
        .finally(() => setLoadingProfile(false));
    }
  }, [user?._id]); // Refresh once per signed-in account, not from cached balances.

  const referralCode = summary?.referralCode || user?.referralCode || '';
  const referralLink = referralCode
    ? `${window.location.origin}/register?ref=${encodeURIComponent(referralCode)}`
    : '';

  const handleCopy = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setLoadError('Your browser blocked clipboard access. Select and copy the link manually.');
    }
  };

  if (!user) return null;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-12 pb-16">
      <section className="mb-4">
        <h1 className="text-[var(--color-ivory)] font-serif text-4xl mb-2 tracking-wide flex items-center gap-3">
          Refer & Earn <Gift className="text-[var(--color-gold)]" size={28} />
        </h1>
        <p className="text-[var(--color-ivory-muted)] text-md font-light">
          Share your referral link with friends. They get a welcome discount, and you get rewarded when they make their first purchase!
        </p>
      </section>

      <section>
        <div className="bg-[#111] border border-white/10 rounded-xl p-6 lg:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-gold)]/5 rounded-full blur-3xl"></div>
          
          <h2 className="text-xl text-[var(--color-ivory)] font-serif mb-6 border-b border-white/10 pb-2 relative z-10">
            Your Referral Link
          </h2>
          
          <div className="flex flex-col sm:flex-row items-stretch gap-4 relative z-10 mb-8">
            <div className="flex-1 bg-black/50 border border-white/20 rounded-lg px-4 py-3 flex items-center overflow-hidden">
              <span className="text-[var(--color-ivory-muted)] font-mono text-sm whitespace-nowrap overflow-x-auto select-all">
                {referralLink || (loadingProfile ? 'Loading your link…' : 'Referral link unavailable')}
              </span>
            </div>
            <button 
              onClick={handleCopy}
              disabled={!referralLink}
              className="flex items-center justify-center gap-2 bg-[var(--color-gold)] text-black px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-[#b58b38] transition-colors whitespace-nowrap"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>

          {loadError && <p className="mb-5 text-sm text-red-400 relative z-10">{loadError}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
            <div className="bg-black/60 border border-[var(--color-gold)]/30 p-6 rounded-xl text-center">
              <Users className="text-[var(--color-gold)] mx-auto mb-3" size={24} />
              <p className="text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1">Friends Joined</p>
              <p className="text-3xl font-serif text-white">{summary?.totalSignups ?? 0}</p>
            </div>
            <div className="bg-black/60 border border-[var(--color-gold)]/30 p-6 rounded-xl text-center">
              <Check className="text-green-400 mx-auto mb-3" size={24} />
              <p className="text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1">Successful</p>
              <p className="text-3xl font-serif text-white">{summary?.successfulReferrals ?? user.totalReferrals ?? 0}</p>
            </div>
            <div className="bg-black/60 border border-[var(--color-gold)]/30 p-6 rounded-xl text-center">
              <Gift className="text-[var(--color-gold)] mx-auto mb-3" size={24} />
              <p className="text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1">Reward Balance</p>
              <p className="text-3xl font-serif text-green-400">
                <Price amount={summary?.rewardBalance ?? user.rewardBalance ?? 0} />
              </p>
              <p className="text-[10px] text-white/40 mt-2">Available for your next purchase</p>
            </div>
          </div>
        </div>
      </section>

      {summary?.program && (
        <section className="bg-[#111] border border-white/10 rounded-xl p-6">
          <h2 className="text-xl text-[var(--color-ivory)] font-serif mb-4">Current Program</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-black/40 rounded-lg p-4">
              <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Your reward</p>
              <p className="text-white">
                {summary.program.rewardType === 'percentage'
                  ? `${summary.program.rewardAmount}% of the friend's first paid order`
                  : <><Price amount={summary.program.rewardAmount} /> after their first paid order</>}
              </p>
            </div>
            <div className="bg-black/40 rounded-lg p-4">
              <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Friend's welcome benefit</p>
              <p className="text-white">
                {summary.program.welcomeDiscountType === 'percentage'
                  ? `${summary.program.welcomeDiscount}% off their first qualifying order`
                  : <><Price amount={summary.program.welcomeDiscount} /> off their first qualifying order</>}
              </p>
            </div>
          </div>
        </section>
      )}

      {summary?.referrals?.length > 0 && (
        <section>
          <h2 className="text-xl text-[var(--color-ivory)] font-serif mb-5 border-b border-white/10 pb-2">Recent Referrals</h2>
          <div className="overflow-hidden border border-white/10 rounded-xl">
            {summary.referrals.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between gap-4 px-5 py-4 bg-[#111] border-b border-white/5 last:border-b-0">
                <div>
                  <p className="text-white text-sm">{referral.name}</p>
                  <p className="text-white/40 text-xs mt-1">Joined {new Date(referral.joinedAt).toLocaleDateString()}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${referral.status === 'successful' ? 'text-green-400' : 'text-amber-300'}`}>
                  {referral.status === 'successful' ? <Check size={14} /> : <Clock3 size={14} />}
                  {referral.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl text-[var(--color-ivory)] font-serif mb-6 border-b border-white/10 pb-2">
          How it Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)] flex items-center justify-center text-xl font-serif">1</div>
            <h3 className="text-white font-serif">Share Link</h3>
            <p className="text-sm text-[var(--color-ivory-muted)]">Send your unique referral link to friends and family.</p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)] flex items-center justify-center text-xl font-serif">2</div>
            <h3 className="text-white font-serif">They Sign Up</h3>
            <p className="text-sm text-[var(--color-ivory-muted)]">Your friends get a welcome discount automatically applied at checkout.</p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)] flex items-center justify-center text-xl font-serif">3</div>
            <h3 className="text-white font-serif">You Get Rewarded</h3>
            <p className="text-sm text-[var(--color-ivory-muted)]">Once their first order is paid, your reward balance is credited instantly!</p>
          </div>
        </div>
      </section>

    </div>
  );
}
