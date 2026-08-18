import { ArrowUpRight, Heart } from 'lucide-react';
import { useWishlist } from '../context/wishlistContext';

function ShopProductCard({ product, index }) {
  const { isSaved, toggleProduct } = useWishlist();
  const saved = isSaved(product);

  return (
    <article className="shop-product-card">
      <div className="shop-product-card__media">
        <span className="shop-product-card__number">{String(index + 1).padStart(2, '0')}</span>
        <button type="button" className={saved ? 'is-saved' : ''} aria-pressed={saved} onClick={() => toggleProduct(product)} aria-label={saved ? `Remove ${product.name} from saved cigars` : `Save ${product.name}`}>
          <Heart size={19} strokeWidth={1.35} fill={saved ? 'currentColor' : 'none'} />
        </button>
        <a href={`/product-details/${product.slug}`} aria-label={`View ${product.name}`}><img src={product.image} alt={product.name} loading="lazy" /></a>
      </div>
      <div className="shop-product-card__body">
        <p>{product.brand}</p>
        <h3><a href={`/product-details/${product.slug}`}>{product.name}</a></h3>
        <div className="shop-product-card__notes"><span>{product.wrapper}</span><span>{product.flavor}</span></div>
        <a className="shop-product-card__view" href={`/product-details/${product.slug}`}>View details <ArrowUpRight size={15} strokeWidth={1.4} /></a>
      </div>
    </article>
  );
}

export default ShopProductCard;
