import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, ArrowRight, ShieldCheck, Lock, CreditCard, Loader2, Truck, AlertTriangle, CheckCircle2, ShoppingCart, MapPin, FileText, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getProductPrice } from '../../data';
import LocationInput from '../../components/LocationInput';
import CityInput from '../../components/CityInput';
import PaymentForm from './PaymentForm';
import Price from '../../components/ui/Price';
import api from '../../api';

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
  const [deliveryPreference, setDeliveryPreference] = useState('home');

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

  const cartSubtotal = vendorCartItems.reduce((sum, item) => sum + (getProductPrice(item.price) * item.quantity), 0);

  useEffect(() => {
    document.title = 'Checkout – The Grand Store';
    window.scrollTo({ top: 0, behavior: 'auto' });
    
    // Prevent vendors and admins from checking out
    if (user && user.role && (user.role.startsWith('vendor') || user.role === 'admin')) {
      onNotify("Vendors and admins cannot checkout. Please login as a customer to buy.");
      navigate('/register');
      return;
    }

    if (vendorCartItems.length === 0) {
      navigate('/customer/cart');
    }
  }, [vendorCartItems, navigate, user, onNotify, vendorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (['address', 'city', 'postalCode', 'country'].includes(name)) {
      setQuote(null);
      setDutiesAccepted(false);
    }
  };

  const selectDeliveryPreference = (preference) => {
    setDeliveryPreference(preference);
    setQuote(null);
    setDutiesAccepted(false);
    if (preference === 'postnet') {
      setFormData((current) => ({ ...current, country: 'South Africa' }));
    }
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
        shippingAddress,
        deliveryPreference
      };

      const res = await api.post(`/checkout/quote`, payload);
      const data = res.data;

      setQuote(data);
      window.requestAnimationFrame(() => {
        document.getElementById('delivery-rates')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      // setCheckoutStep(2); -> removed
      
    } catch (error) {
      console.error(error);
      onNotify(error.response?.data?.message || error.message || 'Failed to get shipping quote. Check address details.');
    } finally {
      setQuoteLoading(false);
    }
  };


  const handleCourierSelect = (shipmentIndex, courierOption) => {
    if (!quote) return;
    
    const newShipments = [...quote.shipments];
    newShipments[shipmentIndex] = {
      ...newShipments[shipmentIndex],
      selectedCourier: courierOption,
      selectedPickupStore: courierOption.courierName === 'PostNet'
        ? newShipments[shipmentIndex].selectedPickupStore
        : null
    };

    let newShippingTotal = newShipments.reduce((sum, shp) => sum + (shp.selectedCourier ? shp.selectedCourier.cost : 0), 0);
    
    const newQuote = { 
      ...quote,
      shipments: newShipments,
      aggregatedTotals: {
        ...quote.aggregatedTotals,
        shipping: newShippingTotal,
        totalToPay: parseFloat((quote.globalSubtotal + newShippingTotal).toFixed(2))
      }
    };
    
    setQuote(newQuote);
  };

  const handlePostnetStoreSelect = (shipmentIndex, store) => {
    if (!quote) return;

    const newShipments = quote.shipments.map((shipment, index) => (
      index === shipmentIndex
        ? { ...shipment, selectedPickupStore: store }
        : shipment
    ));

    setQuote({ ...quote, shipments: newShipments });
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

  const cartHash = JSON.stringify(vendorCartItems.map(i => ({ id: i.id || i._id, q: i.quantity, opt: i.option })));

  // Hydrate checkout state on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('checkoutState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.cartHash === cartHash) {
          if (parsed.checkoutStep && checkoutStep === 1) setCheckoutStep(parsed.checkoutStep);
          if (parsed.quote && !quote) setQuote(parsed.quote);
          if (parsed.formData && !formData.address) setFormData(parsed.formData);
          if (parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod);
          if (parsed.createdOrderId) setCreatedOrderId(parsed.createdOrderId);
          if (parsed.deliveryPreference) setDeliveryPreference(parsed.deliveryPreference);
        } else {
          sessionStorage.removeItem('checkoutState');
          if (parsed.formData && !formData.address) setFormData(parsed.formData);
        }
      } catch (e) {}
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save state on change
  useEffect(() => {
    sessionStorage.setItem('checkoutState', JSON.stringify({
      checkoutStep, quote, formData, paymentMethod, createdOrderId, deliveryPreference, cartHash
    }));
  }, [checkoutStep, quote, formData, paymentMethod, createdOrderId, deliveryPreference, cartHash]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!quote) {
      onNotify("Please calculate and select a delivery option first.");
      return;
    }

    const missingPostnetBranch = quote.shipments.some((shipment) => (
      shipment.selectedCourier?.courierName === 'PostNet' && !shipment.selectedPickupStore
    ));
    if (missingPostnetBranch) {
      onNotify("Please select a PostNet branch for every PostNet shipment.");
      return;
    }
    
    if (quote.hasInternational && !dutiesAccepted) {
      onNotify("Please accept the International Duties acknowledgment");
      return;
    }
    
    setLoading(true);
    
    try {
      const orderData = {
        quote,
        shippingAddress: {
          address: formData.address || quote.shipments.find((shipment) => shipment.selectedPickupStore)?.selectedPickupStore?.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country
        },
        deliveryPreference,
        paymentMethod: paymentMethod === 'payfast' ? 'PayFast' : 'Bank Transfer',
        isGift,
        giftRecipientName,
        giftMessage
      };

      const res = await api.post(`/orders`, orderData);
      const data = res.data;
      
      setCreatedOrderId(data._id);

      if (paymentMethod === 'payfast') {
        // Request PayFast signature
        const pfRes = await api.post(`/payfast/generate-shop`, { orderId: data._id });
        const pfData = pfRes.data;

        setPayfastUrl(pfData.url);
        setPaymentData(pfData.data);
      } else {
        // Go to Step 3: Upload Proof of Payment
        setCheckoutStep(3);
      }
      
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.message || 'Failed to place order';
      onNotify(msg);
      if (msg.includes('expired')) {
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
      await api.post(`/orders/${createdOrderId}/bank-transfer/upload`, { proofUrl });
      
      onNotify("Proof uploaded successfully. Awaiting verification.");
      onClearCart(vendorId);
      navigate(`/customer/order/${createdOrderId}`);
    } catch (error) {
      onNotify(error.response?.data?.message || error.message || "Failed to upload proof");
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
          
          
          {/* Itemised order summary */}
          {checkoutStep !== 3 && (
            <div className="w-full bg-[#111]/80 backdrop-blur-md border border-[var(--color-gold)]/20 rounded-2xl p-5 md:p-7 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent opacity-50"></div>
              <div className="relative">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)] mb-1">Your order</p>
                    <h2 className="text-xl font-serif text-white">Price breakdown</h2>
                  </div>
                  <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-[var(--color-ivory-muted)]">
                    {vendorCartItems.reduce((sum, item) => sum + item.quantity, 0)} item{vendorCartItems.reduce((sum, item) => sum + item.quantity, 0) === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="space-y-3 border-b border-white/10 pb-5">
                  {vendorCartItems.map((item) => (
                    <div key={`${item.id || item._id}-${item.option || ''}`} className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3">
                      <div className="w-11 h-11 rounded-lg border border-white/10 bg-black/40 p-1.5 flex items-center justify-center overflow-hidden">
                        <img src={item.image} alt="" className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{item.fullName || item.name}</p>
                        <p className="text-xs text-[var(--color-ivory-muted)]">Qty {item.quantity}{item.option ? ` · ${item.option}` : ''}</p>
                      </div>
                      <span className="text-sm text-white"><Price amount={getProductPrice(item.price) * item.quantity} /></span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-5 text-sm">
                  <div className="flex justify-between gap-4 text-[var(--color-ivory-muted)]">
                    <span>Merchandise subtotal</span>
                    <span className="text-white"><Price amount={quote?.globalSubtotal ?? cartSubtotal} /></span>
                  </div>
                  {quote ? quote.shipments.map((shipment, index) => (
                    <div key={`${shipment.vendorId || index}-shipping`} className="flex justify-between gap-4 text-[var(--color-ivory-muted)]">
                      <span className="min-w-0">Delivery {quote.shipments.length > 1 ? `${index + 1} ` : ''}<span className="text-white/50">· {shipment.selectedCourier?.courierName}</span></span>
                      <span className="text-white shrink-0">{shipment.selectedCourier?.cost > 0 ? <Price amount={shipment.selectedCourier.cost} /> : 'FREE'}</span>
                    </div>
                  )) : (
                    <div className="flex justify-between gap-4 text-[var(--color-ivory-muted)]">
                      <span>Delivery</span>
                      <span>Calculated after details</span>
                    </div>
                  )}

                  <div className="flex items-end justify-between gap-4 border-t border-white/10 pt-4">
                    <div>
                      <p className="text-white font-medium">Pay now</p>
                      <p className="text-[11px] text-[var(--color-ivory-muted)]">Products and selected delivery</p>
                    </div>
                    <span className="text-3xl font-serif text-gold-gradient"><Price amount={quote?.aggregatedTotals.totalToPay ?? cartSubtotal} /></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Left Column - Forms */}
          <div className="w-full flex flex-col gap-8">
            
            {checkoutStep !== 3 ? (
            
              <form onSubmit={handlePlaceOrder}>
                {/* Shipping Method Section moved to top */}
                <section className="mb-8">
                  <h2 className="text-xl font-serif mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-sans">1</span>
                    Delivery Method
                  </h2>
                  
                  <p className="text-sm text-[var(--color-ivory-muted)] mb-5">Choose how you want to receive the order before entering delivery details.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      {
                        value: 'home',
                        title: 'Door delivery',
                        description: 'Courier Guy locally or DHL for an international address.',
                        icon: Truck
                      },
                      {
                        value: 'postnet',
                        title: 'PostNet pickup',
                        description: 'South Africa only. Search your city, then choose a nearby branch.',
                        icon: MapPin
                      },
                      {
                        value: 'best',
                        title: 'Compare all',
                        description: 'See every available home and pickup rate together.',
                        icon: ShoppingCart
                      }
                    ].map((method) => {
                      const MethodIcon = method.icon;
                      const selected = deliveryPreference === method.value;
                      return (
                        <button
                          key={method.value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => selectDeliveryPreference(method.value)}
                          className={`relative rounded-2xl border p-5 text-left transition-all ${selected ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10 shadow-[0_0_20px_rgba(212,175,55,0.08)]' : 'border-white/10 bg-[#0a0a0a] hover:border-white/30'}`}
                        >
                          <span className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full ${selected ? 'bg-[var(--color-gold)] text-black' : 'bg-white/5 text-white/60'}`}>
                            <MethodIcon size={19} />
                          </span>
                          <span className="block text-sm font-medium text-white mb-1">{method.title}</span>
                          <span className="block text-xs leading-relaxed text-[var(--color-ivory-muted)]">{method.description}</span>
                          {selected && <CheckCircle2 size={17} className="absolute right-4 top-4 text-[var(--color-gold)]" />}
                        </button>
                      );
                    })}
                  </div>

                  {!quote && !quoteLoading && (
                    <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-[var(--color-ivory-muted)]">
                      Next: add {deliveryPreference === 'postnet' ? 'your city and postal code' : 'the delivery address'} below, then calculate the available rate.
                    </div>
                  )}

                  {quoteLoading && (
                    <div className="flex flex-col items-center justify-center p-8 border border-white/10 rounded-xl bg-black/40">
                      <Loader2 size={32} className="animate-spin text-gold mb-4" />
                      <p className="text-[var(--color-ivory-muted)]">Checking the available courier and PostNet rates...</p>
                    </div>
                  )}

                  {!quoteLoading && quote && quote.shipments.map((shp, index) => (
                    <div id={index === 0 ? 'delivery-rates' : undefined} key={index} className="bg-black/40 border border-white/10 rounded-xl p-5 md:p-6 mt-5 mb-6 last:mb-0">
                      <h4 className="text-lg font-serif text-gold mb-4 flex items-center gap-2"><Truck size={18} /> Shipment {index + 1} — {shp.vendorName || 'The Grand Store'}</h4>
                      <p className="text-xs text-[var(--color-ivory-muted)] mb-4">Delivering from {shp.originCountry} to {shp.destCountry}</p>
                      
                      <div className="mb-4">
                        {shp.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm mb-2">
                            <span>{item.quantity} × {item.name}</span>
                            <span><Price amount={getProductPrice(item.price) * item.quantity} /></span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3 mt-4 pt-4 border-t border-white/5">
                        <p className="text-xs uppercase tracking-widest text-[var(--color-ivory-muted)]">Select Delivery Option</p>
                        {shp.shippingQuotes.map((opt, optIndex) => (
                          <div key={optIndex} className="mb-2">
                            <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${shp.selectedCourier?.serviceLevel === opt.serviceLevel ? 'border-gold bg-gold/5' : 'border-white/10 hover:border-white/30'}`}>
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
                            
                            {/* PostNet Stores Logic */}
                            {shp.selectedCourier?.serviceLevel === opt.serviceLevel && opt.courierName === 'PostNet' && (
                              <div className="mt-2 pl-8 pr-3 pb-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                {opt.stores && opt.stores.length > 0 ? (
                                  <div className="mt-3">
                                    <p className="text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-3">Nearby PostNet Locations</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {opt.stores.map(store => (
                                        <label key={store.id} className="block cursor-pointer">
                                          <input
                                            type="radio"
                                            name={`postnet-store-${index}`}
                                            value={store.id}
                                            checked={shp.selectedPickupStore?.id === store.id}
                                            onChange={() => handlePostnetStoreSelect(index, store)}
                                            className="peer sr-only"
                                            required
                                          />
                                          <div className="h-full border border-white/10 bg-[#0a0a0a] p-3 rounded-lg peer-checked:border-gold peer-checked:bg-gold/5 hover:border-white/30 transition-colors">
                                            <p className="text-sm font-medium text-white mb-1">{store.name}</p>
                                            <p className="text-xs text-[var(--color-ivory-muted)]">{store.address}</p>
                                          </div>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm mt-2 flex items-start gap-2">
                                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                    <p>No PostNet stores are available near your address. Please select another delivery option.</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {!quoteLoading && quote?.hasInternational && (
                    <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-5 mt-6">
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
                </section>

                <section className="border-t border-white/10 pt-8 mb-8">
                  <h2 className="text-xl font-serif mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-sans">2</span>
                    Delivery Details
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
                    {deliveryPreference !== 'postnet' ? (
                      <div className="md:col-span-2">
                        <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-2">Street Address</label>
                        <LocationInput
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          onPlaceDetails={({ address, city, postalCode, country, lat, lng }) => {
                            setFormData((current) => ({
                              ...current,
                              address: address || current.address,
                              city: city || current.city,
                              postalCode: postalCode || current.postalCode,
                              country: country || current.country
                            }));
                            setQuote(null);
                            setDutiesAccepted(false);
                            if (lat && lng) setMapLocation({ lat, lng });
                          }}
                          required
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--color-gold)]/50 focus:outline-none transition-colors text-white"
                          placeholder="Start typing your address..."
                        />
                        <p className="mt-2 text-xs text-[var(--color-ivory-muted)]">Select a suggested address, review the fields below, then calculate the delivery rate.</p>
                      </div>
                    ) : (
                      <div className="md:col-span-2 rounded-xl border border-[var(--color-gold)]/20 bg-[var(--color-gold)]/5 p-4 flex items-start gap-3">
                        <MapPin size={18} className="mt-0.5 shrink-0 text-[var(--color-gold)]" />
                        <div>
                          <p className="text-sm text-white font-medium">No street address needed yet</p>
                          <p className="mt-1 text-xs leading-relaxed text-[var(--color-ivory-muted)]">Enter your city and postal code. You will choose the exact PostNet branch after the branch search.</p>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-2">City</label>
                      <CityInput
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        onCityDetails={({ city, country, lat, lng }) => {
                          setFormData((current) => ({
                            ...current,
                            city,
                            country: deliveryPreference === 'postnet' ? 'South Africa' : (country || current.country)
                          }));
                          setQuote(null);
                          setDutiesAccepted(false);
                          if (lat && lng) setMapLocation({ lat, lng });
                        }}
                        restrictToSouthAfrica={deliveryPreference === 'postnet'}
                        required
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--color-gold)]/50 focus:outline-none transition-colors"
                        placeholder={deliveryPreference === 'postnet' ? 'Search South African cities...' : 'Search for a city...'}
                      />
                      <p className="mt-2 text-xs text-[var(--color-ivory-muted)]">Start typing and select a city from the suggestions.</p>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-2">Postal Code</label>
                      <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} required className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--color-gold)]/50 focus:outline-none transition-colors" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-2">Country</label>
                      {deliveryPreference === 'postnet' ? (
                        <div className="w-full bg-[#0a0a0a] border border-[var(--color-gold)]/25 rounded-xl px-4 py-3 text-sm text-white flex items-center justify-between gap-3">
                          <span>South Africa</span>
                          <span className="text-[10px] uppercase tracking-widest text-[var(--color-gold)]">PostNet only</span>
                        </div>
                      ) : (
                        <input type="text" name="country" value={formData.country} onChange={handleChange} required className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--color-gold)]/50 focus:outline-none transition-colors text-white" />
                      )}
                    </div>
                    
                    <div className="md:col-span-2 mt-2">
                        <button 
                          type="button" 
                          onClick={() => {
                            const needsStreetAddress = deliveryPreference !== 'postnet';
                            if ((needsStreetAddress && !formData.address) || !formData.city || !formData.postalCode || !formData.country) {
                              onNotify(needsStreetAddress
                                ? "Please fill in the address, city, postal code, and country."
                                : "Please fill in the city, postal code, and country to find PostNet branches.");
                              return;
                            }
                            fetchQuote({
                              address: formData.address,
                              city: formData.city,
                              postalCode: formData.postalCode,
                              country: formData.country
                            });
                          }}
                          disabled={quoteLoading}
                          className="w-full bg-white/5 border border-white/10 text-white font-medium text-xs uppercase tracking-widest py-4 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                        >
                          {quoteLoading ? (
                            <><Loader2 size={16} className="animate-spin" /> Calculating...</>
                          ) : deliveryPreference === 'postnet' ? (
                            quote ? 'Search PostNet Branches Again' : 'Find PostNet Branches & Price'
                          ) : (
                            quote ? 'Recalculate Delivery Price' : 'Calculate Delivery Price'
                          )}
                        </button>
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
                
                {/* Payment Section */}
                <section className="border-t border-white/10 pt-8">
                  <h2 className="text-xl font-serif flex items-center gap-3 mb-6">
                    <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-sans">3</span>
                    Payment Method
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`cursor-pointer bg-[#0a0a0a] border rounded-2xl p-6 relative overflow-hidden transition-all ${paymentMethod === 'payfast' ? 'border-[var(--color-gold)] shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'border-white/10 hover:border-white/30'}`}>
                      <input type="radio" name="paymentMethod" value="payfast" checked={paymentMethod === 'payfast'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                      <div className="absolute top-0 right-0 p-4 opacity-10"><CreditCard size={80} /></div>
                      <div className="relative z-10">
                        <h4 className="font-medium text-white mb-1">PayFast (Instant)</h4>
                        <p className="text-xs text-[var(--color-ivory-muted)] mb-4">Credit/Debit Cards, Instant EFT</p>
                        <div className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 shadow-[0_6px_20px_rgba(0,0,0,0.25)] min-w-[120px]">
                          <img
                            src="https://res.cloudinary.com/oioqrgj0/image/upload/v1787729897/grand-store/assets/pkv0g8anwi079fvihl2e.png"
                            alt="PayFast"
                            className="h-10 md:h-12 w-auto object-contain"
                          />
                        </div>
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
                  disabled={loading || !quote}
                  className="w-full mt-8 bg-[#c9a35b] text-black font-bold uppercase tracking-widest text-xs py-4 rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : <>Place Order • <Price amount={quote ? quote.aggregatedTotals.totalToPay : cartSubtotal} /> <ArrowRight size={16} /></>}
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
