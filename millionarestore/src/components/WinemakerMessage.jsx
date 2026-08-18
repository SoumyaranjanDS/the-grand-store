import { ArrowDownRight } from 'lucide-react'
import './WinemakerMessage.css'

export default function WinemakerMessage() {
  return (
    <>
      <section className="winemaker-section" id="story">
        <div className="winemaker-art" aria-hidden="true" />
        <div className="shell winemaker-grid">
          <header data-reveal>
            <p className="eyebrow">Message from the winemaker</p>
            <h2 className="section-title">Born from <em>thirteen</em> expressions of place.</h2>
            <p className="winemaker-update">Upgrade to the latest!</p>
            <div className="winemaker-stat"><strong>18.5–19.5°</strong><span>Balling at harvest</span></div>
          </header>

          <div className="winemaker-copy" data-reveal>
            <p>This vintage is born from 13 distinct wine pockets scattered across the Western Cape’s most celebrated wine-growing regions. Each pocket contributes its own unique character, microclimate, and soil personality—offering a harmonious balance that simply cannot be replicated.</p>
            <p>The grapes—Chardonnay and Pinot Noir—are selectively hand-picked at the peak of ripeness between 10 January and 12 February, carefully chosen to highlight the individuality of each terroir. Harvested at 18.5–19.5° Balling, this is a meticulous gathering of fruit that reflects balance, purity, and finesse from vine to flute.</p>
            <a className="winemaker-link" href="#process">Follow the winemaking journey <ArrowDownRight size={17} /></a>
          </div>
        </div>
      </section>

      <section className="manifesto-section">
        <div className="manifesto-image" data-reveal>
          <img src="/assets/poster-banner.png" alt="Friends celebrating with Millionaires Collection in a vineyard" />
          <span>Made for life’s grandest moments</span>
        </div>
        <div className="manifesto-copy" data-reveal>
          <p className="eyebrow">M Collection</p>
          <h2>Millionaire by name.<br /><em>Magnificent by nature.</em></h2>
          <p>The “M” stands for Millionaire, a symbol of status, select taste, and timeless sophistication. This sparkling wine was born to elevate life’s grandest moments, crafted for collectors and connoisseurs who accept only the rarest and the best.</p>
          <div className="manifesto-signature"><span>M</span><p>Premium sparkling wine<br />Brut · 2021 limited edition</p></div>
        </div>
      </section>
    </>
  )
}
