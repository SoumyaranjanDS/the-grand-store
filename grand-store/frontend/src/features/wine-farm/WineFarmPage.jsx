import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import WineFarmHero from './components/WineFarmHero'
import WineFarmAbout from './components/WineFarmAbout'
import WineFarmSpecials from './components/WineFarmSpecials'
import WineFarmEstates from './components/WineFarmEstates'
import WineFarmVendorBenefits from './components/WineFarmVendorBenefits'
import WineFarmBenefits from './components/WineFarmBenefits'
import WineFarmFeatures from './components/WineFarmFeatures'
import NavBar from './components/NavBar'

const liveBase = 'https://grandstore.co.za'

// Fallback estates shown when no vendors have published profiles yet
const FALLBACK_FARMS = [
  {
    name: 'Tesselaarsdal Wines',
    vendor: 'Ms. BERENE SAULS',
    image: '/assets/farm-tesselaarsdal.png',
    copy: 'Tesselaarsdal was founded in 2015 by long-standing Hamilton Russell Vineyards employee, Berene Sauls. This wine is named after the historic Overberg farming hamlet of Tesselaarsdal...',
  },
  {
    name: 'Original Wines',
    vendor: 'Mr. Grand Store',
    image: '/assets/farm-original.jpg',
    copy: 'Guilty Brand Wine is a celebration of bold flavors and refined craftsmanship. This full-bodied red wine offers a complex bouquet of dark fruits, chocolate, and spice...',
  },
]

const categories = [
  { name: 'Red Wine', image: '/assets/category-red.webp', href: `${liveBase}/shop/wine/red-wine` },
  { name: 'White Wine', image: '/assets/category-white.webp', href: `${liveBase}/shop/wine/white-wine` },
  { name: 'Sparkling Wine', image: '/assets/category-sparkling.webp', href: `${liveBase}/shop/wine/sparkling-wine` },
  { name: 'Rose Wine', image: '/assets/category-rose.webp', href: `${liveBase}/shop/wine/rose-wine` },
]

const videos = [
  { id: '3oit_bGqjfA', title: 'Red Wine | Red Wines Online | Top 10 Red Wines | South Africa' },
  { id: '4qKj0T3NMqw', title: 'Wines | Online Wines | South Africa | Buy Wines Online' },
]

