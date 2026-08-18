import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './TradeNavbar.css'

export default function TradeNavbar() {
  const location = useLocation()

  return (
    <header className="trade-navbar">
      <div className="shell trade-nav-inner">
        <div className="trade-nav-left">
          <Link to="/trade" className="trade-brand">
            <img src="/assets/trade/Trade-logo.png" alt="Grand Store Trade" />
          </Link>
        </div>
        
        <nav className="trade-nav-center">
          <Link to="/trade" className={`trade-nav-link ${location.pathname === '/trade' ? 'active' : ''}`}>Home</Link>
          <Link to="/trade/about-us" className={`trade-nav-link ${location.pathname.includes('/about-us') ? 'active' : ''}`}>About Us</Link>
          <Link to="/trade/trade-export" className={`trade-nav-link ${location.pathname.includes('/trade-export') ? 'active' : ''}`}>Trade Export</Link>
          <Link to="/trade/trade-procedures" className={`trade-nav-link ${location.pathname.includes('/trade-procedures') ? 'active' : ''}`}>Trade Procedures</Link>
          <Link to="/trade/contact-us" className={`trade-nav-link ${location.pathname.includes('/contact-us') ? 'active' : ''}`}>Contact Us</Link>
        </nav>

        <div className="trade-nav-right">
          <Link to="/trade/partner-enquiry" className="trade-partner-btn">Partner With Us</Link>
        </div>
      </div>
    </header>
  )
}
