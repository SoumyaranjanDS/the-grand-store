import { ArrowUpRight, Heart } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { useWishlist } from '../context/wishlistContext';

function ProductCard({ product, index }) {
  const navigate = useNavigate();
  const isExternal = product.href.startsWith('http');
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const revealClass = index % 2 === 0 ? 'reveal-left' : 'reveal-right';
  const delay = { transitionDelay: `${index * 150}ms` };
  const { isSaved, toggleProduct } = useWishlist();
  const saved = isSaved(product);

  const handleClick = (e) => {
    // If clicking the save button, do nothing (let the button handle it)
    if (e.target.closest('button')) return;
    
    // If it's an external link, open in new tab
    if (isExternal) {
      window.open(product.href, '_blank', 'noreferrer');
      return;
    }

    // Prevent default anchor behavior if they clicked an internal link
    if (e.target.closest('a')) {
      e.preventDefault();
    }
    
    // Scroll to top and navigate using React Router
    window.scrollTo(0, 0);
    navigate(product.href);
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
            <a href={product.href} aria-label={`View ${product.name}`} target="_blank" rel="noreferrer">
              <img src={product.image} alt={product.name} loading="lazy" />
            </a>
          ) : (
            <Link to={product.href} aria-label={`View ${product.name}`} onClick={(e) => e.preventDefault()}>
              <img src={product.image} alt={product.name} loading="lazy" />
            </Link>
          )}
        </div>
        <div className="product-card__body">
          <p>{product.brand}</p>
          <h3>
            {isExternal ? (
              <a href={product.href} target="_blank" rel="noreferrer">{product.name}</a>
            ) : (
              <Link to={product.href} onClick={(e) => e.preventDefault()}>{product.name}</Link>
            )}
          </h3>
          {isExternal ? (
            <a className="product-card__link" href={product.href} target="_blank" rel="noreferrer">
              View selection <ArrowUpRight size={15} strokeWidth={1.4} />
            </a>
          ) : (
            <Link className="product-card__link" to={product.href} onClick={(e) => e.preventDefault()}>
              View selection <ArrowUpRight size={15} strokeWidth={1.4} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
