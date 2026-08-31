import React, { useState, useEffect } from 'react';
import api from '../../api';
import { DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp, History, Download, FileSpreadsheet, Layers3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { downloadAccountingWorkbook, downloadCategoryAccountingWorkbook, downloadAuctionsWorkbook, downloadEventsWorkbook, downloadVendorWorkbook, downloadLedgerWorkbook } from '../../utils/accountingWorkbook';

export default function AdminFinancials({ hideHeader = false }) {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [shopOrders, setShopOrders] = useState([]);
  const [auctionOrders, setAuctionOrders] = useState([]);
  const [eventBookings, setEventBookings] = useState([]);
  const [vendorPayments, setVendorPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('shop');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportError, setExportError] = useState('');
  const [exportingReport, setExportingReport] = useState('');

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount || 0);
  };

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const res = await api.get(`${API_URL}/api/admin/finance?limit=2000`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        setMetrics(res.data.metrics);
        setTransactions(res.data.transactions);
        setShopOrders(res.data.shopOrders || []);
        setAuctionOrders(res.data.auctionOrders || []);
        setEventBookings(res.data.eventBookings || []);
        setVendorPayments(res.data.vendorPayments || []);
      } catch (err) {
        setError('Failed to load finance data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFinanceData();
  }, [user?.token]);

  const exportToExcel = async (reportType) => {
    try {
      setExportError('');
      setExportingReport(reportType);
      if (reportType === 'shop') {
        await downloadCategoryAccountingWorkbook({ shopOrders, auctionOrders, eventBookings });
      } else if (reportType === 'auctions') {
        await downloadAuctionsWorkbook({ auctionOrders });
      } else if (reportType === 'events') {
        await downloadEventsWorkbook({ eventBookings });
      } else if (reportType === 'vendor') {
        await downloadVendorWorkbook({ vendorPayments });
      } else if (reportType === 'transactions') {
        await downloadLedgerWorkbook({ transactions });
      } else {
        await downloadAccountingWorkbook({ metrics, transactions, shopOrders, auctionOrders, eventBookings, vendorPayments });
      }
    } catch (exportError) {
      console.error(exportError);
      setExportError('Could not create the Excel report. Please try again.');
    } finally {
      setExportingReport('');
    }
  };

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

      {/* REPORT EXPORTS */}
      <section className="bg-[#111] border border-white/10 rounded-sm px-6 py-5">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-[#c9a35b] mb-1.5">
              <FileSpreadsheet size={17} />
              <span className="text-[10px] font-bold tracking-[0.18em] uppercase">Reports &amp; exports</span>
            </div>
            <h3 className="text-white font-serif text-xl">Download financial reports</h3>
            <p className="text-[#888] text-xs mt-1">Choose the full accountant workbook or a retail sales report grouped by product category.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xl:min-w-[520px]">
            <button
              type="button"
              onClick={() => exportToExcel(activeTab)}
              disabled={Boolean(exportingReport)}
              className="min-h-12 px-4 py-3 border border-white/10 bg-white/[0.03] text-left hover:border-[#c9a35b]/60 hover:bg-[#c9a35b]/[0.06] disabled:opacity-50 transition-colors flex items-center gap-3"
              title={`Download ${activeTab} report`}
            >
              {exportingReport === activeTab ? <FileSpreadsheet size={18} className="text-[#c9a35b] animate-pulse shrink-0" /> : <Layers3 size={18} className="text-[#c9a35b] shrink-0" />}
              <span>
                <strong className="block text-white text-xs font-bold uppercase tracking-wider">
                  {activeTab === 'shop' && 'Category-wise Excel'}
                  {activeTab === 'events' && 'Event Tickets Excel'}
                  {activeTab === 'auctions' && 'Auctions Excel'}
                  {activeTab === 'vendor' && 'Vendor Reg. Excel'}
                  {activeTab === 'transactions' && 'Ledger Excel'}
                </strong>
                <small className="block text-[#777] text-[10px] mt-0.5">
                  {activeTab === 'shop' && 'Category summary + item detail'}
                  {activeTab === 'events' && 'All event bookings & payouts'}
                  {activeTab === 'auctions' && 'All auction orders & payouts'}
                  {activeTab === 'vendor' && 'Vendor registration payments'}
                  {activeTab === 'transactions' && 'Master transaction ledger'}
                </small>
              </span>
            </button>
            <button
              type="button"
              onClick={() => exportToExcel('overall')}
              disabled={Boolean(exportingReport)}
              className="min-h-12 px-4 py-3 bg-[#c9a35b] text-black text-left hover:bg-[#e1bd70] disabled:opacity-50 transition-colors flex items-center gap-3"
              title="Download the complete accountant workbook"
            >
              {exportingReport === 'overall' ? <FileSpreadsheet size={18} className="animate-pulse shrink-0" /> : <Download size={18} className="shrink-0" />}
              <span>
                <strong className="block text-xs font-bold uppercase tracking-wider">Overall Excel report</strong>
                <small className="block text-black/60 text-[10px] mt-0.5">All financial modules and ledger</small>
              </span>
            </button>
          </div>
        </div>
        {exportError && <p className="text-red-400 text-xs mt-4" role="alert">{exportError}</p>}
      </section>

      {/* ORDER FINANCIAL BREAKDOWN */}
      <div className="bg-[#111] border border-white/10 rounded-sm overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-white/10 bg-black/40 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h3 className="text-white font-serif text-xl">Revenue Breakdown</h3>
          <div className="flex flex-wrap gap-2">
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
            <button
              onClick={() => setActiveTab('vendor')}
              className={`px-4 py-2 text-xs font-bold tracking-wider uppercase rounded-sm transition-colors ${
                activeTab === 'vendor' ? 'bg-[#b58b38] text-black' : 'bg-white/5 text-[#888] hover:bg-white/10 hover:text-white'
              }`}
            >
              Vendor Reg.
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-2 text-xs font-bold tracking-wider uppercase rounded-sm transition-colors ${
                activeTab === 'transactions' ? 'bg-[#b58b38] text-black' : 'bg-white/5 text-[#888] hover:bg-white/10 hover:text-white'
              }`}
            >
              Ledger
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

        {activeTab === 'vendor' && (
          vendorPayments.length === 0 ? (
            <div className="p-12 text-center text-[#666]">
              <History size={48} className="mx-auto mb-4 opacity-20" />
              <p>No vendor registration payments yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-black/60 text-[#888] text-[10px] uppercase tracking-wider">
                    <th className="p-4 font-medium">Ref ID</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Vendor</th>
                    <th className="p-4 font-medium text-right font-bold text-white">Amount Paid</th>
                    <th className="p-4 font-medium">Gateway</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-300">
                  {vendorPayments.map(txn => (
                    <tr key={txn._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono text-xs text-[#b58b38]">{txn.gsReference || txn.reference}</td>
                      <td className="p-4 text-xs">{new Date(txn.createdAt || txn.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td className="p-4 text-xs">{txn.customer?.name || txn.customer?.email || txn.user?.name || txn.user?.email || 'N/A'}</td>
                      <td className="p-4 text-right font-bold text-white">{formatMoney(txn.amount)}</td>
                      <td className="p-4 text-xs text-[#888]">{txn.gateway}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {activeTab === 'transactions' && (
          transactions.length === 0 ? (
            <div className="p-12 text-center text-[#666]">
              <History size={48} className="mx-auto mb-4 opacity-20" />
              <p>No ledger transactions yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-black/60 text-[#888] text-[10px] uppercase tracking-wider">
                    <th className="p-4 font-medium">GS Reference</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Module</th>
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Gross</th>
                    <th className="p-4 font-medium text-right">Net</th>
                    <th className="p-4 font-medium">Gateway</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-300">
                  {transactions.map((transaction) => (
                    <tr key={transaction._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono text-xs text-[#b58b38]">{transaction.gsReference}</td>
                      <td className="p-4 text-xs">{new Date(transaction.createdAt).toLocaleDateString('en-ZA')}</td>
                      <td className="p-4 text-xs uppercase">{transaction.module}</td>
                      <td className="p-4 text-xs uppercase">{transaction.type}</td>
                      <td className="p-4 text-xs uppercase">{transaction.status}</td>
                      <td className="p-4 text-right">{formatMoney(transaction.amount)}</td>
                      <td className="p-4 text-right">{formatMoney(transaction.netAmount)}</td>
                      <td className="p-4 text-xs">{transaction.gateway}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
