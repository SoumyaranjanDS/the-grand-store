import { useEffect } from 'react'
import { ArrowRight, GitCompareArrows, Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWishlist } from './wishlistContext'

function WishlistPage({ onAdd, onCompare, compareItems }) {
  const { wishlistItems, wishlistCount, removeFromWishlist, clearWishlist } = useWishlist()

  useEffect(() => {
    document.title = 'My Wishlist — The Grand Store'
    window.scrollTo({ top: 0, behavior: 'auto' })
    return () => { document.title = 'The Grand Store — Luxury Wines & Spirits' }
  }, [])

  const clearAll = () => {
    if (window.confirm('Remove every bottle from your wishlist?')) clearWishlist()
  }

  return (
    <main className="min-h-[70vh] text-[#eee8dd] bg-[#0c0b09] bg-[radial-gradient(circle_at_80%_8%,rgba(167,103,28,0.14),transparent_29rem)]">
      <section className="pt-[24px] pb-[20px] border-b border-[#e1bd70]/20 bg-[linear-gradient(110deg,rgba(41,29,13,0.72),rgba(10,9,7,0.92))] px-6 sm:px-0">
        <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 sm:gap-8">
          <div>
            <p className="uppercase tracking-[0.18em] text-[10px] font-semibold text-[#c9b79c] mb-1.5">Your private shortlist</p>
            <h1 className="mt-[4px] text-[#f4eee3] text-[clamp(32px,4vw,48px)] font-normal leading-[0.95] tracking-[-0.02em]">Bottles worth<br /><em className="text-[#e1bd70] font-normal italic">remembering.</em></h1>
          </div>
          <div className="min-w-0 sm:min-w-[120px] py-[4px] pl-0 sm:pl-5 border-l-0 sm:border-l border-[#e1bd70]/40 grid mt-3 sm:mt-0">
            <strong className="text-[#e1bd70] font-serif text-[40px] font-normal leading-[0.9]">{String(wishlistCount).padStart(2, '0')}</strong>
            <span className="mt-[4px] text-[#a69d91] text-[9px] tracking-[0.17em] uppercase">{wishlistCount === 1 ? 'bottle' : 'bottles'} saved</span>
          </div>
        </div>
      </section>

      <section className="pt-12 px-6 sm:px-0 max-w-[1240px] mx-auto pb-24">
        <div>
          {wishlistCount ? (
            <>
              <div className="mb-[22px] pb-[18px] flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5 border-b border-[#e1bd70]/20">
                <div>
                  <p className="uppercase tracking-[0.18em] text-[11px] font-semibold text-[#c9b79c]">Curated by you</p>
                  <h2 className="mt-1.5 text-[#f3ede2] text-[clamp(34px,4vw,52px)] font-normal">Your wishlist</h2>
                </div>
                <button type="button" onClick={clearAll} className="px-[13px] py-[11px] inline-flex items-center gap-2 border border-[#e1bd70]/30 text-[#c4bbaf] bg-transparent text-[11px] tracking-[0.11em] uppercase cursor-pointer hover:text-[#0c0a07] hover:bg-[#e1bd70] hover:border-[#e1bd70] transition-colors"><Trash2 size={16} /> Clear wishlist</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlistItems.map((product) => {
                  const compared = compareItems.some((item) => item.id === product.id)
                  return (
                    <article className="overflow-hidden border border-[#e1bd70]/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.012))] hover:border-[#e1bd70]/50 hover:-translate-y-1 transition-all duration-300 group" key={product.id}>
                      <div className="relative h-[275px] sm:h-[300px] grid place-items-center bg-[#11100e] bg-[radial-gradient(circle_at_50%_65%,rgba(201,163,91,0.15),transparent_34%)]">
                        <button type="button" onClick={() => removeFromWishlist(product)} aria-label={`Remove ${product.name} from wishlist`} className="absolute z-10 top-3.5 right-3.5 w-10 h-10 grid place-items-center border border-[#e1bd70]/50 rounded-full text-[#e1bd70] bg-[#080705]/80 hover:bg-[#e1bd70] hover:text-[#0b0906] transition-colors"><Heart size={19} fill="currentColor" /></button>
                        <Link to={`/product/${product.slug || product.id || product._id}`} className="w-full h-full grid place-items-center"><img src={product.image} alt={product.fullName || product.name} className="w-[74%] h-[84%] object-contain drop-shadow-[0_24px_18px_rgba(0,0,0,0.62)] group-hover:-translate-y-1.5 group-hover:scale-105 transition-transform duration-350" /></Link>
                      </div>
                      <div className="p-5">
                        <p className="m-0 mb-2 text-[#e1bd70] text-[10px] tracking-[0.14em] uppercase">{product.brand} · {product.origin}</p>
                        <h2 className="min-h-[55px] m-0 text-[#f1eadf] text-[22px] font-medium leading-[1.22] hover:text-[#e1bd70] transition-colors"><Link to={`/product/${product.slug || product.id || product._id}`}>{product.fullName || product.name}</Link></h2>
                        <strong className="mt-[13px] block text-[#e1bd70] font-serif text-[23px] font-normal">{product.price}</strong>
                        <div className="mt-[17px] flex gap-2">
                          <button type="button" onClick={() => onAdd(product)} className="min-h-[42px] px-[15px] inline-flex items-center justify-center gap-2 border border-[#e1bd70] text-[#0b0907] bg-[#e1bd70] text-[10px] font-bold tracking-[0.1em] uppercase cursor-pointer transition-colors hover:bg-white hover:border-white">Add to bag <ShoppingBag size={16} /></button>
                          <button className={`w-[42px] p-0 min-h-[42px] inline-flex items-center justify-center border cursor-pointer transition-colors ${compared ? 'text-[#0b0907] bg-[#e1bd70] border-[#e1bd70]' : 'text-[#d9d0c4] bg-transparent border-[#e1bd70]/30 hover:text-[#0b0907] hover:bg-[#e1bd70] hover:border-[#e1bd70]'}`} type="button" onClick={() => onCompare(product)} aria-label={compared ? `View ${product.name} in comparison` : `Compare ${product.name}`}><GitCompareArrows size={17} /></button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="max-w-[780px] mx-auto p-14 sm:p-[72px_40px] border border-[#e1bd70]/20 text-center bg-[#11100d] bg-[radial-gradient(circle_at_50%_0,rgba(182,120,40,0.13),transparent_20rem)]">
              <span className="w-[70px] h-[70px] mx-auto mb-6 grid place-items-center text-[#e1bd70] border border-[#e1bd70]/50 rounded-full"><Heart size={32} /></span>
              <p className="uppercase tracking-[0.18em] text-[11px] font-semibold text-[#c9b79c]">Your wishlist is empty</p>
              <h2 className="my-2.5 text-[#f3ede2] text-[clamp(34px,4vw,52px)] font-normal">Begin your private selection.</h2>
              <p className="max-w-[520px] mx-auto mb-7 text-[#afa699] text-base leading-[1.7]">Use the heart beside any bottle and it will be waiting here whenever you return.</p>
              <Link className="inline-flex items-center gap-[9px] px-6 py-3 border border-[#e1bd70] text-black bg-[#e1bd70] text-xs font-bold tracking-widest uppercase hover:bg-white transition-colors" to="/shop">Explore the cellar <ArrowRight size={17} /></Link>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default WishlistPage
