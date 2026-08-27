import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SectionHeading from '../components/SectionHeading';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import './ProductShowcase.css';

function ProductShowcase({ id, eyebrow, title, intro, products, tone = 'dark', linkUrl = '/shop/mosi-oa-tunya' }) {
  const isDark = tone === 'dark';
  const [linkRef, linkVisible] = useIntersectionObserver({ threshold: 0.5 });

  const handleClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <section className={`product-showcase product-showcase--${tone}`} id={id}>
      <div className="product-showcase__inner">
        <SectionHeading eyebrow={eyebrow} title={title} intro={intro} align="center" light={isDark} />
        <div className="product-showcase__grid">
          {products.map((product, index) => <ProductCard key={product.name} product={product} index={index} />)}
        </div>
        <Link 
          ref={linkRef}
          className={`product-showcase__all reveal-right ${linkVisible ? 'is-visible' : ''}`} 
          to={linkUrl}
          onClick={handleClick}
        >
          View the complete collection
        </Link>
      </div>
    </section>
  );
}

export default ProductShowcase;
