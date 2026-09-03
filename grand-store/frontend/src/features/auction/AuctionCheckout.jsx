import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api';
import { 
  ChevronRight, ArrowRight, ShieldCheck, CreditCard, Loader2, 
  Landmark, UploadCloud, CheckCircle2, Copy, FileText, X, ExternalLink, Clock, Sparkles
} from 'lucide-react';
import LocationInput from '../../components/LocationInput';
import PaymentForm from '../checkout/PaymentForm';
import Price from '../../components/ui/Price';

export default function AuctionCheckout({ onNotify }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lot, setLot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Flow State: 1 = Address, 2 = Payment
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [dynamicShipping, setDynamicShipping] = useState(0);

  // Payment selection: 'payfast' | 'bank_transfer'
  const [paymentMethod, setPaymentMethod] = useState('payfast');
  const [proofUrl, setProofUrl] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [bankTransferSubmitted, setBankTransferSubmitted] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'South Africa'
  });

  const [paymentData, setPaymentData] = useState(null);
  const [payfastUrl, setPayfastUrl] = useState(null);

  useEffect(() => {
    document.title = 'Auction Checkout – The Grand Store';
    window.scrollTo({ top: 0, behavior: 'auto' });

    const fetchLot = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const headers = userInfo?.token ? { Authorization: `Bearer ${userInfo.token}` } : {};
        const res = await api.get(`/auction/${id}`, { headers });
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
    if (formData.country.toLowerCase() === 'south africa') {
      setDynamicShipping(250);
    } else {
      setDynamicShipping(1500); // International
    }
    setCheckoutStep(2);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProof(true);
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await api.post('/vendor/upload-public', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProofUrl(res.data.url);
      if (onNotify) onNotify('Proof of payment screenshot uploaded successfully');
    } catch (err) {
      console.error('File upload error:', err);
      if (onNotify) onNotify(err.response?.data?.message || 'Failed to upload screenshot file');
    } finally {
      setUploadingProof(false);
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setProcessing(true);

    if (paymentMethod === 'bank_transfer' && !proofUrl) {
      if (onNotify) onNotify('Please upload your proof of payment screenshot or enter a receipt link before proceeding.');
      setProcessing(false);
      return;
    }

    try {
      // 1. Save shipping & order payment method
      const res = await api.post(`/auction/${id}/pay`, {
        shippingAddress: { 
          address: formData.address, 
          city: formData.city, 
          postalCode: formData.postalCode, 
          country: formData.country 
        },
        calculatedShipping: dynamicShipping,
        paymentMethod: paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'PayFast',
        proofUrl: proofUrl || ''
      });

      setCreatedOrder(res.data.order);

      // If Bank Transfer, complete the user flow and switch to confirmation state
      if (paymentMethod === 'bank_transfer') {
        setBankTransferSubmitted(true);
        setProcessing(false);
        if (onNotify) onNotify('Proof of payment submitted! Admin will verify your transfer.');
        return;
      }
      
      // 2. If PayFast, request PayFast signature and auto-submit form
      const pfRes = await api.post('/payfast/generate-auction', { auctionId: id });

      setPayfastUrl(pfRes.data.url);
      setPaymentData(pfRes.data.data);
      
    } catch (err) {
      console.error(err);
      if (onNotify) onNotify(err.response?.data?.message || 'Payment processing failed');
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white bg-[#050505]">Loading Secure Checkout...</div>;
  if (!lot) return <div className="min-h-screen flex items-center justify-center text-white bg-[#050505]">Lot not found</div>;

  const total = (lot.winningBid || 0) + (lot.buyerPremiumAmount || 0) + (lot.barChargeAmount || 0) + (lot.vatAmount || 0) + dynamicShipping;
  const paymentReference = `AUC-${lot.lotNumber || lot._id.slice(-6).toUpperCase()}`;

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
            <span className={checkoutStep === 2 && !bankTransferSubmitted ? "text-gold-gradient font-medium" : ""}>Payment</span>
            {bankTransferSubmitted && (
              <>
                <ChevronRight size={12} />
                <span className="text-gold-gradient font-medium">Verification</span>
              </>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-serif">
            {bankTransferSubmitted ? 'Order Awaiting Verification' : 'Auction Checkout'}
          </h1>
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
                  className="w-full bg-[#c9a35b] text-black font-bold uppercase tracking-widest text-xs py-4 rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Continue to Payment <ArrowRight size={16} />
                </button>
              </form>
            ) : bankTransferSubmitted ? (
              /* Step 3: Bank Transfer Success / Awaiting Approval Screen */
              <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-[var(--color-gold)]/30 rounded-3xl p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                  <CheckCircle2 size={32} className="text-emerald-400" />
                </div>

                <h3 className="text-2xl font-serif text-white mb-2">Bank Transfer Proof Submitted</h3>
                <p className="text-sm text-[var(--color-ivory-muted)] font-light leading-relaxed mb-6">
                  Your proof of payment for <strong className="text-white">{lot.title}</strong> has been received and routed directly to the Grand Store administrative and finance desk for verification.
                </p>

                <div className="bg-black/50 border border-white/5 rounded-2xl p-5 mb-6 space-y-3 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-white/40 uppercase tracking-wider text-[10px]">Reference Number</span>
                    <span className="font-mono text-[var(--color-gold)] font-bold">{paymentReference}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-white/40 uppercase tracking-wider text-[10px]">Total Transferred</span>
                    <span className="font-serif text-white font-bold text-sm"><Price amount={total} /></span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-white/40 uppercase tracking-wider text-[10px]">Review Status</span>
                    <span className="inline-flex items-center gap-1 text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      <Clock size={11} /> Awaiting Admin Approval
                    </span>
                  </div>
                  {proofUrl && (
                    <div className="pt-2">
                      <span className="text-white/40 uppercase tracking-wider text-[10px] block mb-1.5">Submitted Proof Receipt</span>
                      <div className="flex items-center gap-3 bg-white/[0.02] p-2 rounded-xl border border-white/10">
                        {/\.(jpeg|jpg|png|webp|gif)($|\?)/i.test(proofUrl) ? (
                          <img src={proofUrl} alt="Receipt Preview" className="w-12 h-12 object-cover rounded border border-white/10" />
                        ) : (
                          <div className="w-12 h-12 rounded bg-white/5 flex items-center justify-center text-[var(--color-gold)]">
                            <FileText size={20} />
                          </div>
                        )}
                        <a
                          href={proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 underline truncate"
                        >
                          <ExternalLink size={12} /> View Uploaded Document
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-8 text-xs text-white/60 leading-relaxed space-y-2">
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#e1bd70]" /> What Happens Next:
                  </p>
                  <p>1. Our compliance team verifies your bank deposit against the auction escrow account.</p>
                  <p>2. Once verified, the lot status immediately transitions to <strong>Paid</strong> and bonded vault dispatch begins.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/customer/auctions"
                    className="flex-1 py-3.5 px-6 rounded-xl bg-gold-gradient text-black font-bold uppercase tracking-widest text-xs text-center hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all"
                  >
                    View My Auctions
                  </Link>
                  <Link
                    to="/auction"
                    className="py-3.5 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-xs text-center border border-white/10 transition-colors"
                  >
                    Explore Live Auctions
                  </Link>
                </div>
              </div>
            ) : (
              /* Step 2: Payment Method Choice (PayFast vs Bank Transfer) */
              <form onSubmit={handlePay}>
                <div className="mb-6 pb-6 border-b border-white/10 flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-medium">Delivery to: {formData.city}, {formData.country}</h3>
                    <p className="text-xs text-[var(--color-ivory-muted)] mt-1">{formData.address}, {formData.postalCode}</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setCheckoutStep(1)} 
                    className="text-xs text-gold-gradient uppercase tracking-widest hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                <section className="border-t border-white/10 pt-8">
                  <h2 className="text-xl font-serif flex items-center gap-3 mb-6">
                    <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-sans">2</span>
                    Payment Method
                  </h2>

                  {/* Dual Method Selection Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Option 1: PayFast */}
                    <label 
                      className={`cursor-pointer bg-[#0a0a0a] border rounded-2xl p-5 relative overflow-hidden transition-all flex flex-col justify-between ${
                        paymentMethod === 'payfast' 
                          ? 'border-[var(--color-gold)] shadow-[0_0_20px_rgba(212,175,55,0.15)] ring-1 ring-[var(--color-gold)]/50' 
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="payfast" 
                        checked={paymentMethod === 'payfast'} 
                        onChange={(e) => setPaymentMethod(e.target.value)} 
                        className="hidden" 
                      />
                      <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                        <CreditCard size={70} />
                      </div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-white text-base">PayFast (Instant)</h4>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'payfast' ? 'border-[var(--color-gold)]' : 'border-white/30'}`}>
                            {paymentMethod === 'payfast' && <div className="w-2 h-2 rounded-full bg-[var(--color-gold)]"></div>}
                          </div>
                        </div>
                        <p className="text-xs text-[var(--color-ivory-muted)] mb-4 leading-relaxed">
                          Instant checkout via Credit/Debit Card, Instant EFT, or Masterpass.
                        </p>
                      </div>

                      {/* Official PayFast Logo Container */}
                      <div className="relative z-10 pt-2">
                        <div className="inline-flex items-center justify-center rounded-lg bg-white px-3.5 py-1.5 shadow-[0_4px_14px_rgba(0,0,0,0.35)] min-w-[120px]">
                          <img
                            src="https://res.cloudinary.com/oioqrgj0/image/upload/v1787729897/grand-store/assets/pkv0g8anwi079fvihl2e.png"
                            alt="PayFast"
                            className="h-9 w-auto object-contain"
                          />
                        </div>
                      </div>
                    </label>

                    {/* Option 2: Manual Bank Transfer */}
                    <label 
                      className={`cursor-pointer bg-[#0a0a0a] border rounded-2xl p-5 relative overflow-hidden transition-all flex flex-col justify-between ${
                        paymentMethod === 'bank_transfer' 
                          ? 'border-[var(--color-gold)] shadow-[0_0_20px_rgba(212,175,55,0.15)] ring-1 ring-[var(--color-gold)]/50' 
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="bank_transfer" 
                        checked={paymentMethod === 'bank_transfer'} 
                        onChange={(e) => setPaymentMethod(e.target.value)} 
                        className="hidden" 
                      />
                      <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                        <Landmark size={70} />
                      </div>

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-white text-base">Manual Bank Transfer</h4>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'bank_transfer' ? 'border-[var(--color-gold)]' : 'border-white/30'}`}>
                            {paymentMethod === 'bank_transfer' && <div className="w-2 h-2 rounded-full bg-[var(--color-gold)]"></div>}
                          </div>
                        </div>
                        <p className="text-xs text-[var(--color-ivory-muted)] mb-4 leading-relaxed">
                          Electronic Funds Transfer (EFT) directly to our escrow account with proof verification.
                        </p>
                      </div>

                      <div className="relative z-10 pt-2 flex items-center gap-2 text-xs text-[var(--color-gold)] font-medium">
                        <ShieldCheck size={16} /> Admin Verified Escrow
                      </div>
                    </label>
                  </div>

                  {/* Bank Transfer Details & Proof Upload Section */}
                  {paymentMethod === 'bank_transfer' ? (
                    <div className="space-y-5 animate-fadeIn">
                      {/* Bank Details Card */}
                      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 md:p-6 relative">
                        <h4 className="text-sm font-serif text-[var(--color-gold)] mb-3 flex items-center gap-2">
                          <Landmark size={16} /> Grand Store Escrow Banking Details
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                            <span className="text-white/40 block text-[9px] uppercase tracking-wider mb-0.5">Bank Name</span>
                            <span className="text-white font-medium">Standard Bank</span>
                          </div>
                          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                            <span className="text-white/40 block text-[9px] uppercase tracking-wider mb-0.5">Account Name</span>
                            <span className="text-white font-medium">The Grand Store PTY LTD</span>
                          </div>
                          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                            <span className="text-white/40 block text-[9px] uppercase tracking-wider mb-0.5">Account Number</span>
                            <span className="text-white font-mono font-bold">0123456789</span>
                          </div>
                          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                            <span className="text-white/40 block text-[9px] uppercase tracking-wider mb-0.5">Branch Code</span>
                            <span className="text-white font-mono font-bold">051001</span>
                          </div>
                          <div className="bg-black/40 p-3 rounded-xl border border-white/5 sm:col-span-2 flex items-center justify-between">
                            <div>
                              <span className="text-[var(--color-gold)] block text-[9px] uppercase tracking-wider mb-0.5 font-bold">Required Reference</span>
                              <span className="text-white font-mono font-bold text-sm tracking-wide">{paymentReference}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(paymentReference);
                                if (onNotify) onNotify('Reference copied to clipboard');
                              }}
                              className="text-[10px] text-white/70 hover:text-white flex items-center gap-1 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-white/30 transition-colors cursor-pointer"
                            >
                              <Copy size={12} /> Copy Reference
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Screenshot / Proof Upload Card */}
                      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 md:p-6">
                        <h4 className="text-sm font-semibold text-white mb-1.5 flex items-center gap-2">
                          <UploadCloud size={16} className="text-[#e1bd70]" /> Proof of Payment (Screenshot / Receipt)
                        </h4>
                        <p className="text-xs text-[var(--color-ivory-muted)] mb-4">
                          Upload your EFT screenshot or PDF receipt. Our administrative desk verifies the transfer and marks the lot as Paid.
                        </p>

                        {proofUrl ? (
                          <div className="p-4 rounded-xl bg-black/60 border border-[#e1bd70]/40 flex items-center justify-between">
                            <div className="flex items-center gap-3 overflow-hidden">
                              {/\.(jpeg|jpg|png|webp|gif)($|\?)/i.test(proofUrl) ? (
                                <img src={proofUrl} alt="Proof" className="w-12 h-12 object-cover rounded-lg border border-white/10" />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-[#e1bd70]">
                                  <FileText size={20} />
                                </div>
                              )}
                              <div className="overflow-hidden">
                                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                  <CheckCircle2 size={13} /> Proof Screenshot Ready
                                </div>
                                <a 
                                  href={proofUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[10px] text-white/60 hover:underline truncate block"
                                >
                                  Preview uploaded receipt
                                </a>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setProofUrl('')}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-colors cursor-pointer"
                              title="Remove screenshot"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/15 rounded-xl hover:border-[#e1bd70]/50 bg-black/30 cursor-pointer transition-colors">
                              <input
                                type="file"
                                accept="image/*,application/pdf"
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={uploadingProof}
                              />
                              {uploadingProof ? (
                                <div className="flex flex-col items-center gap-2 text-white">
                                  <Loader2 size={24} className="animate-spin text-[#e1bd70]" />
                                  <span className="text-xs">Uploading screenshot to secure storage...</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-1.5 text-center">
                                  <UploadCloud size={24} className="text-[#e1bd70]" />
                                  <span className="text-xs font-semibold text-white">Click to upload screenshot / receipt</span>
                                  <span className="text-[10px] text-white/40">PNG, JPG, WEBP, or PDF up to 10MB</span>
                                </div>
                              )}
                            </label>

                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-[1px] bg-white/10"></div>
                              <span className="text-[10px] uppercase text-white/30 tracking-wider">or enter document URL</span>
                              <div className="flex-1 h-[1px] bg-white/10"></div>
                            </div>

                            <input
                              type="url"
                              value={proofUrl}
                              onChange={(e) => setProofUrl(e.target.value)}
                              placeholder="https://... (direct link to payment screenshot or PDF)"
                              className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-[var(--color-gold)]/50 focus:outline-none transition-colors"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* PayFast Notice */
                    <div className="bg-[#0a0a0a] border border-[var(--color-gold)]/30 rounded-2xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10"><CreditCard size={100} /></div>
                      <div className="relative z-10">
                        <p className="text-sm text-[var(--color-ivory-muted)] mb-3 leading-relaxed">
                          You will be securely redirected to PayFast's encrypted portal to complete your transaction with zero latency.
                        </p>
                        <div className="flex items-center gap-3 text-xs text-emerald-400">
                          <ShieldCheck size={16} /> 256-Bit SSL PCI-DSS Level 1 Encrypted
                        </div>
                      </div>
                    </div>
                  )}
                </section>
                
                <button 
                  type="submit" 
                  disabled={processing}
                  className="w-full mt-8 bg-[#c9a35b] text-black font-bold uppercase tracking-widest text-xs py-4 rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {processing ? (
                    <><Loader2 size={16} className="animate-spin" /> Processing Order...</>
                  ) : paymentMethod === 'bank_transfer' ? (
                    <>Submit Bank Transfer Proof • <Price amount={total} /> <ArrowRight size={16} /></>
                  ) : (
                    <>Pay via PayFast • <Price amount={total} /> <ArrowRight size={16} /></>
                  )}
                </button>
                
                <PaymentForm paymentData={paymentData} payfastUrl={payfastUrl} />
              </form>
            )}
            
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-24 bg-[#0a0a0a] border border-white/10 rounded-2xl p-8">
              <h3 className="text-xl font-serif mb-6">Auction Summary</h3>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center p-2">
                  <img 
                    src={lot.images && lot.images[0] ? lot.images[0] : '/assets/auction/macallan-25.png'} 
                    alt={lot.title} 
                    className="max-w-full max-h-full object-contain" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">{lot.title}</h4>
                  <p className="text-xs text-[var(--color-ivory-muted)]">Lot {lot.lotNumber || lot._id.slice(-6).toUpperCase()}</p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6 flex flex-col gap-3 text-sm font-mono">
                <div className="flex justify-between text-[var(--color-ivory-muted)]">
                  <span>Winning Bid</span>
                  <span><Price amount={lot.winningBid} /></span>
                </div>
                <div className="flex justify-between text-[var(--color-ivory-muted)]">
                  <span>Buyer Premium</span>
                  <span><Price amount={lot.buyerPremiumAmount} /></span>
                </div>
                <div className="flex justify-between text-[var(--color-ivory-muted)]">
                  <span>BAR Charge</span>
                  <span><Price amount={lot.barChargeAmount} /></span>
                </div>
                <div className="flex justify-between text-[var(--color-ivory-muted)]">
                  <span>VAT ({lot.vatPct}%)</span>
                  <span><Price amount={lot.vatAmount} /></span>
                </div>
                {checkoutStep === 2 ? (
                  <div className="flex justify-between pb-4 border-b border-white/10 text-white">
                    <span>Shipping</span>
                    <span><Price amount={dynamicShipping} /></span>
                  </div>
                ) : (
                   <div className="pb-4 border-b border-white/10"></div>
                )}
                
                <div className="flex justify-between text-lg font-serif mt-2">
                  <span>Total To Pay</span>
                  <span className="text-gold-gradient font-bold">
                    {checkoutStep === 2 ? <Price amount={total} /> : <Price amount={total - dynamicShipping} />}
                  </span>
                </div>
                {checkoutStep === 1 && (
                  <p className="text-[10px] text-white/30 italic mt-4">
                    Shipping costs will be calculated in the next step based on your delivery address.
                  </p>
                )}
              </div>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[var(--color-ivory-muted)]">
                <ShieldCheck size={14} className="text-[#e1bd70]" /> Grand Store Bonded Escrow Guarantee
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