function SectionHeading({ kicker, title, copy, align = 'left' }) {
  return (
    <div className={`max-w-[820px] mb-8 ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      <div className={`flex items-center gap-2 mb-6 text-[#7b263c] uppercase text-xs font-semibold tracking-widest ${align === 'center' ? 'justify-center' : ''}`}>
        {kicker}
      </div>
      <h2 className="text-ink font-serif text-[clamp(43px,4.7vw,76px)] font-medium leading-[1.02] tracking-tighter mb-6">{title}</h2>
      {copy && <p className="max-w-[640px] text-muted text-lg leading-[1.7] mx-auto">{copy}</p>}
    </div>
  )
}

function Farms() {
  const [estates, setEstates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/estates`)
      .then(r => r.json())
      .then(data => setEstates(Array.isArray(data) ? data : []))
      .catch(() => setEstates([]))
      .finally(() => setLoading(false));
  }, []);

  // If no published estates yet, fall back to static placeholders
  const showFallback = !loading && estates.length === 0;

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto" id="farms">
      <div className="mb-12">
        <SectionHeading kicker="Wine Estates" title={<>Discover Our <em className="text-[#7b263c]">Estate Network</em></>} />
        <p className="text-lg text-ink/70">Stories shaped by soil, sea air, heritage and an unhurried devotion to craft.</p>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {[1,2].map(i => <div key={i} className="bg-black/5 rounded-2xl h-96 animate-pulse" />)}
        </div>
      ) : showFallback ? (
        // Fallback static cards
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {FALLBACK_FARMS.map((farm) => (
            <article className="bg-[#fcfbf8] rounded-2xl overflow-hidden shadow-sm border border-black/5" key={farm.name}>
              <div className="relative h-64 overflow-hidden">
                <img src={farm.image} alt={farm.name} className="w-full h-full object-cover transition-transform hover:scale-105 duration-700" />
              </div>
              <div className="p-8">
                <p className="text-xs uppercase tracking-widest text-[#7b263c] mb-2 font-bold">Vendor : {farm.vendor}</p>
                <h3 className="text-2xl font-serif text-ink mb-4">{farm.name}</h3>
                <p className="text-ink/70 leading-relaxed mb-6">{farm.copy}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        // Real published estates from API
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {estates.map((estate) => (
            <Link to={`/estate/${estate.slug}`} key={estate._id}
              className="group bg-[#fcfbf8] rounded-2xl overflow-hidden shadow-sm border border-black/5 hover:-translate-y-1 transition-all hover:shadow-xl">
              <div className="relative h-56 overflow-hidden">
                {estate.heroImageUrl
                  ? <img src={estate.heroImageUrl} alt={estate.estateName} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                  : <div className="w-full h-full bg-gradient-to-br from-[#7b263c]/20 to-[#b58b38]/20 flex items-center justify-center text-4xl">🍷</div>
                }
              </div>
              <div className="p-6">
                {estate.region && <p className="text-xs uppercase tracking-widest text-[#7b263c] mb-1 font-bold">{estate.region}</p>}
                <h3 className="text-xl font-serif text-ink mb-2">{estate.estateName}</h3>
                {estate.tagline && <p className="text-ink/60 text-sm leading-relaxed mb-4">{estate.tagline}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink/40">{estate.followers?.length || 0} followers</span>
                  <span className="inline-flex items-center gap-1 uppercase text-xs font-bold tracking-widest text-[#7b263c] border-b border-[#7b263c] pb-0.5">Explore ↗</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

function VendorCta() {
  return (
    <section className="bg-ink text-white py-32 px-6 text-center">
      <span className="block uppercase text-xs tracking-[0.2em] text-[#bd9054] mb-6">For growers • makers • visionaries</span>
      <h2 className="font-serif text-5xl md:text-7xl mb-8 leading-tight">Your journey to success<br /><em className="text-[#7b263c] not-italic">starts here</em></h2>
      <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">Forge unforgettable memories and seize business opportunities with our custom wine experiences.</p>
      <a className="inline-block bg-[#f4efe3] text-ink uppercase text-xs font-bold tracking-[0.14em] px-8 py-4 hover:bg-[#7b263c] hover:text-white transition-colors" href={`${liveBase}/vendor-portal`}>Become A Vendor</a>
    </section>
  )
}

function Categories() {
  return (
    <section className="py-24 px-6 bg-[#fbf8f1]" id="categories">
      <div className="max-w-7xl mx-auto">
        <SectionHeading kicker="Shop the cellar" title={<>Explore Top <em className="text-[#7b263c] not-italic">Categories</em></>} align="center" />
        <p className="text-center text-lg text-ink/70 mb-16">Discover South Africa's finest wines, selected from celebrated regions and expressive vineyards.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category, index) => (
            <a href={category.href} target="_blank" rel="noreferrer" className="group bg-white border border-black/5 rounded-2xl p-8 text-center transition-all hover:-translate-y-2 hover:shadow-xl" key={category.name}>
              <span className="block text-4xl font-serif text-black/5 mb-6 group-hover:text-[#7b263c]/10 transition-colors">0{index + 1}</span>
              <div className="h-48 flex justify-center mb-6"><img src={category.image} alt="" className="h-full object-contain group-hover:scale-105 transition-transform duration-500" /></div>
              <h3 className="font-bold uppercase tracking-wider text-ink mb-2">{category.name}</h3>
              <p className="text-sm text-ink/60">Discover South Africa's finest {category.name.toLowerCase()}s.</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function VideoSection() {
  const [selected, setSelected] = useState(0)
  const activeVideo = videos[selected]
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <SectionHeading kicker="From the field" title={<>Trending <em className="text-[#7b263c] not-italic">Video</em></>} />
      <div className="flex flex-col lg:flex-row gap-8 mt-12">
        <a href={`https://www.youtube.com/watch?v=${activeVideo.id}`} target="_blank" rel="noreferrer" className="flex-1 relative rounded-2xl overflow-hidden group">
          <img src={`https://i.ytimg.com/vi/${activeVideo.id}/maxresdefault.jpg`} alt="" className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
             <span className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white text-3xl transition-transform group-hover:scale-110">▶</span>
          </div>
        </a>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-ink text-white py-24 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-20 border-b border-white/10 pb-20">
        <div>
          <span className="uppercase text-[#bd9054] tracking-widest text-xs mb-4 block">Ready to take your place?</span>
          <h2 className="font-serif text-5xl leading-tight">Bring your vineyard<br /><em className="text-[#7b263c] not-italic">to a wider world.</em></h2>
        </div>
        <a className="mt-8 md:mt-0 inline-block bg-[#f4efe3] text-ink uppercase text-xs font-bold tracking-[0.14em] px-8 py-4 hover:bg-[#7b263c] hover:text-white transition-colors" href={`${liveBase}/vendor-portal`}>Become A Vendor</a>
      </div>
      <div className="max-w-7xl mx-auto text-center text-white/50 text-sm">
        <p>© 2026 The Grand Store. All Rights Reserved.</p>
      </div>
    </footer>
  )
}

export default function WineFarmPage() {
  useEffect(() => {
    document.title = 'Wine Farm | The Grand Store'
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="bg-[#fbf8f1]">
      <NavBar />
      <main className="pt-0">
        <WineFarmHero />
        <WineFarmBenefits />
        <WineFarmAbout />
        <WineFarmSpecials />
        <WineFarmEstates />
        <Farms />
        <VendorCta />
        <Categories />
        <VideoSection />
        <WineFarmVendorBenefits />
        <WineFarmFeatures />
      </main>
      <Footer />
    </div>
  )
}
