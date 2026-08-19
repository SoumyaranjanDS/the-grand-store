import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Package, MapPin, Search } from 'lucide-react';
import { formatCartPrice } from '../../data';

export default function VendorOrders() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
  const scriptFont = { fontFamily: "'Dancing Script', cursive" };

  const filteredSales = sales.filter(sale => 
    (sale.invoiceNumber || sale._id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sale.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-[var(--color-ivory)] font-serif text-4xl mb-2 flex items-center gap-4">
            <div className="p-3 bg-[var(--color-gold)]/10 text-gold-gradient rounded-xl border border-[var(--color-gold)]/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
              <ShoppingBag size={28} />
            </div>
            Order <span className={`${goldTextClass} ml-2`} style={scriptFont}>History</span>
          </h1>
          <p className="text-[var(--color-ivory-muted)] text-sm max-w-2xl font-light">
            Review detailed information about customer orders containing your products, including shipping addresses and quantities.
          </p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="Search by Order ID or Customer..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-full py-3 px-5 pl-10 text-sm text-[var(--color-ivory)] placeholder:text-[var(--color-ivory-muted)]/50 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
          />
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-ivory-muted)]" />
        </div>
      </div>

      {loading ? (
        <div className="text-gold-gradient p-10 text-center">Loading your sales history...</div>
      ) : filteredSales.length === 0 ? (
        <div className="text-center py-20 border border-white/5 rounded-3xl bg-white/[0.01]">
          <ShoppingBag size={48} className="mx-auto mb-4 text-[var(--color-ivory-muted)] opacity-20" />
          <p className="text-[var(--color-ivory-muted)] text-lg">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredSales.map((sale) => (
            <div key={sale._id} className="bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden transition-all">
              
              {/* Order Header */}
              <div className="bg-black/40 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 gap-4">
                <div className="flex flex-col md:flex-row gap-2 md:gap-8">
                  <div>
                    <div className="text-[10px] text-[var(--color-ivory-muted)] uppercase tracking-widest mb-1">Order ID</div>
                    <div className="text-sm text-gold-gradient font-bold">{sale.invoiceNumber || sale._id}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--color-ivory-muted)] uppercase tracking-widest mb-1">Date</div>
                    <div className="text-sm text-[var(--color-ivory)] font-serif">
                      {new Date(sale.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-[10px] text-[var(--color-ivory-muted)] uppercase tracking-widest mb-1">Your Total Payout</div>
                  <div className="text-xl font-serif text-gold-gradient">{formatCartPrice(sale.vendorTotal)}</div>
                </div>
              </div>

              {/* Order Details Body */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Customer Info */}
                <div className="col-span-1 border-r border-white/5 pr-4">
                  <h4 className="text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-4 flex items-center gap-2">
                    <MapPin size={14} className="text-gold-gradient" /> Shipping Details
                  </h4>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[var(--color-ivory)]">{sale.user?.name || 'Guest'}</p>
                    <p className="text-xs text-[var(--color-ivory-muted)]">{sale.user?.email}</p>
                  </div>
                  
                  {sale.shippingAddress ? (
                    <div className="mt-4 text-sm text-[var(--color-ivory-muted)] leading-relaxed">
                      {sale.shippingAddress.address}<br />
                      {sale.shippingAddress.city}, {sale.shippingAddress.postalCode}<br />
                      {sale.shippingAddress.country}
                    </div>
                  ) : (
                    <div className="mt-4 text-xs italic text-[var(--color-ivory-muted)] opacity-50">No shipping address provided</div>
                  )}
                </div>

                {/* Items List */}
                <div className="col-span-1 md:col-span-2">
                  <h4 className="text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-4 flex items-center gap-2">
                    <Package size={14} className="text-gold-gradient" /> Products Purchased
                  </h4>
                  <div className="space-y-4">
                    {sale.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 last:pb-0">
                        <div className="flex gap-4 items-center">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-12 h-12 object-contain bg-black rounded border border-white/10 p-1" />
                          )}
                          <div>
                            <p className="text-sm font-serif text-[var(--color-ivory)]">{item.name}</p>
                            {item.option && <p className="text-xs text-[var(--color-ivory-muted)] mt-1">{item.option}</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-[var(--color-ivory)]">{item.quantity} × {formatCartPrice(item.price)}</div>
                          <div className="text-xs font-bold text-gold-gradient mt-1">{formatCartPrice(item.price * item.quantity)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
