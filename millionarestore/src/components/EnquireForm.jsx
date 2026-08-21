import { useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import './EnquireForm.css'

export default function EnquireForm() {
  const [submitted, setSubmitted] = useState(false)

  const submit = (event) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <section className="enquire-section" id="enquire">
      <div className="shell enquire-layout">
        <div className="enquire-copy" data-reveal>
          <p className="eyebrow">A private conversation</p>
          <h2 className="section-title">Enquire <em>now.</em></h2>
          <p>For availability, private occasions, partnerships, or more about the 2021 limited edition, leave your details with our collection team.</p>
        </div>

        <div className="enquire-form-card" data-reveal>
          {submitted ? (
            <div className="enquire-success"><CheckCircle2 size={33} /><h3>Thank you for your enquiry.</h3><p>Our collection team will be in touch shortly.</p></div>
          ) : (
            <form onSubmit={submit}>
              <label><span>Your name</span><input type="text" name="name" placeholder="Your Name" required /></label>
              <label><span>Email address</span><input type="email" name="email" placeholder="Email Address" required /></label>
              <label><span>Phone number</span><input type="tel" name="phone" placeholder="Phone Number" required /></label>
              <label><span>Referral</span><input type="text" name="referral" placeholder="How did you find us?" required /></label>
              <button type="submit">Submit enquiry <ArrowRight size={17} /></button>
            </form>
          )}
        </div>
      </div>
      <img className="enquire-bottle" src="/assets/footer-bottle.png" alt="" aria-hidden="true" loading="lazy" decoding="async" />
    </section>
  )
}
