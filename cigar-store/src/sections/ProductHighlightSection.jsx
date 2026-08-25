import { ArrowUpRight } from 'lucide-react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import './EditorialSections.css';

function ProductHighlightSection() {
  const [contentRef, contentVisible] = useIntersectionObserver({ threshold: 0.2 });
  const [imgRef, imgVisible] = useIntersectionObserver({ threshold: 0.2 });

  return (
    <section 
      className="editorial-section" 
      id="product-highlight" 
      style={{ 
        paddingTop: '2.5rem',
        paddingBottom: '2.5rem',
        backgroundColor: '#ffffff',
        borderTop: '1px solid rgba(156, 116, 63, 0.15)'
      }}
    >
      <style>{`
        #product-highlight .editorial-section__image::before {
          display: none;
        }
      `}</style>
      <div 
        className="editorial-section__grid" 
        style={{ 
          gridTemplateColumns: 'minmax(350px, 1.1fr) 1fr', 
          gap: 'clamp(30px, 4vw, 60px)' 
        }}
      >
        <figure 
          ref={imgRef}
          className={`editorial-section__image reveal-left ${imgVisible ? 'is-visible' : ''}`}
          style={{ maxWidth: '100%', margin: '0' }}
        >
          <img 
            src="https://res.cloudinary.com/oioqrgj0/image/upload/v1787664071/cigar-store/ChatGPT_Image_Aug_25_2026_05_02_00_PM.jpg" 
            alt="Product lifestyle shot" 
            loading="lazy" 
            style={{ 
              width: '100%', 
              height: 'auto', 
              aspectRatio: 'auto',
              borderRadius: '2px'
            }}
          />
        </figure>
        
        <div 
          ref={contentRef}
          className={`editorial-section__content reveal-right ${contentVisible ? 'is-visible' : ''}`}
          style={{ paddingLeft: 'clamp(10px, 3vw, 40px)' }}
        >
          <p className="editorial-section__number">03 / Connoisseur Selection</p>
          <h3>A Masterclass in<br /><em>Craftsmanship</em></h3>
          <p>
            Selected exclusively for our discerning clientele, this signature offering represents the pinnacle of artisanship. Every detail—from its origin to the final presentation—has been meticulously curated to deliver an unforgettable experience.
          </p>
          <p style={{ marginTop: '1rem', color: '#655e55', fontSize: 'clamp(18px, 1.4vw, 22px)' }}>
            Whether marking a significant milestone or celebrating the art of living well, this exceptional piece serves as the perfect companion for those who demand nothing but the absolute best.
          </p>
          <a className="outline-link" href="/exclusive-collection" style={{ marginTop: '2.5rem' }}>
            Explore More <ArrowUpRight size={16} strokeWidth={1.4} />
          </a>
        </div>
      </div>
    </section>
  );
}

export default ProductHighlightSection;
