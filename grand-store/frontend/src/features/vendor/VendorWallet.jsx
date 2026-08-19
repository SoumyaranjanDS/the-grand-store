import React, { useEffect, useState } from 'react';
import { Wallet, ArrowDownRight, ArrowUpRight, CheckCircle2, History } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatCartPrice } from '../../data';

export default function VendorWallet() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/vendor/sales`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          setSales(data);
        }
      } catch (error) {
        console.error('Failed to fetch sales', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchSales();
    }
  }, [user]);

  const goldTextClass = "bg-gradient-to-r from-[#b58b38] via-[#e6c97a] to-[#b58b38] bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(230,201,122,0.6)]";
  const scriptFont = { fontFamily: "'Dancing Script', cursive" };

  const transactions = sales.map(sale => {
    const commission = sale.vendorTotal * 0.15;
    return {
      id: sale.invoiceNumber,
      date: new Date(sale.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      type: 'Order',
      value: sale.vendorTotal,
      commission: commission,
      net: sale.vendorTotal - commission,
      status: sale.isDelivered ? 'Completed' : 'Pending'
    };
  });

  const availableBalance = transactions.filter(t => t.status === 'Completed').reduce((sum, t) => sum + t.net, 0);
  const pendingBalance = transactions.filter(t => t.status === 'Pending').reduce((sum, t) => sum + t.net, 0);

  return (
    <div className="flex flex-col gap-10 w-full max-w-7xl mx-auto pb-10">
      
      {/* Header */}
      <section>
        <h1 className="text-[var(--color-ivory)] font-serif text-5xl mb-4 leading-tight">
          Vendor <span className={goldTextClass} style={scriptFont}>Wallet</span>
        </h1>
        <p className="text-[var(--color-ivory-muted)] text-lg max-w-2xl font-light leading-relaxed">
          Full financial transparency. Track your earnings, commissions, and upcoming payouts.
        </p>
      </section>

      {/* Balance Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 border-t border-[var(--color-gold)]/20 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--color-gold)]/10 rounded-full blur-3xl group-hover:bg-[var(--color-gold)]/20 transition-all"></div>
          <div className="flex items-center gap-3 mb-4 text-[var(--color-ivory-muted)] uppercase tracking-widest text-xs font-semibold">
            <Wallet size={16} className="text-gold-gradient" />
            Available Balance
          </div>
          <div className={`text-5xl font-serif ${goldTextClass}`}>
            {loading ? '...' : formatCartPrice(availableBalance)}
          </div>
          <div className="mt-6 flex justify-between items-center text-sm">
            <span className="text-[var(--color-ivory-muted)]">Next payout: 1st Sep</span>
            <button className="text-black bg-gold-gradient px-4 py-2 rounded-full font-bold uppercase tracking-widest text-[10px] hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all">
              Withdraw
            </button>
          </div>
        </div>

        <div className="p-8 border-t border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4 text-[var(--color-ivory-muted)] uppercase tracking-widest text-xs font-semibold">
              <History size={16} />
              Pending Balance
            </div>
            <div className="text-3xl font-serif text-[var(--color-ivory)]">{loading ? '...' : formatCartPrice(pendingBalance)}</div>
          </div>
          <p className="text-xs text-[var(--color-ivory-muted)] font-light mt-4">Orders currently in transit or awaiting customer confirmation.</p>
        </div>

        <div className="p-8 border-t border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4 text-[var(--color-ivory-muted)] uppercase tracking-widest text-xs font-semibold">
              <CheckCircle2 size={16} />
              Total Paid Out
            </div>
            <div className="text-3xl font-serif text-[var(--color-ivory)]">R 142,500</div>
          </div>
          <p className="text-xs text-[var(--color-ivory-muted)] font-light mt-4">Lifetime earnings transferred to your verified bank account.</p>
        </div>
      </section>

      {/* Transparent Commission Table */}
      <section className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 md:p-8 shadow-2xl mt-4">
        <div className="pb-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-serif text-[var(--color-ivory)] mb-1">Recent Transactions</h3>
            <p className="text-sm text-[var(--color-ivory-muted)] font-light">Detailed breakdown of sales and the 15% Grand Store commission.</p>
          </div>
        </div>
        
        <div className="overflow-x-auto mt-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 md:p-5 text-xs font-bold text-[var(--color-ivory-muted)] uppercase tracking-widest">Order ID / Date</th>
                <th className="p-4 md:p-5 text-xs font-bold text-[var(--color-ivory-muted)] uppercase tracking-widest">Order Value</th>
                <th className="p-4 md:p-5 text-xs font-bold text-red-400/80 uppercase tracking-widest">Commission (15%)</th>
                <th className="p-4 md:p-5 text-xs font-bold text-gold-gradient uppercase tracking-widest">Net Payout</th>
                <th className="p-4 md:p-5 text-xs font-bold text-[var(--color-ivory-muted)] uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((tx, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-5">
                    <div className="font-medium text-[var(--color-ivory)]">{tx.id}</div>
                    <div className="text-xs text-[var(--color-ivory-muted)] mt-1">{tx.date}</div>
                  </td>
                  <td className="p-5 text-[var(--color-ivory)] font-medium">R {tx.value.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
                  <td className="p-5 text-red-400/80 font-medium">-R {tx.commission.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
                  <td className="p-5 text-gold-gradient font-bold">R {tx.net.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
                  <td className="p-5 text-right">
                    {tx.status === 'Completed' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-green-500/10 text-green-500 border border-green-500/20">
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
