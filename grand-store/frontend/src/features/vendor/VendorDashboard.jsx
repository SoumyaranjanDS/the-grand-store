import Price from '../../components/ui/Price';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TrendingUp, Package, DollarSign, Activity, AlertCircle, ShoppingBag, Lightbulb, Calendar, Gavel } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCartPrice } from '../../data';

export default function VendorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [lots, setLots] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resubmitLotId, setResubmitLotId] = useState(null);
  const [resubmitDates, setResubmitDates] = useState({ startDate: '', endDate: '' });
  const [expandedLot, setExpandedLot] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = { Authorization: `Bearer ${user.token}` };
        
        // Fetch Sales
        const salesRes = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/vendor/sales`, { headers });
        if (salesRes.ok) setSales(await salesRes.json());

        // Fetch Lots
        const lotsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/auction/vendor/lots`, { headers });
        if (lotsRes.ok) setLots(await lotsRes.json());

        // Fetch Wallet
        const walletRes = await fetch(`${import.meta.env.VITE_API_URL}/api/vendor/wallet`, { headers });
        if (walletRes.ok) {
          const data = await walletRes.json();
          setWallet(data.wallet);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleResubmit = async (lotId) => {
    try {
      const headers = { 
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'application/json'
      };
      
      const payload = {
        startDate: resubmitDates.startDate ? new Date(resubmitDates.startDate).toISOString() : new Date().toISOString(),
        endDate: resubmitDates.endDate ? new Date(resubmitDates.endDate).toISOString() : new Date(Date.now() + 7 * 86400000).toISOString()
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auction/${lotId}/resubmit`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setResubmitLotId(null);
        // Refresh lots
        const lotsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/auction/vendor/lots`, { headers: { Authorization: `Bearer ${user.token}` } });
        if (lotsRes.ok) setLots(await lotsRes.json());
      } else {
        alert("Failed to resubmit lot.");
      }
    } catch (err) {
      console.error(err);
      alert("Error resubmitting lot.");
    }
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.vendorTotal, 0);
  const totalOrders = sales.length;
  const unitsSold = sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
  const netPayout = wallet ? (wallet.availableBalance + wallet.pendingBalance) : 0;

  return (
    <div className="flex flex-col gap-10 w-full max-w-7xl mx-auto pb-10 font-sans">
      
      {/* Welcome & Store Health Section */}
      <section className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1">
          <h1 className="text-[var(--color-ivory)] font-serif text-[clamp(42px,5vw,64px)] font-medium tracking-[-0.035em] mb-4 leading-[1.02]">
            Welcome back, <br/>
            <span className="text-[#e1bd70]">{user?.name?.split(' ')[0] || 'Partner'}</span>
          </h1>
          <p className="text-[var(--color-ivory-muted)] text-lg max-w-2xl font-light leading-relaxed">
            Here is your daily business summary. You have {totalOrders > 0 ? totalOrders : 'no'} pending orders to fulfill and your store health is looking excellent.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => navigate('/vendor/event-add')}
              className="flex items-center gap-2 px-6 py-3 bg-[#11100d] border border-[#c9a35b]/30 hover:bg-[#c9a35b]/10 text-[#e1bd70] font-semibold rounded-lg transition-colors"
            >
              <Calendar size={20} /> Create Event
            </button>
            <button
              onClick={() => navigate('/vendor/product-add')}
              className="flex items-center gap-2 px-6 py-3 bg-[#11100d] border border-white/20 hover:bg-white/10 text-[var(--color-ivory)] font-semibold rounded-lg transition-colors"
            >
              <Package size={20} /> Add Product
            </button>
            <button
              onClick={() => navigate('/vendor/auction-submit')}
              className="flex items-center gap-2 px-6 py-3 bg-[#c9a35b] hover:bg-[#e1bd70] text-black font-semibold rounded-lg transition-colors"
            >
              <Package size={20} /> Add Auction Lot
            </button>
          </div>
        </div>

        {/* Gamified Store Health */}
        <div className="w-full lg:w-96 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-gold)]/5 rounded-full blur-3xl"></div>
          <h3 className="text-[var(--color-ivory)] font-serif text-xl mb-4 flex items-center justify-between">
            Store Health 
            <span className="text-[#e1bd70] font-serif text-2xl">87%</span>
          </h3>
          
          <div className="w-full h-2 bg-black/50 rounded-full mb-6 overflow-hidden border border-white/5">
            <div className="h-full bg-[#c9a35b] w-[87%]"></div>
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
          <Link to="/vendor/profile" className="mt-6 inline-block text-[10px] uppercase tracking-widest text-[#e1bd70] hover:text-white transition-colors font-bold">
            Improve My Store &rarr;
          </Link>
        </div>
      </section>

      {/* KPI Cards (Sales Intelligence) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Net Payout", value: <Price amount={netPayout} />, icon: DollarSign },
          { title: "Revenue", value: <Price amount={totalRevenue} />, icon: TrendingUp },
          { title: "Units Sold", value: unitsSold, icon: Package },
          { title: "Total Orders", value: totalOrders, icon: ShoppingBag },
        ].map((kpi, idx) => (
          <div key={idx} className="p-6 border-b border-white/10 group transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="text-[var(--color-ivory-muted)] text-[10px] uppercase tracking-widest font-semibold">{kpi.title}</div>
              <div className="p-2 rounded-lg bg-black/40 text-[#e1bd70] border border-white/[0.05]">
                <kpi.icon size={16} />
              </div>
            </div>
            <div className="text-3xl font-serif text-[var(--color-ivory)] mb-2 group-hover:text-[#e1bd70] transition-colors">{loading ? '...' : kpi.value}</div>
          </div>
        ))}
      </section>

      {/* AI Growth Recommendations & Top Products */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Growth Recommendations (Takes up 2 cols) */}
        <div className="lg:col-span-2 p-8 border-t border-white/10 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[var(--color-gold)]/20 text-[#e1bd70] rounded-lg border border-[var(--color-gold)]/30">
              <Lightbulb size={20} />
            </div>
            <h3 className="text-2xl font-serif font-medium tracking-[-0.02em] text-[var(--color-ivory)]">Vendor Growth <span className="text-[#e1bd70]">Insights</span></h3>
          </div>
          
          <div className="space-y-4">
            <div className="border-b border-white/5 py-5">
              <p className="text-[var(--color-ivory)] font-medium mb-2">High Traffic, Low Conversion</p>
              <p className="text-[var(--color-ivory-muted)] text-sm leading-relaxed mb-4">
                Your <strong>2022 Stellenbosch Cabernet Sauvignon</strong> has received 42 views this week but only 3 purchases. Consider adding tasting notes and food pairing information to increase buyer confidence.
              </p>
              <div className="flex gap-4">
                <button className="text-[10px] uppercase tracking-widest font-bold text-[#e1bd70] hover:text-white transition-colors">Edit Product</button>
                <button className="text-[10px] uppercase tracking-widest font-bold text-[#e1bd70] hover:text-white transition-colors">Run 10% Promo</button>
              </div>
            </div>
            <div className="border-b border-white/5 py-5">
              <p className="text-[var(--color-ivory)] font-medium mb-2">Trending Category</p>
              <p className="text-[var(--color-ivory-muted)] text-sm leading-relaxed mb-4">
                MCC is selling 34% faster than your other sparkling wines across the platform. You have 0 MCC items in stock.
              </p>
              <button className="text-[10px] uppercase tracking-widest font-bold text-[#e1bd70] hover:text-white transition-colors">Add MCC Product</button>
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
          <Link to="/vendor/products" className="block mt-8 text-center text-[10px] uppercase tracking-widest text-[var(--color-ivory-muted)] hover:text-[#e1bd70] transition-colors">
            View All Products &rarr;
          </Link>
        </div>

      </section>

      {/* Recent Vendor Orders */}
      <section className="mt-2 border-t border-white/10 pt-8">
        <h3 className="text-2xl font-serif text-[var(--color-ivory)] mb-6 flex items-center gap-3">
          <div className="p-2 bg-[var(--color-gold)]/10 text-[#e1bd70] rounded-lg">
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
                    <td className="py-4 pl-6 font-bold text-xs text-[#e1bd70]">{sale.invoiceNumber || sale._id}</td>
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
                      <Price amount={sale.vendorTotal} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Vendor Auction Lots */}
      <section className="mt-2 border-t border-white/10 pt-8">
        <h3 className="text-2xl font-serif text-[var(--color-ivory)] mb-6 flex items-center gap-3">
          <div className="p-2 bg-[var(--color-gold)]/10 text-[#e1bd70] rounded-lg">
            <Gavel size={20} />
          </div>
          My Auction Lots
        </h3>
        
        {lots.length === 0 ? (
          <div className="text-center py-12 border border-white/5 rounded-2xl bg-white/[0.01]">
            <p className="text-[var(--color-ivory-muted)]">No auction lots submitted yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white/[0.01] border border-white/5 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-[var(--color-ivory-muted)] bg-black/20">
                  <th className="py-4 font-semibold pl-6">Lot Title</th>
                  <th className="py-4 font-semibold">Status</th>
                  <th className="py-4 font-semibold">Start / End</th>
                  <th className="py-4 font-semibold">Current/Winning Bid</th>
                  <th className="py-4 font-semibold pr-6">Action</th>
                </tr>
              </thead>
              <tbody>
                {lots.map((lot) => (
                  <React.Fragment key={lot._id}>
                    <tr className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                      <td className="py-4 pl-6 font-serif text-sm text-[var(--color-ivory)]">
                        <Link to={`/auction/${lot._id}`} className="hover:text-[#e1bd70] transition-colors">
                          {lot.title}
                        </Link>
                      </td>
                      <td className="py-4 text-xs font-bold uppercase tracking-widest text-[var(--color-gold)]">
                        {lot.status.replace('_', ' ')}
                        {lot.status === 'sold' && (
                          <span className={`ml-2 px-1.5 py-0.5 rounded text-[8px] ${lot.paymentStatus === 'Paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {lot.paymentStatus || 'Pending'}
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-xs text-[var(--color-ivory-muted)]">
                        <div className="mb-1 text-white">Start: {new Date(lot.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                        <div>End: {new Date(lot.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="py-4 text-sm font-bold text-[var(--color-ivory)] font-serif">
                        <Price amount={(lot.winningBid || lot.currentBid || 0).toLocaleString('en-ZA')} />
                      </td>
                      <td className="py-4 pr-6 text-sm flex items-center gap-2">
                        {(lot.status === 'unsold' || lot.status === 'closed') && (
                          resubmitLotId === lot._id ? (
                            <div className="flex flex-col gap-2">
                              <input type="datetime-local" className="text-xs p-1 bg-black/50 border border-white/20 text-white rounded" onChange={e => setResubmitDates({...resubmitDates, startDate: e.target.value})} placeholder="Start Date" />
                              <input type="datetime-local" className="text-xs p-1 bg-black/50 border border-white/20 text-white rounded" onChange={e => setResubmitDates({...resubmitDates, endDate: e.target.value})} placeholder="End Date" />
                              <div className="flex gap-2">
                                <button onClick={() => handleResubmit(lot._id)} className="text-[10px] bg-[#c9a35b] hover:bg-[#e1bd70] text-black px-2 py-1 rounded font-bold uppercase tracking-widest transition-colors">Save</button>
                                <button onClick={() => setResubmitLotId(null)} className="text-[10px] border border-white/20 text-white px-2 py-1 rounded hover:bg-white/10 transition-colors uppercase tracking-widest">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => setResubmitLotId(lot._id)} className="text-[10px] border border-[var(--color-gold)] text-[#e1bd70] hover:bg-[var(--color-gold)]/10 px-3 py-1.5 rounded uppercase tracking-widest font-bold transition-all">
                              Resubmit Lot
                            </button>
                          )
                        )}
                        {lot.status === 'sold' && (
                          <button 
                            onClick={() => setExpandedLot(expandedLot === lot._id ? null : lot._id)} 
                            className="text-[10px] border border-white/20 text-white hover:bg-white/10 px-3 py-1.5 rounded uppercase tracking-widest font-bold transition-all"
                          >
                            {expandedLot === lot._id ? 'Hide Details' : 'View Details'}
                          </button>
                        )}
                      </td>
                    </tr>
                    {/* Expanded Row for Sold Lots */}
                    {expandedLot === lot._id && lot.status === 'sold' && (
                      <tr className="bg-white/[0.02]">
                        <td colSpan="5" className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                            <div className="bg-[#0a0a0a] p-5 rounded-xl border border-white/10">
                               <h4 className="text-[var(--color-gold)] font-bold tracking-widest uppercase text-[10px] mb-4">Financial Breakdown</h4>
                               <div className="space-y-2 font-mono text-[var(--color-ivory-muted)]">
                                  <div className="flex justify-between"><span>Winning Bid:</span> <span><Price amount={lot.winningBid?.toLocaleString('en-ZA')} /></span></div>
                                  <div className="flex justify-between"><span>Auction Commission ({(lot.commissionPct || 15)}%):</span> <span className="text-red-400">- <Price amount={lot.commissionAmount?.toLocaleString('en-ZA')} /></span></div>
                                  <div className="flex justify-between"><span>VAT Deducted:</span> <span className="text-red-400">- <Price amount={lot.vatAmount?.toLocaleString('en-ZA')} /></span></div>
                                  <div className="flex justify-between border-t border-white/10 pt-2 mt-2 text-white font-bold">
                                     <span>Your Net Payable:</span> 
                                     <span className="text-[var(--color-gold)]"><Price amount={lot.vendorPayable?.toLocaleString('en-ZA')} /></span>
                                  </div>
                               </div>
                            </div>
                            <div className="bg-[#0a0a0a] p-5 rounded-xl border border-white/10">
                               <h4 className="text-[var(--color-gold)] font-bold tracking-widest uppercase text-[10px] mb-4">Winner & Delivery Details</h4>
                               {lot.winner ? (
                                  <div className="mb-4">
                                    <p className="text-white">{lot.winner.name}</p>
                                    <p className="text-[var(--color-ivory-muted)]">{lot.winner.email}</p>
                                  </div>
                               ) : (
                                  <p className="text-[var(--color-ivory-muted)] mb-4">Winner info not available.</p>
                               )}
                               
                               <h5 className="text-[var(--color-ivory-muted)] text-[10px] tracking-widest uppercase font-bold mb-2">Shipping Address</h5>
                               {lot.paymentStatus === 'Paid' && lot.shippingAddress ? (
                                  <div className="text-[var(--color-ivory-muted)] text-xs">
                                     <p>{lot.shippingAddress.address}</p>
                                     <p>{lot.shippingAddress.city}, {lot.shippingAddress.postalCode}</p>
                                     <p>{lot.shippingAddress.country}</p>
                                  </div>
                               ) : (
                                  <p className="text-[var(--color-ivory-muted)] text-xs italic">
                                     {lot.paymentStatus === 'Paid' ? 'No shipping address provided.' : 'Waiting for buyer to complete checkout.'}
                                  </p>
                               )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
