import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown, Sparkles, CheckCircle2, ArrowRight, X, ShieldCheck } from 'lucide-react';
import Price from '../../../components/ui/Price';

/**
 * Luxury Gold & Champagne Canvas Confetti Particle System
 */
function LuxuryConfettiCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = [
      '#ffd700', // Bright Gold
      '#f5d77f', // Pale Champagne
      '#d4af37', // Imperial Gold
      '#c99742', // Warm Amber
      '#ffffff', // Diamond White
      '#e6ca65', // Metallic Gold
    ];

    const particleCount = Math.min(120, Math.floor(window.innerWidth / 10));
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * -height,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 3 + 2,
      speedX: (Math.random() - 0.5) * 2.5,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 5,
      shape: Math.random() > 0.4 ? 'rect' : 'circle',
      opacity: Math.random() * 0.5 + 0.5,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotSpeed;

        if (p.y > height) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Auto-stop after 8 seconds to preserve GPU
    const stopTimer = setTimeout(() => {
      cancelAnimationFrame(animationFrameId);
    }, 8000);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(stopTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9998] w-full h-full"
    />
  );
}

export default function AuctionWinnerCelebrationModal({
  isOpen,
  onClose,
  lot,
  user,
}) {
  const navigate = useNavigate();

  if (!isOpen || !lot) return null;

  const hammerPrice = lot.winningBid || lot.currentBid || 0;
  const lotNumber = lot.lotNumber || lot._id?.slice(-6)?.toUpperCase() || 'GS-LOT';
  const lotImage = lot.images && lot.images.length > 0 ? lot.images[0] : null;

  const handleProceedToCheckout = () => {
    onClose?.();
    navigate(`/auction/checkout/${lot._id}`);
  };

  const handleViewCertificate = () => {
    onClose?.();
    const el = document.getElementById('acquisition-certificate');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl"
        />

        {/* Confetti Animation */}
        <LuxuryConfettiCanvas />

        {/* Modal Dialog Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-gradient-to-b from-[#1b1509] via-[#0e0c08] to-[#050505] border border-[#ffd700]/70 p-6 sm:p-10 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_60px_rgba(212,175,55,0.3)] z-10 text-center"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>

          {/* Golden Trophy Emblem */}
          <div className="relative mx-auto mb-6 w-24 h-24 flex items-center justify-center">
            {/* Pulsing Aura Rings */}
            <div className="absolute inset-0 rounded-full bg-[#d4af37]/20 animate-ping opacity-75" />
            <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-[#ffd700]/30 to-transparent blur-xl" />

            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#ffd700] via-[#f5d77f] to-[#b38e2e] p-0.5 shadow-[0_0_40px_rgba(255,215,0,0.6)]">
              <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center">
                <Trophy size={42} className="text-[#ffd700] drop-shadow-[0_0_12px_rgba(255,215,0,0.8)]" />
              </div>
            </div>
          </div>

          {/* Header Texts */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-widest bg-[#d4af37]/15 text-[#ffd700] border border-[#d4af37]/40 mb-3 shadow-sm">
              <Crown size={13} /> Official Auction Victory
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ffffff] via-[#f5d77f] to-[#d4af37] tracking-tight mb-2">
              Congratulations{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
            </h2>
            <p className="text-sm font-light text-[var(--color-ivory-muted)] max-w-md mx-auto leading-relaxed">
              The gavel has officially fallen. You emerged as the winning bidder for this singular reserve piece.
            </p>
          </div>

          {/* Lot Summary Box */}
          <div className="rounded-2xl bg-black/60 border border-white/10 p-5 mb-6 text-left flex items-center gap-4">
            {lotImage && (
              <div className="w-16 h-20 rounded-xl bg-white/[0.03] border border-white/10 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={lotImage}
                  alt={lot.title}
                  className="w-full h-full object-contain drop-shadow"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#d4af37] font-bold block mb-1">
                LOT #{lotNumber}
              </span>
              <h3 className="text-sm font-serif font-bold text-white truncate mb-2">
                {lot.title}
              </h3>
              <div className="flex items-baseline justify-between border-t border-white/5 pt-2">
                <span className="text-xs font-mono text-white/50">Winning Hammer:</span>
                <span className="text-lg font-serif font-bold text-[#f5d77f]">
                  <Price amount={hammerPrice} />
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleProceedToCheckout}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#ffd700] via-[#f5d77f] to-[#d4af37] text-black font-black uppercase tracking-widest text-xs shadow-[0_0_35px_rgba(212,175,55,0.5)] hover:shadow-[0_0_45px_rgba(212,175,55,0.8)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <Sparkles size={16} className="text-black/80" />
              <span>Complete Checkout & Secure Delivery</span>
              <ArrowRight size={16} className="text-black/80" />
            </button>

            <button
              type="button"
              onClick={handleViewCertificate}
              className="w-full py-3 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-mono uppercase tracking-widest text-[11px] border border-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck size={14} className="text-[#ffd700]" />
              <span>Review Certificate of Acquisition</span>
            </button>
          </div>

          {/* Footer note */}
          <p className="mt-5 text-[10px] font-mono text-white/40 tracking-wider">
            Protected by Grand Store Bonded Vault Escrow • Direct Insured Dispatch
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
