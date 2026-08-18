import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import './Newsletter.css'

export default function Newsletter() {
  const [subscribed, setSubscribed] = useState(false)

  const submit = (event) => {
    event.preventDefault()
    setSubscribed(true)
  }

  return (
    <section className="newsletter-section">
      <div className="newsletter-visual" aria-hidden="true" />
      <div className="newsletter-inner" data-reveal>
        <p className="eyebrow">The private list</p>
        <h2>Subscribe to<br />our newsletter.</h2>
        <p>Stay updated with our latest wines, offers, and events.</p>
        {subscribed ? (
          <div className="newsletter-success"><Check size={18} /> Welcome to the collection.</div>
        ) : (
          <form onSubmit={submit}>
            <input type="email" aria-label="Email address" placeholder="Enter your email" required />
            <button type="submit" aria-label="Subscribe"><ArrowRight size={19} /></button>
          </form>
        )}
      </div>
    </section>
  )
}
