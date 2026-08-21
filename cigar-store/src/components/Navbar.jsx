import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronDown, Heart, Menu, Search, X } from 'lucide-react';
import { useWishlist } from '../context/wishlistContext';
import brandLogo from '../assets/cigar logo with roman number (1).png';
import './Navbar.css';

const mobileLinks = [
  ['Home', '/#top'],
  ['About us', '/#mission'],
  ['Cigar history', '/cigar-history'],
  ['New arrivals', '/#new-arrivals'],
  ['Mosi Oa Tunya', '/shop/mosi-oa-tunya'],
  ['Wishlist', '/wishlist'],
  ['Contact', '/#contact'],
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { savedCount } = useWishlist();

  useEffect(() => {
    const updateHeader = () => {
      const hero = document.querySelector('.scroll-film, .history-page-hero, .mosi-shop-hero, .saved-page__hero');
      if (!hero) {
        setScrolled(true);
        return;
      }
      const threshold = hero.offsetHeight;
      setScrolled(window.scrollY > (threshold > 50 ? threshold - 88 : 30));
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
    return () => window.removeEventListener('scroll', updateHeader);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    return () => document.body.classList.remove('menu-open');
  }, [menuOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''} ${menuOpen ? 'navbar--open' : ''}`}>
      <div className="navbar-main">
        <div className="navbar-main__inner">
          <a className="brand" href="/#top" aria-label="Cigar Connoisseur Club home">
            <img className="brand-logo" src={brandLogo} alt="Cigar Connoisseur Club" />
          </a>

          <nav className="desktop-nav" aria-label="Primary navigation">
            <a href="/#top">Home</a>
            <div className="desktop-nav__group">
              <button type="button">About <ChevronDown size={12} /></button>
              <div className="desktop-nav__dropdown">
                <a href="/#mission">Our mission</a>
                <a href="/cigar-history">Cigar history</a>
              </div>
            </div>
            <div className="desktop-nav__group">
              <button type="button">Shop <ChevronDown size={12} /></button>
              <div className="desktop-nav__dropdown">
                <a href="/#new-arrivals">New arrivals</a>
                <a href="/#featured-products">Featured products</a>
                <a href="/shop/mosi-oa-tunya">Mosi Oa Tunya</a>
              </div>
            </div>
            <a href="/#contact">Contact</a>
          </nav>

          <div className="nav-actions">
            <button className="nav-saved" type="button" onClick={() => navigate('/wishlist')} aria-label={`Wishlist, ${savedCount} saved ${savedCount === 1 ? 'cigar' : 'cigars'}`}>
              <Heart size={21} strokeWidth={1.4} fill={savedCount ? 'currentColor' : 'none'} />
              <b>Wishlist</b>
              <span aria-live="polite">{savedCount > 99 ? '99+' : savedCount}</span>
            </button>
            <button className="nav-search" type="button" aria-label="Open search" aria-expanded={searchOpen} onClick={() => setSearchOpen((open) => !open)}>
              {searchOpen ? <X size={17} strokeWidth={1.4} /> : <Search size={17} strokeWidth={1.4} />}
            </button>
            <a className="nav-enquire" href="mailto:info@cigarconnoisseurclub.com">Enquire</a>
            <button className="menu-toggle" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
              {menuOpen ? <X size={22} strokeWidth={1.4} /> : <Menu size={22} strokeWidth={1.4} />}
            </button>
          </div>
        </div>
      </div>

      <form className={`navbar-search-panel ${searchOpen ? 'navbar-search-panel--open' : ''}`} onSubmit={handleSearchSubmit}>
        <label htmlFor="site-search">Search the collection</label>
        <input 
          id="site-search" 
          type="search" 
          placeholder="Cohiba, Davidoff, Arturo Fuente…" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" aria-label="Search"><Search size={17} strokeWidth={1.4} /></button>
      </form>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        <p>Explore the club</p>
        {mobileLinks.map(([label, href], index) => (
          <Link key={label} to={href} onClick={() => setMenuOpen(false)}><span>0{index + 1}</span>{label}</Link>
        ))}
        <a className="mobile-nav__enquire" href="mailto:info@cigarconnoisseurclub.com">info@cigarconnoisseurclub.com</a>
      </nav>
    </header>
  );
}

export default Navbar;
