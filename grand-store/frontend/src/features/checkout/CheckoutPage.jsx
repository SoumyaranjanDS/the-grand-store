import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, ShieldCheck, Lock, CreditCard, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatCartPrice, getProductPrice } from '../../data';

export default function CheckoutPage({ cartItems, onClearCart, onNotify }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: user ? user.email : '',
    firstName: user ? user.name.split(' ')[0] : '',
    lastName: user && user.name.split(' ').length > 1 ? user.name.split(' ')[1] : '',
    address: '',
    city: '',
    postalCode: '',
    country: 'South Africa',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartItems.reduce((total, item) => total + (getProductPrice(item.price) * item.quantity), 0);
  const delivery = 0;
  const total = subtotal + delivery;

  useEffect(() => {
    document.title = 'Checkout – The Grand Store';
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (cartItems.length === 0) {
      navigate('/customer/cart');
    }
  }, [cartItems, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      onNotify("Please log in to place an order");
      navigate('/login?redirect=/customer/checkout');
      return;
    }
    
    setLoading(true);
    
    try {
      const orderData = {
        orderItems: cartItems.map(item => ({
          product: item.id || item._id,
          name: item.fullName || item.name,
          quantity: item.quantity,
          price: getProductPrice(item.price),
          option: item.option,
          image: item.image
        })),
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country
        },
        paymentMethod: 'Credit Card (Simulated)',
        totalPrice: total
      };

      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Error placing order');
      }

      onClearCart();
      onNotify('Order placed successfully!');
      navigate(`/customer/order/${data._id}`);
      
    } catch (error) {
      console.error(error);
      onNotify(error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-[var(--color-ivory)] pt-10 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-xs text-[var(--color-ivory-muted)] uppercase tracking-widest mb-4">
            <Link to="/customer/cart" className="hover:text-gold-gradient transition-colors">Cart</Link>
            <ChevronRight size={12} />
            <span className="text-gold-gradient font-medium">Secure Checkout</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif">Checkout</h1>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column - Forms */}
          <div className="lg:col-span-7 flex flex-col gap-10">
            
            {/* Contact Info */}
            <section className="border-t border-white/10 pt-8">
              <h2 className="text-xl font-serif mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-sans">1</span>
                Contact Information
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-2">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--color-gold)]/50 focus:outline-none transition-colors" placeholder="Email for order updates" />
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section className="border-t border-white/10 pt-8">
              <h2 className="text-xl font-serif mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-sans">2</span>
                Shipping Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-2">First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--color-gold)]/50 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-2">Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--color-gold)]/50 focus:outline-none transition-colors" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-2">Street Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} required className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--color-gold)]/50 focus:outline-none transition-colors" placeholder="Apartment, suite, etc." />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-2">City</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--color-gold)]/50 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-2">Postal Code</label>
                  <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} required className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--color-gold)]/50 focus:outline-none transition-colors" />
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="border-t border-white/10 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-sans">3</span>
                  Payment
                </h2>
                <div className="flex items-center gap-2 text-xs text-[var(--color-ivory-muted)]">
                  <Lock size={14} /> Secure Encryption
                </div>
              </div>
              
              <div className="bg-[#0a0a0a] border border-[var(--color-gold)]/30 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <CreditCard size={100} />
                </div>
                
                <p className="text-sm text-gold-gradient mb-6 font-medium">Credit / Debit Card</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                  <div className="md:col-span-2">
                    <input type="text" name="cardNumber" value={formData.cardNumber} onChange={handleChange} required maxLength="19" placeholder="Card Number (Mock)" className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-sm focus:border-[var(--color-gold)] focus:outline-none transition-colors placeholder:text-white/20" />
                  </div>
                  <div>
                    <input type="text" name="expiry" value={formData.expiry} onChange={handleChange} required placeholder="MM / YY" className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-sm focus:border-[var(--color-gold)] focus:outline-none transition-colors placeholder:text-white/20" />
                  </div>
                  <div>
                    <input type="text" name="cvc" value={formData.cvc} onChange={handleChange} required placeholder="CVC" className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-sm focus:border-[var(--color-gold)] focus:outline-none transition-colors placeholder:text-white/20" />
                  </div>
                </div>
              </div>
            </section>
            
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-24 bg-[#0a0a0a] border border-white/10 rounded-2xl p-8">
              <h3 className="text-xl font-serif mb-6">Order Summary</h3>
              
              <div className="flex flex-col gap-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center p-2">
                      <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{item.fullName || item.name}</h4>
                      <p className="text-xs text-[var(--color-ivory-muted)]">{item.option} × {item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium">
                      {formatCartPrice(getProductPrice(item.price) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-6 flex flex-col gap-3 text-sm">
                <div className="flex justify-between text-[var(--color-ivory-muted)]">
                  <span>Subtotal</span>
                  <span>{formatCartPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10 mb-4 pb-4">
                  <span className="text-[var(--color-ivory-muted)]">Shipping</span>
                  <span>Complimentary</span>
                </div>
                <div className="flex justify-between text-lg font-serif mt-4 pt-4 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-gold-gradient">{formatCartPrice(total)}</span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-8 bg-gradient-to-r from-[#b58b38] via-[#e6c97a] to-[#b58b38] text-black font-bold uppercase tracking-widest text-xs py-4 rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Processing...</>
                ) : (
                  <>Pay {formatCartPrice(total)} <ArrowRight size={16} /></>
                )}
              </button>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[var(--color-ivory-muted)]">
                <ShieldCheck size={14} /> Payments are secure and encrypted
              </div>
            </div>
          </div>

        </form>
      </div>
    </main>
  );
}
