import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, Download } from 'lucide-react'
import './TradePage.css'

export default function TradePage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const services = [
    {
      title: 'Private Label Development',
      desc: 'We work with quality suppliers and service providers to offer our clients the best private label options available. We customize the product to the client’s specifications.',
      icon: '/assets/trade/5.png'
    },
    {
      title: 'Sourcing & Blending',
      desc: 'We have the capability to offer a wide range of bulk wines from all the wine regions in South Africa.',
      icon: '/assets/trade/6.png'
    },
    {
      title: 'Procurement & Filling',
      desc: 'We manage the supply chain of all the packaging material used in our products. The services include the filling, warehousing and all the applicable documentation and approvals.',
      icon: '/assets/trade/7.png'
    },
    {
      title: 'Transport & Shipping',
      desc: 'Our logistics department offers a wide range of services and will take care of all your needs. We can offer different incoterms (FOB, CIF, DAP) and will take care of container loading, documentation and door to door insurance.',
      icon: '/assets/trade/8.png'
    }
  ]

  return (
    <main className="trade-page">
      {/* Hero Section */}
      <section className="trade-hero">
        <div className="trade-hero-image-wrapper">
          <img src="/assets/trade/Trade_banner.jpg" alt="Premium Wine and Liquor Trade Services" className="trade-hero-img" />
          <div className="trade-hero-actions-overlay">
            <Link to="/contact" className="btn-primary">Partner With Us <ArrowRight size={18} /></Link>
            <Link to="/about-us" className="btn-secondary">Discover More</Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="trade-services-section">
        <div className="shell">
          <div className="trade-section-header">
            <h2>Our Core Expertise</h2>
            <p>Providing seamless, end-to-end solutions for the global beverage market.</p>
          </div>
          
          <div className="trade-services-grid">
            {services.map((service, idx) => (
              <div className="trade-service-card" key={idx}>
                <div className="service-icon-wrapper">
                  <img src={service.icon} alt={service.title} />
                </div>
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Export Process & Logistics */}
      <section className="trade-export-section">
        <div className="shell">
          <div className="trade-export-container">
            <div className="trade-export-content">
              <h2>Export & Logistics Excellence</h2>
              <p>
                Further information on the wine export approval process can be found on our website. As an exporter we adhere to all the Procedure for the preparation and transportation of wine. We also keep records and retention samples of each loads for exports.
              </p>
              <ul className="trade-export-list">
                <li><ChevronRight size={16} /> Strict adherence to export preparation procedures</li>
                <li><ChevronRight size={16} /> Comprehensive record-keeping and retention samples</li>
                <li><ChevronRight size={16} /> Full compliance with international shipping regulations</li>
              </ul>
              <Link to="/trade-procedures" className="btn-outline">
                <Download size={18} /> View Trade Procedures
              </Link>
            </div>
            
            <div className="trade-export-visual">
              <div className="trade-image-frame">
                <img src="/assets/trade/maritime.jpeg" alt="Maritime Hub and Logistics" />
                <div className="trade-image-accent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  )
}
