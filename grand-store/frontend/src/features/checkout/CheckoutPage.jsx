import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, ChevronDown, ChevronUp, ArrowRight, ShieldCheck, Lock, CreditCard, Loader2, Truck, AlertTriangle, CheckCircle2, ShoppingCart, MapPin, FileText, Download, Plus, Minus, Trash2, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getProductPrice } from '../../data';
import LocationInput from '../../components/LocationInput';
import CityInput from '../../components/CityInput';
import PostalCodeInput from '../../components/PostalCodeInput';
import PaymentForm from './PaymentForm';
import SecurePaymentBadges from '../../components/checkout/SecurePaymentBadges';
import Price from '../../components/ui/Price';
import api from '../../api';

export default function CheckoutPage({ cartItems, updateCartQuantity, removeFromCart, onClearCart, clearVendorCart, onNotify }) {
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
  const [applyRewards, setApplyRewards] = useState(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  const [formData, setFormData] = useState({
    email: user ? user.email : '',
    firstName: user ? user.name.split(' ')[0] : '',
    lastName: user && user.name.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : '',
    phone: user ? (user.phone || user.phoneNumber || '') : '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    lat: null,
    lng: null
  });
  const [postnetPreview, setPostnetPreview] = useState({
    loading: false,
    stores: [],
    searchedCity: '',
    hasCityMatch: false,
    usingNearestCity: false,
    error: ''
  });
  const [preferredPostnetStore, setPreferredPostnetStore] = useState(null);

  const [paymentData, setPaymentData] = useState(null);
  const [payfastUrl, setPayfastUrl] = useState(null);

  const cartSubtotal = vendorCartItems.reduce((sum, item) => sum + (getProductPrice(item.price) * item.quantity), 0);
  const cartItemCount = vendorCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const placeOrderTotal = quote ? quote.aggregatedTotals.totalToPay : cartSubtotal;
  const displayedTotal = Math.max(0, placeOrderTotal - (applyRewards ? (user?.rewardBalance || 0) : 0));

  const scrollToCheckoutSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleUpdateQuantity = (productId, option, newQuantity) => {
    if (updateCartQuantity) updateCartQuantity(productId, option, newQuantity);
    setQuote(null);
    setDutiesAccepted(false);
  };

  const handleRemoveItem = (item) => {
    if (removeFromCart) removeFromCart(item);
    setQuote(null);
    setDutiesAccepted(false);
  };

  useEffect(() => {
    document.title = 'Checkout – The Grand Store';
    window.scrollTo({ top: 0, behavior: 'auto' });
    
    // Prevent vendors and admins from checking out
    if (user && user.role && (user.role.startsWith('vendor') || user.role === 'admin')) {
      onNotify("Vendors and admins cannot checkout. Please login as a customer to buy.");
      navigate('/register');
      return;
    }
  }, [vendorCartItems, navigate, user, onNotify, vendorId]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: prev.email || user.email || '',
        firstName: prev.firstName || (user.name ? user.name.split(' ')[0] : ''),
        lastName: prev.lastName || (user.name && user.name.split(' ').length > 1 ? user.name.split(' ').slice(1).join(' ') : ''),
        phone: prev.phone || user.phone || user.phoneNumber || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (['address', 'city', 'postalCode', 'country'].includes(name)) {
      setQuote(null);
      setDutiesAccepted(false);
    }
  };

  const handleCityChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
      postalCode: '',
      lat: null,
      lng: null
    }));
    setPreferredPostnetStore(null);
    setPostnetPreview({
      loading: false,
      stores: [],
      searchedCity: value,
      hasCityMatch: false,
      usingNearestCity: false,
      error: ''
    });
    setQuote(null);
    setDutiesAccepted(false);
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

      if (preferredPostnetStore) {
        data.shipments = data.shipments.map((shipment) => {
          const postnetOption = shipment.shippingQuotes?.find((option) => option.courierName === 'PostNet');
          const matchingStore = postnetOption?.stores?.find((store) => store.id === preferredPostnetStore.id);
          return matchingStore ? { ...shipment, selectedPickupStore: matchingStore } : shipment;
        });
      }

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
    setPreferredPostnetStore(store);

    const newShipments = quote.shipments.map((shipment, index) => (
      index === shipmentIndex
        ? { ...shipment, selectedPickupStore: store }
        : shipment
    ));

    setQuote({ ...quote, shipments: newShipments });
  };

  const handlePreferredPostnetStoreSelect = (store) => {
    setPreferredPostnetStore(store);
    setQuote((currentQuote) => {
      if (!currentQuote) return currentQuote;
      return {
        ...currentQuote,
        shipments: currentQuote.shipments.map((shipment) => {
          if (!store) {
            return { ...shipment, selectedPickupStore: null };
          }
          const postnetOption = shipment.shippingQuotes?.find((option) => option.courierName === 'PostNet');
          const matchingStore = postnetOption?.stores?.find((candidate) => candidate.id === store.id);
          return matchingStore ? { ...shipment, selectedPickupStore: matchingStore } : shipment;
        })
      };
    });
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

  useEffect(() => {
    const isSouthAfricanCity = ['south africa', 'za', 'rsa'].includes(String(formData.country || '').trim().toLowerCase());
    const shouldFindPostnet = user
      && deliveryPreference !== 'home'
      && isSouthAfricanCity
      && formData.city
      && formData.lat !== null
      && formData.lat !== undefined
      && formData.lat !== ''
      && formData.lng !== null
      && formData.lng !== undefined
      && formData.lng !== ''
      && Number.isFinite(Number(formData.lat))
      && Number.isFinite(Number(formData.lng));

    if (!shouldFindPostnet) return undefined;

    let cancelled = false;
    setPostnetPreview((current) => ({ ...current, loading: true, error: '', stores: [], searchedCity: formData.city }));

    api.get('/postnet/locator', {
      params: {
        address: `${formData.city}, South Africa`,
        city: formData.city,
        lat: formData.lat,
        lng: formData.lng
      }
    }).then((response) => {
      if (cancelled) return;
      setPostnetPreview({
        loading: false,
        stores: response.data?.stores || [],
        searchedCity: response.data?.searchedCity || formData.city,
        hasCityMatch: Boolean(response.data?.hasCityMatch),
        usingNearestCity: Boolean(response.data?.usingNearestCity),
        error: ''
      });
    }).catch((error) => {
      if (cancelled) return;
      setPostnetPreview({
        loading: false,
        stores: [],
        searchedCity: formData.city,
        hasCityMatch: false,
        usingNearestCity: false,
        error: error.response?.data?.message || 'PostNet branches could not be loaded. Please try again.'
      });
    });

    return () => {
      cancelled = true;
    };
  }, [deliveryPreference, formData.city, formData.country, formData.lat, formData.lng, user]);

  const postnetPostalCodes = useMemo(() => (
    [...new Set(postnetPreview.stores.filter((store) => store.isInSelectedCity).map((store) => (
      store.postalCode || String(store.address || '').match(/\b\d{4}\b/)?.[0]
    )).filter(Boolean))]
  ), [postnetPreview.stores]);

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
          country: formData.country,
          phone: formData.phone || user?.phone || user?.phoneNumber || '',
          phoneNumber: formData.phone || user?.phone || user?.phoneNumber || ''
        },
        deliveryPreference,
        paymentMethod: paymentMethod === 'payfast' ? 'PayFast' : 'Bank Transfer',
        isGift,
        giftRecipientName,
        giftMessage,
        applyRewards
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

  if (vendorCartItems.length === 0) {
    return (
      <main className="pt-32 pb-16 min-h-screen bg-[#050505]">
        <div className="max-w-6xl mx-auto px-6 mb-12">
          <div className="flex flex-col items-center justify-center text-center space-y-6 py-20 border border-white/10 bg-black/40 rounded-3xl">
            <ShoppingCart size={48} className="text-white/20" />
            <div>
              <h2 className="text-3xl font-serif text-white mb-2">Your cart is empty</h2>
              <p className="text-[var(--color-ivory-muted)]">Add some items before checking out.</p>
            </div>
            <Link to="/shop" className="bg-[#c9a35b] text-black font-bold uppercase tracking-widest text-xs py-4 px-8 rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2">
              Shop More <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-36 min-h-screen bg-[#050505] md:pt-32 md:pb-16">
      <div className="max-w-6xl mx-auto px-4 mb-8 sm:px-6 md:mb-12">
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-[var(--color-gold)] transition-colors text-sm font-medium uppercase tracking-wider">
            <ArrowRight size={16} className="rotate-180" /> Back
          </button>
        </div>
        
        {/* Header */}
        <div className="mb-7 md:mb-12">
          <div className="hidden items-center gap-2 text-xs text-[var(--color-ivory-muted)] uppercase tracking-widest mb-4 md:flex">
            <Link to="/customer/cart" className="hover:text-gold-gradient transition-colors">Cart</Link>
            <ChevronRight size={12} />
            <span className={checkoutStep === 1 ? "text-gold-gradient font-medium" : ""}>Delivery</span>
            <ChevronRight size={12} />
            <span className={checkoutStep === 2 ? "text-gold-gradient font-medium" : ""}>Payment</span>
          </div>
          <div className="flex items-end justify-between gap-4">
            <h1 className="text-3xl font-serif md:text-5xl">Checkout</h1>
            <div className="text-right md:hidden">
              <p className="text-[10px] uppercase tracking-widest text-white/40">Total</p>
              <p className="font-serif text-xl text-[var(--color-gold)]"><Price amount={displayedTotal} /></p>
            </div>
          </div>
        </div>

        {checkoutStep !== 3 && (
          <nav aria-label="Checkout sections" className="sticky top-[68px] z-30 -mx-4 mb-5 overflow-x-auto border-y border-white/10 bg-[#080808]/95 px-4 py-2 backdrop-blur-xl md:hidden">
            <div className="flex min-w-max items-center gap-2">
              {[
                ['checkout-order-summary', 'Order', true],
                ['checkout-delivery-method', 'Delivery', Boolean(deliveryPreference)],
                ['checkout-delivery-details', 'Details', Boolean(formData.firstName && formData.lastName && formData.city && formData.postalCode && formData.country)],
                ['checkout-payment', 'Payment', Boolean(quote)],
              ].map(([id, label, complete], index) => (
                <button key={id} type="button" onClick={() => scrollToCheckoutSection(id)} className="flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 text-xs font-medium text-white/70 active:border-[var(--color-gold)] active:text-white">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${complete ? 'bg-[var(--color-gold)] text-black' : 'bg-white/10 text-white/50'}`}>{complete ? <CheckCircle2 size={12} /> : index + 1}</span>
                  {label}
                </button>
              ))}
            </div>
          </nav>
        )}

        <div className="flex flex-col lg:flex-row-reverse lg:items-start gap-8 w-full md:gap-12 xl:gap-16">
          
          
          {/* Right Column - Itemised order summary */}
          {checkoutStep !== 3 && (
            <div className="w-full lg:w-[420px] xl:w-[460px] lg:sticky lg:top-32 shrink-0">
            <div id="checkout-order-summary" className="scroll-mt-32 w-full bg-[#111]/80 backdrop-blur-md border border-[var(--color-gold)]/20 rounded-2xl p-4 md:p-7 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent opacity-50"></div>
              <div className="relative">
                <div className="flex items-center justify-between gap-4 mb-4 md:mb-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)] mb-1">Your order</p>
                    <h2 className="text-xl font-serif text-white">Price breakdown</h2>
                  </div>
                  <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-[var(--color-ivory-muted)]">
                    {cartItemCount} item{cartItemCount === 1 ? '' : 's'}
                  </span>
                </div>

                <button type="button" onClick={() => setMobileSummaryOpen((open) => !open)} aria-expanded={mobileSummaryOpen} className="mb-4 flex min-h-11 w-full items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white md:hidden">
                  <span>{mobileSummaryOpen ? 'Hide products and charges' : 'Show products and charges'}</span>
                  {mobileSummaryOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                </button>

                <div className={`${mobileSummaryOpen ? 'block' : 'hidden'} md:block`}>
                <div className="space-y-4 border-b border-white/10 pb-5">
                  {vendorCartItems.map((item) => (
                    <div key={`${item.id || item._id}-${item.option || ''}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-lg border border-white/10 bg-black/40 p-1.5 flex items-center justify-center overflow-hidden shrink-0">
                          <img src={item.image} alt="" className="max-w-full max-h-full object-contain" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate font-medium">{item.fullName || item.name}</p>
                          <p className="text-xs text-[var(--color-ivory-muted)]">{item.option || 'Pack of 1'}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                        <div className="flex items-center gap-3 bg-black/50 border border-white/10 rounded-lg px-2 py-1">
                          <button type="button" onClick={() => handleUpdateQuantity(item.id || item._id, item.option, item.quantity - 1)} className="text-white/60 hover:text-white p-1 transition-colors" aria-label="Decrease quantity"><Minus size={14} /></button>
                          <span className="text-sm font-medium text-white w-4 text-center">{item.quantity}</span>
                          <button type="button" onClick={() => handleUpdateQuantity(item.id || item._id, item.option, item.quantity + 1)} className="text-white/60 hover:text-white p-1 transition-colors" aria-label="Increase quantity"><Plus size={14} /></button>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-[var(--color-gold)] min-w-[60px] text-right"><Price amount={getProductPrice(item.price) * item.quantity} /></span>
                          <button type="button" onClick={() => handleRemoveItem(item)} className="text-red-400/60 hover:text-red-400 p-1.5 bg-red-400/5 hover:bg-red-400/10 rounded-lg transition-colors" aria-label="Remove item"><Trash2 size={16} /></button>
                        </div>
                      </div>
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

                </div>
                </div>

                  <div className="flex items-end justify-between gap-4 border-t border-white/10 pt-4">
                    <div>
                      <p className="text-white font-medium">Pay now</p>
                      <p className="text-[11px] text-[var(--color-ivory-muted)]">Products and selected delivery</p>
                      {applyRewards && user?.rewardBalance > 0 && (
                        <p className="text-[11px] text-green-400 mt-1">Applying up to <Price amount={user.rewardBalance} /> in rewards</p>
                      )}
                    </div>
                    <span className="text-3xl font-serif text-gold-gradient">
                      <Price amount={displayedTotal} />
                    </span>
                  </div>
              </div>
            </div>
            </div>
          )}

          {/* Left Column - Forms */}
          <div className="w-full lg:w-auto flex-1 flex flex-col gap-8 min-w-0">
            
            {checkoutStep !== 3 ? (
            
              <form id="checkout-form" onSubmit={handlePlaceOrder}>
                {/* Shipping Method Section moved to top */}
                <section id="checkout-delivery-method" className="scroll-mt-32 mb-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:mb-8 md:border-0 md:bg-transparent md:p-0">
                  <h2 className="text-xl font-serif mb-4 flex items-center gap-3 md:mb-6">
                    <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-sans">1</span>
                    Delivery Method
                  </h2>
                  
                  <p className="text-sm text-[var(--color-ivory-muted)] mb-5">Choose how you want to receive the order before entering delivery details.</p>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
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
                          className={`relative flex min-h-[88px] items-start gap-3 rounded-2xl border p-4 text-left transition-all md:block md:min-h-0 md:p-5 ${selected ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10 shadow-[0_0_20px_rgba(212,175,55,0.08)]' : 'border-white/10 bg-[#0a0a0a] hover:border-white/30'}`}
                        >
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full md:mb-4 ${selected ? 'bg-[var(--color-gold)] text-black' : 'bg-white/5 text-white/60'}`}>
                            <MethodIcon size={19} />
                          </span>
                          <span className="block min-w-0 pr-6 md:pr-0">
                            <span className="block text-sm font-medium text-white mb-1">{method.title}</span>
                            <span className="block text-xs leading-relaxed text-[var(--color-ivory-muted)]">{method.description}</span>
                          </span>
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
                              <div className="mt-2 px-0 pb-2 animate-in fade-in slide-in-from-top-2 duration-300 sm:pl-8 sm:pr-3">
                                {opt.stores && opt.stores.length > 0 ? (
                                  <div className="mt-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-xs uppercase tracking-widest text-[var(--color-ivory-muted)]">PostNet pickup branches</p>
                                      {shp.selectedPickupStore && (
                                        <button 
                                          type="button" 
                                          onClick={() => handlePreferredPostnetStoreSelect(null)} 
                                          className="text-[10px] font-bold uppercase tracking-widest text-gold hover:text-white transition-colors"
                                        >
                                          Change branch
                                        </button>
                                      )}
                                    </div>

                                    {opt.usingNearestCity && !shp.selectedPickupStore && (
                                      <div className="mb-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs leading-relaxed text-amber-200">
                                        No branch was found in {opt.searchedCity || formData.city}. These are the nearest PostNet alternatives.
                                      </div>
                                    )}

                                    {shp.selectedPickupStore ? (
                                      <div className="border border-gold bg-gold/5 p-3 rounded-lg">
                                        <p className="text-sm font-medium text-white mb-1">{shp.selectedPickupStore.name}</p>
                                        <p className="text-xs text-[var(--color-ivory-muted)]">{shp.selectedPickupStore.address}</p>
                                        <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-wider">
                                          <span className="text-emerald-300">Selected for pickup</span>
                                          {shp.selectedPickupStore.distance !== null && shp.selectedPickupStore.distance !== undefined && (
                                            <span className="text-white/50">{shp.selectedPickupStore.distance} km away</span>
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {opt.stores.map(store => (
                                          <label key={store.id} className="block cursor-pointer">
                                            <input
                                              type="radio"
                                              name={`postnet-store-${index}`}
                                              value={store.id}
                                              checked={shp.selectedPickupStore?.id === store.id}
                                              onChange={() => handlePreferredPostnetStoreSelect(store)}
                                              className="peer sr-only"
                                              required
                                            />
                                            <div className="h-full border border-white/10 bg-[#0a0a0a] p-3 rounded-lg peer-checked:border-gold peer-checked:bg-gold/5 hover:border-white/30 transition-colors">
                                              <p className="text-sm font-medium text-white mb-1">{store.name}</p>
                                              <p className="text-xs text-[var(--color-ivory-muted)]">{store.address}</p>
                                              <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-wider">
                                                <span className={store.isNearestAlternative ? 'text-amber-300' : 'text-emerald-300'}>
                                                  {store.isNearestAlternative ? `Nearest alternative${store.city ? ` · ${store.city}` : ''}` : `In ${opt.searchedCity || formData.city}`}
                                                </span>
                                                {store.distance !== null && store.distance !== undefined && (
                                                  <span className="text-white/50">{store.distance} km away</span>
                                                )}
                                              </div>
                                            </div>
                                          </label>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm mt-2 flex items-start gap-2">
                                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                    <p>{opt.storeLookupError || 'No PostNet branch could be loaded for this city. Please retry the branch search.'}</p>
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

                <section id="checkout-delivery-details" className="scroll-mt-32 mb-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:mb-8 md:rounded-none md:border-x-0 md:border-b-0 md:bg-transparent md:px-0 md:pt-8">
                  <h2 className="text-xl font-serif mb-4 flex items-center gap-3 md:mb-6">
                    <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-sans">2</span>
                    Delivery Details
                  </h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-2">First Name</label>
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--color-gold)]/50 focus:outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-2">Last Name</label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--color-gold)]/50 focus:outline-none transition-colors" />
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                        <label className="text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] flex items-center gap-1.5">
                          <Phone size={13} className="text-[var(--color-gold)]" /> Phone Number (For Courier & Delivery Tracking)
                        </label>
                        {(user?.phone || user?.phoneNumber) && formData.phone === (user.phone || user.phoneNumber) && (
                          <span className="text-[11px] text-[var(--color-gold)] font-medium flex items-center gap-1 bg-[var(--color-gold)]/10 px-2.5 py-0.5 rounded-full border border-[var(--color-gold)]/25 self-start sm:self-auto">
                            <CheckCircle2 size={12} /> Auto-filled from profile
                          </span>
                        )}
                      </div>
                      <input 
                        type="tel" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        required 
                        placeholder="e.g. +27 82 123 4567" 
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--color-gold)]/50 focus:outline-none transition-colors text-white" 
                      />
                      <p className="mt-1.5 text-xs text-[var(--color-ivory-muted)] font-light">
                        Couriers require a mobile contact number to send tracking notifications and arrange gate access.
                      </p>
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
                              country: country || current.country,
                              lat: lat ?? current.lat,
                              lng: lng ?? current.lng
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
                          <p className="text-sm text-white font-medium">
                            {preferredPostnetStore ? `Pickup at ${preferredPostnetStore.name}` : "No street address needed yet"}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-[var(--color-ivory-muted)]">
                            {preferredPostnetStore ? preferredPostnetStore.address : "Enter your city and postal code. You will choose the exact PostNet branch after the branch search."}
                          </p>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-2">City</label>
                      <CityInput
                        name="city"
                        value={formData.city}
                        onChange={handleCityChange}
                        onCityDetails={({ city, country, lat, lng }) => {
                          setFormData((current) => ({
                            ...current,
                            city,
                            postalCode: '',
                            country: deliveryPreference === 'postnet' ? 'South Africa' : (country || current.country),
                            lat,
                            lng
                          }));
                          setPreferredPostnetStore(null);
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
                      <PostalCodeInput
                        name="postalCode"
                        value={formData.postalCode}
                        city={formData.city}
                        cityLat={formData.lat}
                        cityLng={formData.lng}
                        suggestedPostalCodes={postnetPostalCodes}
                        onChange={handleChange}
                        onPostalDetails={({ postalCode }) => {
                          setFormData((current) => ({
                            ...current,
                            postalCode
                          }));
                          setQuote(null);
                          setDutiesAccepted(false);
                        }}
                        restrictToSouthAfrica={deliveryPreference === 'postnet' || String(formData.country).toLowerCase() === 'south africa'}
                        required
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--color-gold)]/50 focus:outline-none transition-colors"
                        placeholder="Search postal code..."
                      />
                    </div>
                    {deliveryPreference !== 'home' && formData.city && (
                      <div className="md:col-span-2 rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 md:p-5">
                        <div className="flex items-start gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)]">
                            {postnetPreview.loading ? <Loader2 size={17} className="animate-spin" /> : <MapPin size={17} />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white">PostNet branches near {formData.city}</p>
                            {postnetPreview.loading ? (
                              <p className="mt-1 text-xs text-[var(--color-ivory-muted)]">Checking the selected city and nearby areas...</p>
                            ) : postnetPreview.error ? (
                              <p className="mt-1 text-xs text-red-400">{postnetPreview.error}</p>
                            ) : postnetPreview.stores.length > 0 ? (
                              <>
                                <p className={`mt-1 text-xs ${postnetPreview.usingNearestCity ? 'text-amber-300' : 'text-[var(--color-ivory-muted)]'}`}>
                                  {postnetPreview.usingNearestCity
                                    ? `There is no PostNet branch listed in ${formData.city}. Choose one of the nearest alternatives below.`
                                    : `Branches listed in ${formData.city}. You can choose one now or after the delivery price is calculated.`}
                                </p>
                                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                  {postnetPreview.stores.map((store) => {
                                    const selected = preferredPostnetStore?.id === store.id;
                                    return (
                                      <button
                                        type="button"
                                        key={store.id}
                                        onClick={() => handlePreferredPostnetStoreSelect(store)}
                                        className={`rounded-xl border p-3 text-left transition-colors ${selected ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10' : 'border-white/10 bg-black/30 hover:border-white/30'}`}
                                      >
                                        <span className="flex items-center justify-between gap-3">
                                          <span className="text-sm font-medium text-white">{store.name}</span>
                                          {selected && <CheckCircle2 size={15} className="shrink-0 text-[var(--color-gold)]" />}
                                        </span>
                                        <span className="mt-1 block text-xs leading-relaxed text-[var(--color-ivory-muted)]">{store.address}</span>
                                        <span className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-wider">
                                          <span className={store.isNearestAlternative ? 'text-amber-300' : 'text-emerald-300'}>
                                            {store.isNearestAlternative ? `Nearest alternative${store.city ? ` · ${store.city}` : ''}` : `In ${formData.city}`}
                                          </span>
                                          {store.distance !== null && store.distance !== undefined && (
                                            <span className="text-white/50">{store.distance} km away</span>
                                          )}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </>
                            ) : (
                              <p className="mt-1 text-xs text-[var(--color-ivory-muted)]">Select a city suggestion to load PostNet branches.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
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
                              country: formData.country,
                              lat: formData.lat,
                              lng: formData.lng
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
                      <div className={`w-full transition-all duration-700 ease-in-out overflow-hidden rounded-xl border border-[var(--color-gold)]/20 ${mapLocation ? 'h-52 opacity-100 mt-4 md:h-64' : 'h-0 opacity-0 border-none'}`} ref={mapRef}></div>
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
                    
                    {/* Rewards */}
                    {user?.rewardBalance > 0 && (
                      <div className="md:col-span-2 mt-2 bg-[var(--color-gold)]/5 border border-[var(--color-gold)]/20 p-5 rounded-xl">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <input type="checkbox" checked={applyRewards} onChange={(e) => setApplyRewards(e.target.checked)} className="w-5 h-5 accent-[var(--color-gold)] rounded bg-black border-[var(--color-gold)]/20" />
                          <div>
                            <span className="text-[var(--color-gold)] font-medium text-sm flex items-center gap-2">Apply Referral Rewards</span>
                            <p className="text-xs text-[var(--color-ivory-muted)] mt-1">You have <Price amount={user.rewardBalance} /> available. This will be deducted from your total.</p>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                </section>
                
                {/* Payment Section */}
                <section id="checkout-payment" className="scroll-mt-32 rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:rounded-none md:border-x-0 md:border-b-0 md:bg-transparent md:px-0 md:pt-8">
                  <h2 className="text-xl font-serif flex items-center gap-3 mb-4 md:mb-6">
                    <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-sans">3</span>
                    Payment Method
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`cursor-pointer bg-[#0a0a0a] border rounded-2xl p-4 md:p-6 relative overflow-hidden transition-all ${paymentMethod === 'payfast' ? 'border-[var(--color-gold)] shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'border-white/10 hover:border-white/30'}`}>
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

                    <label className={`cursor-pointer bg-[#0a0a0a] border rounded-2xl p-4 md:p-6 relative overflow-hidden transition-all ${paymentMethod === 'bank_transfer' ? 'border-[var(--color-gold)] shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'border-white/10 hover:border-white/30'}`}>
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
                  className="hidden w-full mt-8 bg-[#c9a35b] text-black font-bold uppercase tracking-widest text-xs py-4 rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all md:flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : <>Place Order • <Price amount={quote ? quote.aggregatedTotals.totalToPay : cartSubtotal} /> <ArrowRight size={16} /></>}
                </button>
                
                <SecurePaymentBadges />
                <PaymentForm paymentData={paymentData} payfastUrl={payfastUrl} />
              </form>
            ) : checkoutStep === 3 ? (
              /* Step 3: Bank Transfer Proof Upload */
              <div className="border-t border-white/10 pt-0 mb-8">
                <h2 className="text-xl font-serif mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[var(--color-gold)] text-black flex items-center justify-center text-sm font-sans"><CheckCircle2 size={16} /></span>
                  Order Placed Successfully
                </h2>
                
                <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-[var(--color-gold)]/20 shadow-[0_0_30px_rgba(212,175,55,0.05)] rounded-2xl p-4 sm:p-6 md:p-8 mb-8 text-center relative overflow-hidden">
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

      {checkoutStep !== 3 && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#080808]/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-16px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <div className="min-w-0 shrink-0">
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">Pay now</p>
              <p className="truncate font-serif text-lg text-[var(--color-gold)]"><Price amount={displayedTotal} /></p>
            </div>
            {quote ? (
              <button form="checkout-form" type="submit" disabled={loading} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#c9a35b] px-4 text-xs font-bold uppercase tracking-widest text-black disabled:opacity-50">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Processing</> : <>Place Order <ArrowRight size={16} /></>}
              </button>
            ) : (
              <button type="button" onClick={() => scrollToCheckoutSection('checkout-delivery-details')} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#c9a35b] px-4 text-xs font-bold uppercase tracking-wider text-black">
                Add delivery rate <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
