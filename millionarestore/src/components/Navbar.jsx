import { useEffect, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const updateHeader = () => {
      const hero = document.getElementById('home')
      const pinSpacer = hero?.closest('.pin-spacer')
      // If the hero section is pinned by GSAP, its pin-spacer contains the total scroll duration
      const threshold = pinSpacer ? pinSpacer.offsetHeight : (window.innerHeight || 0)
      
      // Turn solid right as we scroll past the hero section (minus navbar height)
      setScrolled(window.scrollY > (threshold > 50 ? threshold - 88 : 30))
    }
    updateHeader()
    window.addEventListener('scroll', updateHeader, { passive: true })
    return () => window.removeEventListener('scroll', updateHeader)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="nav-shell">
        <a className="nav-brand" href="#home" onClick={closeMenu} aria-label="Millionaires Collection home">
          <img src="/assets/logo.png" alt="" />
          <span><strong>Millionaires</strong>Collection</span>
        </a>

        <nav className={`nav-links ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          <a href="#story" onClick={closeMenu}>Our Story</a>
          <a href="#collection" onClick={closeMenu}>Collection</a>
          <a href="#process" onClick={closeMenu}>Process</a>
          <a href="#gallery" onClick={closeMenu}>Gallery</a>
          <a className="nav-enquire" href="#enquire" onClick={closeMenu}>Enquire <ArrowUpRight size={15} /></a>
        </nav>

        <button className="nav-toggle" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>
    </header>
  )
}
