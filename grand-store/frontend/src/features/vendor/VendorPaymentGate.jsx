import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, CheckCircle, Store, ShieldCheck } from 'lucide-react';
import Price from '../../components/ui/Price';

export default function VendorPaymentGate() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Mock payment details
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Simulate network delay for payment gateway
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call backend to update role to vendor_active
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.token || user?.token;

      const { data } = await axios.post('/api/vendor/simulate-payment', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local storage and context
      if (userInfo) {
        userInfo.role = 'vendor_active';
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
      }
      if (login && userInfo) {
        login(userInfo);
      }

      setSuccess(true);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/vendor/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Payment failed', error);
      alert('Payment processing failed. Please try again.');
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="vendor-theme min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="bg-[#0a0a0a] border border-gold/30 p-12 rounded-2xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl text-white font-light mb-4">Payment Successful!</h2>
          <p className="text-white/60 mb-8">Welcome to The Grand Store. Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-theme min-h-screen bg-[#050505] flex items-center justify-center p-4 py-20">
      <div className="max-w-4xl w-full flex flex-col md:flex-row gap-8">
        
        {/* Left Side: Summary */}
        <div className="w-full md:w-1/3 bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 flex flex-col justify-between">
          <div>
            <div className="text-gold mb-6"><Store size={32} /></div>
            <h2 className="text-2xl text-white font-light mb-2">Vendor Activation</h2>
            <p className="text-white/50 text-sm mb-8">Complete your one-time registration fee to activate your storefront.</p>
            
            <div className="space-y-4 border-b border-white/10 pb-6 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Setup & Verification</span>
                <span className="text-white"><Price amount={2500} /></span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">First Month Subscription</span>
                <span className="text-white"><Price amount={500} /></span>
              </div>
            </div>
            
            <div className="flex justify-between text-lg">
              <span className="text-white">Total Due</span>
              <span className="text-gold font-mono"><Price amount={3000} /></span>
            </div>
          </div>
          
          <div className="mt-8 flex items-center gap-3 text-xs text-white/40">
            <ShieldCheck size={16} />
            <span>Secured by Grand Store Payments</span>
          </div>
        </div>
        
        {/* Right Side: Payment Form */}
        <div className="w-full md:w-2/3 bg-[#0a0a0a] border border-white/10 rounded-2xl p-8">
          <h3 className="text-xl text-white mb-6">Payment Method</h3>
          
          <form onSubmit={handlePayment}>
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-widest text-gold mb-2">Cardholder Name</label>
              <input 
                type="text" 
                required
                className="w-full bg-black border border-white/20 rounded p-4 text-white focus:border-gold outline-none"
                placeholder="Name on card"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-widest text-gold mb-2">Card Number</label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                <input 
                  type="text" 
                  required
                  maxLength="19"
                  value={cardNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                    setCardNumber(formatted);
                  }}
                  className="w-full bg-black border border-white/20 rounded p-4 pl-12 text-white focus:border-gold outline-none font-mono tracking-wider"
                  placeholder="0000 0000 0000 0000"
                />
              </div>
            </div>
            
            <div className="flex gap-6 mb-8">
              <div className="flex-1">
                <label className="block text-xs uppercase tracking-widest text-gold mb-2">Expiry Date</label>
                <input 
                  type="text" 
                  required
                  maxLength="5"
                  value={expiry}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.length > 2) {
                      val = val.substring(0, 2) + '/' + val.substring(2, 4);
                    }
                    setExpiry(val);
                  }}
                  className="w-full bg-black border border-white/20 rounded p-4 text-white focus:border-gold outline-none font-mono"
                  placeholder="MM/YY"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs uppercase tracking-widest text-gold mb-2">CVV</label>
                <input 
                  type="text" 
                  required
                  maxLength="4"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-black border border-white/20 rounded p-4 text-white focus:border-gold outline-none font-mono"
                  placeholder="123"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={processing}
              className="w-full bg-gold text-black py-4 rounded font-medium tracking-wide hover:bg-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {processing ? 'Processing Payment...' : 'Pay <Price amount={3000} /> & Activate'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
