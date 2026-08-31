import { useNavigate } from 'react-router-dom';
import './LuxuryBannerSection.css';

function LuxuryBannerSection() {
  const navigate = useNavigate();

  return (
    <section className="luxury-banner-section">
      <div 
        className="luxury-banner-container" 
        onClick={() => navigate('/shop')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') navigate('/shop');
        }}
      >
        <img 
          src="/images/luxury-lifestyle-banner.jpg" 
          alt="Luxury lifestyle with premium selections" 
          className="luxury-banner-bg" 
        />
        <div className="luxury-banner-content">
          <h2 className="luxury-banner-title">
            Explore premium<br/>
            cigars,<br/>
            spirits and<br/>
            unforgettable<br/>
            selections
          </h2>
          <p className="luxury-banner-subtitle">
            ALL IN ONE<br/>
            DESTINATION
          </p>
          <button className="luxury-banner-button">
            SHOP NOW
          </button>
        </div>
      </div>
    </section>
  );
}

export default LuxuryBannerSection;
