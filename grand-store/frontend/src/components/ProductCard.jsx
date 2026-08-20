import { Link, useNavigate } from 'react-router-dom'
import { GitCompareArrows, Heart, Eye, ShoppingCart, ShoppingBag } from 'lucide-react'
import { useWishlist } from '../wishlistContext'

export default function ProductCard({ product, index, onAdd, onWish, onCompare, isCompared = false, onQuickView }) {
  const navigate = useNavigate()
  const productPath = `/product/${product.slug || product.id || product._id}`
  const { isWishlisted } = useWishlist()
  const wishlisted = isWishlisted(product)

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) return
    navigate(productPath)
  }

  // Format price
  const formattedPrice = typeof product.price === 'number'
    ? `R ${product.price.toLocaleString()}`
    : (product.price?.toString().startsWith('R') ? product.price : `R ${product.price}`)

  // Derive badge text (Category)
  const badge = product.category || product.type || product.badge || 'Wine'

  // Derive Vendor, Origin, Volume
  const vendorName = product.storeName || product.vendor || 'Grand Store'
  const origin = product.origin || product.region || product.country || 'South Africa'
  const volume = product.volume || (product.options && product.options[0]) || '750ml'

  // The elegant pure gold gradient matching Arrivals text
  const goldRedGradient = "bg-[linear-gradient(135deg,#c5993b_0%,#f7df95_50%,#b88628_100%)]"
  const activeText = "text-black" // Explicitly black text
  const idleBg = "bg-[#181613]"
  const idleText = "text-[#f7df95]"

  return (
    <article 
      onClick={handleCardClick} 
      className="group relative flex flex-col w-full cursor-pointer select-none transition-all duration-300 rounded-xl bg-gradient-to-b from-[#c5993b]/50 via-[#f7df95]/15 to-[#b88628]/25 p-[1px] hover:from-[#f7df95]/70 hover:to-[#b88628]/40"
    >
      <div className="flex flex-col w-full h-full bg-[#0a0a0a] rounded-xl overflow-hidden pb-3">
        {/* 1. Bottle Display Area - Compact */}
        <div className="relative w-full h-[220px] sm:h-[240px] flex items-center justify-center bg-transparent mt-2">
          
          {/* Floor ambient radial glow under the bottle - updated to match gold/red theme */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[130px] h-[25px] rounded-[100%] pointer-events-none opacity-80"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(217, 119, 6, 0.45) 0%, rgba(255, 215, 0, 0.1) 50%, transparent 70%)',
              filter: 'blur(6px)'
            }}
          />

          {/* Pill Badge (Top-Left) with Gold Boundary */}
          {badge && (
            <div className={`absolute top-2 left-2 z-20 px-2.5 h-[28px] rounded-full ${goldRedGradient} border-[1.5px] border-[#f7df95] ${activeText} font-bold text-[10px] uppercase tracking-wider flex items-center justify-center shadow-[0_0_12px_rgba(217,119,6,0.5)]`}>
              {badge}
            </div>
          )}


          {/* The Bottle - Tall Standing Cutout */}
          <img 
            src={product.image} 
            alt={product.name} 
            className="relative z-10 w-auto h-[92%] max-h-[230px] object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.85)] transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:scale-105"
            loading="lazy" 
          />
        </div>

        {/* 2. Typography & Metadata Section - Centered Layout & Compact */}
        <div className="mt-2 flex flex-col items-center text-center px-2">
          
          {/* Line 1: Title / Brand Name - Elegant Gold */}
          <h3 className="font-serif text-[18px] sm:text-[20px] font-medium text-[#f7df95] leading-tight line-clamp-1 w-full">
            {product.name}
          </h3>

          {/* Line 2: Sub-info (Vendor / Origin / Volume) */}
          <p className="text-[#918a7f] text-[12px] font-normal tracking-wide mt-1 line-clamp-1 flex items-center justify-center gap-1.5">
            <span className="text-[#c5993b]">{vendorName}</span>
            <span>{origin}</span>
            <span>{volume}</span>
          </p>

          {/* Line 3: Price */}
          <div className="mt-1 flex items-baseline justify-center gap-2 min-h-[24px] w-full">
            <span className="text-[#f7df95] font-bold text-[18px] sm:text-[20px] tracking-wide">
              {formattedPrice}
            </span>
            {product.originalPrice && (
              <span className="text-[#75726c] line-through text-[12px] sm:text-[13px]">
                {product.originalPrice}
              </span>
            )}
          </div>

          {/* Line 4: Action Buttons (Elegant Gold theme) */}
          <div className="mt-2.5 flex items-center justify-center gap-2.5 w-full">
            {/* Wishlist */}
            {onWish && (
              <button
                onClick={(e) => { e.stopPropagation(); onWish(product); }}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-[1.5px] transition-all ${
                  wishlisted 
                    ? `${goldRedGradient} border-[#f7df95] ${activeText} shadow-[0_0_15px_rgba(217,119,6,0.5)]` 
                    : `${idleBg} border-[#c5993b] ${idleText} hover:${goldRedGradient} hover:border-[#fff] hover:${activeText} hover:shadow-[0_0_15px_rgba(217,119,6,0.5)]`
                }`}
                title="Wishlist"
              >
                <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            )}

            {/* Add to Cart (Icon only) */}
            {onAdd && (
              <button
                onClick={(e) => { e.stopPropagation(); onAdd(product); }}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-[1.5px] transition-all ${idleBg} border-[#c5993b] ${idleText} hover:${goldRedGradient} hover:border-[#fff] hover:${activeText} hover:shadow-[0_0_15px_rgba(217,119,6,0.5)]`}
                title="Add to Cart"
              >
                <ShoppingCart size={16} />
              </button>
            )}

            {/* Checkout (Pill) */}
            {onAdd && (
              <button
                onClick={(e) => { e.stopPropagation(); onAdd(product); navigate('/checkout'); }}
                className={`h-9 sm:h-10 px-6 sm:px-8 rounded-full flex items-center justify-center ${goldRedGradient} border-[1.5px] border-[#f7df95] !text-black text-[14px] sm:text-[15px] font-black uppercase tracking-wider [-webkit-text-stroke:0.5px_black] drop-shadow-[0_1px_3px_rgba(255,255,255,0.5)] transition-all hover:border-[#fff] hover:shadow-[0_0_15px_rgba(217,119,6,0.5)]`}
                title="Checkout"
              >
                Checkout
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
