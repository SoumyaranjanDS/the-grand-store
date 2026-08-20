import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, ArrowRight, ShieldCheck, Lock, CreditCard, Loader2, Truck, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatCartPrice } from '../../data';
import LocationInput from '../../components/LocationInput';

export default function CheckoutPage({ cartItems, onClearCart, clearVendorCart, onNotify }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vendorId = searchParams.get('vendor');
  const vendorCartItems = cartItems.filter(item => (item.storeId || item.vendorId || 'grand-store') === vendorId);

  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Flow State: 1 = Address, 2 = Quote & Payment
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [quote, setQuote] = useState(null);
  const [dutiesAccepted, setDutiesAccepted] = useState(false);

  const [formData, setFormData] = useState({
    email: user ? user.email : '',
    firstName: user ? user.name.split(' ')[0] : '',
    lastName: user && user.name.split(' ').length > 1 ? user.name.split(' ')[1] : '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  useEffect(() => {
    document.title = 'Checkout – The Grand Store';
    window.scrollTo({ top: 0, behavior: 'auto' });
    
    // Prevent vendors from checking out
    if (user && user.role && user.role.startsWith('vendor')) {
      onNotify("Vendors cannot checkout. Please sign up as a customer.");
      navigate('/register');
      return;
    }

    if (!vendorId || vendorCartItems.length === 0) {
      navigate('/customer/cart');
    }
  }, [vendorCartItems, navigate, user, onNotify, vendorId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerateQuote = async (e) => {
    e.preventDefault();
    if (!user) {
      onNotify("Please log in to continue checkout");
      navigate('/login?redirect=/customer/checkout');
      return;
    }
    
    setQuoteLoading(true);
    
    try {
      const payload = {
        cartItems: vendorCartItems.map(item => ({
          product: item.id || item._id,
          name: item.fullName || item.name,
          quantity: item.quantity,
          option: item.option,
          image: item.image
        })),
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country
        }
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/checkout/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error generating quote');

      setQuote(data);
      setCheckoutStep(2);
      
    } catch (error) {
      console.error(error);
      onNotify(error.message || 'Failed to get shipping quote. Check address details.');
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleCourierSelect = (shipmentIndex, courierOption) => {
    if (!quote) return;
    const newQuote = { ...quote };
    newQuote.shipments[shipmentIndex].selectedCourier = courierOption;
    
    // Recalculate defaultShippingTotal
    let newShippingTotal = newQuote.shipments.reduce((sum, shp) => sum + (shp.selectedCourier ? shp.selectedCourier.cost : 0), 0);
    newQuote.aggregatedTotals.shipping = newShippingTotal;
    
    // Recalculate totalToPay
    const { globalSubtotal, aggregatedTotals } = newQuote;
    newQuote.aggregatedTotals.totalToPay = parseFloat((globalSubtotal + newShippingTotal + aggregatedTotals.vat).toFixed(2));
    
    setQuote(newQuote);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (quote.hasInternational && !dutiesAccepted) {
      onNotify("Please accept the International Duties acknowledgment");
      return;
    }
    
    setLoading(true);
    
    try {
      const orderData = {
        quote,
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country
        },
        paymentMethod: 'Credit Card (Simulated)'
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
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

      if (clearVendorCart && vendorId) {
        clearVendorCart(vendorId);
      } else {
        onClearCart();
      }
      onNotify('Order placed successfully!');
      navigate(`/customer/order/${data._id}`);
      
    } catch (error) {
      console.error(error);
      onNotify(error.message || 'Failed to place order');
      if (error.message.includes('expired')) {
        setCheckoutStep(1); // Force requote
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-[var(--color-ivory)] pt-0 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-xs text-[var(--color-ivory-muted)] uppercase tracking-widest mb-4">
            <Link to="/customer/cart" className="hover:text-gold-gradient transition-colors">Cart</Link>
            <ChevronRight size={12} />
            <span className={checkoutStep === 1 ? "text-gold-gradient font-medium" : ""}>Delivery</span>
            <ChevronRight size={12} />
            <span className={checkoutStep === 2 ? "text-gold-gradient font-medium" : ""}>Payment</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column - Forms */}
          <div className="lg:col-span-7 flex flex-col gap-10">
            
            {/* Step 1: Address */}
            {checkoutStep === 1 ? (
              <form onSubmit={handleGenerateQuote}>
                <section className="border-t border-white/10 pt-0 mb-8">
                  <h2 className="text-xl font-serif mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-sans">1</span>
                    Delivery Address
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
                      <LocationInput 
                        name="address" 
                        value={formData.address} 
                        onChange={handleChange} 
                        onPlaceDetails={({ city, postalCode, country }) => {
                          setFormData(prev => ({
                            ...prev,
                            city: city,
                            postalCode: postalCode,
                            country: country
                          }));
                        }}
                        required 
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--color-gold)]/50 focus:outline-none transition-colors text-white" 
                        placeholder="Start typing your address..." 
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-2">City</label>
                      <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--color-gold)]/50 focus:outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-2">Postal Code</label>
                      <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} required className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--color-gold)]/50 focus:outline-none transition-colors" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-2">Country</label>
                      <input type="text" name="country" value={formData.country} onChange={handleChange} required className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--color-gold)]/50 focus:outline-none transition-colors text-white" />
                    </div>
                  </div>
                </section>
                <button 
                  type="submit" 
                  disabled={quoteLoading}
                  className="w-full bg-gradient-to-r from-[#b58b38] via-[#e6c97a] to-[#b58b38] text-black font-bold uppercase tracking-widest text-xs py-4 rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2"
                >
                  {quoteLoading ? <><Loader2 size={16} className="animate-spin" /> Calculating Shipping...</> : <>Continue to Payment <ArrowRight size={16} /></>}
                </button>
              </form>
            ) : (
              /* Step 2: Quote Breakdown & Payment */
              <form onSubmit={handlePlaceOrder}>
                <div className="mb-6 pb-6 border-b border-white/10 flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-medium">Delivery to: {formData.city}, {formData.country}</h3>
                    <p className="text-xs text-[var(--color-ivory-muted)] mt-1">{formData.address}, {formData.postalCode}</p>
                  </div>
                  <button type="button" onClick={() => setCheckoutStep(1)} className="text-xs text-gold-gradient uppercase tracking-widest hover:underline">Change</button>
                </div>

                {quote && quote.shipments.map((shp, index) => (
                  <div key={index} className="mb-6 bg-black/40 border border-white/10 rounded-xl p-6">
                    <h4 className="text-lg font-serif text-gold mb-4 flex items-center gap-2"><Truck size={18} /> Shipment {index + 1} — {shp.vendorName || 'The Grand Store'}</h4>
                    <p className="text-xs text-[var(--color-ivory-muted)] mb-4">Delivering from {shp.originCountry} to {shp.destCountry}</p>
                    
                    <div className="mb-4">
                      {shp.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm mb-2">
                          <span>{item.quantity} × {item.name}</span>
                          <span>{formatCartPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 mt-4 pt-4 border-t border-white/5">
                      <p className="text-xs uppercase tracking-widest text-[var(--color-ivory-muted)]">Select Delivery Option</p>
                      {shp.shippingQuotes.map((opt, optIndex) => (
                        <label key={optIndex} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${shp.selectedCourier?.serviceLevel === opt.serviceLevel ? 'border-gold bg-gold/5' : 'border-white/10 hover:border-white/30'}`}>
                          <div className="flex items-center gap-3">
                            <input 
                              type="radio" 
                              name={`courier-${index}`} 
                              checked={shp.selectedCourier?.serviceLevel === opt.serviceLevel}
                              onChange={() => handleCourierSelect(index, opt)}
                              className="accent-gold"
                            />
                            <div>
                              <div className="text-sm font-medium text-white">{opt.serviceLevel} ({opt.courierName})</div>
                              <div className="text-xs text-[var(--color-ivory-muted)]">{opt.estimatedDays}</div>
                            </div>
                          </div>
                          <div className="font-medium text-gold">{opt.cost > 0 ? formatCartPrice(opt.cost) : 'FREE'}</div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                {quote?.hasInternational && (
                  <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-5 mb-8">
                    <h4 className="text-red-400 font-bold flex items-center gap-2 mb-2"><AlertTriangle size={18} /> IMPORTANT: International Delivery</h4>
                    <p className="text-sm text-red-200/80 mb-4">
                      Import duties, customs charges, destination VAT/GST or other government charges may be payable by you upon arrival in {formData.country}. 
                      The delivery charge covers transportation only.
                      Estimated duties/taxes: {formatCartPrice(quote.aggregatedTotals.estimatedImportDuties + quote.aggregatedTotals.estimatedImportTaxes)}.
                    </p>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1 accent-red-500" checked={dutiesAccepted} onChange={(e) => setDutiesAccepted(e.target.checked)} required />
                      <span className="text-sm text-white font-medium">I understand that I am responsible for any destination-country taxes, duties, or customs charges.</span>
                    </label>
                  </div>
                )}

                {/* Payment Section */}
                <section className="border-t border-white/10 pt-8">
                  <h2 className="text-xl font-serif flex items-center gap-3 mb-6">
                    <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-sans">2</span>
                    Payment
                  </h2>
                  <div className="bg-[#0a0a0a] border border-[var(--color-gold)]/30 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><CreditCard size={100} /></div>
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
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full mt-8 bg-gradient-to-r from-[#b58b38] via-[#e6c97a] to-[#b58b38] text-black font-bold uppercase tracking-widest text-xs py-4 rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : <>Pay {formatCartPrice(quote?.aggregatedTotals.totalToPay || 0)} <ArrowRight size={16} /></>}
                </button>
              </form>
            )}
            
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
                  </div>
                ))}
              </div>

              {quote ? (
                <div className="border-t border-white/10 pt-6 flex flex-col gap-3 text-sm">
                  <div className="flex justify-between text-[var(--color-ivory-muted)]">
                    <span>Products Subtotal</span>
                    <span>{formatCartPrice(quote.globalSubtotal)}</span>
                  </div>
                  <div className="flex justify-between pb-4 border-b border-white/10 text-[var(--color-ivory-muted)]">
                    <span>Delivery (Total)</span>
                    <span>{quote.aggregatedTotals.shipping > 0 ? formatCartPrice(quote.aggregatedTotals.shipping) : 'Free'}</span>
                  </div>
                  <div className="flex justify-between text-lg font-serif mt-2">
                    <span>Total To Pay</span>
                    <span className="text-gold-gradient">{formatCartPrice(quote.aggregatedTotals.totalToPay)}</span>
                  </div>
                  <p className="text-[10px] text-white/30 italic mt-4">
                    Price locked for 10 minutes. 
                    {quote.hasInternational && " Destination customs/duties are not included in this total."}
                  </p>
                </div>
              ) : (
                <div className="border-t border-white/10 pt-6 flex flex-col gap-3 text-sm text-[var(--color-ivory-muted)] text-center italic">
                  Enter your delivery address to see final shipping and tax calculated securely.
                </div>
              )}
              
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[var(--color-ivory-muted)]">
                <ShieldCheck size={14} /> Payments are secure and encrypted
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
