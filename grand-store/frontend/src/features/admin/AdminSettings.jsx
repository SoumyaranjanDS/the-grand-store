import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Settings, Save, RefreshCw, Percent, Truck, ShieldCheck, ShoppingBag, Users, Gift, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import api from '../../api';
import Price from '../../components/ui/Price';

export default function AdminSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState(null);

  const goldText = "text-[#c9a35b]";
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get(`/settings/public`);
        setSettings(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleTypeChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleBankChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      bankDetails: {
        ...(prev.bankDetails || {}),
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/settings`, settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
      alert("Failed to save settings. Make sure you are logged in as admin.");
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestBirthdayEmail = async () => {
    setTestEmailSending(true);
    setTestEmailResult(null);
    try {
      const res = await api.post('/auth/test-birthday-email');
      setTestEmailResult({ type: 'success', text: res.data.message || 'Test birthday email sent successfully!' });
      setTimeout(() => setTestEmailResult(null), 5000);
    } catch (err) {
      setTestEmailResult({ type: 'error', text: err.response?.data?.message || 'Failed to send test email. Check SMTP settings.' });
      setTimeout(() => setTestEmailResult(null), 7000);
    } finally {
      setTestEmailSending(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-gold-gradient animate-pulse">Loading settings...</div>;
  }

  const FeeCard = ({ icon: Icon, title, description, children }) => (
    <div className="p-6 bg-[#0a0a0a] border border-white/10 rounded-2xl space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-lg border border-[var(--color-gold)]/20">
          <Icon size={18} />
        </div>
        <div>
          <h3 className="text-[var(--color-ivory)] font-serif text-lg">{title}</h3>
          <p className="text-xs text-[var(--color-ivory-muted)]">{description}</p>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );

  const FeeRow = ({ label, field, note, isAmount = false }) => (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1">{label}</label>
        {note && <p className="text-[10px] text-white/30 italic">{note}</p>}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          step={isAmount ? "100" : "0.1"}
          min="0"
          max={isAmount ? undefined : "100"}
          value={settings[field] !== undefined ? settings[field] : ""}
          onChange={e => handleChange(field, e.target.value)}
          className="w-28 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono text-right focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
        />
        <span className="text-[var(--color-ivory-muted)] text-sm w-4">{isAmount || field.endsWith("Fee") ? "R" : "%"}</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-12">
      <section>
        <h1 className="text-[var(--color-ivory)] font-serif text-4xl mb-3">
          Platform <span className={goldText} >Rates & Fees</span>
        </h1>
        <p className="text-[var(--color-ivory-muted)] text-sm">
          Set the global rates for taxes, shipping, commissions, and refundable bidding deposits.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* SETTINGS FORM */}
        <div className="space-y-6">
          <div className="bg-[#111] border border-white/10 rounded-xl p-6">
            <h2 className="text-white font-serif text-xl mb-6 border-b border-white/10 pb-4">Standard Shop Fees</h2>
            <div className="space-y-6">
              <FeeRow label="VAT Rate" field="vatPct" note="Value Added Tax (Deducted from vendor)" />
              <FeeRow label="Marketplace Commission" field="marketplaceCommissionPct" note="The Grand Store's cut on shop product sales" />
              <FeeRow label="Shipping Fee (ZAR)" field="shippingFee" isAmount={true} note="Flat-rate delivery fee charged to customer" />
            </div>
          </div>

          <div className="bg-[#111] border border-white/10 rounded-xl p-6">
            <h2 className="text-white font-serif text-xl mb-6 border-b border-white/10 pb-4">Auction Fees & Bidding Deposits</h2>
            <div className="space-y-6">
              <FeeRow label="Auction Commission" field="auctionCommissionPct" note="Deducted from the vendor's winning bid payout" />
              <FeeRow label="Buyer Premium" field="buyerPremiumPct" note="Extra charge paid by the winning buyer" />
              <FeeRow label="BAR Charge" field="barChargePct" note="Buyer Admin Reserve paid by buyer" />
              <div className="pt-2 border-t border-white/5 space-y-6">
                <FeeRow 
                  label="Refundable Premium Deposit" 
                  field="auctionPremiumDepositAmount" 
                  isAmount={true} 
                  note="Security guarantee paid by 18+ buyers to unlock Premium VIP bidding limits (100% refundable to bank)" 
                />
                <FeeRow 
                  label="Standard Bidding Limit" 
                  field="auctionStandardBiddingLimit" 
                  isAmount={true} 
                  note="Default bidding ceiling for verified 18+ bidders without a deposit" 
                />
                <FeeRow 
                  label="Premium VIP Bidding Limit" 
                  field="auctionPremiumBiddingLimit" 
                  isAmount={true} 
                  note="High-value bidding ceiling unlocked upon deposit verification" 
                />
              </div>
            </div>
          </div>

          <div className="bg-[#111] border border-white/10 rounded-xl p-6">
            <h2 className="text-white font-serif text-xl mb-6 border-b border-white/10 pb-4">Other Fees</h2>
            <div className="space-y-6">
              <FeeRow label="Event Ticket Commission" field="eventCommissionPct" note="Deducted from event organizer payouts" />
              <FeeRow label="Payment Gateway Fee" field="gatewayFeePct" note="Internal cost tracking (not shown to customers)" />
            </div>
          </div>

          <div className="bg-[#111] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <h2 className="text-white font-serif text-xl flex items-center gap-2">
                <span>Vendor Maintenance & Platform Fees</span>
              </h2>
              <span className="text-xs uppercase tracking-widest text-[#c9a35b] font-mono bg-[#c9a35b]/10 px-2.5 py-1 rounded-full border border-[#c9a35b]/20">
                Monthly Billing
              </span>
            </div>
            <div className="space-y-6">
              <FeeRow 
                label="Monthly Maintenance Fee" 
                field="vendorMonthlyMaintenanceFee" 
                isAmount={true} 
                note="Recurring fee charged to active vendors every 30 days after registration fee" 
              />
              <FeeRow 
                label="Grace Period (Days)" 
                field="vendorMaintenanceGraceDays" 
                isAmount={true} 
                note="Number of days before an unpaid maintenance fee is flagged overdue" 
              />
            </div>
          </div>

          <div className="bg-[#111] border border-white/10 rounded-xl p-6">
            <h2 className="text-white font-serif text-xl mb-6 border-b border-white/10 pb-4">Refer & Earn System</h2>
            <div className="space-y-6">
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1">Referral Reward</label>
                  <p className="text-[10px] text-white/30 italic">Amount credited to the referrer when a friend completes their first order</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={settings.referralRewardAmount || 0}
                    onChange={e => handleChange('referralRewardAmount', e.target.value)}
                    className="w-24 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono text-right focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />
                  <div className="flex bg-black/50 border border-white/10 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => handleTypeChange('referralRewardType', 'fixed')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${settings.referralRewardType !== 'percentage' ? 'bg-[var(--color-gold)] text-black' : 'text-white/40 hover:text-white'}`}
                    >
                      ZAR
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange('referralRewardType', 'percentage')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${settings.referralRewardType === 'percentage' ? 'bg-[var(--color-gold)] text-black' : 'text-white/40 hover:text-white'}`}
                    >
                      %
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1">Welcome Discount</label>
                  <p className="text-[10px] text-white/30 italic">Amount discounted from the friend's first order</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={settings.referralWelcomeDiscount || 0}
                    onChange={e => handleChange('referralWelcomeDiscount', e.target.value)}
                    className="w-24 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono text-right focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />
                  <div className="flex bg-black/50 border border-white/10 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => handleTypeChange('referralWelcomeDiscountType', 'fixed')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${settings.referralWelcomeDiscountType !== 'percentage' ? 'bg-[var(--color-gold)] text-black' : 'text-white/40 hover:text-white'}`}
                    >
                      ZAR
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange('referralWelcomeDiscountType', 'percentage')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${settings.referralWelcomeDiscountType === 'percentage' ? 'bg-[var(--color-gold)] text-black' : 'text-white/40 hover:text-white'}`}
                    >
                      %
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* CUSTOMER BIRTHDAY AUTOMATION & PROMOTIONS */}
          <div className="bg-[#111] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <h2 className="text-white font-serif text-xl flex items-center gap-2">
                <Gift className="text-[var(--color-gold)]" size={22} /> Customer Birthday Automation
              </h2>
              <span className="text-xs uppercase tracking-widest text-[var(--color-gold)] font-mono bg-[var(--color-gold)]/10 px-2.5 py-1 rounded-full border border-[var(--color-gold)]/20">
                Daily 8:00 AM SMTP
              </span>
            </div>

            <div className="space-y-6">
              {/* Toggle 1: Birthday Greeting Email */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1">
                    Automated Birthday Greeting Emails
                  </label>
                  <p className="text-[10px] text-white/30 italic">
                    Automatically dispatch a prestigious birthday email to customers on their birthday
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange('birthdayEmailEnabled', settings.birthdayEmailEnabled === false ? true : false)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.birthdayEmailEnabled !== false ? 'bg-[#c9a35b]' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-black shadow transition duration-200 ease-in-out ${
                      settings.birthdayEmailEnabled !== false ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2: Promotional Discount / Voucher */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/5">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1">
                    Include Promotional Discount / Voucher
                  </label>
                  <p className="text-[10px] text-white/30 italic">
                    When enabled, email includes an exclusive discount code. If disabled, sends greeting only.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange('birthdayDiscountEnabled', settings.birthdayDiscountEnabled === false ? true : false)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.birthdayDiscountEnabled !== false ? 'bg-[#c9a35b]' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-black shadow transition duration-200 ease-in-out ${
                      settings.birthdayDiscountEnabled !== false ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {settings.birthdayDiscountEnabled !== false && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-white/5">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1">
                      Discount Percentage (%)
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={settings.birthdayDiscountPercent || 15}
                        onChange={e => handleChange('birthdayDiscountPercent', e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
                      />
                      <span className="ml-2 text-xs text-white/40 font-bold">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1">
                      Birthday Promo Code
                    </label>
                    <input
                      type="text"
                      value={settings.birthdayPromoCode || 'BDAY-LUXURY15'}
                      onChange={e => handleChange('birthdayPromoCode', e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono uppercase focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/5">
                <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1">
                  Custom Birthday Celebration Wish
                </label>
                <textarea
                  rows="2"
                  value={settings.birthdayCustomMessage || ''}
                  onChange={e => handleChange('birthdayCustomMessage', e.target.value)}
                  placeholder="To commemorate another distinguished year, we invite you to indulge in South Africa’s finest reserve vintages..."
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors placeholder:text-white/20 resize-none"
                />
              </div>

              {/* Test Email Dispatcher */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-white/50">
                  Preview email formatting with your current SMTP settings.
                </p>
                <button
                  type="button"
                  onClick={handleSendTestBirthdayEmail}
                  disabled={testEmailSending}
                  className="py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {testEmailSending ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                  Send Test Birthday Email
                </button>
              </div>

              {testEmailResult && (
                <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  testEmailResult.type === 'error' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                }`}>
                  {testEmailResult.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
                  <span>{testEmailResult.text}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#111] border border-white/10 rounded-xl p-6">
            <h2 className="text-white font-serif text-xl mb-6 border-b border-white/10 pb-4">Manual Bank Transfer Details</h2>
            <p className="text-[10px] text-white/30 italic mb-4">These details will be displayed to customers when they select "Bank Transfer" at checkout.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1">Bank Name</label>
                <input type="text" value={settings.bankDetails?.bankName || ''} onChange={e => handleBankChange('bankName', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1">Account Name</label>
                <input type="text" value={settings.bankDetails?.accountName || ''} onChange={e => handleBankChange('accountName', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1">Account Number</label>
                <input type="text" value={settings.bankDetails?.accountNumber || ''} onChange={e => handleBankChange('accountNumber', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1">Branch Code</label>
                <input type="text" value={settings.bankDetails?.branchCode || ''} onChange={e => handleBankChange('branchCode', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center gap-2 w-full py-4 bg-[#b58b38] hover:bg-[#c9a35b] text-black font-bold uppercase tracking-widest text-sm rounded-lg transition-colors disabled:opacity-60"
            >
              {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? "Saving Changes..." : "Save Settings"}
            </button>
          </div>
          {saved && <p className="text-green-400 text-center text-sm font-medium">Settings saved successfully!</p>}
        </div>

        {/* LIVE CALCULATORS */}
        <div className="space-y-6">
          
          {/* Shop Calculator */}
          <div className="bg-black/60 border border-[var(--color-gold)]/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-gold)]/5 rounded-full blur-3xl"></div>
            <h3 className="text-[var(--color-gold)] font-serif text-xl mb-6 flex items-center gap-2">
              <ShoppingBag size={20} /> Shop Purchase Example
            </h3>
            {(() => {
              const subtotal = 1000;
              const shipping = settings.shippingFee || 0;
              const vat = parseFloat(((subtotal * settings.vatPct) / 100).toFixed(2));
              const commission = parseFloat(((subtotal * settings.marketplaceCommissionPct) / 100).toFixed(2));
              const customerPays = subtotal + shipping;
              const vendorGets = subtotal - vat - commission + shipping;
              
              return (
                <div className="space-y-4 text-sm font-mono relative z-10">
                  <div className="flex justify-between text-gray-400">
                    <span>Product Subtotal:</span><span className="text-white"><Price amount={subtotal.toFixed(2)} /></span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping Fee:</span><span className="text-white">+ <Price amount={shipping.toFixed(2)} /></span>
                  </div>
                  <div className="flex justify-between font-bold text-white border-t border-white/10 pt-3">
                    <span>CUSTOMER PAYS:</span><span><Price amount={customerPays.toFixed(2)} /></span>
                  </div>
                  
                  <div className="border-t border-white/10 my-4"></div>
                  
                  <div className="flex justify-between text-gray-400">
                    <span>Gross Product Sales:</span><span className="text-white"><Price amount={subtotal.toFixed(2)} /></span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>VAT Deducted ({settings.vatPct}%):</span><span className="text-yellow-500/80">- <Price amount={vat.toFixed(2)} /></span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Marketplace Commission ({settings.marketplaceCommissionPct}%):</span><span className="text-red-400/80">- <Price amount={commission.toFixed(2)} /></span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping Reimbursed:</span><span className="text-white">+ <Price amount={shipping.toFixed(2)} /></span>
                  </div>
                  <div className="flex justify-between font-bold text-green-400 border-t border-white/10 pt-3">
                    <span>VENDOR PAYOUT:</span><span><Price amount={vendorGets.toFixed(2)} /></span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Auction Calculator */}
          <div className="bg-black/60 border border-[var(--color-gold)]/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-gold)]/5 rounded-full blur-3xl"></div>
            <h3 className="text-[var(--color-gold)] font-serif text-xl mb-6 flex items-center gap-2">
              <Settings size={20} /> Auction Example
            </h3>
            {(() => {
              const wb = 10000;
              const bp = parseFloat(((wb * settings.buyerPremiumPct) / 100).toFixed(2));
              const bar = parseFloat(((wb * settings.barChargePct) / 100).toFixed(2));
              const vat = parseFloat(((wb * settings.vatPct) / 100).toFixed(2));
              const ship = settings.shippingFee || 0;
              const customerPays = parseFloat((wb + bp + bar + ship + vat).toFixed(2));
              const comm = parseFloat(((wb * settings.auctionCommissionPct) / 100).toFixed(2));
              const vendorGets = parseFloat((wb - comm - vat).toFixed(2));
              
              return (
                <div className="space-y-4 text-sm font-mono relative z-10">
                  <div className="flex justify-between text-gray-400">
                    <span>Winning Bid:</span><span className="text-white"><Price amount={wb.toFixed(2)} /></span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Buyer Premium ({settings.buyerPremiumPct}%):</span><span className="text-white">+ <Price amount={bp.toFixed(2)} /></span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>BAR Charge ({settings.barChargePct}%):</span><span className="text-white">+ <Price amount={bar.toFixed(2)} /></span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping:</span><span className="text-white">+ <Price amount={ship.toFixed(2)} /></span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>VAT ({settings.vatPct}%):</span><span className="text-white">+ <Price amount={vat.toFixed(2)} /></span>
                  </div>
                  <div className="flex justify-between font-bold text-white border-t border-white/10 pt-3">
                    <span>BUYER PAYS:</span><span><Price amount={customerPays.toFixed(2)} /></span>
                  </div>
                  
                  <div className="border-t border-white/10 my-4"></div>
                  
                  <div className="flex justify-between text-gray-400">
                    <span>Winning Bid:</span><span className="text-white"><Price amount={wb.toFixed(2)} /></span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Auction Commission ({settings.auctionCommissionPct}%):</span><span className="text-red-400/80">- <Price amount={comm.toFixed(2)} /></span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>VAT Deducted ({settings.vatPct}%):</span><span className="text-yellow-500/80">- <Price amount={vat.toFixed(2)} /></span>
                  </div>
                  <div className="flex justify-between font-bold text-green-400 border-t border-white/10 pt-3">
                    <span>VENDOR PAYOUT:</span><span><Price amount={vendorGets.toFixed(2)} /></span>
                  </div>
                </div>
              );
            })()}
          </div>
          
          {/* Refer & Earn Calculator */}
          <div className="bg-black/60 border border-[var(--color-gold)]/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-gold)]/5 rounded-full blur-3xl"></div>
            <h3 className="text-[var(--color-gold)] font-serif text-xl mb-6 flex items-center gap-2">
              <Users size={20} /> Refer & Earn Example
            </h3>
            {(() => {
              const orderTotal = 1000;
              let welcomeDiscount = 0;
              if (settings.referralWelcomeDiscountType === 'percentage') {
                welcomeDiscount = (orderTotal * (settings.referralWelcomeDiscount || 0)) / 100;
              } else {
                welcomeDiscount = settings.referralWelcomeDiscount || 0;
              }
              const friendPays = Math.max(0, orderTotal - welcomeDiscount);
              
              let referrerGets = 0;
              if (settings.referralRewardType === 'percentage') {
                referrerGets = (orderTotal * (settings.referralRewardAmount || 0)) / 100;
              } else {
                referrerGets = settings.referralRewardAmount || 0;
              }
              
              return (
                <div className="space-y-4 text-sm font-mono relative z-10">
                  <div className="text-[10px] text-white/50 uppercase tracking-widest border-b border-white/10 pb-2 mb-2">Scenario 1: Friend's First Purchase</div>
                  <div className="flex justify-between text-gray-400">
                    <span>Friend's Order Total:</span><span className="text-white"><Price amount={orderTotal.toFixed(2)} /></span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Welcome Discount Applied:</span><span className="text-yellow-500/80">- <Price amount={welcomeDiscount.toFixed(2)} /></span>
                  </div>
                  <div className="flex justify-between font-bold text-white border-t border-white/10 pt-3">
                    <span>FRIEND PAYS:</span><span><Price amount={friendPays.toFixed(2)} /></span>
                  </div>
                  
                  <div className="border-t border-white/10 my-4"></div>
                  
                  <div className="text-[10px] text-white/50 uppercase tracking-widest border-b border-white/10 pb-2 mb-2">Scenario 2: Referrer's Reward</div>
                  <div className="flex justify-between text-gray-400">
                    <span>Referrer's Wallet Balance Increases By:</span><span className="text-green-400 font-bold">+ <Price amount={referrerGets.toFixed(2)} /></span>
                  </div>
                  <p className="text-xs text-white/40 mt-2 font-sans italic">
                    * The referrer can apply this <Price amount={referrerGets.toFixed(2)} /> balance as a discount at checkout on their next order.
                  </p>
                </div>
              );
            })()}
          </div>
          
        </div>
      </div>
    </div>
  );
}
