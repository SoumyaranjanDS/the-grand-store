import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function PrivateCollection() {
  const cards = [
    { number: '01', overline: 'Peat & smoke', title: 'The Islay Edit', image: '/assets/products/bowmore-12.png' },
    { number: '02', overline: 'After-dark icons', title: 'The Host’s Cabinet', image: '/assets/products/lady-eclipse.png' },
    { number: '03', overline: 'Silken & storied', title: 'Irish Originals', image: '/assets/products/irishman-harvest.png' },
  ]

  return (
    <section className="py-[66px] lg:py-[72px] bg-[linear-gradient(180deg,#0a0907,#0e0d0a)]" aria-labelledby="private-collection-title">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-0">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-6">
          <div>
            <p className="flex items-center gap-3 m-0 mb-[19px] text-[#e1bd70] text-xs font-semibold tracking-[0.2em] uppercase">
              The private collection
            </p>
            <h2 id="private-collection-title" className="m-0 font-serif text-[clamp(44px,4.4vw,66px)] font-medium tracking-[-0.035em] leading-[0.98] text-[#eee8dd]">
              Chosen with intention
            </h2>
            <p className="max-w-[570px] m-[15px_0_0] text-[#918a7f] text-[15px] leading-[1.8]">
              Thoughtful edits for remarkable tables, important milestones and the pleasure of an undiscovered favourite.
            </p>
          </div>
          <Link className="inline-flex items-center gap-3 pb-[9px] border-b border-[#bd9054] text-[#e1bd70] text-[13px] font-semibold tracking-[0.13em] uppercase transition-colors hover:text-white" to="/shop?collection=private">
            Enter the vault <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.08fr_0.92fr_0.92fr] min-h-[360px] lg:min-h-[380px] gap-3">
          {cards.map((card, idx) => (
            <Link 
              key={card.number}
              className={`group relative flex overflow-hidden min-h-[330px] md:min-h-[360px] lg:min-h-[380px] p-[23px] lg:p-[27px] border border-[#e1bd70]/20 isolate ${idx === 0 ? 'bg-[linear-gradient(145deg,#221b12,#0d0c09_68%)] before:bg-[radial-gradient(circle_at_63%_38%,rgba(192,135,48,0.26),transparent_38%)] md:col-span-2 lg:col-span-1' : 'bg-[linear-gradient(145deg,#1d1913,#0f0e0b_65%)] before:bg-[radial-gradient(circle_at_60%_35%,rgba(183,126,41,0.2),transparent_38%)]'} before:absolute before:inset-0 after:absolute after:inset-0 after:-z-10 after:bg-[linear-gradient(180deg,transparent_50%,rgba(5,5,4,0.68))]`} 
              to="#arrivals"
            >
              <img 
                className="absolute -right-[1%] -bottom-[8%] -z-20 w-[63%] h-[89%] object-contain object-right-bottom drop-shadow-[-15px_22px_24px_rgba(0,0,0,0.65)] transition-all duration-600 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:drop-shadow-[-18px_27px_30px_rgba(0,0,0,0.8)] group-hover:-translate-y-3 group-hover:scale-105" 
                src={card.image} 
                alt={card.title} 
              />
              <span className="text-[#716957] font-serif text-[18px]">{card.number}</span>
              <div className="self-end">
                <p className="m-[0_0_9px] text-[#e1bd70] text-[11px] tracking-[0.16em] uppercase">{card.overline}</p>
                <h3 className="w-[80%] m-[0_0_17px] font-serif text-[38px] lg:text-[clamp(30px,2.8vw,45px)] font-medium leading-[0.98] text-[#eee8dd] lg:text-[clamp(32px,3vw,44px)]">{card.title}</h3>
                <span className="inline-flex items-center pb-1.5 gap-[9px] border-b border-[#e1bd70]/45 text-[#cdc5b8] text-[10px] lg:text-[13px] font-semibold tracking-[0.1em] uppercase leading-[1.45]">Explore collection <ArrowRight size={14} /></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
