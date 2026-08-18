import { ArrowUp, Mail, MapPin, Phone } from 'lucide-react';
import { contactDetails } from '../data/homeContent';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import './SiteFooter.css';

function SiteFooter() {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer" id="contact">
      <div 
        ref={ref}
        className={`site-footer__main reveal-right ${isVisible ? 'is-visible' : ''}`}
      >
        {/* Column 1: Logo & Socials */}
        <div className="site-footer__logo-col">
          <div className="site-footer__logo">
            <img src="/images/cigar-connoisseur-logo.png" alt="Cigar Connoisseur Club" className="site-footer__logo-img" />
          </div>
          <div className="site-footer__socials">
            <a href="#" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#" aria-label="Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </a>
            <a href="#" aria-label="Youtube">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
            </a>
            <a href="#" aria-label="Google">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="21.17" y1="8" x2="12" y2="8"></line><line x1="3.95" y1="6.06" x2="8.54" y2="14"></line><line x1="10.88" y1="21.94" x2="15.46" y2="14"></line></svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
          </div>
        </div>

        {/* Column 2: Address */}
        <div className="site-footer__links-col site-footer__address-col">
          <h4>ADDRESS</h4>
          <div className="footer-contact">
            <p><MapPin size={16} /> <span>Cigar Connoisseur Club, C/O-Nivarp International (Pty) ltd. PO Box<br/>1022, Saxonwold. 2196 Rosebank mall, Johannesburg. South Africa.</span></p>
            <p><Mail size={16} /> <span>info@cigarconnoisseurclub.com</span></p>
            <p><Phone size={16} /> <span>+27 82 496 7256</span></p>
          </div>
        </div>

        {/* Column 3: Information */}
        <div className="site-footer__links-col">
          <h4>INFORMATION</h4>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>

        {/* Column 4: Policies */}
        <div className="site-footer__links-col">
          <h4>OUR POLICIES</h4>
          <ul>
            <li><a href="#">Terms & Conditions</a></li>
            <li><a href="#">Terms Of Service</a></li>
            <li><a href="#">Privacy & Policy</a></li>
            <li><a href="#">Cookies & Policy</a></li>
          </ul>
        </div>
      </div>

      <div className="site-footer__bottom-bar">
        <p>Copyright © Cigar Connoisseur Club | All Rights Reserved</p>
        <button onClick={scrollToTop} className="site-footer__scroll-top" aria-label="Scroll to top">
          <ArrowUp size={20} strokeWidth={2.5} />
        </button>
      </div>
    </footer>
  );
}

export default SiteFooter;
