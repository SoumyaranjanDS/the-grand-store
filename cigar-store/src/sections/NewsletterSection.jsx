import { ArrowRight } from 'lucide-react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import './NewsletterSection.css';

function NewsletterSection() {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.2 });

  return (
    <section className="newsletter-section" id="newsletter">
      <div 
        ref={ref}
        className={`newsletter-section__inner reveal-left ${isVisible ? 'is-visible' : ''}`}
      >
        <p className="newsletter-section__eyebrow">
          Be the first to know about our new arrivals and exclusive offers.
        </p>
        <h2 className="newsletter-section__title">
          Sign Up <em>Newsletter</em>
        </h2>
        
        <form className="newsletter-section__form" onSubmit={(e) => e.preventDefault()}>
          <div className="newsletter-section__input-group">
            <input 
              type="email" 
              placeholder="Enter your email here.." 
              required 
              className="newsletter-section__input"
            />
            <button type="submit" className="newsletter-section__button">
              Sign Up <ArrowRight size={18} strokeWidth={2} />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default NewsletterSection;
