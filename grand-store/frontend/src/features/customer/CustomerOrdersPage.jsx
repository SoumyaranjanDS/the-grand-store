import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { formatCartPrice } from '../../data';
import { LogOut, User, Package, Heart, Building2, Gavel, CheckCircle2, ChevronRight, Search } from 'lucide-react';

export default function CustomerOrdersPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        try {
          const { data } = await axios.get('http://localhost:5000/api/orders/myorders', {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setOrders(data);
        } catch (error) {
          console.error("Failed to fetch orders", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredOrders = orders.filter(order => 
    (order.invoiceNumber || order._id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderItems?.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#050505] text-[var(--color-ivory)] flex flex-col font-sans">
      
      {/* Standalone Dashboard Header */}
      <header className="h-20 bg-black/60 backdrop-blur-xl border-b border-white/[0.05] flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
          <div className="text-2xl font-serif text-[var(--color-ivory)] tracking-widest uppercase">
            The Grand Store
          </div>
          <div className="h-4 w-px bg-white/20 mx-2"></div>
          <div className="text-sm tracking-widest text-[var(--color-gold)] font-medium uppercase">
            Client Portal
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/customer/cart')} className="relative text-[var(--color-ivory-muted)] hover:text-[var(--color-ivory)] transition-colors">
            <Package size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <div className="text-sm font-serif">{user.name}</div>
              <div className="text-xs text-[var(--color-gold)] tracking-widest uppercase">Private Client</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-yellow-700 p-[1px]">
              <div className="w-full h-full bg-[#0a0a0a] rounded-full flex items-center justify-center">
                <User size={18} className="text-[var(--color-gold)]" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Background glow effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--color-gold)]/5 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--color-gold)]/5 blur-[100px]"></div>
        </div>

        {/* Glassmorphic Sidebar */}
        <aside className="w-64 bg-white/[0.02] backdrop-blur-xl border-r border-white/[0.02] flex flex-col fixed top-20 bottom-0 left-0 z-10 overflow-y-auto">
          <nav className="flex flex-col flex-1 p-6 gap-2 mt-4">
            <button onClick={() => navigate('/customer/profile')} className="flex items-center gap-4 px-4 py-3 rounded-xl text-[var(--color-ivory-muted)] hover:bg-white/[0.03] hover:text-[var(--color-ivory)] transition-all text-left text-xs uppercase tracking-widest border border-transparent">
              <User size={16} /> My Profile
            </button>
            <button className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/[0.05] text-[var(--color-gold)] shadow-[0_0_15px_rgba(212,175,55,0.05)] transition-all text-left text-xs uppercase tracking-widest font-semibold border border-white/[0.05]">
              <Package size={16} /> My Orders
            </button>
            <button onClick={() => navigate('/customer/wishlist')} className="flex items-center gap-4 px-4 py-3 rounded-xl text-[var(--color-ivory-muted)] hover:bg-white/[0.03] hover:text-[var(--color-ivory)] transition-all text-left text-xs uppercase tracking-widest border border-transparent">
              <Heart size={16} /> Wishlist
            </button>
            <button onClick={() => navigate('/customer/auctions')} className="flex items-center gap-4 px-4 py-3 rounded-xl text-[var(--color-ivory-muted)] hover:bg-white/[0.03] hover:text-[var(--color-ivory)] transition-all text-left text-xs uppercase tracking-widest border border-transparent">
              <Gavel size={16} /> Auction Bids
            </button>
            
            {user.role === 'vendor_active' && (
              <div className="mt-8 pt-8 border-t border-white/[0.05]">
                <button onClick={() => navigate('/vendor/dashboard')} className="flex items-center gap-4 px-4 py-3 rounded-xl w-full text-[var(--color-ivory-muted)] hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-gold)] transition-all text-left text-xs uppercase tracking-widest border border-transparent hover:border-[var(--color-gold)]/20">
                  <Building2 size={16} /> Vendor Dashboard
                </button>
              </div>
            )}
            
            {user.role !== 'vendor_active' && (
              <div className="mt-8 pt-8 border-t border-white/[0.05]">
                <button onClick={() => navigate('/vendor/onboarding')} className="flex items-center gap-4 px-4 py-3 rounded-xl w-full text-[var(--color-ivory-muted)] hover:bg-[var(--color-gold)]/10 hover:text-[var(--color-gold)] transition-all text-left text-xs uppercase tracking-widest border border-transparent hover:border-[var(--color-gold)]/20">
                  <Building2 size={16} /> Become Vendor
                </button>
              </div>
            )}
          </nav>
          
          <div className="p-6 border-t border-white/[0.05]">
            <button onClick={handleLogout} className="flex items-center gap-4 px-4 py-3 rounded-xl w-full text-[var(--color-ivory-muted)] hover:text-red-400 transition-all text-left text-xs uppercase tracking-widest hover:bg-red-400/10">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 ml-64 p-12 overflow-y-auto z-10 custom-scrollbar pb-24">
          <div className="max-w-5xl mx-auto">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6 mb-10">
              <div>
                <h1 className="text-[var(--color-ivory)] font-serif text-4xl mb-2 flex items-center gap-4">
                  <div className="p-3 bg-[var(--color-gold)]/10 text-[var(--color-gold)] rounded-xl border border-[var(--color-gold)]/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                    <Package size={28} />
                  </div>
                  Order <span className="text-[var(--color-gold)] ml-2 font-script text-5xl font-normal drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">History</span>
                </h1>
                <p className="text-[var(--color-ivory-muted)] text-sm max-w-2xl font-light mt-4">
                  Review all your past purchases and trace your private collection history.
                </p>
              </div>
              
              <div className="relative w-full md:w-64">
                <input 
                  type="text" 
                  placeholder="Search orders..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-full py-3 px-5 pl-10 text-sm text-[var(--color-ivory)] placeholder:text-[var(--color-ivory-muted)]/50 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors backdrop-blur-md"
                />
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-ivory-muted)]" />
              </div>
            </div>

            {loading ? (
              <div className="text-[var(--color-gold)] py-20 text-center flex flex-col items-center gap-4">
                <Package className="animate-pulse opacity-50" size={40} />
                <p>Retrieving your collection...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center py-20 border border-white/5 rounded-3xl bg-white/[0.01]">
                <div className="w-24 h-24 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-6 shadow-inner">
                  <Package size={32} className="text-[var(--color-ivory-muted)] opacity-30" />
                </div>
                <p className="text-[var(--color-ivory-muted)] mb-8 text-lg font-light">Your order history is empty.</p>
                <button onClick={() => navigate('/shop')} className="px-8 py-3 rounded-full border border-[var(--color-gold)]/50 text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-black transition-all uppercase tracking-widest text-xs font-bold shadow-[0_0_20px_rgba(212,175,55,0.1)] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                  Explore the Collection
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => (
                  <div key={order._id} className="bg-white/[0.02] backdrop-blur-md border border-white/[0.05] hover:border-white/10 hover:bg-white/[0.04] transition-all rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                    <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/[0.05]">
                      <div>
                        <div className="text-[var(--color-gold)] text-sm tracking-widest uppercase mb-2 font-bold flex items-center gap-2">
                          {order.invoiceNumber || order._id}
                        </div>
                        <div className="text-sm text-[var(--color-ivory-muted)] flex items-center gap-3">
                          <span>{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          <span className="w-1 h-1 rounded-full bg-white/20"></span>
                          <span>{order.orderItems?.length} {order.orderItems?.length === 1 ? 'Item' : 'Items'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-left md:text-right">
                          <div className="text-sm text-[var(--color-ivory-muted)] mb-1">Order Total</div>
                          <div className="text-2xl font-serif text-[var(--color-ivory)]">{formatCartPrice(order.totalPrice)}</div>
                        </div>
                        <button 
                          onClick={() => navigate(`/customer/order/${order._id}`)}
                          className="w-12 h-12 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)] flex items-center justify-center hover:bg-[var(--color-gold)] hover:text-black transition-colors"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-6 md:px-8 bg-black/20">
                      <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
                        {order.orderItems?.map((item, idx) => (
                          <div key={idx} className="flex-shrink-0 w-64 bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 flex gap-4 items-center">
                            <div className="w-16 h-16 rounded-lg bg-black border border-white/10 flex items-center justify-center overflow-hidden shrink-0 p-1">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="h-full object-contain" />
                              ) : (
                                <Package size={20} className="text-[var(--color-gold)]/50" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm text-[var(--color-ivory)] font-medium truncate">{item.name}</div>
                              {item.option && <div className="text-xs text-[var(--color-ivory-muted)] mt-1 truncate">{item.option}</div>}
                              <div className="text-xs text-[var(--color-gold)] mt-2 font-bold">Qty: {item.quantity}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
