import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { formatCartPrice } from '../../data';
import { LogOut, User, Mail, Package, Heart, Building2, Gavel, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [vendorData, setVendorData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'admin') {
      navigate('/admin/auctions');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchVendorData = async () => {
      if (user && (user.role === 'vendor_active' || user.role === 'vendor_pending' || user.role === 'vendor_rejected')) {
        try {
          const userInfo = JSON.parse(localStorage.getItem('userInfo'));
          const token = userInfo?.token || user?.token;
          const { data } = await axios.get('http://localhost:5000/api/vendor/onboarding', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setVendorData(data);
        } catch (error) {
          console.error("Failed to fetch vendor application", error);
        }
      }
      setLoading(false);
    };

    const fetchOrders = async () => {
      if (user) {
        try {
          const { data } = await axios.get('http://localhost:5000/api/orders/myorders', {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setOrders(data);
        } catch (error) {
          console.error("Failed to fetch orders", error);
        }
      }
    };

    fetchVendorData();
    fetchOrders();
  }, [user]);

  if (!user || loading) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'active':
      case 'approved':
        return { color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20', icon: <CheckCircle2 size={16} />, text: 'Approved' };
      case 'pending_approval':
        return { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', icon: <Clock size={16} />, text: 'Pending Admin Approval' };
      case 'rejected':
        return { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', icon: <AlertCircle size={16} />, text: 'Requires Revision' };
      default:
        return { color: 'text-gold-gradient', bg: 'bg-[var(--color-gold)]/10', border: 'border-[var(--color-gold)]/20', icon: <FileText size={16} />, text: 'Draft Application' };
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[var(--color-ivory)] flex flex-col font-sans">
      
      {/* Standalone Dashboard Header */}
      <header className="h-20 bg-black/60 backdrop-blur-xl border-b border-white/[0.05] flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
          <div className="text-2xl font-serif text-[var(--color-ivory)] tracking-widest uppercase">
            The Grand Store
          </div>
          <div className="h-4 w-px bg-white/20 mx-2"></div>
          <div className="text-sm tracking-widest text-gold-gradient font-medium uppercase">
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
              <div className="text-xs text-gold-gradient tracking-widest uppercase">Private Client</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-yellow-700 p-[1px]">
              <div className="w-full h-full bg-[#0a0a0a] rounded-full flex items-center justify-center">
                <User size={18} className="text-gold-gradient" />
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
            <button className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/[0.05] text-gold-gradient shadow-[0_0_15px_rgba(212,175,55,0.05)] transition-all text-left text-xs uppercase tracking-widest font-semibold border border-white/[0.05]">
              <User size={16} /> My Profile
            </button>
            <button onClick={() => navigate('/customer/orders')} className="flex items-center gap-4 px-4 py-3 rounded-xl text-[var(--color-ivory-muted)] hover:bg-white/[0.03] hover:text-[var(--color-ivory)] transition-all text-left text-xs uppercase tracking-widest border border-transparent">
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
                <button onClick={() => navigate('/vendor/dashboard')} className="flex items-center gap-4 px-4 py-3 rounded-xl w-full text-[var(--color-ivory-muted)] hover:bg-[var(--color-gold)]/10 hover:text-gold-gradient transition-all text-left text-xs uppercase tracking-widest border border-transparent hover:border-[var(--color-gold)]/20">
                  <Building2 size={16} /> Vendor Dashboard
                </button>
              </div>
            )}
            
            {user.role !== 'vendor_active' && (
              <div className="mt-8 pt-8 border-t border-white/[0.05]">
                <button onClick={() => navigate('/vendor/onboarding')} className="flex items-center gap-4 px-4 py-3 rounded-xl w-full text-[var(--color-ivory-muted)] hover:bg-[var(--color-gold)]/10 hover:text-gold-gradient transition-all text-left text-xs uppercase tracking-widest border border-transparent hover:border-[var(--color-gold)]/20">
                  <Building2 size={16} /> Become Vendor
                </button>
              </div>
            )}
          </nav>

          <div className="p-6">
            <button onClick={handleLogout} className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl w-full text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all text-xs uppercase tracking-widest border border-transparent hover:border-red-500/20">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 ml-64 p-10 lg:p-16 flex flex-col gap-12 z-10 overflow-y-auto">
          
          {/* Welcome Section */}
          <section className="mb-4">
            <h1 className="text-[var(--color-ivory)] font-serif text-5xl mb-4">
              Welcome, <span className="font-script text-6xl text-gold-gradient font-normal ml-2 tracking-wide drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">{user.name.split(' ')[0]}</span>
            </h1>
            <p className="text-[var(--color-ivory-muted)] text-lg max-w-2xl font-light">
              Manage your private cellar, track your active bids, and review your order history from your personal suite.
            </p>
          </section>

          {/* Details & Orders Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* Account Details - Glass Panel */}
            <section className="bg-white/[0.02] backdrop-blur-2xl rounded-3xl p-10 border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <h3 className="text-[var(--color-ivory)] font-serif text-3xl mb-8 flex items-center gap-4 border-b border-white/[0.05] pb-6">
                <div className="p-2 rounded-lg bg-[var(--color-gold)]/10 text-gold-gradient">
                  <User size={24} />
                </div>
                Account Details
              </h3>
              <div className="space-y-8">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)]/70 mb-2 font-semibold">Full Name</label>
                  <div className="text-[var(--color-ivory)] text-xl font-serif tracking-wide">{user.name}</div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)]/70 mb-2 font-semibold">Email Address</label>
                  <div className="text-[var(--color-ivory)] text-xl font-serif tracking-wide">{user.email}</div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)]/70 mb-2 font-semibold">Membership Status</label>
                  <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-gold)]/10 text-gold-gradient text-sm uppercase tracking-widest font-semibold border border-[var(--color-gold)]/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                    Private Client
                  </div>
                </div>
              </div>
            </section>
            
            {/* Vendor Details (if applicable) */}
            {vendorData && (
              <section className="bg-white/[0.02] backdrop-blur-2xl rounded-3xl p-10 border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <h3 className="text-[var(--color-ivory)] font-serif text-3xl mb-8 flex items-center justify-between border-b border-white/[0.05] pb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-[var(--color-gold)]/10 text-gold-gradient">
                      <Building2 size={24} />
                    </div>
                    Vendor Application
                  </div>
                  {(() => {
                    const status = getStatusDisplay(vendorData.status);
                    return (
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${status.bg} ${status.color} border ${status.border} text-xs tracking-widest uppercase font-semibold`}>
                        {status.icon}
                        {status.text}
                      </div>
                    );
                  })()}
                </h3>
                
                <div className="space-y-6">
                  {vendorData.businessInfo?.companyName && (
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)]/70 mb-1 font-semibold">Company Name</label>
                      <div className="text-[var(--color-ivory)] text-lg font-serif">{vendorData.businessInfo.companyName}</div>
                    </div>
                  )}
                  {vendorData.businessInfo?.registrationNumber && (
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)]/70 mb-1 font-semibold">Registration Number</label>
                      <div className="text-[var(--color-ivory)] text-md font-light">{vendorData.businessInfo.registrationNumber}</div>
                    </div>
                  )}
                  {vendorData.taxInfo?.vatNumber && (
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)]/70 mb-1 font-semibold">VAT Number</label>
                      <div className="text-[var(--color-ivory)] text-md font-light">{vendorData.taxInfo.vatNumber}</div>
                    </div>
                  )}
                  
                  <div className="pt-6 mt-6 border-t border-white/[0.05]">
                    <button 
                      onClick={() => navigate('/vendor/onboarding')}
                      className="w-full bg-[var(--color-gold)]/10 hover:bg-[var(--color-gold)]/20 text-gold-gradient border border-[var(--color-gold)]/30 transition-all px-6 py-3 rounded-xl uppercase tracking-widest text-xs font-bold shadow-[0_0_20px_rgba(212,175,55,0.05)] hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] flex items-center justify-center gap-2"
                    >
                      <FileText size={16} /> Update Application Documents
                    </button>
                    {user.role === 'vendor_active' && (
                      <p className="text-center text-[10px] uppercase tracking-widest text-[var(--color-ivory-muted)] mt-4">
                        Note: Updating your application will require re-approval from admin.
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}



          </div>
        </main>
      </div>
    </div>
  );
}
