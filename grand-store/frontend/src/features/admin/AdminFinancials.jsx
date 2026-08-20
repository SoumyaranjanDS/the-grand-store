import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp, History } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminFinancials({ hideHeader = false }) {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [shopOrders, setShopOrders] = useState([]);
  const [auctionOrders, setAuctionOrders] = useState([]);
  const [eventBookings, setEventBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('shop');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount || 0);
  };

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const res = await axios.get(`${API_URL}/api/admin/finance`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        setMetrics(res.data.metrics);
        setTransactions(res.data.transactions);
        setShopOrders(res.data.shopOrders || []);
        setAuctionOrders(res.data.auctionOrders || []);
        setEventBookings(res.data.eventBookings || []);
      } catch (err) {
        setError('Failed to load finance data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFinanceData();
  }, []);

  if (loading) return <div className="text-white p-8 text-center animate-pulse">Loading financial data...</div>;
  if (error) return <div className="text-red-500 p-8">{error}</div>;

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-serif text-white">Financial Control Centre</h2>
            <p className="text-gray-400 text-sm mt-1">Master overview of marketplace revenue and vendor payables based on immutable ledgers.</p>
          </div>
        </div>
      )}

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#111] border border-[#b58b38]/30 rounded-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp size={64} className="text-[#b58b38]" />
          </div>
          <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-1">Total Processed (Sales)</p>
          <p className="text-3xl font-serif text-[#e6c97a]">{formatMoney(metrics?.totalProcessed)}</p>
          <p className="text-[#888] text-xs mt-2">Gross customer payments cleared</p>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <ArrowUpRight size={64} className="text-green-500" />
          </div>
          <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-1">GS Commission</p>
          <p className="text-3xl font-serif text-white">{formatMoney(metrics?.totalPlatformRevenue)}</p>
          <p className="text-[#888] text-xs mt-2">Earned marketplace commissions</p>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <DollarSign size={64} className="text-yellow-500" />
          </div>
          <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-1">VAT Collected</p>
          <p className="text-3xl font-serif text-white">{formatMoney(metrics?.totalVatCollected)}</p>
          <p className="text-[#888] text-xs mt-2">VAT securely withheld & tracked</p>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-sm p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <ArrowDownRight size={64} className="text-red-500" />
          </div>
          <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-1">Owed to Vendors</p>
          <p className="text-3xl font-serif text-white">{formatMoney(metrics?.totalPendingPayables)}</p>
          <p className="text-[#888] text-xs mt-2">Pending payables to be disbursed</p>
        </div>
      </div>

      {/* ORDER FINANCIAL BREAKDOWN */}
      <div className="bg-[#111] border border-white/10 rounded-sm overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-white/10 bg-black/40 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h3 className="text-white font-serif text-xl">Revenue Breakdown</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('shop')}
              className={`px-4 py-2 text-xs font-bold tracking-wider uppercase rounded-sm transition-colors ${
                activeTab === 'shop' ? 'bg-[#b58b38] text-black' : 'bg-white/5 text-[#888] hover:bg-white/10 hover:text-white'
              }`}
            >
              Product Purchases
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 text-xs font-bold tracking-wider uppercase rounded-sm transition-colors ${
                activeTab === 'events' ? 'bg-[#b58b38] text-black' : 'bg-white/5 text-[#888] hover:bg-white/10 hover:text-white'
              }`}
            >
              Event Tickets
            </button>
            <button
              onClick={() => setActiveTab('auctions')}
              className={`px-4 py-2 text-xs font-bold tracking-wider uppercase rounded-sm transition-colors ${
                activeTab === 'auctions' ? 'bg-[#b58b38] text-black' : 'bg-white/5 text-[#888] hover:bg-white/10 hover:text-white'
              }`}
            >
              Auctions
            </button>
          </div>
        </div>
        
        {activeTab === 'shop' && (
          shopOrders.length === 0 ? (
            <div className="p-12 text-center text-[#666]">
              <History size={48} className="mx-auto mb-4 opacity-20" />
              <p>No shop orders yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-black/60 text-[#888] text-[10px] uppercase tracking-wider">
                    <th className="p-4 font-medium">Order Ref</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium text-right">Products</th>
                    <th className="p-4 font-medium text-right">Shipping</th>
                    <th className="p-4 font-medium text-right text-blue-400">Ship Margin</th>
                    <th className="p-4 font-medium text-right text-yellow-500">VAT</th>
                    <th className="p-4 font-medium text-right font-bold text-white">Total Paid</th>
                    <th className="p-4 font-medium text-right text-green-500">Commission</th>
                    <th className="p-4 font-medium text-right text-red-400">Vendor Payout</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-300">
                  {shopOrders.map(order => {
                    const totalVendorPayout = order.vendorPayables?.reduce((sum, p) => sum + (p.netPayable || 0), 0) || 0;
                    
                    // Calculate Shipping Margin
                    let customerShipping = order.shippingCost || 0;
                    let actualShipping = 0;
                    if (order.shipments && order.shipments.length > 0) {
                      actualShipping = order.shipments.reduce((sum, shp) => sum + (shp.actualShippingCost || 0), 0);
                    }
                    const shippingMargin = customerShipping - actualShipping;

                    return (
                      <tr key={order._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-mono text-xs text-[#b58b38]">{order.orderId || order.transactionId}</td>
                        <td className="p-4 text-xs">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td className="p-4 text-right text-xs">{formatMoney(order.subTotal)}</td>
                        <td className="p-4 text-right text-xs">{formatMoney(customerShipping)}</td>
                        <td className="p-4 text-right text-xs text-blue-400/80">{formatMoney(shippingMargin)}</td>
                        <td className="p-4 text-right text-xs text-yellow-500/80">{formatMoney(order.vatAmount)}</td>
                        <td className="p-4 text-right font-bold text-white">{formatMoney(order.totalPrice)}</td>
                        <td className="p-4 text-right text-green-500/80">{formatMoney(order.commissionAmount)}</td>
                        <td className="p-4 text-right text-red-400/80">{formatMoney(totalVendorPayout)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}

        {activeTab === 'events' && (
          eventBookings.length === 0 ? (
            <div className="p-12 text-center text-[#666]">
              <History size={48} className="mx-auto mb-4 opacity-20" />
              <p>No event bookings yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-black/60 text-[#888] text-[10px] uppercase tracking-wider">
                    <th className="p-4 font-medium">Ticket Ref</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium text-right">Subtotal</th>
                    <th className="p-4 font-medium text-right text-yellow-500">VAT</th>
                    <th className="p-4 font-medium text-right font-bold text-white">Customer Paid</th>
                    <th className="p-4 font-medium text-right text-green-500">Commission</th>
                    <th className="p-4 font-medium text-right text-red-400">Organizer Payout</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-300">
                  {eventBookings.map(booking => (
                    <tr key={booking._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono text-xs text-[#b58b38]">{booking.gsReference || booking.ticketId}</td>
                      <td className="p-4 text-xs">{new Date(booking.bookingDate || booking.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td className="p-4 text-right text-xs">{formatMoney(booking.subTotal)}</td>
                      <td className="p-4 text-right text-xs text-yellow-500/80">{formatMoney(booking.vatAmount)}</td>
                      <td className="p-4 text-right font-bold text-white">{formatMoney(booking.totalPrice)}</td>
                      <td className="p-4 text-right text-green-500/80">{formatMoney(booking.commissionAmount)}</td>
                      <td className="p-4 text-right text-red-400/80">{formatMoney(booking.organizerPayable)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {activeTab === 'auctions' && (
          auctionOrders.length === 0 ? (
            <div className="p-12 text-center text-[#666]">
              <History size={48} className="mx-auto mb-4 opacity-20" />
              <p>No auction payments yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-black/60 text-[#888] text-[10px] uppercase tracking-wider">
                    <th className="p-4 font-medium">Order Ref</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium text-right">Hammer Price</th>
                    <th className="p-4 font-medium text-right text-yellow-500">VAT</th>
                    <th className="p-4 font-medium text-right font-bold text-white">Buyer Paid</th>
                    <th className="p-4 font-medium text-right text-green-500">Commission</th>
                    <th className="p-4 font-medium text-right text-red-400">Vendor Payout</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-300">
                  {auctionOrders.map(order => {
                    const totalVendorPayout = order.vendorPayables?.reduce((sum, p) => sum + (p.netPayable || 0), 0) || 0;
                    return (
                      <tr key={order._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 font-mono text-xs text-[#b58b38]">{order.transactionId || order.orderId}</td>
                        <td className="p-4 text-xs">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td className="p-4 text-right text-xs">{formatMoney(order.subTotal)}</td>
                        <td className="p-4 text-right text-xs text-yellow-500/80">{formatMoney(order.vatAmount)}</td>
                        <td className="p-4 text-right font-bold text-white">{formatMoney(order.totalPrice)}</td>
                        <td className="p-4 text-right text-green-500/80">{formatMoney(order.commissionAmount)}</td>
                        <td className="p-4 text-right text-red-400/80">{formatMoney(totalVendorPayout)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
