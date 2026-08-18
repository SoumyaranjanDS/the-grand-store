import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TrendingUp, Package, DollarSign, Activity, AlertCircle, ShoppingBag, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCartPrice } from '../../data';

export default function VendorDashboard() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/orders/vendor/sales', {
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
  const scriptFont = { fontFamily: "'Pinyon Script', cursive" };

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.vendorTotal, 0);
  const totalOrders = sales.length;
  const unitsSold = sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
  const netPayout = totalRevenue * 0.85; // 15% commission mock

  return (
    <div className="flex flex-col gap-10 w-full max-w-7xl mx-auto pb-10">
      
      {/* Welcome & Store Health Section */}
      <section className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1">
          <h1 className="text-[var(--color-ivory)] font-serif text-5xl mb-4 leading-tight">
            Welcome back, <br/>
            <span className={goldTextClass} style={scriptFont}>{user?.name?.split(' ')[0] || 'Partner'}</span>
          </h1>
          <p className="text-[var(--color-ivory-muted)] text-lg max-w-2xl font-light leading-relaxed">
            Here is your daily business summary. You have {totalOrders > 0 ? totalOrders : 'no'} pending orders to fulfill and your store health is looking excellent.
          </p>
        </div>

        {/* Gamified Store Health */}
        <div className="w-full lg:w-96 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-gold)]/5 rounded-full blur-3xl"></div>
          <h3 className="text-[var(--color-ivory)] font-serif text-xl mb-4 flex items-center justify-between">
            Store Health 
            <span className="text-[var(--color-gold)] text-2xl" style={scriptFont}>87%</span>
          </h3>
          
          <div className="w-full h-2 bg-black/50 rounded-full mb-6 overflow-hidden border border-white/5">
            <div className="h-full bg-gradient-to-r from-[#b58b38] to-[#e6c97a] w-[87%] shadow-[0_0_10px_rgba(212,175,55,0.8)]"></div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm text-[var(--color-ivory-muted)]">
              <AlertCircle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
              <span><strong className="text-[var(--color-ivory)]">Action required:</strong> Upload 3 more high-quality product photographs to reach 100%.</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-[var(--color-ivory-muted)]">
              <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
              <span>Banking & Compliance verified.</span>
            </div>
          </div>
          <Link to="/vendor/profile" className="mt-6 inline-block text-[10px] uppercase tracking-widest text-[var(--color-gold)] hover:text-white transition-colors font-bold">
            Improve My Store &rarr;
          </Link>
        </div>
      </section>

      {/* KPI Cards (Sales Intelligence) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Net Payout", value: formatCartPrice(netPayout), icon: DollarSign, trend: "+12.5%", positive: true },
          { title: "Revenue", value: formatCartPrice(totalRevenue), icon: TrendingUp, trend: "+15.2%", positive: true },
          { title: "Units Sold", value: unitsSold, icon: Package, trend: "+2.4%", positive: true },
          { title: "Total Orders", value: totalOrders, icon: ShoppingBag, trend: "+5.1%", positive: true },
        ].map((kpi, idx) => (
          <div key={idx} className="p-6 border-b border-white/10 group transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="text-[var(--color-ivory-muted)] text-[10px] uppercase tracking-widest font-semibold">{kpi.title}</div>
              <div className="p-2 rounded-lg bg-black/40 text-[var(--color-gold)] border border-white/[0.05]">
                <kpi.icon size={16} />
              </div>
            </div>
            <div className="text-3xl font-serif text-[var(--color-ivory)] mb-2 group-hover:text-[var(--color-gold)] transition-colors">{loading ? '...' : kpi.value}</div>
            <div className={`text-xs font-semibold ${kpi.positive ? 'text-green-500' : 'text-red-500'}`}>
              {kpi.trend} <span className="text-[var(--color-ivory-muted)] font-normal ml-1">vs last month</span>
            </div>
          </div>
        ))}
      </section>

      {/* AI Growth Recommendations & Top Products */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Growth Recommendations (Takes up 2 cols) */}
        <div className="lg:col-span-2 p-8 border-t border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-gold)]/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[var(--color-gold)]/20 text-[var(--color-gold)] rounded-lg border border-[var(--color-gold)]/30">
              <Lightbulb size={20} />
            </div>
            <h3 className="text-2xl font-serif text-[var(--color-ivory)]">Vendor Growth <span className="text-[var(--color-gold)]" style={scriptFont}>Insights</span></h3>
          </div>
          
          <div className="space-y-4">
            <div className="border-b border-white/5 py-5">
              <p className="text-[var(--color-ivory)] font-medium mb-2">High Traffic, Low Conversion</p>
              <p className="text-[var(--color-ivory-muted)] text-sm leading-relaxed mb-4">
                Your <strong>2022 Stellenbosch Cabernet Sauvignon</strong> has received 42 views this week but only 3 purchases. Consider adding tasting notes and food pairing information to increase buyer confidence.
              </p>
              <div className="flex gap-4">
                <button className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-gold)] hover:text-white transition-colors">Edit Product</button>
                <button className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-gold)] hover:text-white transition-colors">Run 10% Promo</button>
              </div>
            </div>
            <div className="border-b border-white/5 py-5">
              <p className="text-[var(--color-ivory)] font-medium mb-2">Trending Category</p>
              <p className="text-[var(--color-ivory-muted)] text-sm leading-relaxed mb-4">
                MCC is selling 34% faster than your other sparkling wines across the platform. You have 0 MCC items in stock.
              </p>
              <button className="text-[10px] uppercase tracking-widest font-bold text-[var(--color-gold)] hover:text-white transition-colors">Add MCC Product</button>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="p-8 border-t border-white/10">
          <h3 className="text-xl font-serif text-[var(--color-ivory)] mb-6">Top Performers</h3>
          <div className="space-y-6">
            {[
              { name: "Cabernet Sauvignon", sold: 31, trend: "up" },
              { name: "Shiraz Reserve", sold: 19, trend: "up" },
              { name: "Chenin Blanc", sold: 12, trend: "down" },
            ].map((prod, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div>
                  <p className="text-[var(--color-ivory)] font-medium font-serif text-lg">{prod.name}</p>
                  <p className="text-xs text-[var(--color-ivory-muted)] tracking-widest uppercase">{prod.sold} units sold</p>
                </div>
                <div className={`p-2 rounded-full ${prod.trend === 'up' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  <Activity size={16} />
                </div>
              </div>
            ))}
          </div>
          <Link to="/vendor/products" className="block mt-8 text-center text-[10px] uppercase tracking-widest text-[var(--color-ivory-muted)] hover:text-[var(--color-gold)] transition-colors">
            View All Products &rarr;
          </Link>
        </div>

      </section>

      {/* Recent Vendor Orders */}
      <section className="mt-2 border-t border-white/10 pt-8">
        <h3 className="text-2xl font-serif text-[var(--color-ivory)] mb-6 flex items-center gap-3">
          <div className="p-2 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-lg">
            <ShoppingBag size={20} />
          </div>
          Recent Sales
        </h3>
        
        {sales.length === 0 ? (
          <div className="text-center py-12 border border-white/5 rounded-2xl bg-white/[0.01]">
            <p className="text-[var(--color-ivory-muted)]">No sales recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white/[0.01] border border-white/5 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-[var(--color-ivory-muted)] bg-black/20">
                  <th className="py-4 font-semibold pl-6">Invoice</th>
                  <th className="py-4 font-semibold">Date</th>
                  <th className="py-4 font-semibold">Customer</th>
                  <th className="py-4 font-semibold">Purchased Items</th>
                  <th className="py-4 font-semibold text-right pr-6">Your Revenue</th>
                </tr>
              </thead>
              <tbody>
                {sales.slice(0, 10).map((sale) => (
                  <tr key={sale._id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                    <td className="py-4 pl-6 font-bold text-xs text-[var(--color-gold)]">{sale.invoiceNumber || sale._id}</td>
                    <td className="py-4 text-xs text-[var(--color-ivory-muted)]">
                      {new Date(sale.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-4 text-sm text-[var(--color-ivory)] font-serif">{sale.user?.name || 'Guest'}</td>
                    <td className="py-4 text-xs text-[var(--color-ivory-muted)]">
                      {sale.items.map((item, i) => (
                        <div key={i} className="mb-1">
                          <span className="text-white">{item.quantity}x</span> {item.name}
                        </div>
                      ))}
                    </td>
                    <td className="py-4 pr-6 text-right text-sm font-bold text-[var(--color-ivory)] font-serif tracking-wide">
                      {formatCartPrice(sale.vendorTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}

const CheckCircle2 = ({ className, size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);
