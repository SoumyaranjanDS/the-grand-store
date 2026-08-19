import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { BarChart3, Filter, Download, TrendingUp, DollarSign, Users, AlertCircle, Search } from "lucide-react";
import axios from "axios";

const formatR = v => `R${Number(v || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const MODULE_LABELS = { SHP: "Shop", AUC: "Auction", EVT: "Events" };

export default function AdminFinancials({ hideHeader = false }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [auctionLots, setAuctionLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterModule, setFilterModule] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchRef, setSearchRef] = useState("");

  const goldText = "bg-gradient-to-r from-[#b58b38] via-[#e6c97a] to-[#b58b38] bg-clip-text text-transparent";
  const scriptFont = { fontFamily: "'Dancing Script', cursive" };

  // ... (useEffects and mapping logic remains exactly the same below)
  useEffect(() => {
    const headers = { Authorization: `Bearer ${user.token}` };
    const fetchAll = async () => {
      try {
        const [ordRes, bkgRes, aucRes] = await Promise.allSettled([
          axios.get(`${import.meta.env.VITE_API_URL}/api/orders/myorders`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/events/bookings/my-tickets`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/auction/admin/all`, { headers }),
        ]);
        if (ordRes.status === "fulfilled") setOrders(ordRes.value.data || []);
        if (bkgRes.status === "fulfilled") setBookings(bkgRes.value.data || []);
        if (aucRes.status === "fulfilled") setAuctionLots(aucRes.value.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  // Unify transactions
  const allTransactions = [
    ...orders.map(o => ({
      ref: o.invoiceNumber || o.transactionId || o._id,
      module: "SHP",
      type: "Sale",
      date: new Date(o.createdAt),
      customer: o.user?.name || "Customer",
      vendor: o.orderItems?.[0]?.vendorId || "—",
      grossSale: o.subTotal || o.totalPrice,
      commission: o.commissionAmount || 0,
      vat: o.vatAmount || 0,
      vendorPayable: o.vendorPayables?.[0]?.netPayable || 0,
      shipping: o.shippingCost || 0,
      total: o.totalPrice,
      status: o.paymentStatus || (o.isPaid ? "Paid" : "Pending"),
    })),
    ...bookings.map(b => ({
      ref: b.gsReference || b.ticketId,
      module: "EVT",
      type: "Event Booking",
      date: new Date(b.bookingDate),
      customer: b.user?.name || "Customer",
      vendor: b.vendor?.name || "Organizer",
      grossSale: b.subTotal || b.totalPrice,
      commission: b.commissionAmount || 0,
      vat: b.vatAmount || 0,
      vendorPayable: b.organizerPayable || 0,
      shipping: 0,
      total: b.totalPrice,
      status: b.paymentStatus || "Paid",
    })),
    ...auctionLots.filter(l => l.status === "sold").map(l => ({
      ref: l.gsReference || l._id,
      module: "AUC",
      type: "Auction Sale",
      date: new Date(l.updatedAt),
      customer: l.winner?.name || "Winner",
      vendor: l.vendor?.name || "Vendor",
      grossSale: l.winningBid,
      commission: l.commissionAmount || 0,
      vat: l.vatAmount || 0,
      vendorPayable: l.vendorPayable || 0,
      shipping: l.shippingCost || 0,
      total: l.totalPaidByBuyer,
      status: l.paymentStatus || "Paid",
    })),
  ].sort((a, b) => b.date - a.date);

  const filtered = allTransactions.filter(t => {
    if (filterModule !== "ALL" && t.module !== filterModule) return false;
    if (filterStatus !== "ALL" && t.status !== filterStatus) return false;
    if (searchRef && !t.ref?.toLowerCase().includes(searchRef.toLowerCase())) return false;
    return true;
  });

  const totalReceived = filtered.reduce((s, t) => s + (t.total || 0), 0);
  const totalCommission = filtered.reduce((s, t) => s + (t.commission || 0), 0);
  const totalVAT = filtered.reduce((s, t) => s + (t.vat || 0), 0);
  const totalVendorPayable = filtered.reduce((s, t) => s + (t.vendorPayable || 0), 0);
  const gsRevenue = totalCommission; // GS earns commission

  const statusColor = s => {
    if (s === "Paid" || s === "Settled") return "text-green-400 bg-green-500/10 border-green-500/20";
    if (s === "Pending") return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
    if (s === "Refunded") return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    if (s === "Failed" || s === "Disputed") return "text-red-400 bg-red-500/10 border-red-500/20";
    return "text-white/50 bg-white/5 border-white/10";
  };

  const moduleColor = m => {
    if (m === "SHP") return "text-blue-400 bg-blue-500/10";
    if (m === "AUC") return "text-purple-400 bg-purple-500/10";
    if (m === "EVT") return "text-amber-400 bg-amber-500/10";
    return "text-white/50 bg-white/5";
  };

  return (
    <div className={`flex flex-col gap-10 w-full max-w-7xl mx-auto ${hideHeader ? '' : 'pb-10'}`}>
      {!hideHeader && (
        <section>
          <h1 className="text-[var(--color-ivory)] font-serif text-5xl mb-4 leading-tight">
            Financial <span className={goldText} style={scriptFont}>Control Centre</span>
          </h1>
          <p className="text-[var(--color-ivory-muted)] text-lg font-light">
            Unified view of all transactions across Shop, Auctions and Events.
          </p>
        </section>
      )}

      {!hideHeader && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Received", value: formatR(totalReceived), icon: TrendingUp, color: "text-green-400" },
            { label: "GS Revenue (Commission)", value: formatR(gsRevenue), icon: DollarSign, color: "text-[var(--color-gold)]" },
            { label: "VAT Collected", value: formatR(totalVAT), icon: BarChart3, color: "text-blue-400" },
            { label: "Owed to Vendors", value: formatR(totalVendorPayable), icon: Users, color: "text-purple-400" },
          ].map((kpi, i) => (
            <div key={i} className="p-5 bg-[#0a0a0a] border border-white/10 rounded-2xl group hover:border-white/20 transition-all">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[var(--color-ivory-muted)] mb-3">
                <kpi.icon size={14} className={kpi.color} /> {kpi.label}
              </div>
              <div className={`text-2xl font-serif ${kpi.color}`}>{loading ? "..." : kpi.value}</div>
            </div>
          ))}
        </section>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2">
          <Search size={14} className="text-[var(--color-ivory-muted)]" />
          <input
            value={searchRef}
            onChange={e => setSearchRef(e.target.value)}
            placeholder="Search GS Reference..."
            className="bg-transparent text-sm text-white outline-none placeholder:text-white/30 w-44"
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "SHP", "AUC", "EVT"].map(m => (
            <button key={m} onClick={() => setFilterModule(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${filterModule === m ? "bg-[var(--color-gold)]/20 text-[var(--color-gold)] border border-[var(--color-gold)]/30" : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"}`}>
              {m === "ALL" ? "All" : MODULE_LABELS[m]}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {["ALL", "Paid", "Pending", "Refunded", "Failed"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${filterStatus === s ? "bg-[var(--color-gold)]/20 text-[var(--color-gold)] border border-[var(--color-gold)]/30" : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"}`}>
              {s}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-[var(--color-ivory-muted)]">{filtered.length} transactions</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-[#0a0a0a] border border-white/5 rounded-2xl">
        {loading ? (
          <div className="p-12 text-center text-[var(--color-ivory-muted)] animate-pulse">Loading transactions...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-4">
            <AlertCircle className="text-white/20" size={48} />
            <p className="text-[var(--color-ivory-muted)]">No transactions match your filters.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-[var(--color-ivory-muted)] bg-black/20">
                <th className="py-4 pl-6 font-semibold">Reference</th>
                <th className="py-4 font-semibold">Module</th>
                <th className="py-4 font-semibold">Date</th>
                <th className="py-4 font-semibold">Customer</th>
                <th className="py-4 font-semibold text-right">Sale</th>
                <th className="py-4 font-semibold text-right">Commission</th>
                <th className="py-4 font-semibold text-right">VAT</th>
                <th className="py-4 font-semibold text-right">Vendor Payable</th>
                <th className="py-4 font-semibold text-right">Total</th>
                <th className="py-4 pr-6 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 pl-6 font-bold text-xs text-[var(--color-gold)] font-mono">{t.ref}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${moduleColor(t.module)}`}>
                      {MODULE_LABELS[t.module] || t.module}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-[var(--color-ivory-muted)]">
                    {t.date.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="py-3 text-sm text-[var(--color-ivory)] font-serif">{t.customer}</td>
                  <td className="py-3 text-xs text-right text-[var(--color-ivory)]">{formatR(t.grossSale)}</td>
                  <td className="py-3 text-xs text-right text-[var(--color-gold)]">{formatR(t.commission)}</td>
                  <td className="py-3 text-xs text-right text-blue-400">{formatR(t.vat)}</td>
                  <td className="py-3 text-xs text-right text-green-400">{formatR(t.vendorPayable)}</td>
                  <td className="py-3 text-sm text-right font-bold text-[var(--color-ivory)] font-mono">{formatR(t.total)}</td>
                  <td className="py-3 pr-6">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-widest ${statusColor(t.status)}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* VAT Summary */}
      <div className="p-6 bg-[#0a0a0a] border border-[var(--color-gold)]/20 rounded-2xl">
        <h3 className="text-[var(--color-ivory)] font-serif text-xl mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-[var(--color-gold)]" /> VAT History Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-[var(--color-ivory-muted)] text-xs uppercase tracking-widest mb-1">Shop VAT Collected</p>
            <p className="text-2xl font-serif text-blue-400">{formatR(allTransactions.filter(t => t.module === "SHP").reduce((s, t) => s + t.vat, 0))}</p>
          </div>
          <div>
            <p className="text-[var(--color-ivory-muted)] text-xs uppercase tracking-widest mb-1">Event VAT Collected</p>
            <p className="text-2xl font-serif text-blue-400">{formatR(allTransactions.filter(t => t.module === "EVT").reduce((s, t) => s + t.vat, 0))}</p>
          </div>
          <div>
            <p className="text-[var(--color-ivory-muted)] text-xs uppercase tracking-widest mb-1">Auction VAT Collected</p>
            <p className="text-2xl font-serif text-blue-400">{formatR(allTransactions.filter(t => t.module === "AUC").reduce((s, t) => s + t.vat, 0))}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
