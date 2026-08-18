import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import './VendorHeroSection.css';

function VendorHeroSection() {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section 
      className="vendor-hero"
      style={{ backgroundImage: `url('https://grandstore.co.za/public/front/assets/img/WhatsApp%20Image%202026-02-09%20at%201.07.39%20PM.jpeg')` }}
    >
      <div className="vendor-hero__overlay"></div>
      <div className="vendor-hero__content">
        <div 
          ref={ref} 
          className={`vendor-hero__inner ${isVisible ? 'reveal-left' : 'hidden-left'}`}
        >
          <h1 className="vendor-hero__title">
            <span className="text-gold">WELCOME</span> TO OUR VENDOR PORTAL
          </h1>
          <div className="vendor-hero__divider"></div>
          <h2 className="vendor-hero__subtitle">
            Collaborate with Us to Reach More Customers
          </h2>
        </div>
      </div>
    </section>
  );
}

export default VendorHeroSection;
