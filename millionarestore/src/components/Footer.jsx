import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="shell footer-top">
        <div className="footer-brand">
          <a href="#home"><img src="/assets/logo.png" alt="Millionaires Collection" /></a>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut elit tellus, luctus nec ullamcorper mattis.</p>
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
          <h3>Visit Us</h3>
          <p>KLJ G, No 99, Piu City, ID 28289</p><p>Sun - Fri : 06:00 - 18:00</p><a href="tel:0001555333">0001-555-333</a><a href="mailto:help@domain.com">help@domain.com</a>
        </div>
      </div>

      <div className="shell footer-bottom">
        <p>© 2026 The Grand Store. All Rights Reserved.</p>
        <div><a href="#facebook">Facebook</a><a href="#twitter">Twitter</a><a href="#instagram">Instagram</a><a href="#linkedin">LinkedIn</a></div>
      </div>
    </footer>
  )
}
