import { useEffect } from 'react';
import { ArrowRight, Heart, Trash2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SiteFooter from '../sections/SiteFooter';
import { useWishlist } from '../context/wishlistContext';
import './SavedCigarsPage.css';

function SavedCigarsPage() {
  const { savedProducts, savedCount, clearSaved } = useWishlist();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Wishlist | Cigar Connoisseur Club';
  }, []);

  const handleClear = () => {
    if (window.confirm('Remove every cigar from your saved collection?')) clearSaved();
  };

  return (
    <div className="saved-page site-shell" id="top">
      <main className="saved-page__main">
        <header className="saved-page__hero">
          <div>
            <p>Your private selection</p>
            <h1>Your<br /><em>wishlist.</em></h1>
          </div>
          <div className="saved-page__count"><span>{String(savedCount).padStart(2, '0')}</span><p>{savedCount === 1 ? 'selection' : 'selections'} in your collection</p></div>
        </header>

        {savedCount > 0 ? (
          <section className="saved-page__collection" aria-labelledby="saved-collection-title">
            <div className="saved-page__toolbar">
              <div><p>Curated by you</p><h2 id="saved-collection-title">The shortlist</h2></div>
              <button type="button" onClick={handleClear}><Trash2 size={16} /> Clear saved cigars</button>
            </div>
            <div className="saved-page__grid">
              {savedProducts.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
            </div>
          </section>
        ) : (
          <section className="saved-page__empty">
            <div className="saved-page__empty-mark"><Heart size={34} strokeWidth={1.15} /></div>
            <p>Your private humidor is waiting.</p>
            <h2>Save the cigars that<br /><em>catch your eye.</em></h2>
            <span>Use the heart on any product card or detail page. Your wishlist will remain here when you return.</span>
            <a href="/#new-arrivals">Explore the collection <ArrowRight size={17} /></a>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

export default SavedCigarsPage;
