import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function TastingCampaign() {
  return (
    <section 
      className="relative flex w-[calc(100%-48px)] lg:w-[calc(100%-60px)] min-h-[530px] lg:min-h-[640px] max-w-[1500px] mx-auto my-[18px] border border-[#e1bd70]/20 bg-[#0b0a08]" 
      aria-labelledby="tasting-title"
      style={{ isolation: 'isolate' }}
    >
      <img 
        className="absolute inset-0 -z-20 w-full h-full object-cover lg:object-center object-[68%_center]" 
        src="/assets/campaigns/whisky-tasting-editorial.png" 
        alt="Whisky bottles and a crystal tasting glass in a private tasting room" 
      />
      <div 
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(7,7,6,0.35),rgba(7,7,6,0.95)_70%)] lg:bg-[linear-gradient(90deg,rgba(7,7,6,0.93),rgba(7,7,6,0.66)_37%,rgba(7,7,6,0.08)_65%),linear-gradient(180deg,rgba(7,7,6,0.15),transparent_55%,rgba(7,7,6,0.54))]" 
      />
      
      <Link 
        className="flex flex-col justify-end lg:justify-center items-start w-full lg:w-[min(620px,48%)] p-[30px_26px_38px] lg:p-[clamp(44px,6vw,96px)] text-inherit no-underline cursor-pointer group focus-visible:outline-2 focus-visible:outline-[#e1bd70] focus-visible:-outline-offset-[5px]" 
        to="/bookatasting" 
        aria-label="Explore and book an in-store tasting"
      >
        <p className="flex items-center gap-3 m-0 mb-[19px] text-[#e1bd70] text-xs font-semibold tracking-[0.2em] uppercase">
          Heritage • craft • character
        </p>
        <h2 
          id="tasting-title" 
          className="m-0 font-serif text-[50px] lg:text-[clamp(54px,5.2vw,84px)] font-medium tracking-[-0.04em] leading-[0.82]"
        >
          The private<br />
          <em className="text-[#e1bd70] font-normal not-italic">tasting room.</em>
        </h2>
        <p className="max-w-[510px] m-[20px_0_24px] lg:m-[28px_0_30px] text-[#b8b0a4] font-serif text-[16px] lg:text-[18px] lg:leading-[1.55] 2xl:text-[19px] 2xl:leading-[1.62]">
          Explore exceptional pours with expert guidance, considered pairings and stories from the makers.
        </p>
        <span className="inline-flex items-center justify-center min-h-[49px] px-6 gap-[14px] border border-white/10 text-[#eee8dd] bg-white/5 text-xs font-semibold tracking-[0.12em] uppercase transition-all duration-180 group-hover:bg-[#f0c86e] group-hover:text-black group-hover:border-[#f0c86e] group-hover:-translate-y-0.5 group-focus-visible:bg-[#f0c86e] group-focus-visible:text-black group-focus-visible:-translate-y-0.5 pointer-events-none">
          Reserve an evening <ArrowRight size={17} />
        </span>
      </Link>
    </section>
  )
}
