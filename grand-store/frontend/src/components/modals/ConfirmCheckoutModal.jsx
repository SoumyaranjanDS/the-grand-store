import React, { useEffect } from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ConfirmCheckoutModal({ isOpen, onClose, inline = false }) {
  const navigate = useNavigate();

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen && !inline) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProceed = () => {
    onClose();
    navigate('/customer/checkout');
  };

  return (
    <div className={`${inline ? "absolute" : "fixed"} inset-0 ${inline ? "z-10" : "z-50"} flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm`} onClick={onClose}>
      <div 
        className={`bg-[#1a1814] border border-[#d4af37]/30 rounded-xl w-full shadow-2xl overflow-hidden relative text-center ${inline ? "max-w-[90%] text-sm" : "max-w-md"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
          <h3 className={`${inline ? "text-base" : "text-xl"} font-serif text-white flex items-center gap-2`}>
            <ShoppingCart className="text-[#d4af37]" size={20} />
            Checkout Confirmation
          </h3>
          <button 
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className={`${inline ? "p-4" : "p-6"} text-center`}>
          <p className={`text-white/80 mb-4 ${inline ? "text-sm" : "text-lg"}`}>
            {inline ? "Proceed to checkout?" : "Are you sure you want to proceed? You will be redirected to the checkout page."}
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <button 
              onClick={onClose}
              className="px-6 py-2 rounded-md border border-white/20 text-white hover:bg-white/10 transition-colors font-medium"
            >
              Cancel
            </button>
            <button 
              onClick={handleProceed}
              className="px-6 py-2 rounded-md bg-[#d4af37] text-black font-medium hover:bg-[#f3ca40] transition-colors shadow-[0_0_15px_rgba(212,175,55,0.4)]"
            >
              Yes, Proceed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


