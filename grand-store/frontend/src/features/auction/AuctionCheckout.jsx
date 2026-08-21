import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, ArrowRight, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';
import LocationInput from '../../components/LocationInput';
import { formatCartPrice } from '../../data';

export default function AuctionCheckout({ onNotify }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lot, setLot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Flow State: 1 = Address, 2 = Payment
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [dynamicShipping, setDynamicShipping] = useState(0);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'South Africa',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  useEffect(() => {
    document.title = 'Auction Checkout – The Grand Store';
    window.scrollTo({ top: 0, behavior: 'auto' });

    const fetchLot = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const headers = userInfo?.token ? { Authorization: `Bearer ${userInfo.token}` } : {};
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auction/${id}`, { headers });
        setLot(res.data.lot);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchLot();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContinueToPayment = (e) => {
    e.preventDefault();
    // Simple dynamic shipping mock
    if (formData.country.toLowerCase() === 'south africa') {
      setDynamicShipping(250);
    } else {
      setDynamicShipping(1500); // International
    }
    setCheckoutStep(2);
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auction/${id}/pay`,
        { 
          shippingAddress: { 
            address: formData.address, 
            city: formData.city, 
            postalCode: formData.postalCode, 
            country: formData.country 
          },
          calculatedShipping: dynamicShipping 
        },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      onNotify('Payment successful! Your auction win has been processed.');
      navigate(`/auction/${id}`);
    } catch (err) {
      console.error(err);
      onNotify(err.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white bg-[#050505]">Loading Secure Checkout...</div>;
  if (!lot) return <div className="min-h-screen flex items-center justify-center text-white bg-[#050505]">Lot not found</div>;

  const total = lot.winningBid + lot.buyerPremiumAmount + lot.barChargeAmount + lot.vatAmount + dynamicShipping;

  return (
    <main className="min-h-screen bg-[#050505] text-[var(--color-ivory)] pt-0 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-xs text-[var(--color-ivory-muted)] uppercase tracking-widest mb-4">
            <Link to={`/auction/${id}`} className="hover:text-gold-gradient transition-colors">Lot {lot.lotNumber || lot._id.slice(-6).toUpperCase()}</Link>
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
              <form onSubmit={handleContinueToPayment}>
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
                  className="w-full bg-[#c9a35b] text-black font-bold uppercase tracking-widest text-xs py-4 rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2"
                >
                  Continue to Payment <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              /* Step 2: Payment */
              <form onSubmit={handlePay}>
                <div className="mb-6 pb-6 border-b border-white/10 flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-medium">Delivery to: {formData.city}, {formData.country}</h3>
                    <p className="text-xs text-[var(--color-ivory-muted)] mt-1">{formData.address}, {formData.postalCode}</p>
                  </div>
                  <button type="button" onClick={() => setCheckoutStep(1)} className="text-xs text-gold-gradient uppercase tracking-widest hover:underline">Change</button>
                </div>

                <section className="border-t border-white/10 pt-8">
                  <h2 className="text-xl font-serif flex items-center gap-3 mb-6">
                    <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-sans">2</span>
                    Payment Details
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
                  disabled={processing}
                  className="w-full mt-8 bg-[#c9a35b] text-black font-bold uppercase tracking-widest text-xs py-4 rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2"
                >
                  {processing ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : <>Pay {formatCartPrice(total)} <ArrowRight size={16} /></>}
                </button>
              </form>
            )}
            
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-24 bg-[#0a0a0a] border border-white/10 rounded-2xl p-8">
              <h3 className="text-xl font-serif mb-6">Auction Summary</h3>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center p-2">
                  <img src={lot.images && lot.images[0] ? lot.images[0] : '/assets/auction/macallan-25.png'} alt={lot.title} className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">{lot.title}</h4>
                  <p className="text-xs text-[var(--color-ivory-muted)]">Lot {lot.lotNumber || lot._id.slice(-6).toUpperCase()}</p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6 flex flex-col gap-3 text-sm font-mono">
                <div className="flex justify-between text-[var(--color-ivory-muted)]">
                  <span>Winning Bid</span>
                  <span>R {lot.winningBid.toLocaleString('en-ZA')}</span>
                </div>
                <div className="flex justify-between text-[var(--color-ivory-muted)]">
                  <span>Buyer Premium</span>
                  <span>R {lot.buyerPremiumAmount.toLocaleString('en-ZA')}</span>
                </div>
                <div className="flex justify-between text-[var(--color-ivory-muted)]">
                  <span>BAR Charge</span>
                  <span>R {lot.barChargeAmount.toLocaleString('en-ZA')}</span>
                </div>
                <div className="flex justify-between text-[var(--color-ivory-muted)]">
                  <span>VAT ({lot.vatPct}%)</span>
                  <span>R {lot.vatAmount.toLocaleString('en-ZA')}</span>
                </div>
                {checkoutStep === 2 ? (
                  <div className="flex justify-between pb-4 border-b border-white/10 text-white">
                    <span>Shipping</span>
                    <span>R {dynamicShipping.toLocaleString('en-ZA')}</span>
                  </div>
                ) : (
                   <div className="pb-4 border-b border-white/10"></div>
                )}
                
                <div className="flex justify-between text-lg font-serif mt-2">
                  <span>Total To Pay</span>
                  <span className="text-gold-gradient font-bold">{checkoutStep === 2 ? formatCartPrice(total) : formatCartPrice(total - dynamicShipping)}</span>
                </div>
                {checkoutStep === 1 && (
                  <p className="text-[10px] text-white/30 italic mt-4">
                    Shipping costs will be calculated in the next step based on your delivery address.
                  </p>
                )}
              </div>
              
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
