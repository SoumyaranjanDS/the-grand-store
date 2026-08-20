import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  MapPin, Phone, Mail, Globe, Heart,
  Wine, Utensils, Bed, Star, Users, Clock,
  ArrowLeft, ShoppingCart, ChevronRight, CheckCircle,
  ExternalLink
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL;
const APP = import.meta.env.VITE_APP_URL || '';

const getToken = () => JSON.parse(localStorage.getItem('userInfo'))?.token;

/* ─── Gold gradient text ─── */
const GoldText = ({ children, className = '' }) => (
  <span className={`bg-gradient-to-r from-[#c9a84c] via-[#f0d080] to-[#b8860b] bg-clip-text text-transparent ${className}`}>
    {children}
  </span>
);

/* ─── Kicker label ─── */
const Kicker = ({ children, light = false }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className={`w-8 h-px ${light ? 'bg-amber-400/50' : 'bg-[#7b263c]/40'}`} />
    <p className={`uppercase tracking-[0.22em] text-xs font-semibold ${light ? 'text-amber-400' : 'text-[#7b263c]'}`}>
      {children}
    </p>
  </div>
);

/* ─── Ambient glow blob ─── */
const GlowBlob = ({ color = 'amber', className = '' }) => {
  const colors = {
    amber: 'bg-amber-400',
    wine:  'bg-[#7b263c]',
    gold:  'bg-yellow-500',
    white: 'bg-white',
  };
  return (
    <div className={`absolute rounded-full opacity-[0.08] blur-[120px] pointer-events-none ${colors[color]} ${className}`} />
  );
};

