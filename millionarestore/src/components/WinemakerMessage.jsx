import { ArrowDownRight } from 'lucide-react'
import './WinemakerMessage.css'

export default function WinemakerMessage() {
  return (
    <section className="winemaker-section" id="story">
      <div className="shell winemaker-grid">
        
        <div className="winemaker-image-wrapper" data-reveal>
          <img src="/assets/winemaker_farm.jpg" alt="A glass of sparkling wine at a beautiful wine farm" />
        </div>

        <div className="winemaker-content">
          <header data-reveal>
            <p className="eyebrow">Message from the winemaker</p>
            <h2 className="section-title">Born from <em>thirteen</em> expressions of place.</h2>
            <p className="winemaker-update">The 2021 Vintage Release</p>
            <div className="winemaker-stat"><strong>18.5–19.5°</strong><span>Balling at harvest</span></div>
          </header>

          <div className="winemaker-copy" data-reveal>
            <p>This vintage is born from 13 distinct wine pockets scattered across the Western Cape’s most celebrated wine-growing regions. Each pocket contributes its own unique character, microclimate, and soil personality—offering a harmonious balance that simply cannot be replicated.</p>
            <p>The grapes—Chardonnay and Pinot Noir—are selectively hand-picked at the peak of ripeness between 10 January and 12 February, carefully chosen to highlight the individuality of each terroir. Harvested at 18.5–19.5° Balling, this is a meticulous gathering of fruit that reflects balance, purity, and finesse from vine to flute.</p>
            <a className="winemaker-link" href="#process">Follow the winemaking journey <ArrowDownRight size={17} /></a>
          </div>
        </div>

      </div>
    </section>
  )
}
