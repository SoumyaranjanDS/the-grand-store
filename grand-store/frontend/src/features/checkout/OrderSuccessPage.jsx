import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, Download, Printer } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatCartPrice } from '../../data';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Order Confirmation – The Grand Store';
    window.scrollTo({ top: 0, behavior: 'auto' });

    const fetchOrder = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          setOrder(data);
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
      <main className="min-h-screen bg-[#050505] flex items-center justify-center text-[var(--color-gold)]">
        Loading receipt...
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
        <h2>Order not found</h2>
        <Link to="/" className="text-[var(--color-gold)] mt-4">Return Home</Link>
      </main>
    );
  }

  const printInvoice = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-[#050505] text-[var(--color-ivory)] pt-32 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Success Header (Hide on Print) */}
        <div className="text-center mb-16 print:hidden">
          <div className="w-20 h-20 bg-[var(--color-gold)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-[var(--color-gold)]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Order Placed Successfully</h1>
          <p className="text-[var(--color-ivory-muted)]">Thank you for your purchase. Your order is being processed.</p>
        </div>

        {/* Invoice Card */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 md:p-12 print:border-black print:text-black print:bg-white relative">
          
          <div className="flex flex-col md:flex-row justify-between items-start border-b border-white/10 pb-8 mb-8 print:border-black/20">
            <div>
              <div className="text-2xl font-serif text-[var(--color-gold)] tracking-widest uppercase mb-2 print:text-black">The Grand Store</div>
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
              <h3 className="text-xs uppercase tracking-widest text-[var(--color-gold)] mb-4 print:text-black font-bold">Billed To</h3>
              <p className="font-serif">{order.user?.name}</p>
              <p className="text-sm text-[var(--color-ivory-muted)] print:text-gray-600">{order.user?.email}</p>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-widest text-[var(--color-gold)] mb-4 print:text-black font-bold">Shipped To</h3>
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
                    <td className="py-4 text-right text-sm">{formatCartPrice(item.price)}</td>
                    <td className="py-4 text-right text-sm font-medium">{formatCartPrice(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-full md:w-1/2">
              <div className="flex justify-between py-2 text-sm text-[var(--color-ivory-muted)] print:text-gray-600">
                <span>Subtotal</span>
                <span>{formatCartPrice(order.totalPrice)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm text-[var(--color-ivory-muted)] print:text-gray-600 border-b border-white/10 print:border-black/20">
                <span>Shipping</span>
                <span>Complimentary</span>
              </div>
              <div className="flex justify-between py-4 text-xl font-serif text-[var(--color-gold)] print:text-black">
                <span>Total</span>
                <span>{formatCartPrice(order.totalPrice)}</span>
              </div>
              <div className="flex justify-between py-2 text-xs text-[var(--color-ivory-muted)] print:text-gray-500">
                <span>Payment Method</span>
                <span>{order.paymentMethod} (Paid)</span>
              </div>
            </div>
          </div>
          
        </div>

        {/* Actions (Hide on Print) */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-6 print:hidden">
          <Link to="/shop" className="text-sm uppercase tracking-widest hover:text-[var(--color-gold)] transition-colors flex items-center gap-2">
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
