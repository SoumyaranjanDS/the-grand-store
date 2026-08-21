import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, Download, Printer, Truck, Package, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatCartPrice } from '../../data';
import Price from '../../components/ui/Price';

export default function OrderSuccessPage({ onClearCart }) {
  const { id } = useParams();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const paymentStatus = searchParams.get('payment');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Order Confirmation – The Grand Store';
    window.scrollTo({ top: 0, behavior: 'auto' });

    const fetchOrder = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${id}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          setOrder(data);
          if (paymentStatus === 'success' && onClearCart) {
            onClearCart();
          }
        }
      } catch (error) {
        console.error('Error fetching order', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && id) {
      fetchOrder();
    }
  }, [id, user]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] flex items-center justify-center text-gold-gradient">
        Loading receipt...
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
        <h2>Order not found</h2>
        <Link to="/" className="text-gold-gradient mt-4">Return Home</Link>
      </main>
    );
  }

  const printInvoice = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-[#050505] text-[var(--color-ivory)] pt-0 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Success Header (Hide on Print) */}
        <div className="text-center mb-16 print:hidden">
          <div className="w-20 h-20 bg-[var(--color-gold)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-gold-gradient" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Order Placed Successfully</h1>
          
          {paymentStatus === 'success' ? (
             <div className="inline-block px-4 py-2 bg-green-900/30 border border-green-500/50 rounded-lg text-green-400 font-medium mb-4">
                Payment completed successfully via PayFast.
             </div>
          ) : paymentStatus === 'cancel' ? (
             <div className="inline-block px-4 py-2 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 font-medium mb-4">
                Payment was cancelled. You can retry payment from your account dashboard.
             </div>
          ) : (
             <p className="text-[var(--color-ivory-muted)]">Thank you for your purchase. Your order is being processed.</p>
          )}
        </div>

        {/* Invoice Card */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 md:p-12 print:border-black print:text-black print:bg-white relative">
          
          <div className="flex flex-col md:flex-row justify-between items-start border-b border-white/10 pb-8 mb-8 print:border-black/20">
            <div>
              <div className="text-2xl font-serif text-gold-gradient tracking-widest uppercase mb-2 print:text-black">The Grand Store</div>
              <p className="text-sm text-[var(--color-ivory-muted)] print:text-gray-600">Luxury Wines & Spirits</p>
            </div>
            <div className="text-left md:text-right mt-6 md:mt-0">
              <h2 className="text-xl font-serif mb-1 uppercase tracking-widest text-[var(--color-ivory-muted)] print:text-gray-500">Invoice</h2>
              <p className="text-lg font-bold">{order.invoiceNumber || order._id}</p>
              <p className="text-sm text-[var(--color-ivory-muted)] print:text-gray-600 mt-2">
                {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-gold-gradient mb-4 print:text-black font-bold">Billed To</h3>
              <p className="font-serif">{order.user?.name}</p>
              <p className="text-sm text-[var(--color-ivory-muted)] print:text-gray-600">{order.user?.email}</p>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-widest text-gold-gradient mb-4 print:text-black font-bold">Shipped To</h3>
              <p className="text-sm text-[var(--color-ivory-muted)] print:text-gray-600 leading-relaxed">
                {order.shippingAddress?.address}<br />
                {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}<br />
                {order.shippingAddress?.country}
              </p>
            </div>
          </div>

          <div className="mb-8 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 print:border-black/20 text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] print:text-gray-500">
                  <th className="py-4 font-normal">Item</th>
                  <th className="py-4 font-normal text-center">Qty</th>
                  <th className="py-4 font-normal text-right">Price</th>
                  <th className="py-4 font-normal text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.orderItems?.map((item, idx) => (
                  <tr key={idx} className="border-b border-white/5 print:border-black/10">
                    <td className="py-4">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-[var(--color-ivory-muted)] print:text-gray-500 mt-1">{item.option}</p>
                    </td>
                    <td className="py-4 text-center text-sm">{item.quantity}</td>
                    <td className="py-4 text-right text-sm"><Price amount={item.price} /></td>
                    <td className="py-4 text-right text-sm font-medium"><Price amount={item.price * item.quantity} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-12">
            <div className="w-full md:w-1/2">
              <div className="flex justify-between py-2 text-sm text-[var(--color-ivory-muted)] print:text-gray-600">
                <span>Subtotal</span>
                <span><Price amount={order.totalPrice - order.shippingCost} /></span>
              </div>
              <div className="flex justify-between py-2 text-sm text-[var(--color-ivory-muted)] print:text-gray-600 border-b border-white/10 print:border-black/20">
                <span>Shipping</span>
                <span>{order.shippingCost === 0 ? 'Complimentary' : <Price amount={order.shippingCost} />}</span>
              </div>
              <div className="flex justify-between py-4 text-xl font-serif text-gold-gradient print:text-black">
                <span>Total</span>
                <span><Price amount={order.totalPrice} /></span>
              </div>
              <div className="flex justify-between py-2 text-xs text-[var(--color-ivory-muted)] print:text-gray-500">
                <span>Payment Method</span>
                <span>{order.paymentMethod} (Paid)</span>
              </div>
            </div>
          </div>
          
          {/* Unified Tracking Timeline */}
          {order.shipments && order.shipments.length > 0 && (
            <div className="border-t border-white/10 pt-12 print:hidden">
              <h3 className="text-xl font-serif text-gold-gradient tracking-widest uppercase mb-8">Delivery Journey</h3>
              
              <div className="space-y-8">
                {order.shipments.map((shipment, index) => (
                  <div key={shipment._id} className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex flex-col md:flex-row justify-between mb-6 border-b border-white/10 pb-4">
                      <div>
                        <h4 className="font-bold text-sm uppercase tracking-widest text-[#eee8dd] mb-1">
                          Shipment {order.shipments.length > 1 ? index + 1 : ''}
                        </h4>
                        <p className="text-xs text-[var(--color-ivory-muted)]">{shipment.shipmentId}</p>
                      </div>
                      <div className="text-left md:text-right mt-2 md:mt-0">
                        <span className="inline-block px-3 py-1 bg-gold-gradient/10 text-gold-gradient border border-gold-gradient/20 text-[10px] uppercase tracking-widest font-bold rounded-full">
                          {shipment.status || 'Processing'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Unified Timeline View */}
                    <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent">
                      
                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/50 bg-[#0a0907] text-[#eee8dd] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 absolute left-[-32px] md:static">
                          <Package size={14} />
                        </div>
                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-white/10 bg-white/5 shadow">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-bold text-[#eee8dd]">Order Confirmed</h4>
                          </div>
                          <div className="text-xs text-[var(--color-ivory-muted)]">Sent to Vendor</div>
                        </div>
                      </div>
                      
                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/20 bg-[#0a0907] text-[var(--color-ivory-muted)] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 absolute left-[-32px] md:static">
                          <Package size={14} />
                        </div>
                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-white/5 bg-white/[0.02] shadow">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-bold text-[var(--color-ivory-muted)]">Preparing</h4>
                          </div>
                          <div className="text-xs text-[var(--color-ivory-muted)]/50">Vendor is preparing your order in {shipment.pickupAddress?.country || 'South Africa'}</div>
                        </div>
                      </div>
                      
                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/20 bg-[#0a0907] text-[var(--color-ivory-muted)] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 absolute left-[-32px] md:static">
                          <Truck size={14} />
                        </div>
                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-white/5 bg-white/[0.02] shadow">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-bold text-[var(--color-ivory-muted)]">In Transit</h4>
                          </div>
                          <div className="text-xs text-[var(--color-ivory-muted)]/50">Handed over to courier network</div>
                        </div>
                      </div>
                      
                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/20 bg-[#0a0907] text-[var(--color-ivory-muted)] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 absolute left-[-32px] md:static">
                          <MapPin size={14} />
                        </div>
                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-white/5 bg-white/[0.02] shadow">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-bold text-[var(--color-ivory-muted)]">Out for Delivery</h4>
                          </div>
                          <div className="text-xs text-[var(--color-ivory-muted)]/50">Arriving at your address in {shipment.deliveryAddress?.city || 'your city'}</div>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Actions (Hide on Print) */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-6 print:hidden">
          <Link to="/shop" className="text-sm uppercase tracking-widest hover:text-gold-gradient transition-colors flex items-center gap-2">
            <ChevronLeft size={16} /> Continue Shopping
          </Link>
          <button onClick={printInvoice} className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl text-sm uppercase tracking-widest transition-colors flex items-center gap-2">
            <Printer size={16} /> Print Receipt
          </button>
        </div>

      </div>
    </main>
  );
}
