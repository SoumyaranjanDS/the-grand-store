import { useState } from 'react';
import { ArrowUpRight, CheckCircle2, LoaderCircle } from 'lucide-react';
import { submitCigarEnquiry } from '../api';

function ProductEnquiryForm({ product }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', quantity: 1, preferredContact: 'email', message: '', website: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const result = await submitCigarEnquiry({
        customerName: form.name,
        email: form.email,
        phone: form.phone,
        quantity: Number(form.quantity),
        preferredContact: form.preferredContact,
        message: form.message,
        website: form.website,
        product: {
          slug: product.slug,
          name: product.name,
          sku: product.sku,
          brand: product.brand,
          image: product.image,
          pageUrl: window.location.href,
          specifications: (product.specifications || []).map((item) => Array.isArray(item)
            ? { label: item[0], value: String(item[1]) }
            : { label: item.label, value: String(item.value) }),
        },
      });
      setConfirmation(result);
      setForm({ name: '', email: '', phone: '', quantity: 1, preferredContact: 'email', message: '', website: '' });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="product-enquiry" id="product-enquiry">
      <div className="product-enquiry__heading">
        <p>Private assistance</p>
        <h2>Product <em>Enquiry</em></h2>
        <span>Tell us what you need and the club will assist with availability.</span>
        <small>No account or sign-in is required.</small>
      </div>

      {confirmation ? (
        <div className="product-enquiry__success" role="status">
          <CheckCircle2 size={34} strokeWidth={1.3} />
          <p>Enquiry received</p>
          <h3>Thank you for contacting Mcigar.</h3>
          <span>Our cigar concierge team will review your request for {product.name} and contact you shortly.</span>
          {confirmation.reference && <strong>Reference: {confirmation.reference}</strong>}
          <small>{confirmation.acknowledgementSent ? 'A confirmation email has been sent to your inbox.' : 'Your enquiry is safely recorded. Our team will still contact you directly.'}</small>
          <button type="button" onClick={() => setConfirmation(null)}>Send another enquiry <ArrowUpRight size={17} strokeWidth={1.4} /></button>
        </div>
      ) : (
        <form className="product-enquiry__form" onSubmit={handleSubmit}>
          <label><span>Your name</span><input name="name" value={form.name} onChange={updateField} type="text" autoComplete="name" maxLength="120" required /></label>
          <label><span>Email</span><input name="email" value={form.email} onChange={updateField} type="email" autoComplete="email" maxLength="180" required /></label>
          <label><span>Phone</span><input name="phone" value={form.phone} onChange={updateField} type="tel" autoComplete="tel" maxLength="40" required /></label>
          <label><span>Quantity</span><input name="quantity" value={form.quantity} onChange={updateField} type="number" min="1" max="10000" required /></label>
          <label>
            <span>Preferred contact</span>
            <select name="preferredContact" value={form.preferredContact} onChange={updateField}>
              <option value="email">Email</option>
              <option value="phone">Phone call</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
          </label>
          <label className="product-enquiry__form-wide"><span>How can we assist?</span><textarea name="message" value={form.message} onChange={updateField} rows="4" maxLength="3000" placeholder="Availability, gifting, delivery date or any details our concierge should know…" /></label>
          <label className="product-enquiry__honeypot" aria-hidden="true"><span>Website</span><input name="website" value={form.website} onChange={updateField} type="text" tabIndex="-1" autoComplete="off" /></label>
          {error && <div className="product-enquiry__error" role="alert">{error}</div>}
          <button type="submit" disabled={submitting}>
            {submitting ? <><LoaderCircle className="product-enquiry__spinner" size={17} /> Sending enquiry</> : <>Submit enquiry <ArrowUpRight size={17} strokeWidth={1.4} /></>}
          </button>
        </form>
      )}
    </section>
  );
}

export default ProductEnquiryForm;
