import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="shell footer-top">
        <div className="footer-brand">
          <a className="footer-brand-logo" href="#home" aria-label="Millionaires Collection home">
            <img src="/assets/logo.png" alt="" />
            <span><strong>Millionaires</strong>Collection</span>
          </a>
          <p>Timeless sophistication crafted for connoisseurs. Discover the artistry, patience, and meticulous attention to detail that defines our legacy in every pour.</p>
        </div>

        <div className="footer-column">
          <h3>Navigations</h3>
          <a href="#story">About Us</a><a href="#collection">Our Team</a><a href="#process">Services</a><a href="#collection">Pricing</a><a href="#enquire">FAQ</a>
        </div>

        <div className="footer-column">
          <h3>Useful Links</h3>
          <a href="#terms">Terms &amp; Conditions</a><a href="#privacy">Privacy Policy</a><a href="#disclaimer">Disclaimer</a><a href="#enquire">Support</a><a href="#enquire">Contact</a>
        </div>

        <div className="footer-column footer-visit">
          <h3>Visit the Estate</h3>
          <p>Hemel-en-Aarde Valley<br />Hermanus, South Africa</p><p>Mon - Sat : 09:00 - 17:00</p><a href="tel:+27210000000">+27 21 000 0000</a><a href="mailto:reserve@millionaires.com">reserve@millionaires.com</a>
        </div>
      </div>

      <div className="shell footer-bottom">
        <p>© 2026 The Grand Store. All Rights Reserved.</p>
        <div><a href="#facebook">Facebook</a><a href="#twitter">Twitter</a><a href="#instagram">Instagram</a><a href="#linkedin">LinkedIn</a></div>
      </div>
    </footer>
  )
}
