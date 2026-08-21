import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { formatCartPrice } from '../../data';
import { LogOut, User, Mail, Package, Heart, Building2, Gavel, FileText, CheckCircle2, Clock, AlertCircle, Ticket } from 'lucide-react';

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
          const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/vendor/onboarding`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setVendorData(data);
        } catch (error) {
          console.error("Failed to fetch vendor application", error);
          if (error.response?.status === 401) {
            logout();
            navigate('/login');
          }
        }
      }
      setLoading(false);
    };

    const fetchOrders = async () => {
      if (user) {
        try {
          const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/myorders`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setOrders(data);
        } catch (error) {
          console.error("Failed to fetch orders", error);
          if (error.response?.status === 401) {
            logout();
            navigate('/login');
          }
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
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 md:gap-12">
      {/* Welcome Section */}
      <section className="mb-4">
        <h1 className="text-[var(--color-ivory)] font-serif text-3xl md:text-5xl mb-4">
              Welcome, <span className="text-6xl text-gold-gradient font-normal ml-2 tracking-wide drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">{user.name ? user.name.split(' ')[0] : 'User'}</span>
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
    </div>
  );
}
