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
          <div className="saved-page__hero-content">
            <p>Your private selection</p>
            <h1>Your <em>wishlist</em></h1>
          </div>
        </header>

        {savedCount > 0 ? (
          <section className="saved-page__collection" aria-labelledby="saved-collection-title">
            <div className="saved-page__toolbar">
              <h2 id="saved-collection-title">The shortlist</h2>
              <button type="button" onClick={handleClear} className="saved-page__clear-btn">
                <Trash2 size={14} /> Clear list
              </button>
            </div>
            <div className="saved-page__grid">
              {savedProducts.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
            </div>
          </section>
        ) : (
          <section className="saved-page__empty">
            <div className="saved-page__empty-inner">
              <div className="saved-page__empty-mark"><Heart size={32} strokeWidth={1} /></div>
              <h2>Save the cigars that <em>catch your eye.</em></h2>
              <p>Use the heart on any product card or detail page. Your wishlist will remain here when you return.</p>
              <a href="/#new-arrivals" className="saved-page__explore-btn">Explore the collection</a>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

export default SavedCigarsPage;
