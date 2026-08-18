import { Link } from 'react-router-dom'
import { brands } from '../../../data'

export default function BrandSection() {
  const list = [...brands, ...brands]
  return (
    <section className="relative py-[54px] pb-[52px] bg-[#0e0d0b] bg-[radial-gradient(ellipse_at_50%_112%,rgba(143,84,24,0.17),transparent_48%),linear-gradient(120deg,rgba(103,68,25,0.12),transparent_45%)]" id="brands">
      <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-10 bg-[radial-gradient(ellipse_at_50%_50%,#e1bd70,transparent_60%)]" />
      <div className="max-w-[1240px] mx-auto px-6 sm:px-0 mb-[25px] text-center">
        <h2 className="m-0 font-serif text-[40px] font-medium tracking-[-0.035em] leading-[0.98]">
          Top Whisky Brands
        </h2>
      </div>
      <div 
        className="relative overflow-hidden w-full group" 
        style={{ maskImage: 'linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent)' }}
        aria-label="Featured whisky brands"
      >
        <div className="flex w-max animate-[marquee_15s_linear_infinite] group-hover:[animation-play-state:paused] will-change-transform">
          {list.map((brand, index) => (
            <Link 
              className="relative flex items-center justify-center flex-[0_0_200px] h-[82px] mr-3 px-4 py-3 border border-[#e1bd70]/20 bg-white/5 transition-all duration-200 hover:bg-[#e1bd70]/10 hover:border-[#e1bd70]/40 hover:-translate-y-1" 
              to={`/shop?brand=${encodeURIComponent(brand.name)}`} 
              key={`${brand.name}-${index}`} 
              aria-label={`Shop ${brand.name}`}
            >
              <img 
                className="w-[150px] h-[82px] object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.4)]" 
                style={{ filter: 'sepia(0.16) saturate(1.1) brightness(1.18)' }}
                src={brand.image} 
                alt="" 
              />
              <span className="absolute bottom-2 right-2 text-[#d8cbae] text-[9px] font-[650] tracking-[0.18em] uppercase opacity-0 transition-opacity group-hover:opacity-100">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
