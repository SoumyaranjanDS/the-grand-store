import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Settings, Save, RefreshCw, Percent, Truck, ShieldCheck } from "lucide-react";
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
    <div className="flex flex-col gap-10 w-full max-w-4xl mx-auto pb-10">
      <section>
        <h1 className="text-[var(--color-ivory)] font-serif text-5xl mb-4 leading-tight">
          Platform <span className={goldText} style={scriptFont}>Settings</span>
        </h1>
        <p className="text-[var(--color-ivory-muted)] text-lg font-light">
          Configure all platform fees and rates. Changes take effect immediately on new transactions.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FeeCard icon={Truck} title="Shipping" description="Flat-rate shipping fee per order">
          <FeeRow label="Shipping Fee (ZAR)" field="shippingFee" note="Charged to customer on checkout" />
        </FeeCard>

        <FeeCard icon={Percent} title="VAT" description="Value Added Tax charged on product subtotal">
          <FeeRow label="VAT Rate" field="vatPct" note="Applied on top of subtotal — deducted from vendor payable" />
        </FeeCard>

        <FeeCard icon={ShieldCheck} title="Marketplace Commission" description="Grand Store's cut on product sales">
          <FeeRow label="Commission %" field="marketplaceCommissionPct" note="Deducted from vendor payable on shop sales" />
        </FeeCard>

        <FeeCard icon={ShieldCheck} title="Event Commission" description="Grand Store's cut on event ticket sales">
          <FeeRow label="Commission %" field="eventCommissionPct" note="Deducted from organizer payable on bookings" />
        </FeeCard>

        <FeeCard icon={Settings} title="Auction Fees" description="All auction-related charges">
          <FeeRow label="Auction Commission %" field="auctionCommissionPct" note="Deducted from vendor payable (on winning bid)" />
          <FeeRow label="Buyer Premium %" field="buyerPremiumPct" note="Added ON TOP of winning bid — paid by buyer" />
          <FeeRow label="BAR Charge %" field="barChargePct" note="Buyer Administration Reserve — added on top, paid by buyer" />
        </FeeCard>

        <FeeCard icon={ShieldCheck} title="Payment Gateway" description="PayFast / gateway processing fee">
          <FeeRow label="Gateway Fee %" field="gatewayFeePct" note="For internal reconciliation only — not shown to customer" />
        </FeeCard>
      </div>

      {/* Preview */}
      <div className="p-6 bg-[#0a0a0a] border border-[var(--color-gold)]/20 rounded-2xl">
        <h3 className="text-[var(--color-ivory)] font-serif text-xl mb-4">Fee Preview — Auction Example</h3>
        <div className="space-y-2 text-sm font-mono">
          {(() => {
            const wb = 50000;
            const bp = parseFloat(((wb * settings.buyerPremiumPct) / 100).toFixed(2));
            const bar = parseFloat(((wb * settings.barChargePct) / 100).toFixed(2));
            const vat = parseFloat(((wb * settings.vatPct) / 100).toFixed(2));
            const ship = settings.shippingFee;
            const total = parseFloat((wb + bp + bar + ship + vat).toFixed(2));
            const comm = parseFloat(((wb * settings.auctionCommissionPct) / 100).toFixed(2));
            const vendorNet = parseFloat((wb - comm - vat).toFixed(2));
            return (
              <div className="grid grid-cols-2 gap-1">
                <span className="text-[var(--color-ivory-muted)]">Winning Bid:</span><span className="text-white text-right">R{wb.toLocaleString()}</span>
                <span className="text-[var(--color-ivory-muted)]">Buyer Premium ({settings.buyerPremiumPct}%):</span><span className="text-white text-right">+ R{bp.toLocaleString()}</span>
                <span className="text-[var(--color-ivory-muted)]">BAR Charge ({settings.barChargePct}%):</span><span className="text-white text-right">+ R{bar.toLocaleString()}</span>
                <span className="text-[var(--color-ivory-muted)]">Shipping:</span><span className="text-white text-right">+ R{ship.toLocaleString()}</span>
                <span className="text-[var(--color-ivory-muted)]">VAT ({settings.vatPct}%):</span><span className="text-white text-right">+ R{vat.toLocaleString()}</span>
                <span className="text-[var(--color-gold)] font-bold border-t border-white/10 pt-2">BUYER PAYS:</span><span className="text-[var(--color-gold)] font-bold border-t border-white/10 pt-2 text-right">R{total.toLocaleString()}</span>
                <span className="text-[var(--color-ivory-muted)] mt-2">Commission ({settings.auctionCommissionPct}%):</span><span className="text-red-400 text-right mt-2">- R{comm.toLocaleString()}</span>
                <span className="text-[var(--color-ivory-muted)]">VAT deducted:</span><span className="text-red-400 text-right">- R{vat.toLocaleString()}</span>
                <span className="text-green-400 font-bold border-t border-white/10 pt-2">VENDOR RECEIVES:</span><span className="text-green-400 font-bold border-t border-white/10 pt-2 text-right">R{vendorNet.toLocaleString()}</span>
              </div>
            );
          })()}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-4 bg-gold-gradient text-black font-bold uppercase tracking-widest text-xs rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-60"
        >
          {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving..." : "Save Settings"}
        </button>
        {saved && <span className="text-green-400 text-sm font-medium flex items-center gap-2"><ShieldCheck size={16} /> Settings saved successfully</span>}
      </div>
    </div>
  );
}
