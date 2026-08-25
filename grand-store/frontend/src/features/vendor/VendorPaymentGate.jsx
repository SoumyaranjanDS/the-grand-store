import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { CreditCard, CheckCircle, Store, ShieldCheck } from "lucide-react";
import Price from "../../components/ui/Price";

export default function VendorPaymentGate() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const [registrationFee, setRegistrationFee] = useState(0);

  React.useEffect(() => {
    // Check if we just returned from PayFast
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      handleSuccessRedirect();
    } else if (params.get('success') === 'false') {
      alert("Payment was cancelled or failed. Please try again.");
    }

    // Fetch fee
    const fetchFee = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const token = userInfo?.token || user?.token;
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/vendor/onboarding`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data && data.registrationFee) {
          setRegistrationFee(data.registrationFee);
        }
      } catch (err) {
        console.error("Failed to fetch vendor registration fee", err);
      }
    };
    fetchFee();
  }, [user]);

  const handleSuccessRedirect = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) {
      userInfo.role = "vendor_active";
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
    }
    if (login && userInfo) {
      login(userInfo);
    }
    setSuccess(true);
    setTimeout(() => {
      navigate("/vendor/dashboard");
    }, 2000);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.token || user?.token;

      // Call backend to generate PayFast URL and signature
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/payfast/generate-vendor`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Construct and submit a form dynamically to redirect to PayFast
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.url;

      for (const key in data.data) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = data.data[key];
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
      
    } catch (error) {
      console.error("Payment generation failed", error);
      alert("Failed to initialize payment gateway.");
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
          <h2 className="text-2xl text-white font-light mb-4">
            Payment Successful!
          </h2>
          <p className="text-white/60 mb-8">
            Welcome to The Grand Store. Redirecting to your dashboard...
          </p>
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
            <div className="text-gold mb-6">
              <Store size={32} />
            </div>
            <h2 className="text-2xl text-white font-light mb-2">
              Vendor Activation
            </h2>
            <p className="text-white/50 text-sm mb-8">
              Complete your one-time registration fee to activate your
              storefront.
            </p>

            <div className="space-y-4 border-b border-white/10 pb-6 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Setup & Verification</span>
                <span className="text-white">
                  <Price amount={registrationFee} />
                </span>
              </div>
            </div>

            <div className="flex justify-between text-lg">
              <span className="text-white">Total Due</span>
              <span className="text-gold font-mono">
                <Price amount={registrationFee} />
              </span>
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
              <p className="text-white/60 text-sm mb-6">
                You will be securely redirected to PayFast to complete your activation payment.
              </p>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full bg-gold hover:bg-white text-black py-4 rounded font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {processing ? (
                "Initializing Secure Gateway..."
              ) : (
                <>
                  Pay Now via PayFast <ShieldCheck size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