export default function EstateDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followStatus, setFollowStatus] = useState(null);
  const [followLoading, setFollowLoading] = useState(false);
  const heroRef = useRef(null);

  // Parallax on hero image
  useEffect(() => {
    const onScroll = () => {
      if (heroRef.current) {
        heroRef.current.style.transform = `scale(1.08) translateY(${window.scrollY * 0.15}px)`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    axios.get(`${API}/api/estates/${slug}`)
      .then(res => {
        setData(res.data);
        setFollowerCount(res.data.estate.followers?.length || 0);
        const me = JSON.parse(localStorage.getItem('userInfo'));
        if (me && res.data.estate.followers?.includes(me._id)) setFollowing(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleFollow = async () => {
    const token = getToken();
    if (!token) { setFollowStatus('login'); return; }
    setFollowLoading(true);
    try {
      const res = await axios.post(`${API}/api/estates/${data.estate._id}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFollowing(res.data.following);
      setFollowerCount(res.data.followerCount);
      setFollowStatus(res.data.following ? 'success' : null);
    } catch { }
    finally { setFollowLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center relative overflow-hidden">
      <GlowBlob color="gold" className="w-96 h-96 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="text-center z-10">
        <div className="w-12 h-12 border border-amber-400/40 border-t-amber-400 rounded-full animate-spin mx-auto mb-6" />
        <p className="uppercase tracking-[0.3em] text-xs text-amber-400/60">Loading Estate</p>
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center gap-6">
      <p className="text-6xl">🍷</p>
      <h2 className="font-serif text-3xl text-white">Estate Not Found</h2>
      <Link to="/winefarm" className="text-amber-400 hover:text-amber-300 uppercase tracking-widest text-xs transition-colors">
        ← Back to Wine Estates
      </Link>
    </div>
  );

  const { estate, products = [] } = data;
  const { story = {}, vineyard = {}, hospitality = {}, contact = {} } = estate;

  return (
    <div className="min-h-screen font-sans">

      <style>{`
        @keyframes slowZoom {
          from { transform: scale(1.08) translateY(0); }
          to   { transform: scale(1) translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.06; }
          50%       { opacity: 0.12; }
        }
        .gold-shimmer {
          background: linear-gradient(90deg, #b8860b 0%, #f0d080 25%, #c9a84c 50%, #f0d080 75%, #b8860b 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 5s linear infinite;
        }
        .glow-pulse { animation: glowPulse 4s ease-in-out infinite; }
        .fade-up { animation: fadeUp 0.9s ease both; }
        .fade-up-2 { animation: fadeUp 0.9s 0.15s ease both; }
        .fade-up-3 { animation: fadeUp 0.9s 0.3s ease both; }
        .gold-border { border: 1px solid; border-image: linear-gradient(90deg, transparent, #c9a84c, transparent) 1; }
        .section-number {
          font-family: serif;
          font-size: 5rem;
          line-height: 1;
          background: linear-gradient(180deg, rgba(201,168,76,0.3) 0%, rgba(201,168,76,0) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* ════════════════════════════════════════════
          HERO — cinematic full-screen
      ════════════════════════════════════════════ */}
      <section className="relative h-screen min-h-[640px] overflow-hidden bg-[#080808]">
        {/* Background */}
        {estate.heroImageUrl ? (
          <img ref={heroRef} src={estate.heroImageUrl} alt={estate.estateName}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ animation: 'slowZoom 18s ease-out forwards', transformOrigin: 'center center' }} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a00] via-[#0f0505] to-[#080808]" />
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/70 via-[#080808]/20 to-transparent" />

        {/* Ambient glow orbs */}
        <div className="absolute bottom-0 left-0 w-[600px] h-[300px] bg-amber-500/10 blur-[140px] rounded-full glow-pulse" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-[#7b263c]/15 blur-[120px] rounded-full glow-pulse" style={{ animationDelay: '2s' }} />

        {/* Nav */}
        <div className="absolute top-8 left-8 z-20 fade-up">
          <Link to="/winefarm"
            className="inline-flex items-center gap-2 text-white/40 hover:text-amber-400 text-xs uppercase tracking-widest transition-all duration-300">
            <ArrowLeft size={13} /> Wine Estates
          </Link>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 px-8 md:px-16 pb-16 z-10">
          <div className="max-w-5xl">
            {/* Region badge */}
            {estate.region && (
              <div className="fade-up inline-flex items-center gap-2 mb-6 px-4 py-1.5 border border-amber-400/20 bg-amber-400/5 backdrop-blur-sm">
                <MapPin size={11} className="text-amber-400" />
                <span className="text-amber-400/80 text-xs uppercase tracking-widest">
                  {estate.region}{estate.country ? `, ${estate.country}` : ''}
                </span>
              </div>
            )}

            {/* Estate name with gold shimmer */}
            <h1 className="fade-up-2 font-serif leading-[0.9] mb-4 tracking-tight" style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)' }}>
              <span className="gold-shimmer">{estate.estateName}</span>
            </h1>

            {/* Tagline */}
            {estate.tagline && (
              <p className="fade-up-3 text-white/50 text-lg md:text-xl font-light italic max-w-lg mb-8">
                {estate.tagline}
              </p>
            )}

            {/* Follow button */}
            <div className="fade-up-3 flex items-center gap-5 flex-wrap">
              <button onClick={handleFollow} disabled={followLoading}
                className={`group relative inline-flex items-center gap-2.5 px-8 py-3.5 text-sm font-medium tracking-wide overflow-hidden transition-all duration-300 ${
                  following
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-[0_0_30px_rgba(245,158,11,0.4)]'
                    : 'border border-white/20 text-white hover:border-amber-400/60 hover:shadow-[0_0_20px_rgba(201,168,76,0.15)] backdrop-blur-sm bg-white/5'
                }`}>
                {/* Shimmer on hover */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                <Heart size={15} className={following ? 'fill-current' : ''} />
                {following ? `Following · ${followerCount}` : `Follow Estate · ${followerCount}`}
              </button>

              {/* Inline status */}
              {followStatus === 'login' && (
                <span className="text-amber-300/80 text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <Link to="/login" className="underline underline-offset-2">Log in</Link> to follow
                </span>
              )}
              {followStatus === 'success' && (
                <span className="text-green-400/80 text-sm flex items-center gap-2">
                  <CheckCircle size={14} /> You're now following this estate
                </span>
              )}
            </div>

            {/* Meta strip */}
            {(story.foundedYear || story.founders) && (
              <div className="mt-10 flex items-center gap-6 text-white/25 text-xs uppercase tracking-widest">
                {story.foundedYear && <span>Est. {story.foundedYear}</span>}
                {story.foundedYear && story.founders && <span className="w-px h-3 bg-white/15" />}
                {story.founders && <span>{story.founders}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Bottom gold line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
      </section>

      {/* ════════════════════════════════════════════
          OUR STORY — deep dark with glow
      ════════════════════════════════════════════ */}
      {(story.history || story.philosophy || story.winemaker) && (
        <section className="relative bg-[#0a0804] py-32 px-8 md:px-16 overflow-hidden">
          <GlowBlob color="wine" className="w-[600px] h-[600px] -top-20 -left-40 glow-pulse" />
          <GlowBlob color="gold" className="w-[400px] h-[400px] top-1/2 right-0 glow-pulse" style={{ animationDelay: '1.5s' }} />

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
              <div className="md:col-span-4">
                <Kicker light>Our Story</Kicker>
                <h2 className="font-serif text-5xl md:text-6xl leading-none text-white mb-2">
                  The Heart<br />of the
                </h2>
                <h2 className="font-serif text-5xl md:text-6xl leading-none mb-8">
                  <GoldText>Estate</GoldText>
                </h2>

                {/* Gold divider */}
                <div className="w-12 h-px bg-gradient-to-r from-amber-400/60 to-transparent mb-8" />

                {(story.foundedYear || story.founders) && (
                  <div className="space-y-5">
                    {story.foundedYear && (
                      <div>
                        <p className="text-[10px] text-amber-400/50 uppercase tracking-widest mb-1">Founded</p>
                        <p className="font-serif text-3xl text-white/80">{story.foundedYear}</p>
                      </div>
                    )}
                    {story.founders && (
                      <div>
                        <p className="text-[10px] text-amber-400/50 uppercase tracking-widest mb-1">Founders</p>
                        <p className="text-white/70 font-medium">{story.founders}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="md:col-span-8 space-y-8">
                {story.history && (
                  <p className="text-white/60 text-lg leading-[1.9] first-letter:font-serif first-letter:text-6xl first-letter:text-amber-400 first-letter:float-left first-letter:mr-3 first-letter:leading-none first-letter:mt-1">
                    {story.history}
                  </p>
                )}
                {story.philosophy && (
                  <div className="relative pl-6 py-3">
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-amber-400/60 via-amber-400/30 to-transparent" />
                    <p className="text-white/40 text-lg italic leading-relaxed">{story.philosophy}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Winemaker */}
            {story.winemaker && (
              <div className="mt-20 pt-12 border-t border-white/[0.06] grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                <div className="md:col-span-3">
                  <p className="text-[10px] text-amber-400/50 uppercase tracking-widest mb-2">Winemaker</p>
                  <p className="font-serif text-2xl text-white/80">{story.winemaker}</p>
                </div>
                {story.winemakerBio && (
                  <div className="md:col-span-9">
                    <p className="text-white/40 leading-relaxed">{story.winemakerBio}</p>
                  </div>
                )}
              </div>
            )}

            {/* Awards */}
            {estate.awards?.length > 0 && (
              <div className="mt-12 pt-8 border-t border-white/[0.06]">
                <p className="text-[10px] text-amber-400/50 uppercase tracking-widest mb-4">Awards & Accolades</p>
                <div className="flex flex-wrap gap-3">
                  {estate.awards.map((a, i) => (
                    <span key={i} className="text-amber-400/80 text-xs border border-amber-400/20 px-4 py-2 hover:border-amber-400/50 transition-colors">
                      ⭐ {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════
          VINEYARD — cream with subtle texture
      ════════════════════════════════════════════ */}
      {(vineyard.altitude || vineyard.soil || vineyard.climate || vineyard.grapeVarieties?.length > 0) && (
        <section className="relative bg-[#f5f0e8] py-32 px-8 md:px-16 overflow-hidden">
          {/* Decorative large number */}
          <div className="absolute right-8 top-12 text-[20vw] font-serif text-stone-900/[0.03] leading-none select-none pointer-events-none">
            02
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
              <div className="md:col-span-4">
                <Kicker>The Vineyard</Kicker>
                <h2 className="font-serif text-5xl md:text-6xl leading-none text-stone-900 mb-2">
                  Terroir &amp;<br />
                </h2>
                <h2 className="font-serif text-5xl md:text-6xl leading-none mb-8">
                  <span className="bg-gradient-to-r from-[#7b263c] via-[#a83254] to-[#7b263c] bg-clip-text text-transparent">
                    Craft
                  </span>
                </h2>
                <div className="w-12 h-px bg-[#7b263c]/40 mb-6" />
                {vineyard.viticulture && (
                  <p className="text-stone-400 text-xs uppercase tracking-widest">{vineyard.viticulture}</p>
                )}
              </div>

              <div className="md:col-span-8">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-0 mb-12">
                  {[
                    { label: 'Altitude', value: vineyard.altitude },
                    { label: 'Soil', value: vineyard.soil },
                    { label: 'Climate', value: vineyard.climate },
                  ].filter(d => d.value).map((d, i) => (
                    <div key={d.label} className={`p-8 ${i > 0 ? 'border-l border-stone-200' : ''}`}>
                      <p className="text-[10px] text-[#7b263c]/60 uppercase tracking-widest mb-3">{d.label}</p>
                      <p className="text-stone-800 text-lg font-light">{d.value}</p>
                    </div>
                  ))}
                </div>

                {vineyard.grapeVarieties?.length > 0 && (
                  <div className="mb-10">
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-4">Grape Varieties</p>
                    <div className="flex flex-wrap gap-2">
                      {vineyard.grapeVarieties.map((g, i) => (
                        <span key={i} className="text-stone-600 text-sm border border-stone-300 px-4 py-1.5 hover:border-[#7b263c]/40 hover:text-[#7b263c] transition-colors">
                          🍇 {g}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {vineyard.sustainability && (
                  <div className="bg-white/60 backdrop-blur-sm border border-stone-200 p-6">
                    <p className="text-[10px] text-green-600/70 uppercase tracking-widest mb-2">Sustainability</p>
                    <p className="text-stone-600 leading-relaxed">{vineyard.sustainability}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════
          WINE TASTINGS — deep dark gold theme
      ════════════════════════════════════════════ */}
      {hospitality.hasTastings && hospitality.tastings?.length > 0 && (
        <section className="relative bg-[#08060a] py-32 px-8 md:px-16 overflow-hidden">
          <GlowBlob color="gold" className="w-[700px] h-[400px] top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 glow-pulse" />

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="mb-20 text-center">
              <Kicker light>Experiences</Kicker>
              <h2 className="font-serif leading-none" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
                <span className="gold-shimmer">Wine Tastings</span>
              </h2>
              <p className="text-white/30 max-w-lg mx-auto mt-4 text-sm leading-relaxed">
                Curated experiences designed to guide you through the character of each vintage.
              </p>
            </div>

            {/* Gold top border */}
            <div className="h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent mb-0" />

            <div className="divide-y divide-white/[0.05]">
              {hospitality.tastings.map((t, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-6 py-10 items-start group hover:bg-white/[0.02] transition-colors px-2 -mx-2">
                  <div className="md:col-span-1 section-number">{String(i + 1).padStart(2, '0')}</div>
                  <div className="md:col-span-5">
                    <h3 className="font-serif text-2xl text-white/90 mb-2 group-hover:text-amber-300 transition-colors">{t.name}</h3>
                    {t.description && <p className="text-white/40 text-sm leading-relaxed">{t.description}</p>}
                  </div>
                  <div className="md:col-span-3 space-y-2 pt-1">
                    {t.duration && <div className="flex items-center gap-2 text-white/30 text-sm"><Clock size={12} /> {t.duration}</div>}
                    {t.capacity && <div className="flex items-center gap-2 text-white/30 text-sm"><Users size={12} /> Up to {t.capacity} guests</div>}
                  </div>
                  <div className="md:col-span-3 text-right">
                    {t.price && (
                      <p className="font-serif text-3xl">
                        <GoldText>R{Number(t.price).toLocaleString()}</GoldText>
                        <span className="text-white/25 text-sm font-sans ml-1">/ person</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent mt-0" />

            {contact.phone && (
              <p className="text-white/25 text-sm text-center mt-8">
                Reservations: <a href={`tel:${contact.phone}`} className="text-amber-400/60 hover:text-amber-400 transition-colors">{contact.phone}</a>
              </p>
            )}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════
          RESTAURANT — cream editorial
      ════════════════════════════════════════════ */}
      {hospitality.hasRestaurant && (
        <section className="relative bg-[#faf8f4] py-32 px-8 md:px-16 overflow-hidden">
          <div className="absolute right-8 top-12 text-[18vw] font-serif text-stone-900/[0.03] leading-none select-none pointer-events-none">03</div>
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
              <div>
                <Kicker>Dining</Kicker>
                <h2 className="font-serif text-5xl md:text-6xl leading-tight text-stone-900 mb-2">
                  {hospitality.restaurant?.name || 'Our Restaurant'}
                </h2>
                <div className="w-12 h-px bg-[#7b263c]/40 mb-8" />
                {hospitality.restaurant?.description && (
                  <p className="text-stone-500 text-lg leading-relaxed mb-10">{hospitality.restaurant.description}</p>
                )}
                <div className="space-y-5">
                  {hospitality.restaurant?.openingHours && (
                    <div className="flex items-start gap-5 border-b border-stone-100 pb-5">
                      <span className="text-[10px] text-stone-300 uppercase tracking-widest w-20 pt-0.5 flex-shrink-0">Hours</span>
                      <span className="text-stone-700">{hospitality.restaurant.openingHours}</span>
                    </div>
                  )}
                  {hospitality.restaurant?.phoneNumber && (
                    <div className="flex items-start gap-5">
                      <span className="text-[10px] text-stone-300 uppercase tracking-widest w-20 pt-0.5 flex-shrink-0">Reserve</span>
                      <a href={`tel:${hospitality.restaurant.phoneNumber}`}
                        className="text-[#7b263c] font-medium hover:opacity-70 transition-opacity">
                        {hospitality.restaurant.phoneNumber}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              <div className="relative">
                <div className="bg-stone-200 h-96 flex items-center justify-center">
                  <Utensils size={56} className="text-stone-300" />
                </div>
                {/* Gold frame accent */}
                <div className="absolute -bottom-3 -right-3 w-full h-full border border-amber-400/20 pointer-events-none" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════
          ACCOMMODATION — dark immersive
      ════════════════════════════════════════════ */}
      {hospitality.hasAccommodation && (
        <section className="relative bg-[#06080a] py-32 px-8 md:px-16 overflow-hidden">
          <GlowBlob color="amber" className="w-[500px] h-[500px] bottom-0 left-1/4 glow-pulse" />
          <GlowBlob color="wine" className="w-[400px] h-[400px] top-0 right-0 glow-pulse" style={{ animationDelay: '2s' }} />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
              <div className="md:col-span-5">
                <Kicker light>Stay</Kicker>
                <h2 className="font-serif leading-none text-white mb-3" style={{ fontSize: 'clamp(2.8rem, 5vw, 5rem)' }}>
                  Sleep Among<br />The <GoldText>Vines</GoldText>
                </h2>
                <div className="w-12 h-px bg-gradient-to-r from-amber-400/60 to-transparent my-8" />
                {hospitality.accommodation?.priceFrom && (
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">From</p>
                    <p className="font-serif text-6xl">
                      <GoldText>R{Number(hospitality.accommodation.priceFrom).toLocaleString()}</GoldText>
                      <span className="text-white/25 text-xl font-sans font-normal ml-2">/ night</span>
                    </p>
                  </div>
                )}
              </div>
              <div className="md:col-span-7 space-y-8 pt-2">
                {hospitality.accommodation?.description && (
                  <p className="text-white/50 text-lg leading-relaxed">{hospitality.accommodation.description}</p>
                )}
                {hospitality.accommodation?.roomTypes?.length > 0 && (
                  <div>
                    <p className="text-[10px] text-white/25 uppercase tracking-widest mb-4">Room Types</p>
                    <div className="space-y-3">
                      {hospitality.accommodation.roomTypes.map((r, i) => (
                        <div key={i} className="flex items-center gap-3 text-white/50">
                          <div className="w-4 h-px bg-amber-400/40" /> {r}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {hospitality.accommodation?.bookingEmail && (
                  <div className="pt-6 border-t border-white/[0.06]">
                    <p className="text-white/25 text-xs uppercase tracking-widest mb-2">Book your stay</p>
                    <a href={`mailto:${hospitality.accommodation.bookingEmail}`}
                      className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
                      {hospitality.accommodation.bookingEmail}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════
          OTHER EXPERIENCES — white
      ════════════════════════════════════════════ */}
      {hospitality.experiences?.length > 0 && (
        <section className="relative bg-white py-32 px-8 md:px-16 overflow-hidden">
          <div className="absolute right-8 top-12 text-[18vw] font-serif text-stone-900/[0.025] leading-none select-none pointer-events-none">04</div>
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="mb-16">
              <Kicker>Beyond Wine</Kicker>
              <h2 className="font-serif text-5xl md:text-6xl text-stone-900">Estate <span className="bg-gradient-to-r from-[#7b263c] to-[#a83254] bg-clip-text text-transparent">Experiences</span></h2>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent mb-0" />
            <div className="divide-y divide-stone-100">
              {hospitality.experiences.map((e, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-6 py-10 items-start group hover:bg-stone-50 transition-colors px-2 -mx-2">
                  <div className="md:col-span-1 font-serif text-5xl text-stone-900/10">{String(i + 1).padStart(2, '0')}</div>
                  <div className="md:col-span-6">
                    <h3 className="font-serif text-2xl text-stone-900 mb-2 group-hover:text-[#7b263c] transition-colors">{e.name}</h3>
                    {e.description && <p className="text-stone-400 leading-relaxed text-sm">{e.description}</p>}
                  </div>
                  <div className="md:col-span-3 space-y-2">
                    {e.duration && <div className="flex items-center gap-2 text-stone-400 text-sm"><Clock size={12} /> {e.duration}</div>}
                    {e.capacity && <div className="flex items-center gap-2 text-stone-400 text-sm"><Users size={12} /> Max {e.capacity}</div>}
                  </div>
                  <div className="md:col-span-2 text-right">
                    {e.price && <p className="font-serif text-2xl text-[#7b263c]">R{Number(e.price).toLocaleString()}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════
          SHOP WINES — dark with gold accents
      ════════════════════════════════════════════ */}
      {products.length > 0 && (
        <section className="relative bg-[#0c0a08] py-32 px-8 md:px-16 overflow-hidden">
          <GlowBlob color="gold" className="w-[600px] h-[300px] top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" />

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex items-end justify-between mb-16">
              <div>
                <Kicker light>From the Cellar</Kicker>
                <h2 className="font-serif leading-none" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
                  <span className="gold-shimmer">Shop Our Wines</span>
                </h2>
              </div>
              <p className="text-white/25 text-sm">{products.length} wines</p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent mb-12" />

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products.map(p => (
                <Link key={p._id} to={`/product/${p._id}`} className="group">
                  <div className="relative bg-[#1a1510] aspect-[3/4] mb-4 overflow-hidden">
                    {p.images?.[0]
                      ? <img src={`${API}${p.images[0]}`} alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                      : <div className="w-full h-full flex items-center justify-center"><Wine size={40} className="text-white/10" /></div>
                    }
                    {/* Gold corner accents */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-amber-400/30 group-hover:border-amber-400/70 transition-colors" />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-amber-400/30 group-hover:border-amber-400/70 transition-colors" />
                  </div>
                  <p className="text-white/70 font-medium text-sm mb-1 group-hover:text-amber-400 transition-colors">{p.name}</p>
                  <p className="text-white/30 text-sm">R{Number(p.price).toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-xs text-white/20 mt-2 group-hover:text-amber-400/70 transition-colors">
                    <ShoppingCart size={10} /> View & Add <ChevronRight size={10} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════
          VISIT US — almost-black with gold glow
      ════════════════════════════════════════════ */}
      <section className="relative bg-[#06070a] py-32 px-8 md:px-16 overflow-hidden">
        <GlowBlob color="amber" className="w-[800px] h-[400px] bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2" />
        <GlowBlob color="wine" className="w-[500px] h-[500px] top-0 -left-40 glow-pulse" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
            <div className="md:col-span-5">
              <Kicker light>Plan Your Visit</Kicker>
              <h2 className="font-serif leading-none mb-4" style={{ fontSize: 'clamp(2.8rem, 5vw, 5rem)' }}>
                <span className="text-white">Come</span><br />
                <span className="gold-shimmer">Find Us</span>
              </h2>
              <div className="w-12 h-px bg-gradient-to-r from-amber-400/50 to-transparent my-8" />
              {estate.tagline && <p className="text-white/30 italic">{estate.tagline}</p>}
            </div>

            <div className="md:col-span-7">
              <div className="space-y-0 divide-y divide-white/[0.05]">
                {[
                  { icon: MapPin, label: 'Address', content: contact.address, href: null },
                  { icon: Phone, label: 'Phone', content: contact.phone, href: contact.phone ? `tel:${contact.phone}` : null },
                  { icon: Mail, label: 'Email', content: contact.email, href: contact.email ? `mailto:${contact.email}` : null },
                  { icon: Globe, label: 'Website', content: contact.website, href: contact.website, external: true },
                  { icon: Star, label: 'Instagram', content: contact.instagram, href: contact.instagram ? `https://instagram.com/${contact.instagram.replace('@','')}` : null, external: true },
                ].filter(r => r.content).map(({ icon: Icon, label, content, href, external }) => (
                  <div key={label} className="flex gap-5 items-start py-6 group">
                    <div className="w-8 h-8 flex items-center justify-center border border-white/[0.06] group-hover:border-amber-400/30 transition-colors flex-shrink-0 mt-0.5">
                      <Icon size={14} className="text-amber-400/50 group-hover:text-amber-400 transition-colors" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/20 uppercase tracking-widest mb-1">{label}</p>
                      {href
                        ? <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}
                            className="text-white/50 hover:text-amber-400 transition-colors flex items-center gap-1.5">
                            {content} {external && <ExternalLink size={10} />}
                          </a>
                        : <p className="text-white/50">{content}</p>
                      }
                    </div>
                  </div>
                ))}
              </div>

              {contact.mapLink && (
                <div className="mt-8 pt-6 border-t border-white/[0.05]">
                  <a href={contact.mapLink} target="_blank" rel="noreferrer"
                    className="group relative inline-flex items-center gap-3 px-8 py-3.5 border border-amber-400/30 text-amber-400 text-sm tracking-wide overflow-hidden hover:shadow-[0_0_30px_rgba(201,168,76,0.2)] transition-shadow">
                    <span className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/10 to-amber-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <MapPin size={14} /> Get Directions
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Estate footer line */}
          <div className="mt-24 pt-8 border-t border-white/[0.04] flex items-center justify-between">
            <div>
              <p className="font-serif text-white/20 text-lg">{estate.estateName}</p>
              {estate.region && <p className="text-white/10 text-xs uppercase tracking-widest mt-1">{estate.region}</p>}
            </div>
            <Link to="/winefarm" className="text-white/15 hover:text-amber-400/50 text-xs uppercase tracking-widest transition-colors">
              ← All Estates
            </Link>
          </div>
        </div>

        {/* Bottom gold gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
      </section>
    </div>
  );
}
