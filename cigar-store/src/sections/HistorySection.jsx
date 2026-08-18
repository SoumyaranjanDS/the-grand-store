import { ArrowUpRight } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import './EditorialSections.css';

function HistorySection() {
  const [imgRef, imgVisible] = useIntersectionObserver({ threshold: 0.2 });
  const [contentRef, contentVisible] = useIntersectionObserver({ threshold: 0.2 });

  return (
    <section className="history-section editorial-section" id="history">
      <SectionHeading eyebrow="Our heritage" title="History" align="center" />

      <div className="editorial-section__grid">
        <figure 
          ref={imgRef} 
          className={`editorial-section__image editorial-section__image--history reveal-left ${imgVisible ? 'is-visible' : ''}`}
        >
          <span>Since the 16th century</span>
          <img src="/images/cigar-history.png" alt="Cigars resting inside a wooden humidor" loading="lazy" />
        </figure>

        <div 
          ref={contentRef}
          className={`editorial-section__content reveal-right ${contentVisible ? 'is-visible' : ''}`}
        >
          <p className="editorial-section__number">01 / The story</p>
          <h3>Cigar <em>History</em></h3>
          <p><strong>Here&apos;s a brief overview:</strong> Cigars have a rich and fascinating history that spans centuries and continents.</p>
          <p><strong>Origins:</strong> The indigenous people of the Caribbean and Central America were smoking tobacco in various forms long before the arrival of Europeans.</p>
          <p><strong>16th–18th century:</strong> Cigars as we know them began to take shape. Spanish conquistadors introduced tobacco to Europe, and the first cigars were rolled in Cuba, where the climate and soil were ideal for high-quality tobacco.</p>
          <p><strong>19th century:</strong> Their popularity grew worldwide, with manufacturing spreading to the Dominican Republic, Honduras, and Nicaragua. Cigars became a symbol of luxury and status.</p>
          <a className="outline-link" href="/cigar-history">
            Read the full history <ArrowUpRight size={16} strokeWidth={1.4} />
          </a>
        </div>
      </div>
    </section>
  );
}

export default HistorySection;
