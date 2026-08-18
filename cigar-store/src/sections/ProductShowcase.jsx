import ProductCard from '../components/ProductCard';
import SectionHeading from '../components/SectionHeading';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import './ProductShowcase.css';

function ProductShowcase({ id, eyebrow, title, intro, products, tone = 'dark' }) {
  const isDark = tone === 'dark';
  const [linkRef, linkVisible] = useIntersectionObserver({ threshold: 0.5 });

  return (
    <section className={`product-showcase product-showcase--${tone}`} id={id}>
      <div className="product-showcase__inner">
        <SectionHeading eyebrow={eyebrow} title={title} intro={intro} align="center" light={isDark} />
        <div className="product-showcase__grid">
          {products.map((product, index) => <ProductCard key={product.name} product={product} index={index} />)}
        </div>
        <a 
          ref={linkRef}
          className={`product-showcase__all reveal-right ${linkVisible ? 'is-visible' : ''}`} 
          href="https://cigarconnoisseurclub.com/shop.php" 
          target="_blank" 
          rel="noreferrer"
        >
          View the complete collection
        </a>
      </div>
    </section>
  );
}

export default ProductShowcase;
