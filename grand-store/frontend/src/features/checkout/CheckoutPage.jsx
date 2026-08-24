import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, ArrowRight, ShieldCheck, Lock, CreditCard, Loader2, Truck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatCartPrice } from '../../data';
import LocationInput from '../../components/LocationInput';
import PaymentForm from './PaymentForm';
import Price from '../../components/ui/Price';

export default function CheckoutPage({ cartItems, onClearCart, clearVendorCart, onNotify }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vendorId = searchParams.get('vendor');
  const vendorCartItems = vendorId ? cartItems.filter(item => (item.storeId || item.vendorId || 'grand-store') === vendorId) : cartItems;

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
    country: ''
  });

  const [paymentData, setPaymentData] = useState(null);
  const [payfastUrl, setPayfastUrl] = useState(null);


  useEffect(() => {
    document.title = 'Checkout – The Grand Store';
    window.scrollTo({ top: 0, behavior: 'auto' });
    
    // Prevent vendors from checking out
    if (user && user.role && user.role.startsWith('vendor')) {
      onNotify("Vendors cannot checkout. Please sign up as a customer.");
      navigate('/register');
      return;
    }

    if (vendorCartItems.length === 0) {
      navigate('/customer/cart');
    }
  }, [vendorCartItems, navigate, user, onNotify, vendorId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

    const fetchQuote = async (shippingAddress) => {
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
        shippingAddress
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
      // setCheckoutStep(2); -> removed
      
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

    const [mapLocation, setMapLocation] = useState(null);
  const [isGift, setIsGift] = useState(false);
  const [giftRecipientName, setGiftRecipientName] = useState("");
  const [giftMessage, setGiftMessage] = useState("");

  const mapRef = React.useRef(null);
  const googleMapRef = React.useRef(null);
  const markerRef = React.useRef(null);

  useEffect(() => {
    if (mapLocation && mapRef.current && window.google && window.google.maps) {
      if (!googleMapRef.current) {
        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
          center: mapLocation,
          zoom: 15,
          disableDefaultUI: true,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
            { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
            { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
            { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
            { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1f2835" }] },
            { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#f3d19c" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
            { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#515c6d" }] },
            { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#17263c" }] }
          ]
        });
        markerRef.current = new window.google.maps.Marker({
          position: mapLocation,
          map: googleMapRef.current,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#c9a35b",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff"
          }
        });
      } else {
        googleMapRef.current.panTo(mapLocation);
        markerRef.current.setPosition(mapLocation);
      }
    }
  }, [mapLocation]);

  const [paymentMethod, setPaymentMethod] = useState('payfast'); // 'payfast' or 'bank_transfer'
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofUrl, setProofUrl] = useState('');

  // Hydrate checkout state on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('checkoutState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.checkoutStep && checkoutStep === 1) setCheckoutStep(parsed.checkoutStep);
        if (parsed.quote && !quote) setQuote(parsed.quote);
        if (parsed.formData && !formData.address) setFormData(parsed.formData);
        if (parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod);
        if (parsed.createdOrderId) setCreatedOrderId(parsed.createdOrderId);
      } catch (e) {}
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save state on change
  useEffect(() => {
    sessionStorage.setItem('checkoutState', JSON.stringify({
      checkoutStep, quote, formData, paymentMethod, createdOrderId
    }));
  }, [checkoutStep, quote, formData, paymentMethod, createdOrderId]);

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
        paymentMethod: paymentMethod === 'payfast' ? 'PayFast' : 'Bank Transfer',
        isGift,
        giftRecipientName,
        giftMessage
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
      
      setCreatedOrderId(data._id);

      if (paymentMethod === 'payfast') {
        // Request PayFast signature
        const pfRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payfast/generate-shop`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({ orderId: data._id })
        });

        const pfData = await pfRes.json();
        
        if (!pfRes.ok) {
           throw new Error(pfData.message || 'Error generating payment');
        }

        setPayfastUrl(pfData.url);
        setPaymentData(pfData.data);
      } else {
        // Go to Step 3: Upload Proof of Payment
        setCheckoutStep(3);
      }
      
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

  // --- Bank Transfer Proof Upload ---

  const handleUploadProof = async (e) => {
    e.preventDefault();
    if (!proofUrl) {
      onNotify("Please provide a link to the proof of payment document.");
      return;
    }
    setUploadingProof(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${createdOrderId}/bank-transfer/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ proofUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      onNotify("Proof uploaded successfully. Awaiting verification.");
      onClearCart(vendorId);
      navigate(`/customer/order/${createdOrderId}`);
    } catch (error) {
      onNotify(error.message || "Failed to upload proof");
    } finally {
      setUploadingProof(false);
    }
  };

    return (
    <main className="pt-32 pb-16 min-h-screen bg-[#050505]">
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-[var(--color-gold)] transition-colors text-sm font-medium uppercase tracking-wider">
            <ArrowRight size={16} className="rotate-180" /> Back
          </button>
        </div>
        
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

        <div className="max-w-4xl mx-auto flex flex-col gap-12 items-center w-full">
          
          
          {/* Creative Top Summary */}
          {checkoutStep !== 3 && (
            <div className="w-full bg-[#111]/80 backdrop-blur-md border border-[var(--color-gold)]/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent opacity-50"></div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex -space-x-4">
                  {cartItems.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="w-14 h-14 rounded-full border-2 border-black bg-[#222] overflow-hidden flex items-center justify-center p-2 z-[idx] relative">
                       <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" />
                    </div>
                  ))}
                  {cartItems.length > 4 && (
                    <div className="w-14 h-14 rounded-full border-2 border-black bg-[#333] text-[var(--color-gold)] text-xs font-bold flex items-center justify-center z-10 relative">
                      +{cartItems.length - 4}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center md:items-end text-center md:text-right">
                  <span className="text-[10px] uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1">Order Total</span>
                  {quote ? (
                    <span className="text-3xl font-serif text-gold-gradient"><Price amount={quote.aggregatedTotals.totalToPay} /></span>
                  ) : (
                    <span className="text-xl font-serif text-[var(--color-ivory-muted)]">Pending Address</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Left Column - Forms */}
          <div className="w-full flex flex-col gap-8">
            
            {checkoutStep !== 3 ? (
            
              <form onSubmit={handlePlaceOrder}>
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
                        onPlaceDetails={({ city, postalCode, country, lat, lng }) => {
                          setFormData(prev => ({
                            ...prev,
                            city: city,
                            postalCode: postalCode,
                            country: country
                          }));
                          if (lat && lng) {
                             setMapLocation({ lat, lng });
                          }
                          fetchQuote({
                            address: formData.address,
                            city: city,
                            postalCode: postalCode,
                            country: country
                          });
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
                    {/* Live Map */}
                    <div className="md:col-span-2">
                      <div className={`w-full transition-all duration-700 ease-in-out overflow-hidden rounded-xl border border-[var(--color-gold)]/20 ${mapLocation ? 'h-64 opacity-100 mt-4' : 'h-0 opacity-0 border-none'}`} ref={mapRef}></div>
                    </div>
                    
                    {/* Send as Gift */}
                    <div className="md:col-span-2 mt-4 bg-[#111] border border-white/5 p-5 rounded-xl">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input type="checkbox" checked={isGift} onChange={(e) => setIsGift(e.target.checked)} className="w-5 h-5 accent-[#c9a35b] rounded bg-black border-white/10" />
                        <span className="text-white font-medium text-sm">Send as a Gift</span>
                      </label>
                      
                      {isGift && (
                        <div className="mt-5 grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-[var(--color-ivory-muted)] mb-2">Recipient Name</label>
                            <input type="text" value={giftRecipientName} onChange={(e) => setGiftRecipientName(e.target.value)} required className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-[var(--color-gold)]/50 focus:outline-none transition-colors" placeholder="e.g. John Doe" />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-[var(--color-ivory-muted)] mb-2">Gift Message</label>
                            <textarea value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} rows="3" className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-[var(--color-gold)]/50 focus:outline-none transition-colors" placeholder="Write a special message..."></textarea>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
                
                


                {quoteLoading && (
                  <div className="flex flex-col items-center justify-center p-8 border border-white/10 rounded-xl mb-8 bg-black/40 mt-8">
                    <Loader2 size={32} className="animate-spin text-gold mb-4" />
                    <p className="text-[var(--color-ivory-muted)]">Calculating dynamic rates from Courier Guy & DHL...</p>
                  </div>
                )}
                {!quoteLoading && quote && quote.shipments.map((shp, index) => (
                  <div key={index} className="mt-8 mb-6 bg-black/40 border border-white/10 rounded-xl p-6">
                    <h4 className="text-lg font-serif text-gold mb-4 flex items-center gap-2"><Truck size={18} /> Shipment {index + 1} — {shp.vendorName || 'The Grand Store'}</h4>
                    <p className="text-xs text-[var(--color-ivory-muted)] mb-4">Delivering from {shp.originCountry} to {shp.destCountry}</p>
                    
                    <div className="mb-4">
                      {shp.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm mb-2">
                          <span>{item.quantity} × {item.name}</span>
                          <span><Price amount={item.price * item.quantity} /></span>
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
                          <div className="font-medium text-gold">{opt.cost > 0 ? <Price amount={opt.cost} /> : 'FREE'}</div>
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
                      Estimated duties/taxes: <Price amount={quote.aggregatedTotals.estimatedImportDuties + quote.aggregatedTotals.estimatedImportTaxes} />.
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
                    Payment Method
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`cursor-pointer bg-[#0a0a0a] border rounded-2xl p-6 relative overflow-hidden transition-all ${paymentMethod === 'payfast' ? 'border-[var(--color-gold)] shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'border-white/10 hover:border-white/30'}`}>
                      <input type="radio" name="paymentMethod" value="payfast" checked={paymentMethod === 'payfast'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                      <div className="absolute top-0 right-0 p-4 opacity-10"><CreditCard size={80} /></div>
                      <div className="relative z-10">
                        <h4 className="font-medium text-white mb-1">PayFast (Instant)</h4>
                        <p className="text-xs text-[var(--color-ivory-muted)] mb-4">Credit/Debit Cards, Instant EFT</p>
                        <img src="https://payfast.io/images/payfast-logo.svg" alt="PayFast" className="h-6 brightness-0 invert opacity-80" />
                      </div>
                    </label>

                    <label className={`cursor-pointer bg-[#0a0a0a] border rounded-2xl p-6 relative overflow-hidden transition-all ${paymentMethod === 'bank_transfer' ? 'border-[var(--color-gold)] shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'border-white/10 hover:border-white/30'}`}>
                      <input type="radio" name="paymentMethod" value="bank_transfer" checked={paymentMethod === 'bank_transfer'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                      <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldCheck size={80} /></div>
                      <div className="relative z-10">
                        <h4 className="font-medium text-white mb-1">Manual Bank Transfer</h4>
                        <p className="text-xs text-[var(--color-ivory-muted)] mb-4">Transfer funds directly to our bank. Upload proof to verify.</p>
                      </div>
                    </label>
                  </div>
                </section>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full mt-8 bg-[#c9a35b] text-black font-bold uppercase tracking-widest text-xs py-4 rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : <>Place Order • <Price amount={quote?.aggregatedTotals.totalToPay || 0} /> <ArrowRight size={16} /></>}
                </button>
                
                <PaymentForm paymentData={paymentData} payfastUrl={payfastUrl} />
              </form>
            ) : checkoutStep === 3 ? (
              /* Step 3: Bank Transfer Proof Upload */
              <div className="border-t border-white/10 pt-0 mb-8">
                <h2 className="text-xl font-serif mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[var(--color-gold)] text-black flex items-center justify-center text-sm font-sans"><CheckCircle2 size={16} /></span>
                  Order Placed Successfully
                </h2>
                
                <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-[var(--color-gold)]/20 shadow-[0_0_30px_rgba(212,175,55,0.05)] rounded-2xl p-8 mb-8 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-gold)]/5 rounded-full blur-3xl"></div>
                  <div className="relative z-10">
                    <h3 className="text-lg font-serif text-[var(--color-gold)] mb-2">Awaiting Bank Transfer</h3>
                  <p className="text-sm text-[var(--color-ivory-muted)] mb-6">
                    Your order <span className="text-white font-mono">{createdOrderId}</span> has been created. 
                    Please transfer exactly <strong className="text-white"><Price amount={quote?.aggregatedTotals.totalToPay || 0} /></strong> to our bank account.
                  </p>

                  <div className="bg-black/50 border border-white/5 p-6 rounded-xl text-left max-w-sm mx-auto mb-6">
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Bank Name</p>
                    <p className="text-sm text-white mb-3">{quote?.bankDetails?.bankName || 'Standard Bank'}</p>
                    
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Account Name</p>
                    <p className="text-sm text-white mb-3">{quote?.bankDetails?.accountName || 'The Grand Store PTY LTD'}</p>
                    
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Account Number</p>
                    <p className="text-sm text-white font-mono mb-3">{quote?.bankDetails?.accountNumber || '0123456789'}</p>
                    
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Branch Code</p>
                    <p className="text-sm text-white font-mono mb-3">{quote?.bankDetails?.branchCode || '051001'}</p>
                    
                    <p className="text-xs text-[var(--color-gold)] uppercase tracking-widest mb-1">Reference</p>
                    <p className="text-lg text-white font-mono font-bold">{createdOrderId?.slice(-6).toUpperCase()}</p>
                  </div>

                  <form onSubmit={handleUploadProof} className="max-w-sm mx-auto text-left">
                    <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-2">Proof of Payment URL (Image/PDF)</label>
                    <input 
                      type="url" 
                      value={proofUrl} 
                      onChange={(e) => setProofUrl(e.target.value)} 
                      required 
                      placeholder="https://..."
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--color-gold)]/50 focus:outline-none transition-colors mb-4" 
                    />
                    
                    <button 
                      type="submit" 
                      disabled={uploadingProof}
                      className="w-full bg-gradient-to-r from-[#c9a35b] to-[#b58b38] text-black font-bold uppercase tracking-widest text-xs py-4 rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2"
                    >
                      {uploadingProof ? <><Loader2 size={16} className="animate-spin" /> Uploading...</> : 'Submit Proof'}
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={() => navigate(`/customer/order/${createdOrderId}`)}
                      className="w-full text-[10px] text-gray-500 uppercase tracking-widest mt-4 hover:text-white transition-colors"
                    >
                      I'll upload it later from my orders
                    </button>
                  </form>
                  </div>
                </div>
              </div>
            ) : null}
            
          </div>

          </div>
      </div>
    </main>
  );
}
