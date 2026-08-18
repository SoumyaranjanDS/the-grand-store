import { ArrowUpRight, Heart } from 'lucide-react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { useWishlist } from '../context/wishlistContext';

function ProductCard({ product, index }) {
  const isExternal = product.href.startsWith('http');
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const revealClass = index % 2 === 0 ? 'reveal-left' : 'reveal-right';
  const delay = { transitionDelay: `${index * 150}ms` };
  const { isSaved, toggleProduct } = useWishlist();
  const saved = isSaved(product);

  return (
    <article 
      ref={ref} 
      className={`product-card ${revealClass} ${isVisible ? 'is-visible' : ''}`}
      style={delay}
    >
      <div className="product-card__surface">
        <div className="product-card__media">
          <span className="product-card__index">0{index + 1}</span>
          <button
            className={`product-card__save ${saved ? 'is-saved' : ''}`}
            type="button"
            aria-label={saved ? `Remove ${product.name} from saved cigars` : `Save ${product.name}`}
            aria-pressed={saved}
            onClick={() => toggleProduct(product)}
          >
            <Heart size={19} strokeWidth={1.4} fill={saved ? 'currentColor' : 'none'} />
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>
          <a href={product.href} aria-label={`View ${product.name}`} {...(isExternal ? { target: '_blank', rel: 'noreferrer' } : {})}>
            <img src={product.image} alt={product.name} loading="lazy" />
          </a>
        </div>
        <div className="product-card__body">
          <p>{product.brand}</p>
          <h3><a href={product.href} {...(isExternal ? { target: '_blank', rel: 'noreferrer' } : {})}>{product.name}</a></h3>
          <a className="product-card__link" href={product.href} {...(isExternal ? { target: '_blank', rel: 'noreferrer' } : {})}>View selection <ArrowUpRight size={15} strokeWidth={1.4} /></a>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
