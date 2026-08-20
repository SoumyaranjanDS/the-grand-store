import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useProducts } from '../../../context/ProductContext'

export default function PrivateCollection() {
  const { products } = useProducts()

  // Use the first 3 products, or fallback to empty array
  const collectionProducts = products.slice(0, 3)

  const cards = collectionProducts.map((product, index) => ({
    number: `0${index + 1}`,
    overline: product.category || product.type || 'Exclusive',
    title: product.name,
    desc: product.description || 'Exclusive curated collection selection.',
    image: product.image,
    link: `/product/${product.id || product._id}`
  }))

  return (
    <section 
      className="py-[40px] md:py-[48px] border-t border-white/10 bg-[#0a0a0a] relative overflow-hidden" 
      aria-labelledby="private-collection-title"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[500px] h-[250px] bg-[var(--color-gold)]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1240px] mx-auto px-6 sm:px-0 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-6 md:mb-7 gap-4 md:gap-8">
          <div className="text-left">
            <div className="text-[10px] md:text-xs uppercase tracking-widest font-semibold text-[#918a7f] mb-1.5 flex items-center gap-2">
              <span className="w-5 h-px bg-[#b58b38] inline-block" />
              Curated Vault Editions
            </div>
            <h2 
              id="private-collection-title" 
              className="m-0 font-serif text-[clamp(40px,3.8vw,62px)] font-medium tracking-[-0.02em] leading-[1.05] text-[#eee8dd]"
            >
              Chosen with{' '}
              <span
                className="gold-gradient-text inline-block pr-2 font-script text-[1.12em]"
                style={{ fontFamily: "'Dancing Script', cursive" }}
              >
                Intention
              </span>
            </h2>
          </div>
          <Link 
            className="inline-flex items-center gap-2.5 pb-[6px] border-b border-[#bd9054] text-[#e1bd70] text-[13px] font-semibold tracking-[0.13em] uppercase transition-colors hover:text-white shrink-0" 
            to="/shop?collection=private"
          >
            Enter the vault <ArrowRight size={15} />
          </Link>
        </div>
        
        {/* 3 Compact Luxury Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 items-stretch">
          {cards.map((card) => (
            <Link 
              key={card.number}
              to={card.link}
              className="group relative flex flex-col min-h-[360px] md:min-h-[380px] p-5 md:p-6 rounded-[24px] border border-white/10 bg-gradient-to-b from-[#11100d] to-[#0a0907] hover:border-[#c9a35b]/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] hover:-translate-y-1.5 transition-all duration-500 overflow-hidden shadow-2xl text-left" 
            >
              {/* Radial ambient glow on hover */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-gold)]/5 rounded-full blur-3xl group-hover:bg-[var(--color-gold)]/15 transition-all pointer-events-none" />

              {/* Card Top Meta */}
              <div className="flex items-start justify-between gap-3 relative z-20 mb-1">
                <span className="text-[11px] md:text-xs uppercase tracking-[0.2em] font-bold text-gold-gradient bg-[#c9a35b]/10 px-3 py-1 rounded-full border border-[#c9a35b]/25 truncate max-w-[170px]">
                  {card.overline}
                </span>
                <span className="text-[14px] font-mono font-semibold text-[#8c8270] bg-black/50 px-2 py-0.5 rounded-md border border-white/5 shrink-0">
                  {card.number}
                </span>
              </div>

              {/* Dedicated Image Container */}
              <div className="relative z-10 flex-grow flex items-center justify-center py-3">
                <img 
                  className="w-full h-[140px] md:h-[155px] object-contain drop-shadow-[-10px_15px_25px_rgba(0,0,0,0.8)] group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 ease-out" 
                  src={card.image} 
                  alt={card.title} 
                  loading="lazy"
                />
              </div>

              {/* Card Content & Action (Bottom) */}
              <div className="relative z-20 mt-auto pt-3 border-t border-white/5">
                <h3 className="m-0 font-serif text-[24px] md:text-[28px] font-medium leading-[1.2] tracking-wide text-[#eee8dd] group-hover:text-[#f0cf76] transition-colors line-clamp-2">
                  {card.title}
                </h3>
                <p className="mt-2.5 text-[14px] md:text-[15px] text-[#b3ac9f] font-light leading-[1.6] line-clamp-2 min-h-[48px]">
                  {card.desc}
                </p>
                <div className="mt-4 flex items-center gap-2 text-[13px] font-bold text-[#c9a35b] group-hover:text-white uppercase tracking-[0.2em] transition-colors">
                  <span>Explore Collection</span>
                  <ArrowRight size={16} className="transform group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
