import { Link, useNavigate } from 'react-router-dom'
import { GitCompareArrows, Heart, Search, ShoppingBag, Plus, Store } from 'lucide-react'
import { useWishlist } from '../wishlistContext'

export default function ProductCard({ product, onAdd, onWish, onCompare, isCompared = false, onQuickView }) {
  const navigate = useNavigate();
  const productPath = `/product/${product.slug || product.id || product._id}`
  const { isWishlisted } = useWishlist()
  const wishlisted = isWishlisted(product)

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) return;
    navigate(productPath);
  };

  return (
    <article 
      onClick={handleCardClick} 
      className="relative flex flex-col group cursor-pointer bg-transparent transition-all duration-500 overflow-hidden"
    >
      {/* Top Image Section */}
      <div className="relative w-full aspect-[4/5] bg-[#080808] flex items-center justify-center overflow-hidden mb-5">
        {/* Subtle golden glow behind bottle on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#b58b38]/0 to-transparent group-hover:from-[#b58b38]/10 transition-colors duration-500" />
        
        {product.badge && (
          <span className="absolute top-4 left-4 z-10 px-2 py-1 bg-black/80 backdrop-blur-sm border border-[#b58b38]/30 text-[#e6c97a] text-[9px] tracking-widest uppercase font-medium">
            {product.badge}
          </span>
        )}

        {/* Floating Image */}
        <img 
          className="relative z-10 w-[70%] h-[85%] object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-105 group-hover:-translate-y-2" 
          src={product.image} 
          alt={product.name} 
          loading="lazy" 
        />

      </div>

      {/* Details Section */}
      <div className="px-2 pb-4 text-center">
        <p className="text-[#918a7f] text-[9px] tracking-[0.2em] uppercase mb-2">
          {product.brand || product.category}
        </p>
        <h3 className="font-serif text-lg text-white mb-2 line-clamp-1 group-hover:text-[#e6c97a] transition-colors">
          {product.name}
        </h3>
        <strong className="text-[#e6c97a] font-serif text-xl font-medium tracking-wide mb-2 inline-block">
          {product.price}
        </strong>

        {product.storeName && product.storeId && (
          <div className="mt-1 mb-2">
            <Link 
              to={`/store/${product.storeId}`} 
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#b58b38]/10 to-[#e6c97a]/10 border border-[#b58b38]/30 rounded-full hover:from-[#b58b38]/20 hover:to-[#e6c97a]/20 hover:border-[#b58b38]/60 transition-all duration-300 group/store shadow-[0_2px_10px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_12px_rgba(181,139,56,0.15)]"
            >
              <Store size={10} className="text-[#c9a35b] group-hover/store:text-[#e6c97a] transition-colors" />
              <span className="text-[9px] uppercase tracking-wider text-[#e6c97a] font-medium group-hover/store:text-white transition-colors truncate max-w-[120px]">
                {product.storeName}
              </span>
            </Link>
          </div>
        )}

        {/* Action Row */}
        <div className="flex items-center justify-center gap-2 mt-4 mb-3 w-full">
          <button
            onClick={(e) => { e.stopPropagation(); onWish(product); }}
            className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-full border ${wishlisted ? 'bg-gradient-to-r from-[#b58b38] to-[#e6c97a] border-transparent text-[#050505] shadow-[0_0_8px_rgba(230,201,122,0.4)]' : 'bg-transparent border-[#b58b38]/40 text-[#e6c97a] hover:bg-[#b58b38]/10 hover:border-[#b58b38]'} transition-all`}
            aria-label="Wishlist"
          >
            <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAdd(product); }}
            className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-transparent border border-[#b58b38]/40 text-[#e6c97a] hover:bg-[#b58b38]/10 hover:border-[#b58b38] transition-all relative"
            aria-label="Add to Cart"
          >
            <ShoppingBag size={14} />
            <Plus size={8} className="absolute bottom-2 right-2 text-[#e6c97a]" strokeWidth={4} />
          </button>
          <button
            onClick={(e) => { 
              e.stopPropagation(); 
              onAdd(product); 
            }}
            className="flex-1 h-9 flex items-center justify-center bg-gradient-to-r from-[#b58b38] via-[#e6c97a] to-[#b58b38] text-[#050505] text-[9px] uppercase tracking-widest font-bold shadow-[0_0_10px_rgba(230,201,122,0.3)] hover:shadow-[0_0_15px_rgba(230,201,122,0.6)] hover:opacity-90 transition-all ml-1"
          >
            Checkout
          </button>
        </div>
      </div>
      
      {/* Bottom border (always visible) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[#e6c97a] to-transparent opacity-100" />
    </article>
  )
}
