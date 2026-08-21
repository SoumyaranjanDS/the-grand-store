import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const [newsletterStatus, setNewsletterStatus] = useState('')

  const handleNewsletterSignup = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const email = new FormData(form).get('email')
    setNewsletterStatus(`Thank you — updates will be sent to ${email}.`)
    form.reset()
  }

  return (
    <footer 
      className="relative border-t border-[#e1bd70]/20 bg-[linear-gradient(180deg,#171817,#121312)] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_86%_12%,rgba(169,110,35,0.09),transparent_26rem)] before:pointer-events-none" 
      id="footer"
    >
      <div className="relative max-w-[1240px] mx-auto px-6 sm:px-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_minmax(330px,1.15fr)] pt-[50px] lg:pt-[66px] pb-[44px] lg:pb-[58px] gap-[38px] lg:gap-[clamp(32px,4vw,70px)]">
        <div className="flex flex-col">
          <h3 className="m-[0_0_20px] lg:m-[0_0_28px] pb-[13px] lg:pb-[18px] border-b border-[#d99d39]/80 text-[#d99d39] font-serif text-[23px] lg:text-[25px] font-medium">The Grand Store</h3>
          <a className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" href="/#why-us">About us</a>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/trade">Trade</Link>
          <a className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" href="/#journal">News &amp; blogs</a>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/bookatasting">Cocktail</Link>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/auction">Auction</Link>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/host-auction">Host an Auction</Link>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/host-event">Host an Event</Link>
          <a className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" href="mailto:concierge@grandstore.co.za">Contact us</a>
          <a className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" href="https://sacoronavirus.co.za/" target="_blank" rel="noopener noreferrer">Covid protocol</a>
        </div>
        <div className="flex flex-col">
          <h3 className="m-[0_0_20px] lg:m-[0_0_28px] pb-[13px] lg:pb-[18px] border-b border-[#d99d39]/80 text-[#d99d39] font-serif text-[23px] lg:text-[25px] font-medium">Our Policies</h3>
          <a className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" href="https://grandstore.co.za/terms-and-conditions" target="_blank" rel="noopener noreferrer">Terms &amp; conditions</a>
          <a className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" href="https://grandstore.co.za/terms-of-service" target="_blank" rel="noopener noreferrer">Terms of service</a>
          <a className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" href="https://grandstore.co.za/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy &amp; cookies policy</a>
          <a className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" href="https://grandstore.co.za/faq" target="_blank" rel="noopener noreferrer">FAQ</a>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/vendor-portal">Sell on The Grand Store</Link>
          <a className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" href="https://grandstore.co.za/refer-and-earn" target="_blank" rel="noopener noreferrer">Refer &amp; earn</a>
        </div>
        <div className="flex flex-col">
          <h3 className="m-[0_0_20px] lg:m-[0_0_28px] pb-[13px] lg:pb-[18px] border-b border-[#d99d39]/80 text-[#d99d39] font-serif text-[23px] lg:text-[25px] font-medium">Wines</h3>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/shop?category=Wine&amp;style=Sparkling">Sparkling wines</Link>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/shop?category=Wine&amp;style=Red">Red wine</Link>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/shop?category=Wine&amp;style=White">White wine</Link>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/shop?category=Wine&amp;style=Rose">Rosé wine</Link>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/winefarm">Join Wine Farm</Link>
          <a className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" href="https://grandstore.co.za/glossary" target="_blank" rel="noopener noreferrer">Glossary</a>
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-1 w-full flex flex-col">
          <h3 className="m-[0_0_20px] lg:m-[0_0_28px] pb-[13px] lg:pb-[18px] border-b border-[#d99d39]/80 text-[#d99d39] font-serif text-[23px] lg:text-[25px] font-medium">Newsletter</h3>
          <p className="max-w-[430px] m-[0_0_24px] text-[#f2ede4] font-serif text-[18px] lg:text-[20px] leading-[1.48]">Subscribe to our newsletter to get the latest updates and exceptional offers.</p>
          <form className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] border border-[#f2ede4]/70" onSubmit={handleNewsletterSignup}>
            <input 
              className="min-w-0 h-[56px] px-[20px] border-0 outline-0 text-[#eee8dd] bg-transparent font-serif text-[16px] placeholder-[#5f5a53]" 
              name="email" 
              type="email" 
              required 
              aria-label="Email address" 
              placeholder="Enter your email here…" 
            />
            <button 
              className="min-w-[112px] min-h-[48px] px-[22px] border-0 text-[#14120e] bg-[#d6a03f] font-serif text-[17px] font-[650] cursor-pointer transition-colors duration-[180ms] hover:bg-[#edbf67]" 
              type="submit"
            >
              Sign up
            </button>
          </form>
          {newsletterStatus && <p className="m-[10px_0_0] text-[#cfc6b7] font-sans text-[11px]" role="status">{newsletterStatus}</p>}
          <strong className="block mt-[28px] pb-[22px] border-b border-[#d99d39]/70 text-[#d99d39] font-serif text-[23px] font-medium">
            Total Visitors <span className="px-[5px]">:</span> 533790
          </strong>
          <div className="flex flex-col sm:flex-row items-start sm:items-center mt-[28px] gap-[12px] sm:gap-[18px]" aria-label="Download The Grand Store mobile app">
            <a className="transition-all duration-[180ms] ease hover:opacity-85 hover:-translate-y-[2px]" href="https://apps.apple.com/in/app/grand-store/id6449220111" target="_blank" rel="noopener noreferrer">
              <img className="w-auto h-[48px] lg:h-[54px] object-contain" src="/assets/footer/app-store.svg" alt="Download on the App Store" />
            </a>
            <a className="transition-all duration-[180ms] ease hover:opacity-85 hover:-translate-y-[2px]" href="https://play.google.com/store/apps/details?id=com.grandstore" target="_blank" rel="noopener noreferrer">
              <img className="w-auto h-[48px] lg:h-[54px] object-contain" src="/assets/footer/google-play.svg" alt="Get it on Google Play" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-[#e1bd70]/20 bg-[#070706]">
        <div className="max-w-[1240px] mx-auto px-6 sm:px-0 grid grid-cols-1 lg:grid-cols-[1fr_minmax(480px,0.9fr)] items-center min-h-[70px] py-[20px] lg:py-0 gap-[18px] lg:gap-[34px] text-[#d6cec0] font-serif text-[16px]">
          <p className="m-0">Copyright © 2026 <Link className="text-[#f2ede4] no-underline transition-colors hover:text-[#d6a03f]" to="/">The Grand Store</Link>. All Rights Reserved</p>
          <img className="justify-self-start lg:justify-self-end w-auto h-[26px] object-contain object-left lg:object-right" src="/assets/footer/payment-strip.png" alt="Accepted payment methods" />
        </div>
      </div>
    </footer>
  )
}
