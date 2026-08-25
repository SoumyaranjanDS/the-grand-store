import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const [newsletterStatus, setNewsletterStatus] = useState('')

  const handleNewsletterSignup = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const email = new FormData(form).get('email')
    
    try {
      setNewsletterStatus('Subscribing...')
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setNewsletterStatus(`Thank you — updates will be sent to ${email}.`)
        form.reset()
      } else {
        setNewsletterStatus(data.message || 'Subscription failed. Please try again.')
      }
    } catch (error) {
      setNewsletterStatus('Network error. Please try again later.')
    }
  }

  return (
    <footer 
      className="relative border-t border-[#e1bd70]/20 bg-[linear-gradient(180deg,#171817,#121312)] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_86%_12%,rgba(169,110,35,0.09),transparent_26rem)] before:pointer-events-none" 
      id="footer"
    >
      <div className="relative max-w-[1240px] mx-auto px-6 sm:px-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_minmax(330px,1.15fr)] pt-[50px] lg:pt-[66px] pb-[44px] lg:pb-[58px] gap-[38px] lg:gap-[clamp(32px,4vw,70px)]">
        <div className="flex flex-col">
          <h3 className="m-[0_0_20px] lg:m-[0_0_28px] pb-[13px] lg:pb-[18px] border-b border-[#d99d39]/80 text-[#d99d39] font-serif text-[23px] lg:text-[25px] font-medium">The Grand Store</h3>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/about" target="_blank" rel="noopener noreferrer">About us</Link>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/trade" target="_blank" rel="noopener noreferrer">Trade</Link>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/blogs" target="_blank" rel="noopener noreferrer">News &amp; blogs</Link>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/cocktail" target="_blank" rel="noopener noreferrer">Cocktail</Link>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/auction" target="_blank" rel="noopener noreferrer">Auction</Link>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/contact-us" target="_blank" rel="noopener noreferrer">Contact us</Link>
          <a className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" href="https://sacoronavirus.co.za/" target="_blank" rel="noopener noreferrer">Covid protocol</a>
        </div>
        <div className="flex flex-col">
          <h3 className="m-[0_0_20px] lg:m-[0_0_28px] pb-[13px] lg:pb-[18px] border-b border-[#d99d39]/80 text-[#d99d39] font-serif text-[23px] lg:text-[25px] font-medium">Our Policies</h3>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/terms-and-conditions" target="_blank" rel="noopener noreferrer">Terms &amp; conditions</Link>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/terms-of-service" target="_blank" rel="noopener noreferrer">Terms of service</Link>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy &amp; cookies policy</Link>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/faq" target="_blank" rel="noopener noreferrer">FAQ</Link>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/vendor-portal" target="_blank" rel="noopener noreferrer">Sell on The Grand Store</Link>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/refer-and-earn" target="_blank" rel="noopener noreferrer">Refer &amp; earn</Link>
        </div>
        <div className="flex flex-col">
          <h3 className="m-[0_0_20px] lg:m-[0_0_28px] pb-[13px] lg:pb-[18px] border-b border-[#d99d39]/80 text-[#d99d39] font-serif text-[23px] lg:text-[25px] font-medium">Wines & Tools</h3>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/shop?category=Wine&amp;style=Sparkling" target="_blank" rel="noopener noreferrer">Sparkling wines</Link>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/shop?category=Wine&amp;style=Red" target="_blank" rel="noopener noreferrer">Red wine</Link>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/shop?category=Wine&amp;style=White" target="_blank" rel="noopener noreferrer">White wine</Link>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/shop?category=Wine&amp;style=Rose" target="_blank" rel="noopener noreferrer">Rosé wine</Link>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/tools/wine-pairing">Wine Pairing Tool</Link>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/tools/whisky-finder">Whisky Finder</Link>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/winefarm" target="_blank" rel="noopener noreferrer">Join Wine Farm</Link>
          <Link className="block w-fit m-[0_0_14px] lg:m-[0_0_17px] text-[#f2ede4] font-serif text-[16px] lg:text-[17px] leading-[1.15] transition-all duration-[150ms] hover:text-[#e1bd70] hover:translate-x-[3px]" to="/glossary" target="_blank" rel="noopener noreferrer">Glossary</Link>
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-1 w-full flex flex-col">
          <h3 className="m-[0_0_20px] lg:m-[0_0_28px] pb-[13px] lg:pb-[18px] border-b border-[#d99d39]/80 text-[#d99d39] font-serif text-[23px] lg:text-[25px] font-medium">Newsletter</h3>
          <p className="max-w-[430px] m-[0_0_24px] text-[#f2ede4] font-serif text-[18px] lg:text-[20px] leading-[1.48]">Subscribe to our newsletter to get latest updates and amazing offers.</p>
          <form className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] border border-[#f2ede4]/70" onSubmit={handleNewsletterSignup}>
            <input 
              className="min-w-0 h-[56px] px-[20px] border-0 outline-0 text-[#eee8dd] bg-transparent font-serif text-[16px] placeholder-[#5f5a53]" 
              name="email" 
              type="email" 
              required 
              aria-label="Email address" 
              placeholder="Enter your email here.." 
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
            Total Visitors <span className="px-[5px]">:</span> 538113
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
          <p className="m-0">Copyright © <Link className="text-[#f2ede4] no-underline transition-colors hover:text-[#d6a03f]" to="/">The Grand Store</Link>. All Rights Reserved</p>
          <img className="justify-self-start lg:justify-self-end w-auto h-[26px] object-contain object-left lg:object-right" src="/assets/footer/payment-strip.png" alt="Accepted payment methods" />
        </div>
      </div>
    </footer>
  )
}
