import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Settings, Save, RefreshCw, Percent, Truck, ShieldCheck, ShoppingBag } from "lucide-react";
import axios from "axios";

export default function AdminSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const goldText = "bg-gradient-to-r from-[#b58b38] via-[#e6c97a] to-[#b58b38] bg-clip-text text-transparent";
  const scriptFont = { fontFamily: "'Dancing Script', cursive" };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/settings/public`);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/settings`, settings, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
      alert("Failed to save settings. Make sure you are logged in as admin.");
    } finally {
      setSaving(false);
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

  const FeeRow = ({ label, field, note }) => (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1">{label}</label>
        {note && <p className="text-[10px] text-white/30 italic">{note}</p>}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          step="0.1"
          min="0"
          max="100"
          value={settings[field]}
          onChange={e => handleChange(field, e.target.value)}
          className="w-24 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono text-right focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
        />
        <span className="text-[var(--color-ivory-muted)] text-sm w-4">{field.endsWith("Fee") ? "R" : "%"}</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-12">
      <section>
        <h1 className="text-[var(--color-ivory)] font-serif text-4xl mb-3">
          Platform <span className={goldText} style={scriptFont}>Rates & Fees</span>
        </h1>
        <p className="text-[var(--color-ivory-muted)] text-sm">
          Set the global rates for taxes, shipping, and commissions. The calculators below show exactly how these rates affect payouts.
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
              <FeeRow label="Shipping Fee (ZAR)" field="shippingFee" note="Flat-rate delivery fee charged to customer" />
            </div>
          </div>

          <div className="bg-[#111] border border-white/10 rounded-xl p-6">
            <h2 className="text-white font-serif text-xl mb-6 border-b border-white/10 pb-4">Auction Fees</h2>
            <div className="space-y-6">
              <FeeRow label="Auction Commission" field="auctionCommissionPct" note="Deducted from the vendor's winning bid payout" />
              <FeeRow label="Buyer Premium" field="buyerPremiumPct" note="Extra charge paid by the winning buyer" />
              <FeeRow label="BAR Charge" field="barChargePct" note="Buyer Admin Reserve paid by buyer" />
            </div>
          </div>

          <div className="bg-[#111] border border-white/10 rounded-xl p-6">
            <h2 className="text-white font-serif text-xl mb-6 border-b border-white/10 pb-4">Other Fees</h2>
            <div className="space-y-6">
              <FeeRow label="Event Ticket Commission" field="eventCommissionPct" note="Deducted from event organizer payouts" />
              <FeeRow label="Payment Gateway Fee" field="gatewayFeePct" note="Internal cost tracking (not shown to customers)" />
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
                    <span>Product Subtotal:</span><span className="text-white">R{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping Fee:</span><span className="text-white">+ R{shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white border-t border-white/10 pt-3">
                    <span>CUSTOMER PAYS:</span><span>R{customerPays.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-white/10 my-4"></div>
                  
                  <div className="flex justify-between text-gray-400">
                    <span>Gross Product Sales:</span><span className="text-white">R{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>VAT Deducted ({settings.vatPct}%):</span><span className="text-yellow-500/80">- R{vat.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Marketplace Commission ({settings.marketplaceCommissionPct}%):</span><span className="text-red-400/80">- R{commission.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping Reimbursed:</span><span className="text-white">+ R{shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-green-400 border-t border-white/10 pt-3">
                    <span>VENDOR PAYOUT:</span><span>R{vendorGets.toFixed(2)}</span>
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
                    <span>Winning Bid:</span><span className="text-white">R{wb.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Buyer Premium ({settings.buyerPremiumPct}%):</span><span className="text-white">+ R{bp.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>BAR Charge ({settings.barChargePct}%):</span><span className="text-white">+ R{bar.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping:</span><span className="text-white">+ R{ship.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>VAT ({settings.vatPct}%):</span><span className="text-white">+ R{vat.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-white border-t border-white/10 pt-3">
                    <span>BUYER PAYS:</span><span>R{customerPays.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-white/10 my-4"></div>
                  
                  <div className="flex justify-between text-gray-400">
                    <span>Winning Bid:</span><span className="text-white">R{wb.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Auction Commission ({settings.auctionCommissionPct}%):</span><span className="text-red-400/80">- R{comm.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>VAT Deducted ({settings.vatPct}%):</span><span className="text-yellow-500/80">- R{vat.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-green-400 border-t border-white/10 pt-3">
                    <span>VENDOR PAYOUT:</span><span>R{vendorGets.toFixed(2)}</span>
                  </div>
                </div>
              );
            })()}
          </div>
          
        </div>
      </div>
    </div>
  );
}
