import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, ShieldCheck, Gift, CircleUserRound, GitCompareArrows } from 'lucide-react';
import axios from 'axios';
import AuctionLotCard from './AuctionLotCard';
import AuctionCountdown from './AuctionCountdown';

export default function AuctionPage({ onNotify }) {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [now, setNow] = useState(() => Date.now());
  const [filters, setFilters] = useState({ search: '', category: 'all', price: 'all', ending: 'all' });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  useEffect(() => {
    document.title = 'Rare Whisky Auctions — The Grand Store';
    window.scrollTo({ top: 0, behavior: 'auto' });
    
    // Timer for UI ticking
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    
    // Polling for data
    const fetchLots = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auction`);
        setLots(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    
    fetchLots();
    const interval = setInterval(fetchLots, 5000);

    return () => {
      window.clearInterval(timer);
      clearInterval(interval);
      document.title = 'The Grand Store — Luxury Wines & Spirits';
    }
  }, []);

  const visibleLots = lots.filter((lot) => {
    const matchesSearch = `${lot.title} ${lot.lotNumber}`.toLowerCase().includes(appliedFilters.search.trim().toLowerCase());
    const matchesCategory = appliedFilters.category === 'all' || lot.category === appliedFilters.category;
    const matchesPrice = appliedFilters.price === 'all'
      || (appliedFilters.price === 'under-10000' ? lot.currentBid < 10000 : lot.currentBid >= 10000);
    const remainingDays = (new Date(lot.endDate).getTime() - now) / 86400000;
    const matchesEnding = appliedFilters.ending === 'all' || remainingDays < 5;
    return matchesSearch && matchesCategory && matchesPrice && matchesEnding && lot.status === 'live';
  });

  const pastLots = lots.filter(lot => lot.status === 'closed' || lot.status === 'sold');

  const steps = [
    ['Become a member', 'Create a complimentary account and join a private community of collectors.'],
    ['Place your bid', 'Bid with confidence through a clear, secure and carefully monitored process.'],
    ['Winning the lot', 'Successful bidders receive confirmation and collection guidance immediately.'],
    ['Grow your collection', 'Discover rare, vintage and limited releases selected for lasting significance.'],
  ];

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center text-white">Loading Auctions...</div>;
  }

  // Hero uses the first live lot if available
  const heroLot = visibleLots.length > 0 ? visibleLots[0] : null;

  return (
    <main className="auction-page">
      <section className="auction-hero" aria-labelledby="auction-hero-title">
        <div className="auction-hero-glow" />
        <div className="shell auction-hero-inner">
          <div className="auction-hero-copy">
            <p className="eyebrow">Featured Lot</p>
            <h1 id="auction-hero-title">{heroLot ? heroLot.title : 'Exceptional Collections'}</h1>
            <p>{heroLot ? heroLot.description.substring(0, 100) + '...' : 'Rare wines and spirits available to the highest bidder.'}</p>
          </div>
          <div className="auction-hero-bottle">
            {heroLot && <span>{heroLot.lotNumber}</span>}
            <img src={heroLot ? heroLot.images[0] : "/assets/auction/macallan-25.png"} alt="Hero collector bottle" />
          </div>
          <div className="auction-offer">
            {heroLot ? (
               <>
                 <p>Exclusive offer ends in</p>
                 <AuctionCountdown endTime={new Date(heroLot.endDate).getTime()} now={now} />
                 <Link className="button button-outline" to={`/auction/${heroLot._id}`}>View Lot</Link>
               </>
            ) : (
               <p>No featured lot currently live.</p>
            )}
          </div>
        </div>
        <div className="shell auction-assurance">
          <div><ShieldCheck /><span><strong>Authenticated lots</strong>Verified provenance and condition</span></div>
          <div><GitCompareArrows /><span><strong>Secure bidding</strong>Protected bidder transactions</span></div>
          <div><Gift /><span><strong>Curated selection</strong>Rare bottles chosen by specialists</span></div>
          <div><CircleUserRound /><span><strong>Collector support</strong>Guidance from bid to collection</span></div>
        </div>
      </section>

      <section className="auction-story section">
        <div className="shell auction-story-grid">
          <div className="auction-story-image"><img src="/assets/auction/hibiki-17.jpeg" alt="Rare whisky" /></div>
          <div className="auction-story-copy">
            <p className="eyebrow">Heritage in every bottle</p>
            <h2>Timeless whisky.<br /><em>Global prestige.</em></h2>
            <p>Welcome to a realm where time is distilled into liquid gold and legacy is held in every bottle. Our auction edit brings together rare antique whiskies, historic distilleries and private collections from across the world.</p>
            <div className="auction-stats"><span><strong>100%</strong>Curated lots</span><span><strong>Global</strong>Collector reach</span><span><strong>Rare</strong>Limited releases</span></div>
          </div>
        </div>
      </section>

      <section className="auction-catalogue section" id="current-auctions" aria-labelledby="current-auctions-title">
        <div className="shell">
          <div className="auction-section-heading"><div><p className="eyebrow">Live catalogue</p><h2 id="current-auctions-title">Current Auctions</h2></div><p>Explore rare single malts, iconic Japanese releases and investment-grade bottles selected for serious collectors.</p></div>
          <form className="auction-filters" onSubmit={(event) => { event.preventDefault(); setAppliedFilters(filters) }}>
            <label><Search size={16} /><input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search whisky, distillery or lot" aria-label="Search auction lots" /></label>
            <select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })} aria-label="Category">
               <option value="all">All categories</option>
               <option>Whisky</option>
               <option>Wine</option>
               <option>Spirits</option>
            </select>
            <select value={filters.price} onChange={(event) => setFilters({ ...filters, price: event.target.value })} aria-label="Price range">
               <option value="all">All price ranges</option>
               <option value="under-10000">Under R10,000</option>
               <option value="over-10000">R10,000 and above</option>
            </select>
            <button type="submit">Apply</button>
          </form>
          {visibleLots.length ? (
            <div className="auction-lot-grid">
              {visibleLots.map((lot) => <AuctionLotCard lot={lot} endTime={new Date(lot.endDate).getTime()} now={now} key={lot._id} />)}
            </div>
          ) : <div className="auction-empty"><h3>No lots match your selection.</h3><button type="button" onClick={() => { const reset = { search: '', category: 'all', price: 'all', ending: 'all' }; setFilters(reset); setAppliedFilters(reset) }}>Clear filters</button></div>}
        </div>
      </section>

      <section className="past-auctions section" aria-labelledby="past-auctions-title">
        <div className="shell">
           <div className="auction-section-heading"><div><p className="eyebrow">Previous results</p><h2 id="past-auctions-title">Past Auctions</h2></div></div>
           <div className="past-auction-grid">
              {pastLots.map((lot) => (
                 <article key={lot._id}>
                   <div><img src={lot.images && lot.images[0] ? lot.images[0] : '/assets/auction/hibiki-17.jpeg'} alt={lot.title} loading="lazy" /><span>Auction ended</span></div>
                   <section>
                     <h3>{lot.title}</h3>
                     <dl>
                       <div><dt>Final result</dt><dd>R{lot.currentBid.toLocaleString('en-ZA')}</dd></div>
                       <div><dt>Category</dt><dd>{lot.category}</dd></div>
                     </dl>
                   </section>
                 </article>
              ))}
           </div>
        </div>
      </section>
      
      <section className="auction-process section">
         <div className="shell">
           <div className="auction-section-heading"><div><p className="eyebrow">Simple & secure</p><h2>Your Path to Premium Bottles</h2></div></div>
           <div className="auction-step-grid">
              {steps.map(([title, text], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}
           </div>
         </div>
      </section>

    </main>
  )
}