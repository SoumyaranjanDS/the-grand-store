import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function PrivateCollection() {
  const cards = [
    { 
      number: '01', 
      overline: 'Peat & Smoke', 
      title: 'The Islay Edit', 
      desc: 'Maritime salt, peat fire and cask strength rarity.',
      image: '/assets/products/bowmore-12.png',
      link: '/shop?category=Whisky'
    },
    { 
      number: '02', 
      overline: 'After-Dark Icons', 
      title: 'The Host’s Cabinet', 
      desc: 'Remarkable bottles chosen for hosting milestones.',
      image: '/assets/products/lady-eclipse.png',
      link: '/shop?collection=private'
    },
    { 
      number: '03', 
      overline: 'Silken & Storied', 
      title: 'Cape Potstill & Irish', 
      desc: 'Heritage copper pot distillation from Stellenbosch to Cork.',
      image: '/assets/products/irishman-harvest.png',
      link: '/shop?category=Brandy'
    },
  ]

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
            <p className="max-w-[600px] mt-2.5 text-[rgba(244,238,224,0.76)] text-[15px] md:text-[16px] leading-[1.6]">
              <span className="font-serif text-[#f0cf76] italic text-[1.06em]">The Private Collection.</span>{' '}
              Thoughtful edits for remarkable tables, important milestones and rare cellar acquisitions.
            </p>
          </div>
          <Link 
            className="inline-flex items-center gap-2.5 pb-[6px] border-b border-[#bd9054] text-[#e1bd70] text-[13px] font-semibold tracking-[0.13em] uppercase transition-colors hover:text-white shrink-0" 
            to="/shop?collection=private"
          >
            Enter the vault <ArrowRight size={15} />
          </Link>
        </div>
        
        {/* 3 Compact Luxury Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 items-stretch">
          {cards.map((card) => (
            <Link 
              key={card.number}
              to={card.link}
              className="group relative flex flex-col justify-between min-h-[250px] md:min-h-[270px] p-5 md:p-6 rounded-2xl border border-white/10 bg-[#11100d] hover:border-[#c9a35b]/60 hover:bg-[#15120e] hover:shadow-[0_16px_36px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-300 overflow-hidden shadow-xl text-left" 
            >
              {/* Radial ambient glow on hover */}
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-[var(--color-gold)]/10 rounded-full blur-2xl group-hover:bg-[var(--color-gold)]/20 transition-all pointer-events-none" />

              {/* Floating Bottle Asset */}
              <img 
                className="absolute -right-2 -bottom-3 w-[46%] h-[80%] object-contain object-right-bottom drop-shadow-[-12px_16px_20px_rgba(0,0,0,0.75)] transition-transform duration-500 ease-out group-hover:scale-108 group-hover:-translate-y-1.5 pointer-events-none z-10" 
                src={card.image} 
                alt={card.title} 
                loading="lazy"
              />

              {/* Card Top Meta */}
              <div className="flex items-center justify-between gap-3 relative z-20">
                <span className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-gold-gradient bg-[#c9a35b]/10 px-2.5 py-0.5 rounded-full border border-[#c9a35b]/20">
                  {card.overline}
                </span>
                <span className="text-xs font-mono font-semibold text-[#716957] bg-black/40 px-2 py-0.5 rounded border border-white/5">
                  {card.number}
                </span>
              </div>

              {/* Card Content & Action */}
              <div className="relative z-20 mt-6 max-w-[65%]">
                <h3 className="m-0 font-serif text-xl md:text-[23px] font-medium leading-[1.15] text-[#eee8dd] group-hover:text-[#f0cf76] transition-colors">
                  {card.title}
                </h3>
                <p className="mt-2 text-xs text-[#918a7f] leading-relaxed line-clamp-2">
                  {card.desc}
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#c9a35b] group-hover:text-white uppercase tracking-wider transition-colors">
                  <span>Explore</span>
                  <ArrowRight size={13} className="transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
