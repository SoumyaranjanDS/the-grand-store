import { ArrowUpRight, Heart } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { useWishlist } from '../context/wishlistContext';

function ProductCard({ product, index }) {
  const navigate = useNavigate();
  const productHref = product.href || `/product-details/${product.slug}`;
  const isExternal = productHref.startsWith('http');
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const revealClass = index % 2 === 0 ? 'reveal-left' : 'reveal-right';
  const delay = { transitionDelay: `${index * 150}ms` };
  const { isSaved, toggleProduct } = useWishlist();
  const saved = isSaved(product);

  const handleClick = (e) => {
    // Buttons and links already handle their own action.
    if (e.target.closest('button, a')) return;
    
    if (isExternal) {
      window.open(productHref, '_blank', 'noopener,noreferrer');
      return;
    }
    
    window.scrollTo(0, 0);
    navigate(productHref);
  };

  return (
    <article 
      ref={ref} 
      className={`product-card ${revealClass} ${isVisible ? 'is-visible' : ''}`}
      style={delay}
    >
      <div className="product-card__surface" onClick={handleClick} style={{ cursor: 'pointer' }}>
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
          {isExternal ? (
            <a href={productHref} aria-label={`View ${product.name}`} target="_blank" rel="noreferrer">
              <img src={product.image} alt={product.name} loading="lazy" />
            </a>
          ) : (
            <Link to={productHref} aria-label={`View ${product.name}`} onClick={() => window.scrollTo(0, 0)}>
              <img src={product.image} alt={product.name} loading="lazy" />
            </Link>
          )}
        </div>
        <div className="product-card__body">
          <p>{product.brand}</p>
          <h3>
            {isExternal ? (
              <a href={productHref} target="_blank" rel="noreferrer">{product.name}</a>
            ) : (
              <Link to={productHref} onClick={() => window.scrollTo(0, 0)}>{product.name}</Link>
            )}
          </h3>
          {isExternal ? (
            <a className="product-card__link" href={productHref} target="_blank" rel="noreferrer">
              View selection <ArrowUpRight size={15} strokeWidth={1.4} />
            </a>
          ) : (
            <Link className="product-card__link" to={productHref} onClick={() => window.scrollTo(0, 0)}>
              View selection <ArrowUpRight size={15} strokeWidth={1.4} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
