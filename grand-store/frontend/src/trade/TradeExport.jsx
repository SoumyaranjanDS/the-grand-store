import React from 'react'
import './TradeExport.css'

export default function TradeExport() {
  return (
    <main className="trade-subpage trade-export">
      <div className="shell trade-export-container">
        <div className="trade-export-content">
          <span className="trade-sub-eyebrow">Trade Export</span>
          <h1 className="trade-sub-title">Your Global Gateway to <span className="trade-script-accent">South Africa’s Finest Wines</span></h1>
          
          <div className="trade-export-text">
            <p className="lead-paragraph">Our Company is a leading player in the wine industry, with a strong presence in South Africa's various wine growing regions. We have established excellent supply channels, allowing us to source the finest wines from the best vineyards in the region.</p>
            
            <p>Our close relationships with selected reputable vineyards have been built over many years, and these relationships are key to our ability to assist importers from around the world in selecting and shipping the wines of their choice. Our extensive network of supply channels, combined with our expertise in the wine industry, enables us to offer a comprehensive service to our clients.</p>
            
            <p>We are able to source a wide range of wine varieties, from classic red and white wines to more unique and specialty wines. Our focus is always on providing our clients with the best possible quality, and we work closely with our vineyard partners to ensure that the wines we offer meet the highest standards.</p>

            <div className="trade-divider-gold"></div>

            <h3 className="trade-section-heading">Logistics & Shipping Excellence</h3>
            <p>In addition to our supply channels, we also have a highly skilled and experienced logistics team that handles all aspects of the shipping process, from securing the wine in shipment containers to tracking the shipment to its final destination. Our team has a deep understanding of the complexities involved in shipping wine, and we take great care to ensure that the wine arrives at its destination in the best possible condition.</p>
            
            <div className="trade-highlight-box">
              <p>In conclusion, our Company is a trusted partner for importers from around the world who are looking for the finest South African wines. With our excellent supply channels, close relationships with reputable vineyards, and experienced logistics team, we are well-equipped to provide a comprehensive and reliable service to our clients.</p>
            </div>
          </div>
        </div>
        <div className="trade-export-visuals">
          <div className="export-image-stack">
            <div className="export-img-wrapper main-img">
              <img src="/assets/trade/maritime.jpeg" alt="Global Shipping and Logistics" />
              <div className="export-img-overlay"></div>
            </div>
            <div className="export-stats-card">
              <span className="stat-number">100+</span>
              <span className="stat-label">Vineyard Partners</span>
            </div>
            <div className="export-stats-card bottom-card">
              <span className="stat-number">Global</span>
              <span className="stat-label">Shipping Destinations</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
